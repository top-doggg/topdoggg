#!/usr/bin/env node
/**
 * Fail closed when a React JSX change removes or alters an existing interaction.
 * Designed as a post-Impeccable-accept check and a required pull-request job.
 *
 * Compares the current working tree against the base ref. New interactive
 * elements are permitted, but existing ones must retain their critical JSX
 * attributes (routing, event handlers, focus and accessibility contracts).
 * Intentional changes require explicit review; never silently waive this gate.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from '@babel/parser';

const INTERACTIVE = new Set(['a', 'button', 'input', 'select', 'textarea', 'form', 'summary', 'details', 'option', 'label']);
const CRITICAL = new Set([
  'href', 'to', 'action', 'formAction', 'target', 'rel', 'type', 'role',
  'tabIndex', 'disabled', 'required', 'readOnly', 'checked', 'defaultChecked',
  'name', 'htmlFor', 'aria-label', 'aria-labelledby', 'aria-describedby',
  'aria-expanded', 'aria-controls', 'aria-hidden', 'aria-disabled',
  'aria-pressed', 'aria-selected', 'aria-current', 'aria-haspopup', 'aria-live',
]);
const JSX_EXTENSIONS = /\.(?:jsx|tsx)$/i;

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 }).trimEnd();
}

function attributeName(name) {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXNamespacedName') return `${name.namespace.name}:${name.name.name}`;
  return '';
}

function elementName(name) {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression') return `${elementName(name.object)}.${elementName(name.property)}`;
  return '';
}

function attributeValue(attribute, source) {
  if (!attribute.value) return 'BOOLEAN_TRUE';
  const value = attribute.value;
  if (value.type === 'StringLiteral') return JSON.stringify(value.value);
  if (value.type === 'JSXExpressionContainer') {
    return source.slice(value.expression.start, value.expression.end).trim();
  }
  return source.slice(value.start, value.end).trim();
}

function extractBindings(source, file) {
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: ['jsx', ...(file.endsWith('.tsx') ? ['typescript'] : [])],
    errorRecovery: false,
  });
  const groups = new Map();
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'JSXOpeningElement') {
      const tag = elementName(node.name);
      const props = new Map();
      for (const attribute of node.attributes) {
        if (attribute.type === 'JSXSpreadAttribute') {
          const raw = source.slice(attribute.argument.start, attribute.argument.end).trim();
          props.set('...spread', (props.get('...spread') || '') + raw);
        } else {
          props.set(attributeName(attribute.name), attributeValue(attribute, source));
        }
      }
      const critical = new Map([...props].filter(([k]) =>
        CRITICAL.has(k) || /^on[A-Z]/.test(k) || k.startsWith('aria-') || k === '...spread'
      ));
      const roleInteractive = props.has('role') && /(button|link|switch|checkbox|radio|tab|menuitem)/i.test(props.get('role'));
      if (INTERACTIVE.has(tag) || critical.size > 0 || roleInteractive) {
        // Stable id/class identity first; use ordinal only for repeats.
        const identifier = props.has('id') ? `id:${props.get('id')}`
          : props.has('className') ? `class:${props.get('className')}`
          : '';
        const key = `${tag}|${identifier}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({
          tag,
          critical,
          line: node.loc?.start?.line || 0,
          summary: `<${tag}${identifier ? ' ' + identifier : ''}>`,
        });
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'tokens' || key === 'comments' || key === 'errors') continue;
      if (Array.isArray(value)) {
        for (const item of value) if (item?.type) visit(item);
      } else if (value?.type) visit(value);
    }
  };
  visit(ast.program);
  return groups;
}

export function compareReactInteractions(baseText, nextText, file = 'Component.jsx') {
  const before = extractBindings(baseText, file);
  const after = extractBindings(nextText, file);
  const findings = [];
  for (const [key, originals] of before) {
    const revised = after.get(key) || [];
    if (revised.length < originals.length) {
      findings.push(`${file}: removed ${originals.length - revised.length} existing interactive element(s) matching ${key}; restore or review explicitly`);
    }
    for (let i = 0; i < Math.min(originals.length, revised.length); i++) {
      const old = originals[i];
      const now = revised[i];
      const names = new Set([...old.critical.keys(), ...now.critical.keys()]);
      for (const attr of names) {
        const originalValue = old.critical.get(attr);
        const revisedValue = now.critical.get(attr);
        if (originalValue !== revisedValue) {
          const show = (v) => v === undefined ? '[missing]' : JSON.stringify(v).slice(0, 110);
          findings.push(`${file}:${now.line} ${old.summary} #${i + 1} ${attr}: ${show(originalValue)} -> ${show(revisedValue)}`);
        }
      }
    }
  }
  return findings;
}

export function inspectChanges(baseRef) {
  git('rev-parse', '--verify', baseRef);
  const files = git('ls-tree', '-r', '--name-only', baseRef, '--', 'src')
    .split(/\r?\n/).filter(f => JSX_EXTENSIONS.test(f));
  const findings = [];
  for (const file of files) {
    const original = execFileSync('git', ['show', `${baseRef}:${file}`], { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 });
    if (!existsSync(file)) {
      const groups = extractBindings(original, file);
      if ([...groups.values()].some(items => items.length > 0)) {
        findings.push(`${file}: component deleted or moved; existing interactions require review`);
      }
      continue;
    }
    const current = readFileSync(file, 'utf8');
    if (current === original) continue;
    try {
      findings.push(...compareReactInteractions(original, current, file));
    } catch (err) {
      findings.push(`${file}: parser failed closed: ${err.message}`);
    }
  }
  return { filesChecked: files.length, findings };
}

if (process.argv[1] && /check-react-interactions\.mjs$/.test(process.argv[1])) {
  const flag = process.argv.indexOf('--base');
  const base = flag >= 0 ? process.argv[flag + 1] : null;
  if (!base) {
    console.error('Usage: node scripts/check-react-interactions.mjs --base <base-commit-or-ref>');
    process.exitCode = 2;
  } else {
    try {
      const { filesChecked, findings } = inspectChanges(base);
      if (findings.length) {
        console.error(`Interaction contract FAILED: ${findings.length} change(s) across ${filesChecked} baseline React files.\n`);
        for (const finding of findings) console.error(`::error::${finding}`);
        process.exitCode = 1;
      } else {
        console.log(`Interaction contract PASSED: ${filesChecked} baseline React files checked against ${base}.`);
      }
    } catch (err) {
      console.error(`Interaction contract could not run: ${err.stack || err}`);
      process.exitCode = 2;
    }
  }
}
