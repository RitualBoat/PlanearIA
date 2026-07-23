import { readFile, readdir, lstat } from 'node:fs/promises';
import path from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '', '.cjs', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mdc', '.mjs',
  '.toml', '.ts', '.tsx', '.txt', '.yaml', '.yml',
]);

const FORBIDDEN_TERMS = [
  'UGxhbmVhcklB',
  'ZG9jZW50ZQ==',
  'dXNlcklk',
  'c3JjL3N5bmM=',
  'QHBsYW5lYXJpYTo=',
  'Uml0dWFsQm9hdExhcHRvcA==',
].map((encoded) => Buffer.from(encoded, 'base64').toString('utf8'));

const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[opusr]_[A-Za-z0-9]{20,}\b/,
  /\bnpm_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /mongodb(?:\+srv)?:\/\/[^@\s]+@/i,
];

function extension(relative) {
  return path.extname(relative).toLowerCase();
}

function normalized(relative) {
  return relative.split(path.sep).join('/');
}

function isAllowed(relative, allowlist) {
  const first = relative.split('/')[0];
  return allowlist.rootFiles.includes(relative) || allowlist.directories.includes(first);
}

export async function scanPublicTree(root, allowlist) {
  const ignored = new Set(allowlist.ignoredDirectories);
  const violations = [];

  async function visit(relative = '') {
    const absolute = path.join(root, relative);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const child = normalized(path.join(relative, entry.name));
      if (relative === '' && ignored.has(entry.name)) continue;
      const stats = await lstat(path.join(root, child));
      if (stats.isSymbolicLink()) {
        violations.push({ kind: 'symlink', path: child });
        continue;
      }
      if (entry.isDirectory()) {
        if (relative === '' && !allowlist.directories.includes(entry.name)) {
          violations.push({ kind: 'path-not-allowlisted', path: child });
          continue;
        }
        await visit(child);
        continue;
      }
      if (!isAllowed(child, allowlist)) {
        violations.push({ kind: 'path-not-allowlisted', path: child });
        continue;
      }
      if (!TEXT_EXTENSIONS.has(extension(child))) continue;
      const content = await readFile(path.join(root, child), 'utf8');
      for (const term of FORBIDDEN_TERMS) {
        if (content.toLocaleLowerCase('en-US').includes(term.toLocaleLowerCase('en-US'))) {
          violations.push({ kind: 'consumer-specific-content', path: child });
          break;
        }
      }
      if (SECRET_PATTERNS.some((pattern) => pattern.test(content))) {
        violations.push({ kind: 'secret-pattern', path: child });
      }
      if (/[A-Za-z]:\\Users\\[^\\\r\n]+\\/i.test(content)) {
        violations.push({ kind: 'absolute-machine-path', path: child });
      }
    }
  }

  await visit();
  return violations.sort((left, right) => (
    left.path.localeCompare(right.path) || left.kind.localeCompare(right.kind)
  ));
}

export const neutralityInternals = Object.freeze({
  forbiddenCount: FORBIDDEN_TERMS.length,
  secretPatternCount: SECRET_PATTERNS.length,
});
