import { works } from "./works.js";
import { dispatchEntries } from "./dispatches.js";
import { products } from "./products.js";
const STOP_WORDS=new Set(["a","an","and","are","as","at","be","by","for","from","in","into","is","it","of","on","or","the","to","with"]);
function terms(value){ return new Set(String(value||"").toLowerCase().replace(/[^a-z0-9\s-]/g," ").split(/\s+/).filter((term)=>term.length>2&&!STOP_WORDS.has(term))); }
function searchableText(node){ return [node.title,node.series,node.kicker,node.summary,node.location,node.medium].filter(Boolean).join(" "); }
export const contentNodes=[
  ...works.map((work)=>({key:"work:"+work.id,kind:"work",id:work.id,path:"/work/"+work.id,title:work.title,series:work.series,summary:work.copy,image:work.image,location:work.location,medium:work.medium,indexable:true,source:work})),
  ...dispatchEntries.map((entry)=>({key:"journal:"+entry.slug,kind:"journal",id:entry.slug,path:entry.href,title:entry.title,kicker:entry.kicker,summary:entry.copy,image:entry.image,indexable:true,relatedWorkIds:entry.relatedWorkIds||[],source:entry})),
  ...products.map((product)=>({key:"product:"+product.id,kind:"product",id:product.id,path:"/shop",title:product.name,summary:product.story,image:product.image,indexable:false,source:product})),
];
export function contentNode(key){ return contentNodes.find((node)=>node.key===key); }
function scorePair(a,b){
  let score=0;
  if(a.kind==="journal"&&b.kind==="work"&&a.relatedWorkIds?.includes(b.id)) score+=10;
  if(b.kind==="journal"&&a.kind==="work"&&b.relatedWorkIds?.includes(a.id)) score+=10;
  if(a.series&&b.series&&a.series===b.series) score+=4;
  if(a.location&&b.location&&a.location===b.location) score+=3;
  const left=terms(searchableText(a)); const right=terms(searchableText(b));
  for(const term of left) if(right.has(term)) score+=1;
  return score;
}
export function relatedContent(key,limit=3){
  const source=contentNode(key); if(!source) return [];
  return contentNodes.filter((candidate)=>candidate.key!==source.key&&candidate.indexable)
    .map((candidate)=>({...candidate,relationScore:scorePair(source,candidate)}))
    .filter((candidate)=>candidate.relationScore>0)
    .sort((a,b)=>b.relationScore-a.relationScore||a.title.localeCompare(b.title)).slice(0,limit);
}
