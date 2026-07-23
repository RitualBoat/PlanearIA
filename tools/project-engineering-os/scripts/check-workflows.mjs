#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowRoots = [
  path.join(root, '.github', 'workflows'),
  path.join(root, 'blueprint', 'core', 'github', 'workflows'),
];
const failures = [];
let count = 0;
for (const workflowRoot of workflowRoots) {
  const files = (await readdir(workflowRoot)).filter((file) => /\.ya?ml$/.test(file));
  count += files.length;
  for (const file of files) {
    const label = path.relative(root, path.join(workflowRoot, file)).split(path.sep).join('/');
    const content = await readFile(path.join(workflowRoot, file), 'utf8');
    if (content.includes('pull_request_target:')) failures.push(`${label}: pull_request_target`);
    for (const match of content.matchAll(/uses:\s*([^\s#]+)/g)) {
      const reference = match[1];
      const at = reference.lastIndexOf('@');
      const revision = at >= 0 ? reference.slice(at + 1) : '';
      if (!/^[0-9a-f]{40}$/.test(revision)) failures.push(`${label}: ${reference}`);
    }
    if (!/^permissions:/m.test(content)) failures.push(`${label}: permissions missing`);
  }
}
if (failures.length > 0) {
  process.stderr.write(`FAIL workflows: ${failures.join(', ')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`PASS workflows ${count}\n`);
}
