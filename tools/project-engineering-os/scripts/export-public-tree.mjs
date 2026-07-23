#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanPublicTree } from './neutrality-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const checkIndex = args.indexOf('--check');
const seed = args.includes('--seed');
const outputArg = outputIndex >= 0 ? args[outputIndex + 1] : null;
const checkArg = checkIndex >= 0 ? args[checkIndex + 1] : null;
if ((outputArg ? 1 : 0) + (checkArg ? 1 : 0) !== 1) {
  throw new Error('Usa exactamente uno de --output <ruta> o --check <ruta>.');
}
const target = path.resolve(outputArg ?? checkArg);
if (target === root || target.startsWith(`${root}${path.sep}`)) {
  throw new Error('El export debe escribirse fuera del source público.');
}

const allowlist = JSON.parse(
  await readFile(path.join(root, 'config', 'export-allowlist.json'), 'utf8'),
);
const violations = await scanPublicTree(root, allowlist);
if (violations.length > 0) {
  throw new Error(`El source no es neutral: ${JSON.stringify(violations)}`);
}

const ignored = new Set(allowlist.ignoredDirectories);
const seedFiles = new Set(['.gitignore', 'LICENSE', 'README.md', 'SECURITY.md']);

async function collect(base, relative = '') {
  const absolute = path.join(base, relative);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (relative === '' && (entry.name === '.git' || ignored.has(entry.name))) continue;
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collect(base, child));
    } else if (entry.isFile()) {
      const normalized = child.split(path.sep).join('/');
      if (!seed || seedFiles.has(normalized)) files.push(normalized);
    } else {
      throw new Error(`Tipo de archivo no soportado: ${child}`);
    }
  }
  return files;
}

async function inventory(base, files) {
  const hash = createHash('sha256');
  const records = [];
  for (const relative of files) {
    const content = await readFile(path.join(base, ...relative.split('/')));
    const canonical = canonicalContent(content);
    const digest = createHash('sha256').update(canonical).digest('hex');
    records.push({
      path: relative,
      sha256: digest,
      bytes: content.byteLength,
      canonicalBytes: canonical.byteLength,
    });
    hash.update(relative);
    hash.update('\0');
    hash.update(digest);
    hash.update('\n');
  }
  return {
    files: records,
    treeHash: hash.digest('hex'),
    hashPolicy: 'text-lf-v1',
  };
}

function canonicalContent(content) {
  return content.includes(0)
    ? content
    : Buffer.from(content.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8');
}

const sourceFiles = await collect(root);
const sourceInventory = await inventory(root, sourceFiles);
if (outputArg) {
  await mkdir(target, { recursive: true });
  const existingFiles = await collect(target);
  const sourceByPath = new Map(sourceInventory.files.map((record) => [record.path, record]));
  for (const relative of existingFiles) {
    const expected = sourceByPath.get(relative);
    const observed = createHash('sha256')
      .update(canonicalContent(await readFile(path.join(target, ...relative.split('/')))))
      .digest('hex');
    if (!expected || expected.sha256 !== observed) {
      throw new Error(`El destino contiene contenido divergente: ${relative}`);
    }
  }
  for (const relative of sourceFiles) {
    const destination = path.join(target, ...relative.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(root, ...relative.split('/')), destination);
  }
  process.stdout.write(`${JSON.stringify({
    result: 'PASS',
    mode: seed ? 'seed' : 'export',
    target,
    ...sourceInventory,
  }, null, 2)}\n`);
} else {
  const targetFiles = await collect(target);
  const targetInventory = await inventory(target, targetFiles);
  const sourcePaths = sourceInventory.files.map((record) => record.path);
  const targetPaths = targetInventory.files.map((record) => record.path);
  if (
    sourceInventory.treeHash !== targetInventory.treeHash
    || JSON.stringify(sourcePaths) !== JSON.stringify(targetPaths)
  ) {
    throw new Error(
      `Export divergente: source=${sourceInventory.treeHash}, target=${targetInventory.treeHash}`,
    );
  }
  const targetStats = await stat(target);
  process.stdout.write(`${JSON.stringify({
    result: 'PASS',
    mode: 'check',
    target,
    targetModified: targetStats.mtime.toISOString(),
    ...targetInventory,
  }, null, 2)}\n`);
}
