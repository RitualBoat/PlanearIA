#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { readJson, resolveNpmCli } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = await readJson(path.join(root, 'package.json'));
const npmCli = await resolveNpmCli();
const result = await new Promise((resolve, reject) => {
  let stdout = '';
  let stderr = '';
  const child = spawn(
    process.execPath,
    [npmCli, 'view', `${packageJson.name}@${packageJson.version}`, 'version', '--json'],
    { cwd: root, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', reject);
  child.on('close', (status) => resolve({ status, stdout, stderr }));
});
if (result.status === 0) {
  throw new Error(`${packageJson.name}@${packageJson.version} ya existe; no se reutilizará.`);
}
if (!/E404|404 Not Found/i.test(`${result.stdout}\n${result.stderr}`)) {
  throw new Error(`No se pudo distinguir versión libre de fallo de registry: ${result.stderr}`);
}
process.stdout.write(`PASS version available ${packageJson.name}@${packageJson.version}\n`);

