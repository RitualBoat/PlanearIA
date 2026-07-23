#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, sha256 } from './release-lib.mjs';

export async function verifyRelease(releaseRoot) {
  const root = path.resolve(releaseRoot);
  const manifest = await readJson(path.join(root, 'release-manifest.json'));
  const checksums = await readFile(path.join(root, 'SHA256SUMS'), 'utf8');
  const tarball = await readFile(path.join(root, manifest.tarball));
  const observed = sha256(tarball);
  const expectedLine = `${manifest.sha256}  ${manifest.tarball}`;
  if (observed !== manifest.sha256 || !checksums.split(/\r?\n/).includes(expectedLine)) {
    throw new Error(`Checksum divergente: esperado=${manifest.sha256}, observado=${observed}`);
  }
  if (!manifest.tested) throw new Error('El manifest no declara tarball probado.');
  return manifest;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? 'release';
  const result = await verifyRelease(root);
  process.stdout.write(`PASS ${result.tarball} ${result.sha256}\n`);
}
