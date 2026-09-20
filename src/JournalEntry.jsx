import { useEffect } from "react";
import { trackDiscoveryEvent } from "./lib/discovery-telemetry.js";
import { dispatchBySlug } from "./content/dispatches.js";
import { relatedContent } from "./content/contentGraph.js";
import SiteShell from "./app/SiteShell.jsx";
import "./storefront.css";
export default function JournalEntry({slug}){
  const entry=dispatchBySlug(slug);
  useEffect(()=>{ if(!entry)return; document.title=entry.title+" | TRST Dispatch"; trackDiscoveryEvent("content_view",{contentType:"journal",contentId:entry.slug}); },[entry]);
  if(!entry) return <SiteShell mainId="journal-entry-main"><main id="journal-entry-main" className="project-missing"><h1>That dispatch is not in the archive yet.</h1><a href="/journal">Return to the journal</a></main></SiteShell>;
  const related=relatedContent("journal:"+entry.slug,3);
  return <SiteShell mainId="journal-entry-main"><main id="journal-entry-main">
    <section className="project-hero"><img src={entry.image} alt={entry.title} fetchPriority="high" loading="eager" decoding="async" /><div><span>{entry.kicker} / TRST Dispatch</span><h1>{entry.title}</h1><p>{entry.copy}</p></div></section>
    <section className="project-statement"><div><span>Published record</span><h2>Field note</h2></div><p>{entry.copy}</p><p><a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={()=>trackDiscoveryEvent("source_outbound",{contentType:"journal",contentId:entry.slug,destination:"instagram"})}>View the original published post</a></p></section>
    {related.length?<section className="related-work" aria-labelledby="journal-related-title"><header><span>Continue through the archive</span><h2 id="journal-related-title">Related work and notes</h2></header><div>
      {related.map((item)=><a href={item.path} key={item.key} onClick={()=>trackDiscoveryEvent("related_content_click",{contentType:"journal",contentId:entry.slug,relatedId:item.key})}>{item.image?<img src={item.image} alt={item.title} loading="lazy" decoding="async" />:null}<span>{item.kind==="journal"?"TRST Dispatch":item.series||"DE.LA.COSTA"}</span><strong>{item.title}</strong></a>)}
    </div></section>:null}
  </main></SiteShell>;
}
