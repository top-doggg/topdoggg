import assert from 'node:assert/strict';
import test from 'node:test';
import { compareReactInteractions } from './check-react-interactions.mjs';

const original = `export default function HomeCover({ trackIntent }) {
  return <div>
    <a className="cover-hero-secondary" href="/work" onClick={() => trackIntent("work")}>Explore the work</a>
    <button type="button" onClick={openMenu} aria-label="Open menu">Menu</button>
    <form onSubmit={submitContact}><input name="email" required aria-label="Email" /></form>
  </div>;
}`;

test('unchanged React routing, event handlers and semantics pass', () => {
  assert.deepEqual(compareReactInteractions(original, original), []);
});

test('allows visual class-independent styling while preserving link and handler', () => {
  const changed = original.replace('Explore the work</a>', '<strong>Explore the work</strong></a>');
  assert.deepEqual(compareReactInteractions(original, changed), []);
});

test('regression: accepted fake variant drops href and React onClick', () => {
  const changed = original.replace(
    'href="/work" onClick={() => trackIntent("work")}',
    '',
  );
  const findings = compareReactInteractions(original, changed);
  assert.ok(findings.some(f => f.includes('href:')));
  assert.ok(findings.some(f => f.includes('onClick:')));
});

test('regression: changed navigation target is blocked', () => {
  const changed = original.replace('href="/work"', 'href="/shop"');
  assert.ok(compareReactInteractions(original, changed).some(f => f.includes('href:')));
});

test('regression: changed event callback is blocked', () => {
  const changed = original.replace('trackIntent("work")', 'trackIntent("shop")');
  assert.ok(compareReactInteractions(original, changed).some(f => f.includes('onClick:')));
});

test('regression: removal of an interactive control is blocked', () => {
  const changed = original.replace(/<button.*?<\/button>/, '');
  assert.ok(compareReactInteractions(original, changed).some(f => f.includes('removed')));
});

test('regression: accessibility and form semantics cannot silently change', () => {
  const changed = original.replace('aria-label="Email"', 'aria-label="Message"')
    .replace('required aria-label', 'aria-label');
  const findings = compareReactInteractions(original, changed);
  assert.ok(findings.some(f => f.includes('aria-label:')));
  assert.ok(findings.some(f => f.includes('required:')));
});

test('new interactive elements are permitted without weakening existing contracts', () => {
  const changed = original.replace('</div>;', '<button onClick={newAction}>New</button></div>;');
  assert.deepEqual(compareReactInteractions(original, changed), []);
});

test('JSX spread props and event bindings remain guarded', () => {
  const base = 'const Panel = () => <button {...props} onKeyDown={handleKey}>Go</button>';
  const changed = 'const Panel = () => <button {...rest} onKeyDown={otherHandler}>Go</button>';
  const findings = compareReactInteractions(base, changed);
  assert.ok(findings.some(f => f.includes('...spread:')));
  assert.ok(findings.some(f => f.includes('onKeyDown:')));
});

test('TSX event contracts are parsed', () => {
  const base = 'const Link = ({go}: Props) => <a href="/work" onClick={go}>Work</a>';
  const changed = 'const Link = ({go}: Props) => <a onClick={go}>Work</a>';
  assert.ok(compareReactInteractions(base, changed, 'Link.tsx').some(f => f.includes('href:')));
});
