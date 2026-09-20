import { useEffect } from "react";
import { trackDiscoveryEvent } from "./lib/discovery-telemetry.js";
import { workById } from "./content/works.js";
import { relatedContent } from "./content/contentGraph.js";
import SiteShell from "./app/SiteShell.jsx";
import "./storefront.css";
export default function ProjectDetail({projectId}){
 const work=workById(projectId);
 useEffect(()=>{if(work){document.title=work.title+" | DE.LA.COSTA";trackDiscoveryEvent("content_view",{contentType:"work",contentId:work.id});}},[work]);
 if(!work)return <SiteShell mainId="project-main"><main id="project-main" className="project-missing"><h1>That project is not in the archive yet.</h1><a href="/work">Return to the work</a></main></SiteShell>;
 const related=relatedContent("work:"+work.id,3);
 const mailto="mailto:trststudiogallery@gmail.com?subject="+encodeURIComponent(work.inquirySubject);
 return <SiteShell mainId="project-main"><main id="project-main">
  <section className="project-hero"><img src={work.image} alt={work.title} fetchPriority="high" decoding="async" loading="eager" style={{aspectRatio:"16/10",width:"100%",height:"auto"}} /><div><span>{work.series} / {work.year}</span><h1>{work.title}</h1><p>{work.copy}</p></div></section>
  <section className="project-statement"><div><span>Project note</span><h2>{work.series}</h2></div><p>{work.statement}</p><dl><div><dt>Year</dt><dd>{work.year}</dd></div><div><dt>Location</dt><dd>{work.location}</dd></div><div><dt>Medium</dt><dd>{work.medium}</dd></div></dl></section>
  <section className="project-inquiry"><div><span>Collect / collaborate</span><h2>Ask the studio about this work.</h2></div><p>Availability, print editions, exhibition loans, licensing, and project-specific collaboration are confirmed directly by the studio.</p><a href={mailto} onClick={()=>trackDiscoveryEvent("studio_inquiry",{contentType:"work",contentId:work.id})}>Start an inquiry</a></section>
  <section className="related-work" aria-labelledby="related-work-title"><header><span>Continue in the archive</span><h2 id="related-work-title">Related work</h2></header><div>
   {related.map((item)=><a href={item.path} key={item.key} onClick={()=>trackDiscoveryEvent("related_content_click",{contentType:"work",contentId:work.id,relatedId:item.key})}><img src={item.image} alt={item.title} loading="lazy" decoding="async" /><span>{item.kind==="journal"?"TRST Dispatch":item.series||"DE.LA.COSTA"}</span><strong>{item.title}</strong></a>)}
  </div></section>
 </main></SiteShell>;
}
