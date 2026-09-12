import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { artworkInventory } from "./artworkInventory";
import "./artist-homepage.css";
import "./editorial-film.css";

const INSTAGRAM_URL = "https://www.instagram.com/_de.la.costa_/";
const SUBSCRIBE_ENDPOINT = (import.meta.env.VITE_SUBSCRIBE_ENDPOINT || "/api/subscribe").trim();
const FILM_URL = "https://at.adobe.com/0uG1Sq7K9HziocHr";

const editorial = {
  grace: "https://at.adobe.com/pKO92xtifSMlR6Ei",
  memorial: "https://at.adobe.com/Gj2CbbucRr10CA75",
  mural: "https://at.adobe.com/RZgEO5UquCJkQZ1x",
  mark: "https://at.adobe.com/rsUNIRdoVO7JIUQK",
  bandana: "https://at.adobe.com/MwwW6TmVWWd5LxYx",
  jaguar: "https://at.adobe.com/Z1UbN0Z2LGkDcNB9",
  warrior: "https://at.adobe.com/i7oV4sl2EbcHf6X2",
  vaqurito: "https://at.adobe.com/mWruWYtY6r4KSE1N",
};

const projects = [
  { number: "01", eyebrow: "Photography / film / community", title: "West of the Tracks", copy: "A continuing visual archive of community, memory, belonging, and everyday life in Southern California.", image: editorial.grace, href: "#west-of-the-tracks" },
  { number: "02", eyebrow: "Memory / portraiture / tribute", title: "Cheo's World", copy: "Neighborhood identity, friendship, innocence, and memory held inside a lived visual world.", image: "/instagram/cheos-world.jpg", href: "#projects" },
  { number: "03", eyebrow: "Place / visual identity / wearable art", title: "Capistrano Love", copy: "A visual language built from home, town, coast, memory, and the feeling of carrying place with you.", image: "/instagram/coming-back-home.jpg", href: "/shop#shop" },
  { number: "04", eyebrow: "Participatory / civic / public archive", title: "Open Thread", copy: "A living record of the places that shape us, built through public memory and community participation.", image: "/instagram/old-town-boogie.jpg", href: "/open-thread" },
];

const shopPieces = [
  { name: "Capistrano Love Tee", detail: "Place / Edition 001", price: "$31.01", image: "https://images-api.printify.com/mockup/6a78fdf747d9c5b8a60c79d7/78973/98445/capistrano-love-t-shirt-vintage-surf-tropical-graphic-tee.jpg?camera_label=front" },
  { name: "No Bad Days For A Warrior Tee", detail: "Daily uniform / Edition 001", price: "$29.05", image: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/79083/98445/no-bad-days-for-a-warrior-tee.jpg?camera_label=front" },
  { name: "Sin Miedo Tee", detail: "Street-art statement / Edition 001", price: "$29.45", image: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92570/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=front" },
];

const exhibitions = [
  ["2023", "To Live and Die Everyday", "Exhibizone / Solo exhibition"],
  ["2023", "Summer Camp", "ShockBoxx Gallery / Hermosa Beach"],
  ["2023", "LOVE 2023", "Exhibizone"],
  ["2023", "Digital Art Collection", "Las Laguna Art Gallery"],
  ["Feature", "Artist Closeup", "Artist profile"],
];

function trackHome(name, properties = {}) { try { track(name, properties); } catch {} }

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  async function submit(event) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setState({ status: "error", message: "Enter a valid email address." });
    setState({ status: "loading", message: "" });
    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: email.trim(), website, source: "artist-homepage", placement: "homepage-footer", path: window.location.pathname, referrer: document.referrer || "", utm: {} }) });
      if (!response.ok) throw new Error("Signup could not be saved. Please try again.");
      setEmail(""); setState({ status: "success", message: "You're on the list." }); trackHome("Newsletter signup", { placement: "artist-homepage" });
    } catch (error) { setState({ status: "error", message: error.message || "Signup failed." }); }
  }
  return <form className="artist-subscribe" onSubmit={submit}><label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label className="artist-honeypot" aria-hidden="true">Website<input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex="-1" autoComplete="off" /></label><button type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Joining…" : "Join TRST Dispatch"}</button>{state.message ? <small className={state.status}>{state.message}</small> : null}</form>;
}

