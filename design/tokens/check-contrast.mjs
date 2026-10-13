// Contrast check for HTCO design tokens (WCAG 2.2). No dependencies: `node design/tokens/check-contrast.mjs`.
// Checks every foreground token against every background it may appear on, in both themes.
// Exit code 1 on any failure. Phase 3 runs this in CI.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(join(here, name), 'utf8'));
const base = load('base.json');

const BACKGROUNDS = ['bg.canvas', 'bg.surface', 'bg.raised', 'bg.sunken', 'bg.selected'];
const TEXT = ['text.primary', 'text.secondary', 'text.muted', 'text.link', 'accent.text', 'attention.text', 'success.text', 'danger.text'];
const UI = ['border.control', 'border.focus', 'accent.fill', 'attention.dot', 'success.dot', 'danger.dot', 'icon.default', 'icon.muted', 'action.primary.bg'];
const PAIRS = [
  // [foreground, background, minimum ratio]
  ['text.on-brand', 'bg.brand', 4.5],
  ['action.primary.fg', 'action.primary.bg', 4.5],
  ['action.primary.fg', 'action.primary.bg-hover', 4.5],
  ['action.primary.fg', 'action.primary.bg-pressed', 4.5],
  ['action.secondary.fg', 'action.secondary.bg', 4.5],
  ['action.secondary.fg', 'action.secondary.bg-hover', 4.5],
  ['action.secondary.border', 'action.secondary.bg', 3],
  ['action.danger.fg', 'action.danger.bg', 4.5],
  ['accent.text', 'accent.subtle', 4.5],
  ['attention.text', 'attention.subtle', 4.5],
  ['success.text', 'success.subtle', 4.5],
  ['danger.text', 'danger.subtle', 4.5],
  ['text.primary', 'accent.subtle', 4.5],
  ['text.primary', 'attention.subtle', 4.5],
  ['text.primary', 'success.subtle', 4.5],
  ['text.primary', 'danger.subtle', 4.5],
];
for (const fg of TEXT) for (const bg of BACKGROUNDS) PAIRS.push([fg, bg, 4.5]);
for (const fg of UI) for (const bg of BACKGROUNDS) PAIRS.push([fg, bg, 3]);

const lookup = (tree, path) => path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), tree);

function resolve(token, trees) {
  const value = token.$value;
  if (typeof value === 'string' && value.startsWith('{')) {
    const path = value.slice(1, -1);
    for (const tree of trees) {
      const next = lookup(tree, path);
      if (next) return resolve(next, trees);
    }
    throw new Error(`Unresolved reference ${value}`);
  }
  return value.hex;
}

const channel = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
for (const theme of ['light', 'dark']) {
  const semantic = load(`semantic.${theme}.json`);
  const trees = [semantic, base];
  for (const [fg, bg, min] of PAIRS) {
    const a = resolve(lookup(semantic.color, fg), trees);
    const b = resolve(lookup(semantic.color, bg), trees);
    const r = ratio(a, b);
    if (r < min) {
      failures += 1;
      console.log(`FAIL ${theme.padEnd(5)} ${r.toFixed(2)} < ${min}  ${fg} (${a}) on ${bg} (${b})`);
    }
  }
}
console.log(`${PAIRS.length * 2} pairs checked, ${failures} failing`);
process.exit(failures ? 1 : 0);
