import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../server/app.mjs';
import { generateQuestion } from '../../src/learning/curriculum/engine.ts';
import { randomUUID } from 'node:crypto';

test('real accounts, ownership, evidence integrity, CSRF, rotation and deletion',async()=>{
  const origin='http://127.0.0.1:4418';let time=Date.now();const server=await createApp({database:':memory:',origin,now:()=>time});
  await new Promise(resolve=>server.listen(4418,'127.0.0.1',resolve));
  const call=async(path,{method='GET',body,cookie,csrf,source=origin}={})=>{
    const response=await fetch(origin+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{Origin:source}:{}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},body:body?JSON.stringify(body):undefined});
    return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0],rawCookie:response.headers.get('set-cookie')};
  };
  try {
    assert.equal((await call('/api/session')).data.user,null);
    const password='ini frasa sandi sangat panjang';
    assert.equal((await call('/api/auth/register',{method:'POST',body:{email:'a@example.test',password:'short',name:'Bunda',consent:true}})).status,400);
    assert.equal((await call('/api/auth/register',{method:'POST',source:'https://bad.test',body:{email:'a@example.test',password,name:'Bunda',consent:true}})).status,403);
    const one=await call('/api/auth/register',{method:'POST',body:{email:'a@example.test',password,name:'Bunda',consent:true}});assert.equal(one.status,201);assert.match(one.rawCookie,/HttpOnly/);assert.match(one.rawCookie,/SameSite=Strict/);assert.ok(!JSON.stringify(one.data).includes('password'));
    assert.equal((await call('/api/profiles',{method:'POST',cookie:one.cookie,body:{nickname:'Ali',grade:1}})).status,403);
    const family=await call('/api/profiles',{method:'POST',cookie:one.cookie,csrf:one.data.csrf,body:{nickname:'Ali',grade:1}});assert.equal(family.status,201);const profileId=family.data.activeProfileId;
    const two=await call('/api/auth/register',{method:'POST',body:{email:'b@example.test',password,name:'Ayah',consent:true}});
    assert.equal((await call(`/api/progress?profileId=${profileId}`,{cookie:two.cookie})).status,404);
    assert.equal((await call('/api/profiles/active',{method:'POST',cookie:two.cookie,csrf:two.data.csrf,body:{profileId}})).status,404);
    const q=generateQuestion('menjumlah',17);
    const record={id:randomUUID(),profileId,lessonId:'menjumlah',seed:17,answer:String(q.expected+1),reason:q.correctReason,hints:0,answerCorrect:true,independent:true};
    assert.equal((await call('/api/attempts',{method:'POST',cookie:two.cookie,csrf:two.data.csrf,body:record})).status,404);
    const result=await call('/api/attempts',{method:'POST',cookie:one.cookie,csrf:one.data.csrf,body:record});assert.equal(result.status,201);assert.equal(result.data.evaluation.answerCorrect,false);
    assert.equal((await call('/api/attempts',{method:'POST',cookie:one.cookie,csrf:one.data.csrf,body:record})).data.duplicate,true);
    const second={...record,id:randomUUID(),answer:String(q.expected)};const checked=await call('/api/attempts',{method:'POST',cookie:one.cookie,csrf:one.data.csrf,body:second});assert.equal(checked.data.evaluation.independent,false);
    const progress=await call(`/api/progress?profileId=${profileId}`,{cookie:one.cookie});assert.equal(progress.data.attempts.length,2);assert.equal(progress.data.attempts[1].answerCorrect,0);
    assert.equal((await call('/api/attempts',{method:'POST',cookie:one.cookie,csrf:one.data.csrf,body:{...record,id:randomUUID(),answer:'1e5'}})).status,400);
    assert.equal((await call('/api/auth/login',{method:'POST',body:{email:'a@example.test',password:'kata sandi ini keliru'}})).status,401);
    const login=await call('/api/auth/login',{method:'POST',cookie:one.cookie,body:{email:'A@example.test',password}});assert.equal(login.status,200);assert.equal((await call('/api/session',{cookie:one.cookie})).data.user,null);
    const changed=await call('/api/account/password',{method:'POST',cookie:login.cookie,csrf:login.data.csrf,body:{currentPassword:password,password:'frasa kata sandi baru sangat panjang'}});assert.equal(changed.status,200);assert.equal((await call('/api/session',{cookie:login.cookie})).data.user,null);
    assert.equal((await call('/api/export',{cookie:changed.cookie})).data.profiles.length,1);
    assert.equal((await call('/api/account',{method:'DELETE',cookie:changed.cookie,csrf:changed.data.csrf,body:{confirmation:'wrong',password:'frasa kata sandi baru sangat panjang'}})).status,400);
    assert.equal((await call('/api/account',{method:'DELETE',cookie:changed.cookie,csrf:changed.data.csrf,body:{confirmation:'a@example.test',password:'frasa kata sandi baru sangat panjang'}})).status,200);
    assert.equal((await call('/api/session',{cookie:changed.cookie})).data.user,null);
    time+=8*86400000;assert.equal((await call('/api/session',{cookie:two.cookie})).data.user,null);
  } finally {await new Promise(resolve=>server.close(resolve));}
});

test('production refuses insecure origins',async()=>{await assert.rejects(()=>createApp({database:':memory:',origin:'http://example.test',production:true}),/HTTPS/);});
