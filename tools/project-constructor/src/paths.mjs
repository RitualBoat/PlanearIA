import {
  access,
  lstat,
  realpath,
} from 'node:fs/promises';
import {
  dirname,
  isAbsolute,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';

import { ConstructorError } from './errors.mjs';

export function normalizeRelativePath(input, label = 'ruta') {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new ConstructorError('PATH_INVALID', `${label} debe ser una ruta relativa no vacía.`);
  }

  if (input.includes('\0') || /^[a-zA-Z]:/.test(input) || isAbsolute(input)) {
    throw new ConstructorError('PATH_INVALID', `${label} debe permanecer dentro de su raíz.`, {
      details: input,
    });
  }

  const normalized = posix.normalize(input.replaceAll('\\', '/')).replace(/^\.\//, '');

  if (
    normalized === '.'
    || normalized === '..'
    || normalized.startsWith('../')
    || normalized.startsWith('/')
  ) {
    throw new ConstructorError('PATH_TRAVERSAL', `${label} intenta salir de su raíz.`, {
      details: input,
      remediation: 'Use una ruta relativa sin segmentos "..".',
    });
  }

  return normalized;
}

export function resolveInside(root, relativePath, label = 'ruta') {
  const normalized = normalizeRelativePath(relativePath, label);
  const rootResolved = resolve(root);
  const destination = resolve(rootResolved, ...normalized.split('/'));
  const back = relative(rootResolved, destination);

  if (back === '..' || back.startsWith(`..${sep}`) || isAbsolute(back)) {
    throw new ConstructorError('PATH_TRAVERSAL', `${label} intenta salir de su raíz.`, {
      details: normalized,
    });
  }

  return destination;
}

function normalizedComparable(path) {
  const resolved = resolve(path);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

export function isInside(root, candidate) {
  const rootComparable = normalizedComparable(root);
  const candidateComparable = normalizedComparable(candidate);
  const suffix = candidateComparable.slice(rootComparable.length);
  return (
    candidateComparable === rootComparable
    || suffix.startsWith(sep)
  );
}

export async function assertExistingPathInsideRoot(root, candidate, label) {
  let stats;

  try {
    stats = await lstat(candidate);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  if (stats.isSymbolicLink()) {
    const resolvedLink = await realpath(candidate);
    const resolvedRoot = await realpath(root);
    if (!isInside(resolvedRoot, resolvedLink)) {
      throw new ConstructorError('SYMLINK_ESCAPE', `${label} apunta fuera del repositorio.`, {
        details: candidate,
        remediation: 'Retire el enlace simbólico o seleccione otro destino.',
      });
    }
  }
}

export async function assertNoSymlinkEscape(root, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const segments = normalized.split('/');
  let cursor = resolve(root);

  for (const segment of segments) {
    cursor = resolve(cursor, segment);
    await assertExistingPathInsideRoot(root, cursor, normalized);
  }
}

export async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function parentDirectories(relativePath) {
  const result = [];
  let cursor = posix.dirname(normalizeRelativePath(relativePath));
  while (cursor !== '.' && cursor !== '/') {
    result.push(cursor);
    cursor = posix.dirname(cursor);
  }
  return result;
}
