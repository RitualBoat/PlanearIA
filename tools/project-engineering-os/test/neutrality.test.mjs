import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { scanPublicTree } from '../scripts/neutrality-lib.mjs';

const allowlist = {
  directories: ['src'],
  ignoredDirectories: ['node_modules'],
  rootFiles: ['package.json'],
};

test('neutral tree passes and a consumer-specific term fails', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-neutrality-'));
  await mkdir(path.join(root, 'src'));
  await writeFile(path.join(root, 'package.json'), '{}\n');
  await writeFile(path.join(root, 'src', 'index.mjs'), 'export const neutral = true;\n');
  assert.deepEqual(await scanPublicTree(root, allowlist), []);

  const forbidden = Buffer.from('UGxhbmVhcklB', 'base64').toString('utf8');
  await writeFile(path.join(root, 'src', 'index.mjs'), `export const inherited = '${forbidden}';\n`);
  assert.deepEqual(await scanPublicTree(root, allowlist), [
    { kind: 'consumer-specific-content', path: 'src/index.mjs' },
  ]);
});

test('rejects an incidental path and a simulated secret', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-secret-'));
  await mkdir(path.join(root, 'src'));
  await mkdir(path.join(root, 'private'));
  await writeFile(path.join(root, 'package.json'), '{}\n');
  await writeFile(path.join(root, 'src', 'index.mjs'), `export const token = 'gho_${'x'.repeat(24)}';\n`);
  await writeFile(path.join(root, 'private', 'note.txt'), 'not public\n');
  assert.deepEqual(await scanPublicTree(root, allowlist), [
    { kind: 'path-not-allowlisted', path: 'private' },
    { kind: 'secret-pattern', path: 'src/index.mjs' },
  ]);
});
