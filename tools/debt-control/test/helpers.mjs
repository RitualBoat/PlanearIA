import { cpSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

export function fixtureRoot(name) {
  return path.join(FIXTURES, name);
}

// Los tests que mutan estado trabajan sobre una copia temporal; los fixtures commiteados son
// inmutables para que un run fallido no contamine al siguiente.
export function tempCopy(name) {
  const dir = mkdtempSync(path.join(tmpdir(), `debt-control-${name}-`));
  cpSync(fixtureRoot(name), dir, { recursive: true });
  return dir;
}

export function readJson(root, relative) {
  return JSON.parse(readFileSync(path.join(root, ...relative.split('/')), 'utf8'));
}

export const NOW = new Date('2026-07-20T12:00:00.000Z');
