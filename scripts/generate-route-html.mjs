import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve("dist");
const base = readFileSync(resolve(dist, "index.html"), "utf8");

const routes = [
  {
    file: "shop.html",
    title: "Shop DE.LA.COSTA Edition 001 | TRST Studios",
    description: "Shop DE.LA.COSTA Edition 001 from TRST Studios—artist-led apparel and wearable work rooted in place, memory, and community.",
    canonical: "https://trststudios.online/shop",
    robots: "index, follow",
  },
  {
    file: "fulfillment-policy.html",
    title: "Shipping & Returns Policy | TRST Studios",
    description: "TRST Studios made-to-order shipping, returns, and issue-resolution policy.",
    canonical: "https://trststudios.online/fulfillment-policy",
    robots: "index, follow",
  },
  {
    file: "partners.html",
    title: "Partner With TRST | TRST Studios",
    description: "Sponsorship and strategic partnership opportunities with TRST Studios and DE.LA.COSTA.",
    canonical: "https://trststudios.online/partners",
    robots: "index, follow",
  },
  {
    file: "open-thread.html",
    title: "Open Thread | TRST Studios",
    description: "TRST Open Thread collects permissioned local stories and turns them into a public creative record.",
    canonical: "https://trststudios.online/open-thread",
    robots: "index, follow",
  },
  {
    file: "open-thread-santa-ana.html",
    title: "Open Thread: Santa Ana | TRST Studios",
    description: "A participatory TRST Studios community archive for Santa Ana, California.",
    canonical: "https://trststudios.online/open-thread/santa-ana",
    robots: "index, follow",
  },
  {
    file: "open-thread-san-juan-capistrano.html",
    title: "Open Thread: San Juan Capistrano | TRST Studios",
    description: "A participatory TRST Studios community archive for San Juan Capistrano, California.",
    canonical: "https://trststudios.online/open-thread/san-juan-capistrano",
    robots: "index, follow",
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
  writeFileSync(resolve(dist, route.file), replaceMeta(base, route));
}
