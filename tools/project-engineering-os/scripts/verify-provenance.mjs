#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = await readJson(path.join(root, 'package.json'));
let release;
for (let attempt = 1; attempt <= 10; attempt += 1) {
  const response = await fetch(
    `https://registry.npmjs.org/${packageJson.name}`,
    { headers: { 'cache-control': 'no-cache' } },
  );
  if (response.ok) {
    const packument = await response.json();
    release = packument.versions?.[packageJson.version];
    if (release?.dist?.integrity && release.dist?.tarball && release.dist?.attestations?.url) break;
  } else if (response.status !== 404) {
    throw new Error(`Registry respondió ${response.status}.`);
  }
  await new Promise((resolve) => setTimeout(resolve, 2_000));
}
if (!release) throw new Error('La versión publicada no aparece en el registry tras 10 intentos.');
if (!release.dist?.integrity || !release.dist?.tarball) {
  throw new Error('La versión no declara integrity/tarball.');
}
if (!release.dist?.attestations?.url) {
  throw new Error('La versión no expone attestations/provenance tras 10 intentos.');
}
process.stdout.write(`PASS provenance ${packageJson.name}@${packageJson.version}\n`);
