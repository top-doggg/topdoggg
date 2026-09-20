import { useEffect } from "react";
import { dispatchEntries } from "./content/dispatches.js";
import SiteShell from "./app/SiteShell.jsx";
import "./editorial-pages.css";
export default function Journal(){
  useEffect(()=>{document.title="Journal | TRST Studios";},[]);
  return <SiteShell mainId="journal-main"><main id="journal-main" className="editorial-page">
    <a className="skip-link" href="#journal-main">Skip to content</a>
    <header className="editorial-page-header"><a href="/"><strong>DE.LA.COSTA</strong><small>TRST Studios</small></a></header>
    <section className="editorial-page-intro"><span>TRST Dispatch</span><h1>The archive while it is still happening.</h1><p>Field notes, releases, studio process, and images that sit between finished work and lived record.</p></section>
    <section className="dispatch-grid">{dispatchEntries.map((entry,index)=><article key={entry.slug} className={index===0?"dispatch-featured":""}>
      <a href={entry.href} aria-label={"Read "+entry.title}><img src={entry.image} alt={entry.title} loading={index===0?"eager":"lazy"} decoding="async" /></a>
      <small>{entry.kicker}</small><h2><a href={entry.href}>{entry.title}</a></h2><p>{entry.copy}</p><a href={entry.href}>Read dispatch</a>
    </article>)}</section>
  </main></SiteShell>;
}
