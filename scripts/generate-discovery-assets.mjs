import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { works } from "../src/content/works.js";
import { dispatchEntries } from "../src/content/dispatches.js";
import { products } from "../src/content/products.js";

const SITE = "https://trststudios.online";
const staticUrls = [
  ["/", "weekly", "1.0"],
  ["/shop", "weekly", "0.9"],
  ["/about", "monthly", "0.7"],
  ["/journal", "weekly", "0.8"],
  ["/work", "monthly", "0.9"],
  ["/fulfillment-policy", "monthly", "0.4"],
  ["/partners", "monthly", "0.7"],
  ["/open-thread", "weekly", "0.8"],
  ["/open-thread/santa-ana", "weekly", "0.8"],
  ["/open-thread/san-juan-capistrano", "weekly", "0.8"],
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const urls = [
  ...staticUrls.map(([path, changefreq, priority]) => ({ path, changefreq, priority })),
  ...works.map((work) => ({ path: "/work/" + work.id, changefreq: "monthly", priority: "0.8" })),
  ...products.map((product) => ({ path: "/shop/" + product.id, changefreq: "weekly", priority: "0.8" })),
  ...dispatchEntries.map((entry) => ({ path: entry.href, changefreq: "monthly", priority: "0.7" })),
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((item) => [
    "  <url>",
    "    <loc>" + esc(SITE + item.path) + "</loc>",
    "    <changefreq>" + item.changefreq + "</changefreq>",
    "    <priority>" + item.priority + "</priority>",
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0">',
  "  <channel>",
  "    <title>TRST Dispatch</title>",
  "    <link>" + SITE + "/journal</link>",
  "    <description>Field notes, releases, studio process, and images from the living TRST Studios archive.</description>",
  "    <language>en-us</language>",
  ...dispatchEntries.map((entry) => [
    "    <item>",
    "      <title>" + esc(entry.title) + "</title>",
    "      <link>" + SITE + entry.href + "</link>",
    '      <guid isPermaLink="true">' + SITE + entry.href + "</guid>",
    "      <description>" + esc(entry.copy) + "</description>",
    "    </item>",
  ].join("\n")),
  "  </channel>",
  "</rss>",
  "",
].join("\n");

writeFileSync(resolve("dist/sitemap.xml"), sitemap);
writeFileSync(resolve("dist/rss.xml"), rss);
