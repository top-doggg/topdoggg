import { createHash } from "node:crypto";
import { get, put } from "@vercel/blob";
const SITE="https://trststudios.online", HOST="trststudios.online", KEY="9db50a3983c44815e0a030a0c2def0da", STATE_PATH="seo/indexnow-state.json";
async function previous(){try{const r=await get(STATE_PATH,{access:"private"});if(!r?.stream)return null;return JSON.parse(await new Response(r.stream).text());}catch{return null;}}
export default async function handler(request,response){
 if(request.method!=="GET"){response.setHeader("Allow","GET");return response.status(405).json({ok:false,error:"Method not allowed"});}
 const secret=process.env.CRON_SECRET;
 if(!secret)return response.status(401).json({ok:false,active:false,error:"CRON_SECRET not configured"});
 if(request.headers.authorization!=="Bearer "+secret)return response.status(401).json({ok:false,error:"Unauthorized"});
 try{
  const sr=await fetch(SITE+"/sitemap.xml",{cache:"no-store"}); if(!sr.ok)throw new Error("Sitemap returned "+sr.status);
  const xml=await sr.text(), hash=createHash("sha256").update(xml).digest("hex"), old=await previous();
  if(old?.hash===hash)return response.status(200).json({ok:true,active:true,changed:false,submitted:0});
  const urlList=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m)=>m[1].trim());
  const up=await fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify({host:HOST,key:KEY,keyLocation:SITE+"/"+KEY+".txt",urlList})});
  if(![200,202].includes(up.status))throw new Error("IndexNow returned "+up.status);
  await put(STATE_PATH,JSON.stringify({hash,submittedAt:new Date().toISOString(),count:urlList.length}),{access:"private",allowOverwrite:true,addRandomSuffix:false,contentType:"application/json"});
  return response.status(200).json({ok:true,active:true,changed:true,submitted:urlList.length});
 }catch(error){console.error("IndexNow sync failed",{message:error?.message});return response.status(500).json({ok:false,error:error?.message||"IndexNow sync failed"});}
}
