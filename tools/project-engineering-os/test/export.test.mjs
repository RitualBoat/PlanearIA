import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(packageRoot, 'scripts', 'export-public-tree.mjs');

function run(args) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(process.execPath, [script, ...args], {
      cwd: packageRoot,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

test('seed, export completo y segundo run convergen sin drift', async () => {
  const target = await mkdtemp(path.join(tmpdir(), 'project-os-export-'));
  const seed = await run(['--seed', '--output', target]);
  assert.equal(seed.status, 0, seed.stderr);
  assert.equal(JSON.parse(seed.stdout).mode, 'seed');

  const full = await run(['--output', target]);
  assert.equal(full.status, 0, full.stderr);
  const fullPayload = JSON.parse(full.stdout);
  assert.equal(fullPayload.mode, 'export');

  const checked = await run(['--check', target]);
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(JSON.parse(checked.stdout).treeHash, fullPayload.treeHash);

  const second = await run(['--output', target]);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(JSON.parse(second.stdout).treeHash, fullPayload.treeHash);
});

test('check rechaza un archivo público alterado', async () => {
  const target = await mkdtemp(path.join(tmpdir(), 'project-os-export-altered-'));
  assert.equal((await run(['--output', target])).status, 0);
  await writeFile(path.join(target, 'README.md'), 'altered\n');
  const checked = await run(['--check', target]);
  assert.notEqual(checked.status, 0);
  assert.match(checked.stderr, /Export divergente/);
});

