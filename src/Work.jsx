import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { archiveWorks } from "./archiveData.js";
import "./storefront.css";

export default function Work() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Work | DE.LA.COSTA and TRST Studios";
    track("Work archive viewed");
    return () => { document.title = previousTitle; };
  }, []);

  return <div className="archive-page">
    <a className="skip-link" href="#work-main">Skip to work</a>
    <header className="archive-header"><a className="wordmark" href="/" aria-label="TRST Studios home"><strong>TRST STUDIOS</strong><small>DE.LA.COSTA / Visual archive</small></a><nav aria-label="Archive navigation"><a href="/">Current issue</a><a href="/open-thread">Open Thread</a><a href="/partners">Collaborate</a></nav></header>
    <main id="work-main">
      <section className="archive-hero"><p>DE.LA.COSTA / TRST STUDIOS</p><h1>Work that keeps a record.</h1><div><span>Southern California</span><span>Photography / illustration / public work</span><span>Ongoing archive</span></div></section>
      <section className="archive-intro"><p>These works move between documentation and invention. People, neighborhoods, photographs, gestures, and ordinary objects become layered records of memory, place, and lived experience.</p><a href="mailto:trststudiogallery@gmail.com?subject=Artwork%20or%20licensing%20inquiry">Ask about original work, editions, licensing, or exhibitions</a></section>
      <section className="archive-grid" aria-label="Selected work">
        {archiveWorks.map((work, index) => <article className={index === 0 ? "archive-card featured" : "archive-card"} key={work.id}>
          <a className="archive-card-link" href={`/work/${work.id}`} onClick={() => track("Work project opened", { project: work.id })}><img src={work.image} alt={work.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" /></a>
          <div><span>{work.series} / {work.year}</span><h2><a href={`/work/${work.id}`}>{work.title}</a></h2><p>{work.copy}</p><small>{work.medium}</small><a className="archive-read-link" href={`/work/${work.id}`}>Read the project</a></div>
        </article>)}
      </section>
      <section className="archive-close"><div><span>Collect</span><h2>Bring the work into the next room.</h2></div><p>For original work, editions, exhibition loans, licensing, or a project that needs a living visual language, contact the studio directly.</p><a href="mailto:trststudiogallery@gmail.com?subject=Artwork%20or%20licensing%20inquiry">Contact the studio</a></section>
    </main>
    <footer className="archive-footer"><strong>TRST STUDIOS</strong><a href="/">Return to the current issue</a></footer>
  </div>;
}
