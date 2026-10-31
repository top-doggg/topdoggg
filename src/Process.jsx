import { useEffect, useRef, useState } from "react";
import SiteShell from "./app/SiteShell.jsx";
import { processProjects } from "./content/processProjects.js";
import "./process.css";

export default function Process() {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const previous = document.title;
    document.title = "Portfolio & Process | DE.LA.COSTA / TRST Studios";
    return () => { document.title = previous; };
  }, []);
  function enlarge(item) { setSelected(item); dialog.current.showModal(); }
  return <SiteShell mainId="process-main">
    <main id="process-main" className="process-page">
      <header className="process-intro">
        <div><p className="process-eyebrow">DE.LA.COSTA / Studio selection</p><h1>Work.<br /><em>In the making.</em></h1><p className="process-lede">A closer look at the images, studies, and decisions behind the work.</p><p>Drawing, photography, design, and wearable forms share a language of place. Six selections bring finished images together with sketches, alternate treatments, and applications.</p><a className="process-text-link" href="#process-selection">Explore the selection <span aria-hidden="true">↓</span></a></div>
        <figure className="process-portrait"><img src="/portfolio/artist-portrait.webp" width="1086" height="1448" alt="Black-and-white portrait of a man seated in the open doorway of a car" fetchPriority="high" /><figcaption>DE.LA.COSTA / Portfolio & process</figcaption></figure>
      </header>
      <nav className="process-index" aria-label="Jump to a project">{processProjects.map((project, index) => <a key={project.id} href={`#${project.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{project.title}</a>)}</nav>
      <section id="process-selection" className="process-selection" aria-label="Portfolio and process projects">
        {processProjects.map((project, index) => <article className="process-project" id={project.id} key={project.id}>
          <div className="process-project-heading"><span className="process-number">{String(index + 1).padStart(2, "0")}</span><div><p className="process-eyebrow">{project.discipline}</p><h2>{project.title}</h2></div></div>
          <button className={`process-cover process-cover-${project.id}`} type="button" onClick={() => enlarge(project.cover)} aria-label={`Enlarge ${project.title}`}><img src={project.cover.src} alt={project.cover.alt} loading="lazy" decoding="async" /><span>View image <span aria-hidden="true">↗</span></span></button>
          <p className="process-summary">{project.summary}</p>
          <details className="process-details"><summary>Inside the work <span>{project.stages.length} images <b aria-hidden="true">+</b></span></summary><div className="process-stages">{project.stages.map((stage) => <figure key={stage.src}><button type="button" onClick={() => enlarge(stage)} aria-label={`Enlarge ${project.title}: ${stage.label}`}><img src={stage.src} alt={`${project.title}: ${stage.alt}`} loading="lazy" decoding="async" /></button><figcaption>{stage.label}</figcaption></figure>)}</div></details>
        </article>)}
      </section>
      <section className="process-close"><p className="process-eyebrow">TRST Studios</p><h2>Bring an idea.<br /><em>Let’s give it form.</em></h2><p>Brand development, design, and creative production.</p><a href="mailto:trststudiogallery@gmail.com?subject=Creative%20project%20inquiry">Start a project <span aria-hidden="true">↗</span></a><a className="process-archive-link" href="/work">Explore the visual archive</a></section>
    </main>
    <dialog className="process-lightbox" ref={dialog} onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}><button className="process-lightbox-close" type="button" onClick={() => dialog.current.close()} aria-label="Close enlarged image">Close ×</button>{selected && <figure><img src={selected.src} alt={selected.alt} /><figcaption>{selected.label}</figcaption></figure>}</dialog>
  </SiteShell>;
}
