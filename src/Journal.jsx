import { useEffect } from "react";
import SiteShell from "./app/SiteShell.jsx";
import "./editorial-pages.css";

const dispatches = [
  { title: "Coming Back Home", kind: "Field note / home", image: "/instagram/coming-back-home.jpg", copy: "A visual record of return, neighborhood, and the people who make a place feel lived in." },
  { title: "Old Town Boogie", kind: "Field note / community", image: "/instagram/old-town-boogie.jpg", copy: "Street-level observation held between history, movement, and everyday gathering." },
  { title: "Game Recognizes Game", kind: "Field note / street", image: "/instagram/game-recognizes-game.jpg", copy: "Images and gestures from the ongoing record of Southern California visual culture." },
];

export default function Journal() {
  useEffect(() => {
    document.title = "Journal | TRST Studios";
  }, []);

  return (
    <SiteShell mainId="journal-main">
      <main id="journal-main" className="editorial-page">
        <a className="skip-link" href="#journal-main">Skip to content</a>
        <header className="editorial-page-header">
          <a href="/"><strong>DE.LA.COSTA</strong><small>TRST Studios</small></a>
        </header>
        <section id="journal-main" className="editorial-page-intro">
          <span>TRST Dispatch</span>
          <h1>The archive while it is still happening.</h1>
          <p>Field notes, releases, studio process, and images that sit between finished work and lived record.</p>
        </section>
        <section className="dispatch-grid">
          {dispatches.map((entry, index) => (
            <article key={entry.title} className={index === 0 ? "dispatch-featured" : ""}>
              <img src={entry.image} alt={entry.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
              <small>{entry.kind}</small>
              <h2>{entry.title}</h2>
              <p>{entry.copy}</p>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}
