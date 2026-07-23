#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertSemver, readJson } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const tagIndex = args.indexOf('--tag');
const tag = tagIndex >= 0 ? args[tagIndex + 1] : process.env.GITHUB_REF_NAME;
const remote = args.includes('--remote');
const packageJson = await readJson(path.join(root, 'package.json'));
assertSemver(packageJson.version);
if (!tag || tag !== `v${packageJson.version}`) {
  throw new Error(`El tag ${tag ?? '<missing>'} no coincide con v${packageJson.version}.`);
}
const changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(`## ${packageJson.version}`)) {
  throw new Error(`CHANGELOG no contiene ## ${packageJson.version}.`);
}
const [major, minor] = process.versions.node.split('.').map(Number);
if (remote && (major < 22 || (major === 22 && minor < 14))) {
  throw new Error('Publicación requiere Node >=22.14.');
}
if (remote) {
  if (process.env.GITHUB_REPOSITORY !== 'RitualBoat/project-engineering-os') {
    throw new Error('La identidad OIDC no pertenece al repositorio aprobado.');
  }
  if (!process.env.GITHUB_WORKFLOW_REF?.includes('/.github/workflows/release.yml@')) {
    throw new Error('La identidad OIDC no pertenece al workflow release.yml aprobado.');
  }
}
process.stdout.write(`PASS release preflight ${packageJson.name}@${packageJson.version}\n`);

