#!/usr/bin/env node

import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './release-lib.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowedLicenses = new Set([
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC0-1.0',
  'ISC',
  'MIT',
]);

export async function checkPackageRoot(root) {
  const failures = [];
  let manifest;
  let lock;
  try {
    manifest = await readJson(path.join(root, 'package.json'));
    lock = await readJson(path.join(root, 'package-lock.json'));
  } catch (error) {
    return [`metadata: ${error.message}`];
  }

  if (manifest.name !== 'create-project-engineering-os') failures.push('package name');
  if (manifest.private === true) failures.push('private package');
  if (manifest.license !== 'MIT') failures.push('package license');
  if (manifest.publishConfig?.access !== 'public') failures.push('public access');
  if (manifest.publishConfig?.provenance !== true) failures.push('provenance flag');
  if (manifest.bin?.['create-project-engineering-os'] !== 'bin/project-os.mjs') {
    failures.push('create bin');
  }
  if (manifest.bin?.['project-os'] !== 'bin/project-os.mjs') failures.push('project-os bin');
  if (Object.hasOwn(manifest.bin ?? {}, 'project-constructor')) {
    failures.push('legacy bin without fixture');
  }
  if (lock.name !== manifest.name || lock.version !== manifest.version) failures.push('lock identity');
  if (lock.packages?.['']?.license !== 'MIT') failures.push('lock license');

  for (const relative of [
    'LICENSE',
    'MANAGED_FILES_NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
    'bin/project-os.mjs',
  ]) {
    try {
      await access(path.join(root, relative));
    } catch {
      failures.push(`missing ${relative}`);
    }
  }

  for (const [name, record] of Object.entries(lock.packages ?? {})) {
    if (name === '') continue;
    if (!record.license || !allowedLicenses.has(record.license)) {
      failures.push(`dependency license ${name}: ${record.license ?? 'missing'}`);
    }
  }
  return failures;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const failures = await checkPackageRoot(packageRoot);
  if (failures.length > 0) {
    process.stderr.write(`FAIL package contract: ${failures.join(', ')}\n`);
    process.exitCode = 1;
  } else {
    const manifest = await readJson(path.join(packageRoot, 'package.json'));
    process.stdout.write(`PASS package contract ${manifest.name}@${manifest.version}\n`);
  }
}
