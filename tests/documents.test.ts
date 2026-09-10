import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { dateStatus, documentExtension, documentSchema, MAX_DOCUMENT_BYTES } from '../src/domain/documents.js';
import { createDocumentsRouter } from '../src/server/routes/documents.routes.js';

test('document dates use Turkey calendar days and file validation rejects forged types',()=>{
  const now=new Date('2026-09-09T21:30:00Z');
  assert.equal(dateStatus(null,now),'unknown');
  assert.equal(dateStatus('2026-02-30',now),'unknown');
  assert.equal(dateStatus('2026-09-09',now),'expired');
  assert.equal(dateStatus('2026-09-10',now),'warning');
  assert.equal(dateStatus('2026-10-10',now),'warning');
  assert.equal(dateStatus('2026-10-11',now),'valid');
  assert.equal(documentExtension(Buffer.from('%PDF-1.7'),'application/pdf'),'pdf');
  assert.equal(documentExtension(Buffer.from('<html>'),'application/pdf'),null);
  assert.equal(documentExtension(Buffer.from('%PDF-1.7'),'image/jpeg'),null);
  assert.equal(documentExtension(new Uint8Array(MAX_DOCUMENT_BYTES+1),'application/pdf'),null);
  assert.equal(documentSchema.safeParse({id:crypto.randomUUID(),title:'Belge',type:'other',expiry_date:null,file_path:'someone/file.pdf'}).success,false);
});

test('document API checks ownership before storage, preserves failed deletions and cleans failed uploads',async()=>{
  const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',id='33333333-3333-4333-8333-333333333333';
  let rows:any[]=[{id,user_id:owner,title:'Test belge',type:'other',expiry_date:null,file_path:null}];
  let storageCalls=0,failDelete=false,failUpdate=false;const files=new Set<string>();
  const db={from(){
    let matches=[...rows],operation='',values:any;const query:any={
      select(){return query;},eq(key:string,value:any){matches=matches.filter(row=>row[key]===value);return query;},is(key:string,value:any){return query.eq(key,value);},order(){return query;},limit(){return query;},
      insert(input:any){operation='insert';values=input;return query;},update(input:any){operation='update';values=input;return query;},delete(){operation='delete';return query;},
      async maybeSingle(){
        if(operation==='update'){if(failUpdate){failUpdate=false;return{error:{message:'db failed'}};}matches.forEach(row=>Object.assign(row,values));}
        if(operation==='delete')rows=rows.filter(row=>!matches.includes(row));
        return{data:matches[0]??null,error:null};
      },async single(){if(operation==='insert'){rows.push(values);return{data:values,error:null};}return query.maybeSingle();},then(resolve:any){return Promise.resolve({data:matches,count:matches.length,error:null}).then(resolve);}
    };return query;
  },storage:{from(){return{
    async upload(path:string){storageCalls++;files.add(path);return{data:{path},error:null};},
    async remove(paths:string[]){storageCalls++;if(failDelete)return{error:{message:'storage failed'}};paths.forEach(path=>files.delete(path));return{data:[],error:null};},
    async createSignedUrl(path:string,ttl:number){storageCalls++;assert.equal(ttl,60);return{data:{signedUrl:`https://example.invalid/${path}`},error:null};}
  };}}};
  const app=express();app.use(express.json());app.use((req:any,_res,next)=>{req.user={id:req.headers['x-test-user']??owner};next();});app.use('/api/documents',createDocumentsRouter(db));
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const url=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/documents`;
  const upload=(user=owner,body='%PDF-1.7')=>fetch(`${url}/${id}/file`,{method:'PUT',headers:{'Content-Type':'application/pdf','x-test-user':user},body});
  try{
    for(const method of ['GET','DELETE'])assert.equal((await fetch(`${url}/${id}${method==='GET'?'/file':''}`,{method,headers:{'x-test-user':other}})).status,404);
    assert.equal((await upload(other)).status,404);assert.equal(storageCalls,0);
    assert.equal((await upload(owner,'<html>')).status,400);assert.equal(storageCalls,0);
    failUpdate=true;assert.equal((await upload()).status,503);assert.equal(files.size,0);assert.equal(rows[0].file_path,null);
    assert.equal((await upload()).status,200);assert.equal(files.size,1);
    assert.equal((await upload()).status,409);
    assert.equal((await fetch(`${url}/${id}/file`)).status,200);
    failDelete=true;assert.equal((await fetch(`${url}/${id}`,{method:'DELETE'})).status,503);assert.equal(rows.length,1);
    failDelete=false;assert.equal((await fetch(`${url}/${id}`,{method:'DELETE'})).status,200);assert.equal(rows.length,0);assert.equal(files.size,0);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('document migration keeps metadata readable but forbids direct writes and caps concurrent inserts',async()=>{
  const db=new PGlite();
  try{
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table public.documents(id uuid primary key,user_id uuid,title text);grant all on public.documents to authenticated;
      grant usage on schema public to service_role;
      create schema auth; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated;
      create table public.vehicles(id uuid primary key,user_id uuid); grant select on public.vehicles to authenticated;
      create table public.expenses(id uuid primary key,user_id uuid,vehicle_id uuid);
      create table public.maintenance_records(like public.expenses including all);
      create table public.appointments(like public.expenses including all);
      grant all on public.expenses,public.maintenance_records,public.appointments to authenticated;
      alter table public.expenses enable row level security;
      create policy original_owner on public.expenses to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());`);
    await db.exec(await readFile(new URL('../supabase/migrations/20260910191237_droto_document_files.sql',import.meta.url),'utf8'));
    const permissions=await db.query<any>(`select has_table_privilege('authenticated','public.documents','INSERT') as insert,has_table_privilege('authenticated','public.documents','DELETE') as delete,has_function_privilege('authenticated','public.droto_document_limit()','EXECUTE') as execute;`);
    assert.deepEqual(permissions.rows[0],{insert:false,delete:false,execute:false});
    assert.equal((await db.query<any>(`select public from storage.buckets where id='droto-documents'`)).rows[0].public,false);
    await db.exec(`set role service_role; insert into public.documents select gen_random_uuid(),'11111111-1111-4111-8111-111111111111','test' from generate_series(1,100);`);
    await assert.rejects(db.exec(`insert into public.documents(id,user_id,title) values(gen_random_uuid(),'11111111-1111-4111-8111-111111111111','limit')`),/DOCUMENT_LIMIT/);
    await db.exec(`reset role; insert into public.vehicles values('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111'),('44444444-4444-4444-8444-444444444444','22222222-2222-4222-8222-222222222222');set role authenticated;set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';`);
    await db.exec(`insert into public.expenses values('55555555-5555-4555-8555-555555555555',auth.uid(),'33333333-3333-4333-8333-333333333333');`);
    await assert.rejects(db.exec(`insert into public.expenses values(gen_random_uuid(),auth.uid(),'44444444-4444-4444-8444-444444444444');`),/row-level security/);
    await assert.rejects(db.exec(`update public.expenses set vehicle_id='44444444-4444-4444-8444-444444444444';`),/row-level security/);
  }finally{await db.close();}
});
