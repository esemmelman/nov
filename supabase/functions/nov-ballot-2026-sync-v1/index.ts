// Capability-authenticated endpoint. Never log tokens or request bodies.
const table = 'nov_ballot_2026_vaults_v1';
Deno.serve(async (req: Request) => {
 const origin=req.headers.get('origin');
 const headers={'Access-Control-Allow-Origin':'https://esemmelman.github.io','Access-Control-Allow-Headers':'content-type,x-nov-sync-key','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
 const reply=(body: unknown,status=200)=>Response.json(body,{status,headers});
 if(origin && origin!=='https://esemmelman.github.io')return reply({error:'Origin denied'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(!['GET','POST','PUT'].includes(req.method))return reply({error:'Method denied'},405);
 const token=req.headers.get('x-nov-sync-key')||'';
 if(!/^[a-f0-9]{64}$/.test(token))return reply({error:'Sync code required'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('nov-ballot-2026:'+token))),b=>b.toString(16).padStart(2,'0')).join('');
 const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const url=Deno.env.get('SUPABASE_URL')!+'/rest/v1/'+table;
 const dbHeaders={apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',Prefer:'return=representation'};
 try {
  if(req.method==='GET'){
   const r=await fetch(url+'?token_hash=eq.'+hash+'&select=revision,vault',{headers:dbHeaders});
   if(!r.ok)throw Error();const rows=await r.json();return rows.length?reply(rows[0]):reply({error:'Ballot not found'},404);
  }
  const bodyText=await req.text();if(bodyText.length>100000)return reply({error:'Too large'},413);
  const b=JSON.parse(bodyText),v=b.vault;
  if(!v || v.version!==1 || typeof v.salt!=='string'|| !/^[A-Za-z0-9+/]{22}==$/.test(v.salt)||typeof v.iv!=='string'||!/^[A-Za-z0-9+/]{16}$/.test(v.iv)||typeof v.data!=='string'||v.data.length<24||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(v.data))return reply({error:'Invalid encrypted vault'},400);
  if(req.method==='POST'){
   const r=await fetch(url,{method:'POST',headers:dbHeaders,body:JSON.stringify({token_hash:hash,vault:v})});
   if(r.status===409)return reply({error:'Already exists'},409);
   if(!r.ok)throw Error();const rows=await r.json();return reply({revision:rows[0].revision},201);
  }
  if(!Number.isSafeInteger(b.revision)||b.revision<1||b.revision>=2147483647)return reply({error:'Revision required'},400);
  const r=await fetch(url+'?token_hash=eq.'+hash+'&revision=eq.'+b.revision,{method:'PATCH',headers:dbHeaders,body:JSON.stringify({vault:v,revision:b.revision+1,updated_at:new Date().toISOString()})});
  if(!r.ok)throw Error();const rows=await r.json();return rows.length?reply({revision:rows[0].revision}):reply({error:'Newer choices exist'},409);
 }catch{return reply({error:'Sync unavailable'},503)}
});

