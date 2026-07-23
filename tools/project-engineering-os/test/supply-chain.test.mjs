import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { checkPackageRoot } from '../scripts/check-package.mjs';
import { sha256 } from '../scripts/release-lib.mjs';
import { verifyRelease } from '../scripts/verify-release.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function packageFixture(name) {
  const root = await mkdtemp(path.join(tmpdir(), `project-os-${name}-`));
  for (const relative of [
    'package.json',
    'package-lock.json',
    'LICENSE',
    'MANAGED_FILES_NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
  ]) {
    await cp(path.join(packageRoot, relative), path.join(root, relative));
  }
  await mkdir(path.join(root, 'bin'));
  await cp(
    path.join(packageRoot, 'bin', 'project-os.mjs'),
    path.join(root, 'bin', 'project-os.mjs'),
  );
  return root;
}

test('package contract rechaza bin ausente y licencia incompatible', async () => {
  const root = await packageFixture('package-negative');
  await rm(path.join(root, 'bin', 'project-os.mjs'));
  let failures = await checkPackageRoot(root);
  assert.equal(failures.includes('missing bin/project-os.mjs'), true);

  await cp(
    path.join(packageRoot, 'bin', 'project-os.mjs'),
    path.join(root, 'bin', 'project-os.mjs'),
  );
  const lockPath = path.join(root, 'package-lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  const dependency = Object.keys(lock.packages).find((name) => name !== '');
  lock.packages[dependency].license = 'GPL-3.0-only';
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  failures = await checkPackageRoot(root);
  assert.equal(
    failures.some((failure) => failure.includes(`dependency license ${dependency}`)),
    true,
  );
});

test('release verifier rejects an altered tarball', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-release-negative-'));
  const filename = 'create-project-engineering-os-0.1.1.tgz';
  const tarballPath = path.join(root, filename);
  const original = Buffer.from('verified tarball fixture');
  const digest = sha256(original);
  await writeFile(tarballPath, original);
  await writeFile(
    path.join(root, 'release-manifest.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      package: 'create-project-engineering-os',
      version: '0.1.1',
      commit: 'a'.repeat(40),
      tarball: filename,
      sha256: digest,
      bytes: original.byteLength,
      tested: true,
    }, null, 2)}\n`,
  );
  await writeFile(path.join(root, 'SHA256SUMS'), `${digest}  ${filename}\n`);
  assert.equal((await verifyRelease(root)).sha256, digest);

  await writeFile(tarballPath, Buffer.from('altered tarball fixture'));
  await assert.rejects(verifyRelease(root), /Checksum divergente/);
});
