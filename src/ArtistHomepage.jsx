import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { artworkInventory } from "./artworkInventory";
import "./artist-homepage.css";

const INSTAGRAM_URL = "https://www.instagram.com/_de.la.costa_/";
const SUBSCRIBE_ENDPOINT = (import.meta.env.VITE_SUBSCRIBE_ENDPOINT || "/api/subscribe").trim();

const projects = [
  {
    eyebrow: "Featured project",
    title: "West of the Tracks",
    copy: "A continuing visual archive of community, memory, belonging, and everyday life in Southern California.",
    image: "/instagram/black-and-white.jpg",
    href: "#west-of-the-tracks",
  },
  {
    eyebrow: "Memory / portraiture",
    title: "Cheo's World",
    copy: "Neighborhood identity, friendship, tribute, and imagination held inside a lived visual world.",
    image: "/instagram/cheos-world.jpg",
    href: "#selected-work",
  },
  {
    eyebrow: "Place / wearable art",
    title: "Capistrano Love",
    copy: "A visual language built from home, town, coast, memory, and the feeling of carrying place with you.",
    image: "/instagram/coming-back-home.jpg",
    href: "/shop#shop",
  },
  {
    eyebrow: "Participatory / civic",
    title: "Open Thread",
    copy: "A living record of the places that shape us, built through public memory and community participation.",
    image: "/instagram/old-town-boogie.jpg",
    href: "/open-thread",
  },
];

const shopPieces = [
  {
    name: "Capistrano Love Tee",
    detail: "Place / Edition 001",
    price: "$31.01",
    image: "https://images-api.printify.com/mockup/6a78fdf747d9c5b8a60c79d7/78973/98445/capistrano-love-t-shirt-vintage-surf-tropical-graphic-tee.jpg?camera_label=front",
  },
  {
    name: "No Bad Days For A Warrior Tee",
    detail: "Daily uniform / Edition 001",
    price: "$29.05",
    image: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/79083/98445/no-bad-days-for-a-warrior-tee.jpg?camera_label=front",
  },
  {
    name: "Sin Miedo Tee",
    detail: "Street-art statement / Edition 001",
    price: "$29.45",
    image: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92570/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=front",
  },
];

const exhibitions = [
  ["2023", "To Live and Die Everyday", "Exhibizone / Solo exhibition"],
  ["2023", "Summer Camp", "ShockBoxx Gallery / Hermosa Beach"],
  ["2023", "LOVE 2023", "Exhibizone"],
  ["2023", "Digital Art Collection", "Las Laguna Art Gallery"],
  ["Feature", "Artist Closeup", "Artist profile"],
];

function trackHome(name, properties = {}) {
  try {
    track(name, properties);
  } catch {
    // Analytics should never interrupt navigation.
  }
}

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  async function submit(event) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState({ status: "error", message: "Enter a valid email address." });
      return;
    }

    setState({ status: "loading", message: "" });
    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website,
          source: "artist-homepage",
          placement: "homepage-footer",
          path: window.location.pathname,
          referrer: document.referrer || "",
          utm: {},
        }),
      });
      if (!response.ok) throw new Error("Signup could not be saved. Please try again.");
      setEmail("");
      setState({ status: "success", message: "You're on the list." });
      trackHome("Newsletter signup", { placement: "artist-homepage" });
    } catch (error) {
      setState({ status: "error", message: error.message || "Signup failed." });
    }
  }

  return (
    <form className="artist-subscribe" onSubmit={submit}>
      <label>
        <span>Email address</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
      </label>
      <label className="artist-honeypot" aria-hidden="true">
        Website
        <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex="-1" autoComplete="off" />
      </label>
      <button type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Joining…" : "Join TRST Dispatch"}</button>
      {state.message ? <small className={state.status}>{state.message}</small> : null}
    </form>
  );
}

