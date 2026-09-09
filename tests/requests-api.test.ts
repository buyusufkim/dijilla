import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { createRequestsRouter } from '../src/server/routes/requests.routes.js';

test('HTTP request API enforces ownership and admin membership, even for direct calls', async () => {
  const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
  const id='33333333-3333-4333-8333-333333333333';
  let storageCalls=0;
  const records=[{id,user_id:owner,kind:'roadside',payload:{},snapshot:{priceMinor:75000},state:{stage:'paid',paidAt:'2026-09-09T10:00:00Z',documentPath:'private/test.pdf'},version:1,created_at:'2026-09-09T09:00:00Z'}];
  const db={
    from(table:string){
      let rows=table==='droto_requests'?[...records]:[];
      const query:any={select(){return query;},eq(key:string,value:unknown){rows=rows.filter((row:any)=>row[key]===value);return query;},order(){return query;},range(){return query;},maybeSingle(){return Promise.resolve({data:rows[0]??null,error:null});},then(resolve:any){return Promise.resolve({data:rows,error:null}).then(resolve);}};
      return query;
    },
    storage:{from(){return{createSignedUrl:async()=>{storageCalls++;return{data:{signedUrl:'https://example.invalid/document'},error:null};}};}}
  };
  const app=express();app.use(express.json());app.use((req:any,_res,next)=>{req.user={id:req.headers['x-test-user']??owner};next();});app.use('/api/requests',createRequestsRouter(db));
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/requests`;
  try {
    assert.equal((await (await fetch(base)).json()).requests.length,1);
    assert.equal((await (await fetch(base,{headers:{'x-test-user':other}})).json()).requests.length,0);
    assert.equal((await fetch(`${base}/${id}`,{headers:{'x-test-user':other}})).status,404);
    assert.equal((await fetch(`${base}/${id}/document`,{headers:{'x-test-user':other}})).status,404);
    assert.equal(storageCalls,0);
    assert.equal((await fetch(`${base}/${id}/document`)).status,200);assert.equal(storageCalls,1);
    assert.equal((await fetch(`${base}?scope=admin`)).status,403);
    assert.equal((await fetch(`${base}/${id}/actions`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:1,action:{type:'pay',paidAt:'2026-09-09T10:00:00Z',amountMinor:75000}})})).status,403);
    assert.equal((await fetch(`${base}/${id}/document`,{method:'POST',headers:{'Content-Type':'application/pdf'},body:'%PDF-test'})).status,403);
    assert.equal((await fetch(`${base}/settings`,{method:'PUT',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
    assert.equal((await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'roadside',priceMinor:1})})).status,400);
  } finally {await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
