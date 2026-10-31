const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function device(){
 const nodes=new Map(),stored=new Map();
 const node=()=>({value:'',textContent:'',hidden:false,checked:false,append(){},replaceChildren(){},focus(){},reset(){},setAttribute(){}});
 const ctx={crypto,TextEncoder,TextDecoder,Uint8Array,atob,btoa,JSON,console,AbortSignal,Promise,
 setTimeout:()=>1,clearTimeout(){},setInterval(){},alert(){},confirm:()=>true,
 window:{addEventListener(){}},document:{hidden:false,addEventListener(){},createElement:node,getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}},
 localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)}};
 vm.createContext(ctx);vm.runInContext(['ballot.js','app.js','sync.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),ctx);
 ctx.run=s=>vm.runInContext(s,ctx);return ctx;
}
async function run(){
 const a=device();
 await a.run(`(async()=>{const salt=crypto.getRandomValues(new Uint8Array(16));key=await derive('client-test-passphrase',salt);answers={};vault=await encrypt('{}',key,base(salt));localStorage.setItem(STORE,JSON.stringify(vault));syncState={token:'a'.repeat(64),revision:1,dirty:false};rememberSync()})()`);
 await a.run(`(async()=>{answers={governor:{choices:['0']}};await save();if(!syncState.dirty)throw Error('Pending edits not tracked');syncRequest=async()=>({revision:2});await syncNow();if(syncState.dirty||syncState.revision!==2)throw Error('Upload failed')})()`);
 // A second device gets the same encrypted vault and decrypts it independently.
 const b=device();b.cloud=JSON.parse(a.run('JSON.stringify(vault)'));
 await b.run(`(async()=>{key=await derive('client-test-passphrase',bytes(cloud.salt));vault=cloud;answers={};syncState={token:'a'.repeat(64),revision:1,dirty:false};syncRequest=async()=>({revision:2,vault:cloud});await syncNow();if(answers.governor.choices[0]!=='0')throw Error('Second-device pull failed')})()`);
 await a.run(`(async()=>{answers={governor:{choices:['1']}};await save();syncRequest=async()=>{const e=Error('conflict');e.status=409;throw e};await syncNow();if(!syncState.dirty||answers.governor.choices[0]!=='1'||$('resolveSync').hidden)throw Error('Conflict lost local choices')})()`);
 // Edits made while a cloud PUT is in flight must remain dirty.
 await a.run(`(async()=>{syncRequest=async()=>{answers={governor:{choices:['0']}};await save();return {revision:3}};await syncNow();if(!syncState.dirty)throw Error('In-flight edit lost')})()`);
 await a.run(`(async()=>{answers={governor:{choices:['1']}};const pending=save();lock();await pending;await Promise.resolve();if(!syncState.dirty)throw Error('Lock discarded pending sync');if(key!==null||Object.keys(answers).length)throw Error('Lock retained choices')})()`);
 console.log('PASS: encrypted second-device pull, automatic upload, stale-write conflict retention, in-flight edit retention, lock with pending edits.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
