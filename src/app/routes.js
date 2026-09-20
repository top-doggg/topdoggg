const SITE_URL="https://trststudios.online";
export const publicRoutes=[
{id:"home",path:"/",title:"TRST Studios | DE.LA.COSTA",indexable:true},
{id:"work",path:"/work",title:"Work | TRST Studios",indexable:true},
{id:"shop",path:"/shop",title:"Shop | TRST Studios",indexable:true},
{id:"openThread",path:"/open-thread",title:"Open Thread | TRST Studios",indexable:true},
{id:"partners",path:"/partners",title:"Partners | TRST Studios",indexable:true},
{id:"journal",path:"/journal",title:"Journal | TRST Studios",indexable:true},
{id:"about",path:"/about",title:"About | DE.LA.COSTA and TRST Studios",indexable:true},
{id:"fulfillment",path:"/fulfillment-policy",title:"Fulfillment | TRST Studios",indexable:true},
];
export function normalizePathname(pathname){return pathname.replace(/\/+$/,"")||"/";}
export function resolveRoute(pathname){
 const path=normalizePathname(pathname);
 const journalMatch=path.match(/^\/journal\/([^/]+)$/); if(journalMatch)return{id:"journalEntry",params:{slug:journalMatch[1]}};
 const projectMatch=path.match(/^\/work\/([^/]+)$/); if(projectMatch)return{id:"project",params:{projectId:projectMatch[1]}};
 const chapterMatch=path.match(/^\/open-thread\/(santa-ana|san-juan-capistrano)$/); if(chapterMatch)return{id:"openThreadChapter",params:{chapter:chapterMatch[1]}};
 if(path==="/partner-a-drop")return{id:"partners",params:{}}; if(path==="/wholesale")return{id:"wholesale",params:{}}; if(path==="/operations")return{id:"operations",params:{}};
 const route=publicRoutes.find((entry)=>entry.path===path); return{id:route?.id||"home",params:{}};
}
export function canonicalUrl(pathname){return SITE_URL+normalizePathname(pathname);}
