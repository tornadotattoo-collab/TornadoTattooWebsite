import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('portfolio heading stacks into one column on phone layouts after gallery refresh overrides', () => {
  const refresh = css.slice(css.indexOf('/* Portfolio gallery refresh */'));
  const mobileBlock = refresh.match(/@media \(max-width: 820px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(
    mobileBlock,
    /\.portfolio-section \.section-heading\s*\{[^}]*grid-template-columns:\s*1fr;/,
    'the later portfolio refresh must explicitly restore a one-column heading on mobile'
  );
});
