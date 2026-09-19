import { useState } from "react";
import SiteShell from "./app/SiteShell.jsx";
import "./home-cover.css";

const SUBSCRIBE_ENDPOINT = (import.meta.env.VITE_SUBSCRIBE_ENDPOINT || "/api/subscribe").trim();
const paths = [
  ["01", "Work", "Original projects, images, and visual records.", "/work"],
  ["02", "Shop", "Artist editions and wearable work.", "/shop"],
  ["03", "Open Thread", "A public record built with community.", "/open-thread"],
  ["04", "Partners", "Commissions, collaborations, and public projects.", "/partners"],
];

export default function HomeCover() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  async function subscribe(event) {
    event.preventDefault(); setStatus("Joining…");
    try { const response = await fetch(SUBSCRIBE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "home-cover", placement: "dispatch", path: "/" }) }); if (!response.ok) throw new Error(); setEmail(""); setStatus("You’re on the list."); } catch { setStatus("Please try again."); }
  }
  return <SiteShell mainId="home-main"><main id="home-main" className="cover-home"><section className="cover-hero"><img src="/instagram/coming-back-home.jpg" alt="Coming Back Home, a DE.LA.COSTA collage of Southern California street scenes" fetchPriority="high" /><div><span>Current issue / Southern California</span><h1>Art, memory, place, and the people who carry it.</h1><p>DE.LA.COSTA is the visual practice of Jorge S. Ruiz. TRST Studios is the platform around the work.</p><a href="/work">Explore the work</a></div></section><section className="cover-paths" aria-label="Explore TRST Studios">{paths.map(([number, title, copy, href]) => <a href={href} key={title}><small>{number}</small><strong>{title}</strong><span>{copy}</span><b>→</b></a>)}</section><section className="cover-feature"><img src="/api/homepage-image?key=grace" alt="Full of Grace, a DE.LA.COSTA visual work" loading="lazy" /><div><span>Featured project</span><h2>West of the Tracks</h2><p>A continuing visual archive of community, memory, belonging, and everyday life in Southern California.</p><a href="/work/west-of-the-tracks">Enter the project</a></div></section><section className="cover-dispatch"><div><span>TRST Dispatch</span><h2>New work, field notes, releases, and opportunities.</h2></div><form onSubmit={subscribe}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" /></label><button type="submit">Join Dispatch</button>{status && <small role="status">{status}</small>}</form></section></main></SiteShell>;
}
