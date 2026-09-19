import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { works } from "./content/works.js";
import SiteShell from "./app/SiteShell.jsx";
import "./storefront.css";

export default function Work() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Work | DE.LA.COSTA and TRST Studios";
    track("Work archive viewed");
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <SiteShell mainId="work-main">
      <main id="work-main">
        <section className="archive-hero">
          <p>DE.LA.COSTA / TRST STUDIOS</p>
          <h1>Work that keeps a record.</h1>
          <div>
            <span>Southern California</span>
            <span>Photography / illustration / public work</span>
            <span>Ongoing archive</span>
          </div>
        </section>
        <section className="archive-intro">
          <p>These works move between documentation and invention. People, neighborhoods, photographs, gestures, and ordinary objects become layered records of memory, place, and lived experience.</p>
          <a href="mailto:trststudiogallery@gmail.com?subject=Artwork%20or%20licensing%20inquiry">Ask about original work, editions, licensing, or exhibitions</a>
        </section>
        <section className="archive-grid" aria-label="Selected work">
          {works.map((work, index) => (
            <article className={index === 0 ? "archive-card featured" : "archive-card"} key={work.id}>
              <a className="archive-card-link" href={`/work/${work.id}`} onClick={() => track("Work project opened", { project: work.id })}>
                <img
                  src={work.image}
                  alt={work.title}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </a>
              <div>
                <span>{work.series} / {work.year}</span>
                <h2><a href={`/work/${work.id}`}>{work.title}</a></h2>
                <p>{work.copy}</p>
                <small>{work.medium}</small>
                <a className="archive-read-link" href={`/work/${work.id}`}>Read the project</a>
              </div>
            </article>
          ))}
        </section>
        <section className="archive-close">
          <div>
            <span>Collect</span>
            <h2>Bring the work into the next room.</h2>
          </div>
          <p>For original work, editions, exhibition loans, licensing, or a project that needs a living visual language, contact the studio directly.</p>
          <a href="mailto:trststudiogallery@gmail.com?subject=Artwork%20or%20licensing%20inquiry">Contact the studio</a>
        </section>
      </main>
    </SiteShell>
  );
}
