import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { archiveWorks, workById } from "./archiveData.js";
import "./storefront.css";

export default function ProjectDetail({ projectId }) {
  const work = workById(projectId);
  useEffect(() => { if (work) { document.title = `${work.title} | DE.LA.COSTA`; track("Work project viewed", { project: work.id }); } }, [work]);
  if (!work) return <main className="project-missing"><h1>That project is not in the archive yet.</h1><a href="/work">Return to the work</a></main>;
  const related = archiveWorks.filter((item) => item.id !== work.id).slice(0, 3);
  const mailto = `mailto:trststudiogallery@gmail.com?subject=${encodeURIComponent(work.inquirySubject)}`;
  return <div className="project-page">
    <a className="skip-link" href="#project-main">Skip to project</a>
    <header className="archive-header"><a className="wordmark" href="/" aria-label="TRST Studios home"><strong>TRST STUDIOS</strong><small>DE.LA.COSTA / Project</small></a><nav aria-label="Project navigation"><a href="/work">All work</a><a href="/open-thread">Open Thread</a><a href="/partners">Collaborate</a></nav></header>
    <main id="project-main">
      <section className="project-hero"><img src={work.image} alt={work.title} fetchPriority="high" decoding="async" /><div><span>{work.series} / {work.year}</span><h1>{work.title}</h1><p>{work.copy}</p></div></section>
      <section className="project-statement"><div><span>Project note</span><h2>{work.series}</h2></div><p>{work.statement}</p><dl><div><dt>Year</dt><dd>{work.year}</dd></div><div><dt>Location</dt><dd>{work.location}</dd></div><div><dt>Medium</dt><dd>{work.medium}</dd></div></dl></section>
      <section className="project-inquiry"><div><span>Collect / collaborate</span><h2>Ask the studio about this work.</h2></div><p>Availability, print editions, exhibition loans, licensing, and project-specific collaboration are confirmed directly by the studio.</p><a href={mailto}>Start an inquiry</a></section>
      <section className="related-work" aria-labelledby="related-work-title"><header><span>Continue in the archive</span><h2 id="related-work-title">Related work</h2></header><div>{related.map((item) => <a href={`/work/${item.id}`} key={item.id}><img src={item.image} alt={item.title} loading="lazy" decoding="async" /><span>{item.series}</span><strong>{item.title}</strong></a>)}</div></section>
    </main>
    <footer className="archive-footer"><strong>TRST STUDIOS</strong><a href="/work">Return to all work</a></footer>
  </div>;
}
