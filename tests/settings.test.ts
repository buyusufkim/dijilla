import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { applicationSettingsSchema } from '../src/domain/settings.js';
import { createRequestsRouter } from '../src/server/routes/requests.routes.js';

const input={version:1,phone:'0850 335 13 75',whatsapp:'+90 (501) 097 26 37',privacy_text:'Test işletmesi için örnek bilgilendirme.',requests_enabled:true,business_name:'Test',support_email:'',support_hours:'09.00–18.00',enabled_kinds:['insurance']};
test('application settings normalize Turkish phones and explain activation prerequisites',()=>{
  const value=applicationSettingsSchema.parse(input);
  assert.equal(value.phone,'908503351375');assert.equal(value.whatsapp,'905010972637');
  for(const phone of ['0501 097 26 37','5010972637','00905010972637','+90 501 097 26 37'])assert.equal(applicationSettingsSchema.parse({...input,phone}).phone,'905010972637');
  for(const value of [{phone:''},{privacy_text:''},{enabled_kinds:[]},{phone:'abc'}])assert.equal(applicationSettingsSchema.safeParse({...input,...value}).success,false);
  assert.equal(applicationSettingsSchema.safeParse({...input,requests_enabled:false,phone:'',privacy_text:'',enabled_kinds:[]}).success,true);
});

test('admin save persists normalized values, bootstrap reflects them, stale or unauthorized writes fail',async()=>{
  const admin='11111111-1111-4111-8111-111111111111';let row:any={id:true,...input,requests_enabled:false};let fail=false;
  const db={from(table:string){
    let match=table==='droto_settings'?[row]:table==='droto_admins'?[{user_id:admin}]:[];let update:any;
    const q:any={select(){return q;},eq(key:string,value:any){match=match.filter(item=>item[key]===value);return q;},order(){return q;},update(value:any){update=value;return q;},
      async maybeSingle(){if(fail&&update)return{error:{message:'db unavailable'}};if(update&&match.length)Object.assign(row,update);return{data:match[0]??null,error:null};},single(){return q.maybeSingle();},then(resolve:any){return Promise.resolve({data:match,error:null}).then(resolve);}};return q;
  }};
  const app=express();app.use(express.json());app.use((req:any,_res,next)=>{req.user={id:req.headers['x-test-user']??admin};next();});app.use('/api/requests',createRequestsRouter(db));
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/requests`;
  const put=(body:any,user=admin)=>fetch(`${base}/settings`,{method:'PUT',headers:{'Content-Type':'application/json','x-test-user':user},body:JSON.stringify(body)});
  try{
    assert.equal((await put(input,'22222222-2222-4222-8222-222222222222')).status,403);
    assert.equal((await put({...input,phone:''})).status,400);assert.equal(row.version,1);
    const saved=await put(input);assert.equal(saved.status,200);assert.equal((await saved.json()).settings.requests_enabled,true);
    const fresh=await(await fetch(`${base}/bootstrap`)).json();assert.equal(fresh.settings.phone,'908503351375');assert.equal(fresh.settings.version,2);assert.deepEqual(fresh.settings.enabled_kinds,['insurance']);
    const disabled=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'premium',settingsVersion:2,idempotencyKey:crypto.randomUUID(),acknowledged:true,payload:{name:'Test',phone:'05010972637',cycle:'monthly'}})});
    assert.equal(disabled.status,409);
    assert.equal((await put(input)).status,409);assert.equal(row.version,2);
    fail=true;assert.equal((await put({...input,version:2})).status,503);assert.equal(row.version,2);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
