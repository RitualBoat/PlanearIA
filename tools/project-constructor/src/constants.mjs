import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const DEFAULT_BLUEPRINT_ROOT = join(PACKAGE_ROOT, 'blueprint');
export const STATE_RELATIVE_PATH = '.project-constructor/state.json';
export const CONFIG_RELATIVE_PATH = '.project-constructor/config.json';
export const TRANSACTIONS_RELATIVE_PATH = '.project-constructor/transactions';
export const STATE_FORMAT_VERSION = 1;
export const MANIFEST_FILE = 'manifest.json';
export const MAX_BLUEPRINT_FILE_BYTES = 2 * 1024 * 1024;

export const OWNERS = Object.freeze([
  'constructor',
  'human-overlay',
  'external-openspec',
  'project',
]);

export const OWNER_ALIASES = Object.freeze({
  generated: 'constructor',
  'managed-section': 'human-overlay',
  external: 'external-openspec',
  'seed-once': 'project',
});

const packageJson = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'),
);

export const CONSTRUCTOR_VERSION = packageJson.version;

export const EXIT_CODES = Object.freeze({
  success: 0,
  drift: 1,
  invalid: 2,
  transaction: 3,
});

export const RESERVED_TARGETS = new Set([
  STATE_RELATIVE_PATH,
]);

export const OPSX_OWNED_PATTERNS = Object.freeze([
  /^\.claude\/commands\/opsx(?:[./-]|$)/i,
  /^\.opencode\/commands\/opsx(?:[./-]|$)/i,
  /^\.codex\/skills\/openspec-(?:apply|archive|explore|propose|sync)/i,
  /^\.agents\/skills\/openspec-(?:apply|archive|explore|propose|sync)/i,
  /^\.github\/workflows\/.*opsx.*$/i,
  /^openspec\/(?:changes|specs)\//i,
]);
