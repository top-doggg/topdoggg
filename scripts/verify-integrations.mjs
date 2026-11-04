// Read-only live probes. A 200 SPA fallback is never accepted as a working API/image.
const base = new URL(process.env.DEPLOYMENT_URL || 'https://trststudios.online');
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
  throw new Error('DEPLOYMENT_URL must be a plain HTTP(S) origin');
}
const headers = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {};
const checks = [
  ...['/', '/shop', '/work', '/process', '/about', '/partners', '/open-thread'].map(path => ({ path, status: 200, mime: 'text/html' })),
  ...['grace', 'memorial', 'mural', 'mark', 'bandana', 'jaguar', 'warrior'].map(key => ({ path: '/api/homepage-image?key=' + key, method: 'HEAD', status: 200, mime: 'image/' })),
  { path: '/api/profile-image', method: 'HEAD', status: 200, mime: 'image/' },
  { path: '/api/film', method: 'HEAD', status: 200, mime: 'video/mp4' },
  { path: '/api/subscribe', status: 200, mime: 'application/json', configured: true },
  { path: '/api/printify-connection', status: 401, mime: 'application/json' },
  { path: '/api/operations', status: 401, mime: 'application/json' },
];
const results = await Promise.all(checks.map(async check => {
  try {
    const response = await fetch(new URL(check.path, base), {
      method: check.method || 'GET', headers, redirect: 'manual', signal: AbortSignal.timeout(20000),
    });
    const mime = response.headers.get('content-type') || '';
    const problems = [];
    if (response.status !== check.status) problems.push('status=' + response.status);
    if (!mime.includes(check.mime)) problems.push('unexpected content type');
    if (check.configured && mime.includes('application/json')) {
      const body = await response.json();
      if (!body.configured) problems.push('storage not configured');
    } else await response.body?.cancel();
    return { path: check.path, ok: problems.length === 0, problems };
  } catch {
    // Do not log URL/header values or raw transport errors containing credentials.
    return { path: check.path, ok: false, problems: ['request failed or timed out'] };
  }
}));
for (const result of results) console.log(result.ok ? 'PASS' : 'FAIL', result.path, result.problems.join(', '));
console.log('HTTP checks do not prove browser rendering, provider stock, completed payment, or email delivery.');
if (results.some(result => !result.ok)) process.exitCode = 1;
