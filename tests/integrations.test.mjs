import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { works } from '../src/content/works.js';
import { processProjects } from '../src/content/processProjects.js';
import { products } from '../src/content/products.js';
import { createOperationsToken, verifyOperationsToken } from '../api/_operations-auth.js';
import printify from '../api/printify-connection.js';
import subscribe from '../api/subscribe.js';
import operations from '../api/operations.js';
import { parseRange } from '../api/film.js';

function response() {
  return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = value ? JSON.parse(value) : null; } };
}

// Never send email, query production records, or call Printify in source CI.
test('private operations tokens reject tampering, expiration, and unlisted users', () => {
  const keys = ['TRST_OPERATIONS_TOKEN_SECRET', 'TRST_OPERATIONS_EMAIL', 'SUBSCRIBER_UNSUBSCRIBE_SECRET'];
  const before = keys.map(key => process.env[key]);
  try {
    process.env.TRST_OPERATIONS_TOKEN_SECRET = 'test-only-key';
    process.env.TRST_OPERATIONS_EMAIL = 'qa@example.invalid';
    const token = createOperationsToken('qa@example.invalid');
    assert.equal(verifyOperationsToken(token).email, 'qa@example.invalid');
    assert.equal(verifyOperationsToken(token + 'x'), null);
    assert.equal(verifyOperationsToken(token + '.extra'), null);
    assert.equal(verifyOperationsToken(createOperationsToken('other@example.invalid')), null);
    const payload = Buffer.from(JSON.stringify({ email: 'qa@example.invalid', expiresAt: Date.now() - 1000 })).toString('base64url');
    const signature = createHmac('sha256', 'test-only-key').update(payload).digest('base64url');
    assert.equal(verifyOperationsToken(payload + '.' + signature), null);
    process.env.TRST_OPERATIONS_TOKEN_SECRET = '';
    process.env.SUBSCRIBER_UNSUBSCRIBE_SECRET = '';
    assert.equal(verifyOperationsToken(token), null);
  } finally { keys.forEach((key, i) => before[i] === undefined ? delete process.env[key] : process.env[key] = before[i]); }
});

test('Printify management denies anonymous requests before accessing provider API', async () => {
  const res = response();
  await printify({ method: 'GET', headers: {}, url: '/api/printify-connection' }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.ok, false);
});

test('subscriber readiness reports unconfigured storage honestly without writing', async () => {
  const keys = ['BLOB_READ_WRITE_TOKEN', 'VERCEL_OIDC_TOKEN', 'BLOB_STORE_ID'];
  const before = keys.map(key => process.env[key]);
  try {
    keys.forEach(key => delete process.env[key]);
    const res = response();
    await subscribe({ method: 'GET', headers: {}, url: '/api/subscribe' }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.configured, false);
    assert.equal(res.body.storage, null);
  } finally { keys.forEach((key, i) => before[i] === undefined ? delete process.env[key] : process.env[key] = before[i]); }
});

test('every curated portfolio and process asset exists; catalog IDs are unique', () => {
  const images = [...works.map(work => work.image), ...processProjects.flatMap(project => [project.cover.src, ...project.stages.map(stage => stage.src)])];
  for (const image of images) {
    assert.ok(image.startsWith('/'), 'curated archive must use an explicit local asset');
    assert.ok(existsSync(new URL('../public' + image, import.meta.url)), 'missing curated asset: ' + image);
  }
  assert.equal(new Set(products.map(product => product.id)).size, products.length);
  for (const product of products) assert.match(product.image, /^https:\/\/images-api\.printify\.com\//);
});


test('operations never claims email delivery without an email provider', async () => {
  const keys = ['BLOB_READ_WRITE_TOKEN', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL'];
  const before = keys.map(key => process.env[key]);
  try {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-only-no-network';
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    const res = response();
    await operations({ method: 'POST', headers: {}, url: '/api/operations' }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.ok, false);
    const denied = response();
    await operations({ method: 'GET', headers: {}, url: '/api/operations' }, denied);
    assert.equal(denied.statusCode, 401);
  } finally { keys.forEach((key, i) => before[i] === undefined ? delete process.env[key] : process.env[key] = before[i]); }
});

test('film ranges cover bounded, open, suffix, and unsatisfiable requests', () => {
  assert.deepEqual(parseRange('bytes=0-9', 100), { start: 0, end: 9 });
  assert.deepEqual(parseRange('bytes=90-', 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange('bytes=-10', 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange('bytes=90-999', 100), { start: 90, end: 99 });
  for (const value of ['bytes=100-', 'bytes=2-1', 'bytes=-0', 'bytes=-', 'bytes=0-1,3-4', 'bytes=9007199254740992-']) {
    assert.equal(parseRange(value, 100), null, value);
  }
});


test('public image files contain image bytes rather than text or encoded payloads', () => {
  const root = new URL('../public/', import.meta.url);
  for (const path of readdirSync(root, { recursive: true }).filter(path => /\.(png|jpe?g|webp|gif)$/i.test(path))) {
    const data = readFileSync(new URL(path, root));
    const valid = /\.png$/i.test(path) ? data.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'
      : /\.jpe?g$/i.test(path) ? data[0] === 255 && data[1] === 216
      : /\.webp$/i.test(path) ? data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP'
      : /^GIF8[79]a$/.test(data.subarray(0, 6).toString());
    assert.ok(valid, 'invalid image container: ' + path);
  }
});
