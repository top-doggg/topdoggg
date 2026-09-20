import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { works } from "../src/content/works.js";
import { dispatchEntries } from "../src/content/dispatches.js";
const SITE="https://trststudios.online";
const staticUrls=[
["/","2026-09-19","weekly","1.0"],["/shop","2026-09-19","weekly","0.9"],["/about","2026-09-19","monthly","0.7"],["/journal","2026-09-19","weekly","0.8"],["/work","2026-09-19","monthly","0.9"],["/fulfillment-policy","2026-08-01","monthly","0.4"],["/partners","2026-08-01","monthly","0.7"],["/open-thread","2026-08-04","weekly","0.8"],["/open-thread/santa-ana","2026-08-04","weekly","0.8"],["/open-thread/san-juan-capistrano","2026-08-04","weekly","0.8"]];
function esc(v){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
const urls=[...staticUrls.map(([path,lastmod,changefreq,priority])=>({path,lastmod,changefreq,priority})),...works.map((w)=>({path:"/work/"+w.id,lastmod:"2026-09-19",changefreq:"monthly",priority:"0.8"})),...dispatchEntries.map((e)=>({path:e.href,lastmod:e.lastModified,changefreq:"monthly",priority:"0.7"}))];
const sitemap=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...urls.map((i)=>["  <url>","    <loc>"+esc(SITE+i.path)+"</loc>","    <lastmod>"+i.lastmod+"</lastmod>","    <changefreq>"+i.changefreq+"</changefreq>","    <priority>"+i.priority+"</priority>","  </url>"].join("\n")),"</urlset>",""].join("\n");
const rss=['<?xml version="1.0" encoding="UTF-8"?>','<rss version="2.0">',"  <channel>","    <title>TRST Dispatch</title>","    <link>"+SITE+"/journal</link>","    <description>Field notes, releases, studio process, and images from the living TRST Studios archive.</description>","    <language>en-us</language>",...dispatchEntries.map((e)=>["    <item>","      <title>"+esc(e.title)+"</title>","      <link>"+SITE+e.href+"</link>","      <guid isPermaLink=\"true\">"+SITE+e.href+"</guid>","      <description>"+esc(e.copy)+"</description>","    </item>"].join("\n")),"  </channel>","</rss>",""].join("\n");
writeFileSync(resolve("dist/sitemap.xml"),sitemap);
writeFileSync(resolve("dist/rss.xml"),rss);
