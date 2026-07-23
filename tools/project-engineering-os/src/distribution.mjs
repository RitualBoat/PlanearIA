import {
  lstat,
  readFile,
  readdir,
} from 'node:fs/promises';
import { join } from 'node:path';

import { PACKAGE_ROOT } from './constants.mjs';
import { ConstructorError } from './errors.mjs';
import { normalizeTextBuffer, sha256 } from './hash.mjs';

const RUNTIME_PREFIX = '.project-constructor/runtime';
const ROOT_FILES = Object.freeze([
  'CHANGELOG.md',
  'LICENSE',
  'MANAGED_FILES_NOTICE.md',
  'README.md',
  'THIRD_PARTY_NOTICES.md',
  'package.json',
  'package-lock.json',
]);
const ROOT_DIRECTORIES = Object.freeze([
  'bin',
  'blueprint',
  'schema',
  'src',
]);
const EXCLUDED_SEGMENTS = new Set([
  'node_modules',
  'test',
  'tests',
  'transactions',
]);
const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdc',
  '.mjs',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

function extension(path) {
  const name = path.toLowerCase();
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

function isExcluded(relativePath) {
  return relativePath
    .replaceAll('\\', '/')
    .split('/')
    .some((segment) => EXCLUDED_SEGMENTS.has(segment));
}

async function collectFiles(root, relativeRoot) {
  const absolute = join(root, ...relativeRoot.split('/'));
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = `${relativeRoot}/${entry.name}`;
    if (isExcluded(relativePath)) {
      continue;
    }
    if (entry.isSymbolicLink()) {
      throw new ConstructorError(
        'RUNTIME_DISTRIBUTION_SYMLINK',
        `La distribución autocontenida no admite symlinks: ${relativePath}.`,
      );
    }
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

async function optionalRootFile(root, relativePath) {
  try {
    const stats = await lstat(join(root, relativePath));
    return stats.isFile() ? [relativePath] : [];
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function packageDistributionEntries({
  packageRoot = PACKAGE_ROOT,
} = {}) {
  const paths = [];
  for (const file of ROOT_FILES) {
    paths.push(...await optionalRootFile(packageRoot, file));
  }
  for (const directory of ROOT_DIRECTORIES) {
    paths.push(...await collectFiles(packageRoot, directory));
  }

  const unique = [...new Set(paths)]
    .filter((path) => !isExcluded(path))
    .sort((left, right) => left.localeCompare(right));
  const entries = [];

  for (const source of unique) {
    const absolute = join(packageRoot, ...source.split('/'));
    const raw = await readFile(absolute);
    const content = TEXT_EXTENSIONS.has(extension(source)) || extension(source) === ''
      ? normalizeTextBuffer(raw.toString('utf8'))
      : raw;
    entries.push({
      content,
      id: `runtime:${source}`,
      managedSection: null,
      mode: TEXT_EXTENSIONS.has(extension(source)) ? 'text' : 'copy',
      owner: 'constructor',
      profileMode: 'any',
      profiles: [],
      required: true,
      source: `package:${source}`,
      sourceHash: sha256(content),
      target: `${RUNTIME_PREFIX}/${source}`,
    });
  }

  if (
    !entries.some((entry) => entry.target === `${RUNTIME_PREFIX}/package.json`)
    || !entries.some((entry) => entry.target === `${RUNTIME_PREFIX}/bin/project-os.mjs`)
    || !entries.some((entry) => entry.target === `${RUNTIME_PREFIX}/blueprint/manifest.json`)
  ) {
    throw new ConstructorError(
      'RUNTIME_DISTRIBUTION_INCOMPLETE',
      'La distribución autocontenida no incluye package.json, bin o blueprint.',
    );
  }

  return entries;
}
