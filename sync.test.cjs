const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const endpoint='https://fgomaujsdblpzxhnnqrg.supabase.co/functions/v1/nov-ballot-2026-sync-v1';
const b64=b=>Buffer.from(b).toString('base64');
async function run(){
 const token=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
 const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('nov-ballot-2026:'+token))).toString('hex');
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode('disposable-test-passphrase'),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const vault={version:1,salt:b64(salt),iv:b64(iv),data:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode('{"test":"disposable"}')))};
 const request=(t,method='GET',body)=>fetch(endpoint,{method,headers:{'x-nov-sync-key':t,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
 let r=await request('');assert.equal(r.status,401);
 r=await request(token);assert.equal(r.status,404);
 r=await request(token,'POST',{vault});assert.equal(r.status,201);assert.equal((await r.json()).revision,1);
 r=await request(token);assert.equal(r.status,200);const remote=await r.json();assert.deepEqual(remote.vault,vault);
 const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(remote.vault.iv,'base64')},key,Buffer.from(remote.vault.data,'base64'));assert.equal(new TextDecoder().decode(decrypted),'{"test":"disposable"}');
 assert.equal((await request('1'.repeat(64))).status,404);
 assert.equal((await request(token,'POST',{vault})).status,409);
 r=await request(token,'PUT',{revision:1,vault});assert.equal(r.status,200);assert.equal((await r.json()).revision,2);
 assert.equal((await request(token,'PUT',{revision:1,vault})).status,409);
 assert.equal((await request(token,'PUT',{revision:2,vault:{version:1}})).status,400);
 r=await fetch(endpoint,{headers:{origin:'https://example.com','x-nov-sync-key':token}});assert.equal(r.status,403);
 console.log('PASS: live create, second-device read and decryption, isolated capability access, duplicate-create protection, atomic revision update, stale-device rejection, invalid payload rejection, CORS restriction.');
 console.log('Disposable test row hash: '+hash);
}
run().catch(e=>{console.error(e);process.exitCode=1});
