#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertSemver,
  exists,
  readJson,
  resolveNpmCli,
  sha256,
} from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outputIndex = args.indexOf('--output');
const requestedOutput = outputIndex >= 0 ? args[outputIndex + 1] : 'release';
const npmCli = await resolveNpmCli();

function run(command, commandArgs, { cwd, timeoutMs = 180_000 } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, commandArgs, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Timeout: ${path.basename(command)} ${commandArgs.join(' ')}`));
    }, timeoutMs);
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr });
    });
  });
}

async function runChecked(command, commandArgs, options, label) {
  const result = await run(command, commandArgs, options);
  if (result.status !== 0) {
    throw new Error(`${label} falló: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

const packageJson = await readJson(path.join(root, 'package.json'));
assertSemver(packageJson.version);
let outputRoot;
let cleanupOutput = false;
if (dryRun) {
  outputRoot = await mkdtemp(path.join(tmpdir(), 'project-os-release-dry-'));
  cleanupOutput = true;
} else {
  if (!requestedOutput) throw new Error('--output requiere una ruta.');
  outputRoot = path.resolve(root, requestedOutput);
  const relative = path.relative(root, outputRoot);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('El output de release debe permanecer dentro del repositorio.');
  }
  await mkdir(outputRoot, { recursive: true });
  const existing = await readdir(outputRoot);
  if (existing.length > 0) {
    throw new Error(`El directorio de release no está vacío: ${outputRoot}`);
  }
}

const runnerRoot = await mkdtemp(path.join(tmpdir(), 'project-os-release-runner-'));
const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'project-os-release-fixture-'));
try {
  await runChecked(process.execPath, [path.join(root, 'scripts', 'check-package.mjs')], { cwd: root }, 'package contract');
  await runChecked(process.execPath, [path.join(root, 'scripts', 'check-neutrality.mjs')], { cwd: root }, 'neutrality');
  const packedRaw = await runChecked(
    process.execPath,
    [npmCli, 'pack', '--json', '--pack-destination', outputRoot],
    { cwd: root },
    'npm pack',
  );
  const packed = JSON.parse(packedRaw);
  if (!Array.isArray(packed) || packed.length !== 1 || !packed[0]?.filename) {
    throw new Error('npm pack no produjo un único tarball.');
  }
  const metadata = packed[0];
  const tarballPath = path.join(outputRoot, metadata.filename);
  const unexpected = metadata.files
    .map((file) => file.path)
    .filter((relative) => (
      relative.startsWith('test/')
      || relative.startsWith('config/')
      || relative.startsWith('.github/')
      || relative.includes('node_modules/')
    ));
  if (unexpected.length > 0) {
    throw new Error(`El tarball incluye rutas incidentales: ${unexpected.join(', ')}`);
  }
  for (const required of ['bin/project-os.mjs', 'LICENSE', 'README.md']) {
    if (!metadata.files.some((file) => file.path === required)) {
      throw new Error(`El tarball omite ${required}.`);
    }
  }

  await runChecked(
    process.execPath,
    [
      npmCli,
      'install',
      '--prefix',
      runnerRoot,
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      tarballPath,
    ],
    { cwd: runnerRoot },
    'install exact tarball',
  );
  const installedCli = path.join(
    runnerRoot,
    'node_modules',
    packageJson.name,
    'bin',
    'project-os.mjs',
  );
  if (!(await exists(installedCli))) throw new Error('El tarball no expone el bin esperado.');
  const version = (
    await runChecked(process.execPath, [installedCli, '--version'], { cwd: runnerRoot }, 'version smoke')
  ).trim();
  if (version !== packageJson.version) {
    throw new Error(`El bin reporta ${version}; se esperaba ${packageJson.version}.`);
  }
  const help = await runChecked(process.execPath, [installedCli, '--help'], { cwd: runnerRoot }, 'help smoke');
  if (!help.includes('upgrade') || !help.includes('debt')) {
    throw new Error('El help no expone upgrade y debt.');
  }

  await runChecked('git', ['init', '--quiet'], { cwd: fixtureRoot }, 'git init fixture');
  await runChecked(
    process.execPath,
    [installedCli, 'bootstrap', '--target', fixtureRoot, '--json'],
    { cwd: fixtureRoot },
    'bootstrap from tarball',
  );
  await runChecked(
    process.execPath,
    [installedCli, 'sync', '--target', fixtureRoot, '--check', '--json'],
    { cwd: fixtureRoot },
    'second-run check',
  );
  await runChecked(
    process.execPath,
    [installedCli, 'debt', 'check', '--root', fixtureRoot, '--json'],
    { cwd: fixtureRoot },
    'debt check',
  );

  const tarball = await readFile(tarballPath);
  const digest = sha256(tarball);
  const commit = (
    await runChecked('git', ['rev-parse', 'HEAD'], { cwd: root }, 'commit identity')
  ).trim();
  const manifest = {
    schemaVersion: 1,
    package: packageJson.name,
    version: packageJson.version,
    commit,
    tarball: metadata.filename,
    sha256: digest,
    bytes: tarball.byteLength,
    tested: true,
  };
  await writeFile(path.join(outputRoot, 'SHA256SUMS'), `${digest}  ${metadata.filename}\n`);
  await writeFile(
    path.join(outputRoot, 'release-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify({ result: 'PASS', ...manifest }, null, 2)}\n`);
} finally {
  const roots = [runnerRoot, fixtureRoot, cleanupOutput ? outputRoot : null].filter(Boolean);
  for (const absolute of roots) {
    const resolved = path.resolve(absolute);
    const temporary = path.resolve(tmpdir());
    if (resolved !== temporary && resolved.startsWith(`${temporary}${path.sep}`)) {
      await rm(resolved, { recursive: true, force: true });
    }
  }
}

