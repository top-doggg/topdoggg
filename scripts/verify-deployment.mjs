const BASE = (process.env.DEPLOYMENT_URL || "").replace(/\/$/, "");
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "";
if (!BASE) {
  console.error("DEPLOYMENT_URL is required");
  process.exit(2);
}

const checks = [
  { path: "/", type: "html" },
  { path: "/journal", type: "html" },
  { path: "/journal/coming-back-home", type: "html", contains: ["Coming Back Home", "BlogPosting"] },
  { path: "/journal/old-town-boogie", type: "html", contains: ["Old Town Boogie", "BlogPosting"] },
  { path: "/journal/the-realest-feeling", type: "html", contains: ["The Realest Feeling", "BlogPosting"] },
  { path: "/rss.xml", type: "rss", contains: ["<rss", "/journal/coming-back-home"] },
  { path: "/sitemap.xml", type: "xml", contains: ["/journal/coming-back-home", "/work/west-of-the-tracks"] },
  { path: "/9db50a3983c44815e0a030a0c2def0da.txt", type: "text", contains: ["9db50a3983c44815e0a030a0c2def0da"] },
];

const headers = BYPASS ? {
  "x-vercel-protection-bypass": BYPASS,
  "x-vercel-set-bypass-cookie": "true",
} : {};

let failures = 0;
for (const check of checks) {
  const response = await fetch(BASE + check.path, { headers, redirect: "manual" });
  const body = await response.text();
  const problems = [];

  if (response.status !== 200) problems.push("status=" + response.status);
  if (response.status >= 300 && response.status < 400) problems.push("redirect=" + (response.headers.get("location") || "unknown"));
  for (const needle of check.contains || []) {
    if (!body.includes(needle)) problems.push("missing=" + JSON.stringify(needle));
  }
  if (check.type === "html") {
    if (/name=["']robots["'][^>]+noindex/i.test(body)) problems.push("unexpected noindex");
    if (!/<link[^>]+rel=["']canonical["']/i.test(body)) problems.push("missing canonical");
  }

  if (problems.length) {
    failures += 1;
    console.error("FAIL", check.path, problems.join(", "));
  } else {
    console.log("PASS", check.path);
  }
}

if (failures) {
  console.error("\nDeployment verification failed:", failures, "route(s)");
  process.exit(1);
}
console.log("\nDeployment verification passed.");
