#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readme = await readFile(path.join(root, 'README.md'), 'utf8');
const failures = [];
const links = [...readme.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)]
  .map((match) => match[1])
  .filter((href) => !/^[a-z]+:/i.test(href));
for (const href of links) {
  try {
    await access(path.resolve(root, href));
  } catch {
    failures.push(`link ${href}`);
  }
}
for (const command of [
  'npx --yes create-project-engineering-os@0.1.1 bootstrap --target .',
  'project-os upgrade --target . --check',
  'project-os debt check --root .',
  'project-os rollback --target . --transaction <id>',
]) {
  if (!readme.includes(command)) failures.push(`command ${command}`);
}
for (const required of [
  'docs/USER_GUIDE.md',
  'docs/RECOVERY.md',
  'docs/prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md',
  'docs/prompts/PROMPT_01_DISCOVERY_PROYECTO.md',
  'docs/GUIA_MANUAL_USUARIO.md',
]) {
  try {
    await access(path.join(root, required));
  } catch {
    failures.push(`missing ${required}`);
  }
}
if (failures.length > 0) {
  process.stderr.write(`FAIL docs: ${failures.join(', ')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`PASS docs ${links.length} README links\n`);
}
