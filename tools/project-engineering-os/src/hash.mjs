import { createHash } from 'node:crypto';

import { stableStringify } from './json.mjs';

export function normalizeLf(value) {
  return String(value).replace(/\r\n?/g, '\n');
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function sha256Json(value) {
  return sha256(stableStringify(value));
}

export function normalizeTextBuffer(value) {
  return Buffer.from(normalizeLf(value), 'utf8');
}
