import { useEffect } from "react";
import { track } from "@vercel/analytics";
import SiteShell from "./app/SiteShell.jsx";
import "./storefront.css";

const chapters = [
  {
    number: "01",
    city: "Santa Ana",
    copy: "A shared record of what Santa Ana gives its people.",
    href: "/open-thread/santa-ana",
    image: "/instagram/black-and-white.jpg",
    imageAlt: "TRST community gathering outdoors",
  },
  {
    number: "02",
    city: "San Juan Capistrano",
    copy: "A shared record of what San Juan Capistrano gives its people.",
    href: "/open-thread/san-juan-capistrano",
    image: "/instagram/cheos-world.jpg",
    imageAlt: "TRST illustrated street scene",
  },
];

export default function OpenThreadHub() {
  useEffect(() => {
    const previousTitle = document.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.href;
    document.title = "Open Thread | TRST Studios";
    canonical?.setAttribute("href", "https://trststudios.online/open-thread");
    track("Open Thread hub viewed");
    return () => {
      document.title = previousTitle;
      if (previousCanonical) canonical?.setAttribute("href", previousCanonical);
    };
  }, []);

  return (
    <SiteShell mainId="thread-main">
      <main id="thread-main">
        <section className="thread-hub-hero">
          <span>TRST Open Thread</span>
          <h1>Every place leaves a mark.</h1>
          <p>Open Thread collects permissioned local signals, turns them into a public creative record, and returns them to the city as original TRST artifacts.</p>
        </section>
        <section className="thread-chapter-list" aria-label="Open Thread chapters">
          {chapters.map((chapter) => (
            <a href={chapter.href} key={chapter.href}>
              <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" decoding="async" width="800" height="450" />
              <span>Chapter {chapter.number}</span>
              <h2>{chapter.city}</h2>
              <p>{chapter.copy}</p>
              <strong>Enter the thread</strong>
            </a>
          ))}
        </section>
        <section className="thread-next">
          <div>
            <span>Bring Open Thread to your place</span>
            <h2>Become an anchor.</h2>
          </div>
          <p>For venues, artists, organizations, and local businesses that want to hold a real corner of a future chapter.</p>
          <a href="/partners">Start a conversation</a>
        </section>
      </main>
    </SiteShell>
  );
}
