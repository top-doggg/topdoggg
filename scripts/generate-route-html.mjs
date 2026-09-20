import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { works } from "../src/content/works.js";
import { dispatchEntries } from "../src/content/dispatches.js";
import { injectRouteSchema, routeSchema } from "./seo-schema.mjs";

const dist = resolve("dist");
const base = readFileSync(resolve(dist, "index.html"), "utf8");

const routes = [
  {
    file: "about.html",
    title: "About | DE.LA.COSTA and TRST Studios",
    description: "The artist practice of Jorge S. Ruiz, working as DE.LA.COSTA, and the TRST Studios platform around it.",
    canonical: "https://trststudios.online/about",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "journal.html",
    title: "Journal | TRST Studios",
    description: "TRST Dispatch: field notes, releases, studio process, and images from the living archive.",
    canonical: "https://trststudios.online/journal",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "work.html",
    title: "Work | DE.LA.COSTA and TRST Studios",
    description: "A living visual archive of photography, illustration, and public work by DE.LA.COSTA.",
    canonical: "https://trststudios.online/work",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "shop.html",
    title: "Shop DE.LA.COSTA Edition 001 | TRST Studios",
    description: "Shop DE.LA.COSTA Edition 001 from TRST Studios—artist-led apparel and wearable work rooted in place, memory, and community.",
    canonical: "https://trststudios.online/shop",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  ...works.map((work) => ({
    file: `work/${work.id}.html`,
    title: `${work.title} | DE.LA.COSTA`,
    description: work.copy,
    canonical: `https://trststudios.online/work/${work.id}`,
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
    work,
  })),
  {
    file: "fulfillment-policy.html",
    title: "Shipping & Returns Policy | TRST Studios",
    description: "TRST Studios made-to-order shipping, returns, and issue-resolution policy.",
    canonical: "https://trststudios.online/fulfillment-policy",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "partners.html",
    title: "Partner With TRST | TRST Studios",
    description: "Sponsorship and strategic partnership opportunities with TRST Studios and DE.LA.COSTA.",
    canonical: "https://trststudios.online/partners",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "open-thread.html",
    title: "Open Thread | TRST Studios",
    description: "TRST Open Thread collects permissioned local stories and turns them into a public creative record.",
    canonical: "https://trststudios.online/open-thread",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "open-thread-santa-ana.html",
    title: "Open Thread: Santa Ana | TRST Studios",
    description: "A participatory TRST Studios community archive for Santa Ana, California.",
    canonical: "https://trststudios.online/open-thread/santa-ana",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "open-thread-san-juan-capistrano.html",
    title: "Open Thread: San Juan Capistrano | TRST Studios",
    description: "A participatory TRST Studios community archive for San Juan Capistrano, California.",
    canonical: "https://trststudios.online/open-thread/san-juan-capistrano",
    robots: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
  },
  {
    file: "wholesale.html",
    title: "Retail Partner Preview | TRST Studios",
    description: "Private retail partner preview for TRST Studios / DE.LA.COSTA Edition 001.",
    canonical: "https://trststudios.online/wholesale",
    robots: "noindex, nofollow",
  },
  {
    file: "operations.html",
    title: "TRST Operations | Internal",
    description: "Private TRST Studios operations workspace.",
    canonical: "https://trststudios.online/operations",
    robots: "noindex, nofollow",
  },
];

function replaceMeta(html, route) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${route.description}" />`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${route.robots}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${route.canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${route.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${route.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${route.canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${route.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${route.description}" />`);
}

for (const route of routes) {
  const target = resolve(dist, route.file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, injectRouteSchema(replaceMeta(base, route), routeSchema(route)));
}
