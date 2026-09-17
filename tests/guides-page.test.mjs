import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'tattoo-guides-and-case-studies.html'), 'utf8');

test('guides page does not publish the retired project-studies section', () => {
  assert.doesNotMatch(html, /id="case-studies"/);
  assert.doesNotMatch(html, /class="project-card"/);
  assert.doesNotMatch(html, /Study the project/);
});
