import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const output = process.argv[2];
if (!output) {
  throw new Error('Uso: node scripts/captureProjectEngineeringOsCut.mjs <output.json>');
}

async function inventory(relativeRoot, owner) {
  const files = [];
  async function visit(relative) {
    const entries = await readdir(path.join(root, relative), { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name === 'node_modules') continue;
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        await visit(child);
      } else if (entry.isFile()) {
        const content = await readFile(path.join(root, child));
        files.push({
          path: child.split(path.sep).join('/'),
          sha256: createHash('sha256').update(content).digest('hex'),
        });
      }
    }
  }
  await visit(relativeRoot);
  return { owner, root: relativeRoot.split(path.sep).join('/'), files };
}

const payload = {
  schemaVersion: 1,
  capturedAt: '2026-07-23',
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sources: [
    await inventory('tools/project-constructor', 'constructor-runtime'),
    await inventory('tools/debt-control', 'debt-runtime'),
  ],
  transition: {
    candidate: 'tools/project-engineering-os',
    direction: 'embedded-sources-to-clean-public-upstream',
    freeze: 'Only a critical correction may change either source root before cutover; it must be ported forward and recorded.',
  },
};

await writeFile(path.resolve(root, output), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
process.stdout.write(`Captured ${payload.sources.reduce((total, source) => total + source.files.length, 0)} files at ${payload.sourceCommit}\n`);
