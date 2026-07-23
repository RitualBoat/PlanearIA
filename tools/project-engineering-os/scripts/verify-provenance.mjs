#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = await readJson(path.join(root, 'package.json'));
const response = await fetch(`https://registry.npmjs.org/${packageJson.name}`);
if (!response.ok) throw new Error(`Registry respondió ${response.status}.`);
const packument = await response.json();
const release = packument.versions?.[packageJson.version];
if (!release) throw new Error('La versión publicada no aparece en el registry.');
if (!release.dist?.integrity || !release.dist?.tarball) {
  throw new Error('La versión no declara integrity/tarball.');
}
if (!release.dist?.attestations?.url) {
  throw new Error('La versión no expone attestations/provenance.');
}
process.stdout.write(`PASS provenance ${packageJson.name}@${packageJson.version}\n`);