export default function ArtistHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedWorks = artworkInventory.slice(6, 10);
  useEffect(() => { document.title = "Jorge S. Ruiz / DE.LA.COSTA | TRST Studios"; }, []);
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="artist-home" id="top">
      <a className="artist-skip" href="#main">Skip to content</a>
      <header className="artist-header"><a className="artist-brand" href="#top" onClick={closeMenu}><strong>DE.LA.COSTA</strong><small>Jorge S. Ruiz / TRST Studios</small></a><button className="artist-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="artist-nav">{menuOpen ? "Close" : "Menu"}</button><nav id="artist-nav" className={menuOpen ? "open" : ""} aria-label="Primary navigation"><a href="#selected-work" onClick={closeMenu}>Work</a><a href="#projects" onClick={closeMenu}>Projects</a><a href="/shop#shop" onClick={() => trackHome("Shop navigation click")}>Shop</a><a href="#about" onClick={closeMenu}>About</a><a href="#journal" onClick={closeMenu}>Journal</a></nav></header>
      <main id="main">
        <section className="artist-hero"><div className="artist-hero-copy"><span className="artist-kicker">Jorge S. Ruiz / working as DE.LA.COSTA</span><h1>Art, memory, place, and the people who carry it.</h1><p>Multidisciplinary work across photography, painting, drawing, film, mixed media, design, and wearable art—rooted in Southern California communities and lived experience.</p><div className="artist-actions"><a href="#selected-work" onClick={() => trackHome("Hero work click")}>View the work</a><a className="secondary" href="#west-of-the-tracks" onClick={() => trackHome("Hero project click")}>Featured project</a></div></div></section>
        <section className="visual-prologue" id="west-of-the-tracks">
          <figure className="prologue-main"><img src={editorial.grace} alt="Black-and-white DE.LA.COSTA visual work titled Full of Grace" fetchPriority="high" decoding="async" /><figcaption><span>WEST OF THE TRACKS / SOUTHERN CALIFORNIA</span><span>FRAME 001 / FULL OF GRACE</span></figcaption></figure>
          <div className="prologue-copy"><span>Featured project / ongoing</span><h2>West of the Tracks</h2><p>A continuing visual archive of community, memory, belonging, and everyday life in Southern California. The work moves between documentation and invention, treating the neighborhood not as backdrop but as a living record.</p></div>
          <div className="editorial-film"><div className="editorial-film-frame"><video src={FILM_URL} autoPlay muted loop playsInline controls preload="metadata" aria-label="4 The Town — DE.LA.COSTA film work" /></div><div className="editorial-film-meta"><span>FILM / FIELD NOTE / SOUTHERN CALIFORNIA</span><span>4 THE TOWN</span></div><div className="editorial-film-copy"><h3>Movement belongs in the archive too.</h3><p>The still images establish place and memory; the film lets the same world breathe, move, and unfold in real time. It sits inside the visual sequence as part of the work—not as a separate media player or promotional block.</p></div></div>
          <div className="editorial-duo"><figure className="duo-wide"><img src={editorial.memorial} alt="Memorial painting with flowers, angel, and family imagery" loading="lazy" decoding="async" /><figcaption>MEMORY / FAMILY / CONTINUITY</figcaption></figure><figure className="duo-tall"><img src={editorial.mural} alt="Detail of a colorful painted mural" loading="lazy" decoding="async" /><figcaption>PUBLIC WALL / COLOR / PLACE</figcaption></figure></div>
          <div className="identity-break" aria-label="TRST Studios visual mark"><img src={editorial.mark} alt="TRST Studio Gallery graffiti-style mark" loading="lazy" decoding="async" /><p>Field notes, studio work, memory, street-level observation, and visual culture held inside one evolving archive.</p></div>
        </section>
        <section className="selected-work" id="selected-work"><header className="editorial-heading compact-heading"><div><span>Selected work</span><h2>Image first. Explanation second.</h2></div><p>The upper half of the site now behaves like a visual sequence rather than a catalog: fewer works, larger scale, more breathing room.</p></header><div className="statement-gallery"><figure className="statement-piece statement-blue"><img src={editorial.bandana} alt="Blue ballpoint-style portrait with Lakers cap and bandana" loading="lazy" decoding="async" /><figcaption><span>PORTRAIT / BALLPOINT / BLUE</span><strong>Bandana Portrait</strong></figcaption></figure><figure className="statement-piece statement-warrior"><img src={editorial.jaguar} alt="Illustrated jaguar warrior figure" loading="lazy" decoding="async" /><figcaption><span>ANCESTRAL CONTINUUM</span><strong>Warrior Study</strong></figcaption></figure><figure className="statement-piece statement-linework"><img src={editorial.warrior} alt="Line drawing of a warrior profile with feathered headdress" loading="lazy" decoding="async" /><figcaption><span>DRAWING / SYMBOL / MEMORY</span><strong>Warrior Profile</strong></figcaption></figure></div><div className="archive-strip">{selectedWorks.map((work) => <a href={work.sourceUrl} target="_blank" rel="noopener noreferrer" key={work.id} onClick={() => trackHome("Artwork source click", { artwork: work.id })}><img src={work.image} alt={work.alt} loading="lazy" decoding="async" /><small>{work.id} / {work.series}</small><strong>{work.title}</strong></a>)}</div></section>
        <section className="projects-section" id="projects"><header className="editorial-heading"><div><span>Projects</span><h2>Bodies of work, not isolated images.</h2></div><p>Photography, drawing, tribute, civic memory, and wearable work all sit inside the same larger practice.</p></header><div className="projects-grid">{projects.map((project) => <a className="project-row" href={project.href} key={project.title} onClick={() => trackHome("Project click", { project: project.title })}><span className="project-number">{project.number}</span><div className="project-image"><img src={project.image} alt="" loading="lazy" decoding="async" /></div><div className="project-copy"><small>{project.eyebrow}</small><h3>{project.title}</h3><p>{project.copy}</p></div><span className="project-arrow">↗</span></a>)}</div></section>
        <section className="about-section" id="about"><figure className="about-image"><img src={editorial.vaqurito} alt="Child in cowboy hat at a family birthday gathering" loading="lazy" decoding="async" /><figcaption>PERSONAL ARCHIVE / FAMILY / PLACE</figcaption></figure><div className="about-copy"><span>Artist</span><h2>Jorge S. Ruiz</h2><h3>DE.LA.COSTA / multidisciplinary visual practice</h3><p>Jorge S. Ruiz, formerly exhibiting as Cokeys Ruiz, is a Southern California–based multidisciplinary artist working under the artist identity DE.LA.COSTA. His practice spans painting, photography, mixed media, film, drawing, design, and wearable forms.</p><p>The work examines how identity, memory, place, and lived experience become embedded in images. People, neighborhoods, photographs, gestures, and everyday objects become layered visual records—part document, part memory, part invention.</p><blockquote>“I make work about the places and people that stay with us—the things we carry, the stories we inherit, and what disappears when nobody records it.”</blockquote></div></section>
        <section className="collect-wear"><article className="collect-panel"><span>Collect</span><h2>Original work and editions.</h2><p>For original work, print editions, exhibition loans, licensing, or collaboration inquiries, contact the studio directly.</p><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Ask the studio →</a></article><article className="wear-panel" id="wear"><span>Wear</span><h2>Artwork translated into everyday form.</h2><p>Edition 001 extends the visual archive into clothing without turning the practice into a clothing label.</p><div className="wear-grid">{shopPieces.map((piece) => <a href="/shop#shop" key={piece.name} onClick={() => trackHome("Wear product click", { product: piece.name })}><img src={piece.image} alt={piece.name} loading="lazy" decoding="async" /><small>{piece.detail}</small><strong>{piece.name}</strong><em>From {piece.price}</em></a>)}</div><a className="wear-shop" href="/shop#shop">Enter the shop →</a></article></section>
        <section className="journal-home" id="journal"><header className="editorial-heading"><div><span>Journal / field notes</span><h2>The archive while it is still happening.</h2></div><p>Studio notes, street-level observations, community gatherings, releases, and images that sit between finished work and lived record.</p></header><div className="journal-home-grid"><a href="https://www.instagram.com/_de.la.costa_/p/DVC3Li9jL7a/" target="_blank" rel="noopener noreferrer"><img src="/instagram/coming-back-home.jpg" alt="Coming Back Home" loading="lazy" /><small>Field note / home</small><h3>Coming Back Home</h3></a><a href="https://www.instagram.com/_de.la.costa_/reel/DQlHUW7kcuP/" target="_blank" rel="noopener noreferrer"><img src="/instagram/old-town-boogie.jpg" alt="Old Town Boogie" loading="lazy" /><small>Field note / community</small><h3>Old Town Boogie</h3></a><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><img src="/instagram/game-recognizes-game.jpg" alt="Game Recognizes Game" loading="lazy" /><small>Field note / street</small><h3>Game Recognizes Game</h3></a></div></section>
        <section className="exhibitions" id="exhibitions"><header className="editorial-heading"><div><span>Selected exhibitions & press</span><h2>Public record.</h2></div></header><div className="exhibition-list">{exhibitions.map(([year, title, venue]) => <div key={`${year}-${title}`}><span>{year}</span><strong>{title}</strong><em>{venue}</em></div>)}</div></section>
        <section className="studio-section"><span>TRST Studios</span><h2>The platform around the practice.</h2><p>TRST Studios publishes, produces, documents, and extends the world around DE.LA.COSTA—from original artwork and photography to releases, public projects, collaborations, and community storytelling.</p></section>
        <section className="dispatch-section"><div><span>TRST Dispatch</span><h2>New work, field notes, releases, and opportunities.</h2></div><SubscribeForm /></section>
      </main>
      <footer className="artist-footer"><div><strong>DE.LA.COSTA</strong><small>Jorge S. Ruiz / TRST Studios</small></div><div className="footer-links"><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a><a href="/shop#shop">Shop</a><a href="/fulfillment-policy">Customer care</a><a href="mailto:trststudiogallery@gmail.com">Collector inquiries</a></div><small>Southern California / independent visual practice.</small></footer>
    </div>
  );
}
