import { useEffect } from "react";
import SiteShell from "./app/SiteShell.jsx";
import "./editorial-pages.css";

export default function About() {
  useEffect(() => {
    document.title = "About | DE.LA.COSTA and TRST Studios";
  }, []);

  return (
    <SiteShell mainId="about-main">
      <main id="about-main" className="editorial-page">
        <a className="skip-link" href="#about-main">Skip to content</a>
        <header className="editorial-page-header">
          <a href="/"><strong>DE.LA.COSTA</strong><small>TRST Studios</small></a>
        </header>
        <section id="about-main" className="editorial-page-intro">
          <span>Artist / studio</span>
          <h1>Jorge S. Ruiz works as DE.LA.COSTA.</h1>
          <p>A Southern California multidisciplinary visual practice working through painting, photography, mixed media, film, drawing, design, and wearable forms.</p>
        </section>
        <section className="editorial-page-split">
          <figure>
            <img src="/api/profile-image" alt="Child in a cowboy hat at a family gathering" fetchPriority="high" loading="eager" decoding="async" />
            <figcaption>Personal archive / family / place</figcaption>
          </figure>
          <div>
            <h2>A record of what stays with us.</h2>
            <p>The work examines how identity, memory, place, and lived experience become embedded in images. People, neighborhoods, photographs, gestures, and everyday objects become layered visual records: part document, part memory, part invention.</p>
            <p>TRST Studios is the platform around that practice. It publishes, produces, documents, and extends the work through original art, releases, public projects, collaborations, and community storytelling.</p>
            <a className="editorial-link" href="/work">Explore the archive</a>
          </div>
        </section>
        <section className="editorial-page-list">
          <span>Selected public record</span>
          <h2>Exhibitions and recognition</h2>
          <dl>
            <div><dt>2023</dt><dd>To Live and Die Everyday <small>Exhibizone / Solo exhibition</small></dd></div>
            <div><dt>2023</dt><dd>Summer Camp <small>ShockBoxx Gallery / Hermosa Beach</small></dd></div>
            <div><dt>2023</dt><dd>LOVE 2023 <small>Exhibizone</small></dd></div>
            <div><dt>2023</dt><dd>Digital Art Collection <small>Las Laguna Art Gallery</small></dd></div>
          </dl>
        </section>
      </main>
    </SiteShell>
  );
}
