#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanPublicTree } from './neutrality-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowlist = JSON.parse(await readFile(path.join(root, 'config', 'export-allowlist.json'), 'utf8'));
const violations = await scanPublicTree(root, allowlist);

if (violations.length > 0) {
  process.stderr.write(`FAIL public tree neutrality (${violations.length})\n`);
  for (const violation of violations) {
    process.stderr.write(`- ${violation.kind}: ${violation.path}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write('PASS public tree neutrality and export allowlist\n');
}