export default function ArtistHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedWorks = artworkInventory.slice(0, 6);

  useEffect(() => {
    document.title = "Jorge S. Ruiz / DE.LA.COSTA | TRST Studios";
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="artist-home" id="top">
      <a className="artist-skip" href="#main">Skip to content</a>

      <header className="artist-header">
        <a className="artist-brand" href="#top" onClick={closeMenu}>
          <strong>DE.LA.COSTA</strong>
          <small>Jorge S. Ruiz / TRST Studios</small>
        </a>
        <button className="artist-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="artist-nav">
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav id="artist-nav" className={menuOpen ? "open" : ""} aria-label="Primary navigation">
          <a href="#selected-work" onClick={closeMenu}>Work</a>
          <a href="#projects" onClick={closeMenu}>Projects</a>
          <a href="/shop#shop" onClick={() => trackHome("Shop navigation click")}>Shop</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#journal" onClick={closeMenu}>Journal</a>
        </nav>
      </header>

      <main id="main">
        <section className="artist-hero">
          <div className="artist-hero-image">
            <img src="/instagram/black-and-white.jpg" alt="DE.LA.COSTA community photograph" fetchPriority="high" decoding="async" />
            <span className="archive-caption">SOUTHERN CALIFORNIA / VISUAL ARCHIVE / 2026</span>
          </div>
          <div className="artist-hero-copy">
            <span className="artist-kicker">Jorge S. Ruiz / working as DE.LA.COSTA</span>
            <h1>Art, memory, place, and the people who carry it.</h1>
            <p>Multidisciplinary work across photography, painting, drawing, film, mixed media, design, and wearable art—rooted in Southern California communities and lived experience.</p>
            <div className="artist-actions">
              <a href="#selected-work" onClick={() => trackHome("Hero work click")}>View the work</a>
              <a className="secondary" href="#west-of-the-tracks" onClick={() => trackHome("Hero project click")}>Featured project</a>
            </div>
            <div className="hand-note" aria-hidden="true">de.la.costa / field note 001</div>
          </div>
        </section>

        <section className="featured-project" id="west-of-the-tracks">
          <header className="editorial-heading">
            <div>
              <span>Featured project / ongoing</span>
              <h2>West of the Tracks</h2>
            </div>
            <p>A continuing visual archive of community, memory, belonging, and everyday life in Southern California. The tracks operate as both a physical landmark and a symbolic boundary—between visibility and erasure, movement and staying, outside narratives and lived experience.</p>
          </header>
          <div className="featured-spread">
            <figure className="featured-large">
              <img src="/instagram/black-and-white.jpg" alt="Black-and-white community photograph from the DE.LA.COSTA archive" loading="lazy" decoding="async" />
              <figcaption>FRAME 004 / COMMUNITY MEMORY</figcaption>
            </figure>
            <figure className="featured-small">
              <img src="/instagram/coming-back-home.jpg" alt="DE.LA.COSTA visual work about returning home" loading="lazy" decoding="async" />
              <figcaption>FRAME 001 / COMING BACK HOME</figcaption>
            </figure>
          </div>
        </section>

        <section className="selected-work" id="selected-work">
          <header className="editorial-heading">
            <div><span>Selected work</span><h2>The image before the product.</h2></div>
            <p>Six works from a larger evolving archive—photographs, drawings, and visual narratives concerned with community, memory, protection, faith, identity, and the emotional weight inside ordinary moments.</p>
          </header>
          <div className="selected-grid">
            {selectedWorks.map((work, index) => (
              <article className={`selected-card selected-card-${(index % 3) + 1}`} key={work.id}>
                <a href={work.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackHome("Artwork source click", { artwork: work.id })}>
                  <img src={work.image} alt={work.alt} loading="lazy" decoding="async" />
                </a>
                <div>
                  <small>{work.id} / {work.series}</small>
                  <h3>{work.title}</h3>
                  <p>{work.statement}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="projects-section" id="projects">
          <header className="editorial-heading">
            <div><span>Projects</span><h2>Bodies of work, not isolated images.</h2></div>
            <p>Each project carries its own visual language while remaining part of the same archive: people, place, memory, loss, resilience, community, and what survives when somebody chooses to record it.</p>
          </header>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <a className="project-card" href={project.href} key={project.title} onClick={() => trackHome("Project click", { project: project.title })}>
                <div className="project-image"><img src={project.image} alt="" loading="lazy" decoding="async" /></div>
                <div className="project-copy">
                  <small>{String(index + 1).padStart(2, "0")} / {project.eyebrow}</small>
                  <h3>{project.title}</h3>
                  <p>{project.copy}</p>
                  <span>Explore →</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-mark" aria-hidden="true">DLC</div>
          <div className="about-copy">
            <span>Artist</span>
            <h2>Jorge S. Ruiz</h2>
            <h3>DE.LA.COSTA / multidisciplinary visual practice</h3>
            <p>Jorge S. Ruiz, formerly exhibiting as Cokeys Ruiz, is a Southern California–based multidisciplinary artist working under the artist identity DE.LA.COSTA. His practice spans painting, photography, mixed media, film, drawing, design, and wearable forms.</p>
            <p>The work examines how identity, memory, place, and lived experience become embedded in images. People, neighborhoods, photographs, gestures, and everyday objects become layered visual records—part document, part memory, part invention.</p>
            <blockquote>“I make work about the places and people that stay with us—the things we carry, the stories we inherit, and what disappears when nobody records it.”</blockquote>
            <div className="about-links">
              <a href="#exhibitions">Selected exhibitions</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </section>

        <section className="collect-wear">
          <article className="collect-panel">
            <span>Collect</span>
            <h2>Original work and editions.</h2>
            <p>For original work, print editions, exhibition loans, licensing, or collaboration inquiries, start with the work and contact the studio directly.</p>
            <div className="collect-preview">
              {artworkInventory.slice(6, 9).map((work) => <img src={work.image} alt={work.alt} key={work.id} loading="lazy" />)}
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Ask the studio →</a>
          </article>

          <article className="wear-panel" id="wear">
            <span>Wear</span>
            <h2>Artwork translated into everyday form.</h2>
            <p>Edition 001 extends the visual archive into clothing without turning the practice into a clothing label.</p>
            <div className="wear-grid">
              {shopPieces.map((piece) => (
                <a href="/shop#shop" key={piece.name} onClick={() => trackHome("Wear product click", { product: piece.name })}>
                  <img src={piece.image} alt={piece.name} loading="lazy" decoding="async" />
                  <small>{piece.detail}</small>
                  <strong>{piece.name}</strong>
                  <em>From {piece.price}</em>
                </a>
              ))}
            </div>
            <a className="wear-shop" href="/shop#shop">Enter the shop →</a>
          </article>
        </section>

        <section className="journal-home" id="journal">
          <header className="editorial-heading">
            <div><span>Journal / field notes</span><h2>The archive while it is still happening.</h2></div>
            <p>Studio notes, street-level observations, community gatherings, releases, and images that sit between finished work and lived record.</p>
          </header>
          <div className="journal-home-grid">
            <a href="https://www.instagram.com/_de.la.costa_/p/DVC3Li9jL7a/" target="_blank" rel="noopener noreferrer">
              <img src="/instagram/coming-back-home.jpg" alt="Coming Back Home" loading="lazy" />
              <small>Field note / home</small><h3>Coming Back Home</h3>
            </a>
            <a href="https://www.instagram.com/_de.la.costa_/reel/DQlHUW7kcuP/" target="_blank" rel="noopener noreferrer">
              <img src="/instagram/old-town-boogie.jpg" alt="Old Town Boogie" loading="lazy" />
              <small>Field note / community</small><h3>Old Town Boogie</h3>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <img src="/instagram/game-recognizes-game.jpg" alt="Game Recognizes Game" loading="lazy" />
              <small>Field note / street</small><h3>Game Recognizes Game</h3>
            </a>
          </div>
        </section>

        <section className="exhibitions-section" id="exhibitions">
          <header className="editorial-heading">
            <div><span>Selected exhibitions & press</span><h2>A practice with a public record.</h2></div>
            <p>Selected presentations and editorial recognition from the developing exhibition history of Jorge S. Ruiz / DE.LA.COSTA.</p>
          </header>
          <div className="exhibition-list">
            {exhibitions.map(([year, title, venue]) => (
              <div key={`${year}-${title}`}><small>{year}</small><strong>{title}</strong><span>{venue}</span></div>
            ))}
          </div>
        </section>

        <section className="trst-section">
          <div>
            <span>Platform</span>
            <h2>TRST Studios</h2>
          </div>
          <div>
            <p>TRST Studios is the platform around the practice: a place for publishing, exhibitions, apparel, collaboration, community projects, visual storytelling, and whatever form the work needs next.</p>
            <p>DE.LA.COSTA is the artist identity. Jorge S. Ruiz is the artist. TRST Studios is the structure built to carry the work further.</p>
            <a href="/open-thread">Explore Open Thread →</a>
          </div>
        </section>

        <section className="dispatch-section" id="contact">
          <span>TRST Dispatch</span>
          <h2>Follow the work, not the noise.</h2>
          <p>New projects, exhibitions, visual essays, limited releases, and studio updates—sent when there is something worth opening.</p>
          <SubscribeForm />
        </section>
      </main>

      <footer className="artist-footer">
        <div className="footer-identity">
          <strong>JORGE S. RUIZ / DE.LA.COSTA</strong>
          <span>Multidisciplinary artist / Founder, TRST Studios</span>
          <small>Southern California</small>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#selected-work">Work</a>
          <a href="#projects">Projects</a>
          <a href="/shop#shop">Shop</a>
          <a href="#about">About</a>
          <a href="#exhibitions">Exhibitions</a>
          <a href="/open-thread">Open Thread</a>
          <a href="/fulfillment-policy">Customer care</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
        </nav>
        <div className="footer-sign">DE.LA.COSTA / TRST STUDIOS / PRIDE IN MY COMMUNITY</div>
      </footer>
    </div>
  );
}
