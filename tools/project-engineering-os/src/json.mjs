import { readFile } from 'node:fs/promises';

import { ConstructorError } from './errors.mjs';

export function sortJson(value) {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.keys(value)
        .sort((left, right) => left.localeCompare(right))
        .map((key) => [key, sortJson(value[key])]),
    );
  }

  return value;
}

export function stableStringify(value, indentation = 2) {
  return `${JSON.stringify(sortJson(value), null, indentation)}\n`;
}

export async function readJsonFile(path, { optional = false, label = path } = {}) {
  let raw;

  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    if (optional && error?.code === 'ENOENT') {
      return null;
    }

    throw new ConstructorError('JSON_READ_FAILED', `No se pudo leer ${label}.`, {
      details: error?.code ?? error?.message,
      remediation: `Compruebe que ${label} exista y sea legible.`,
      cause: error,
    });
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ConstructorError('JSON_INVALID', `${label} no contiene JSON válido.`, {
      details: error.message,
      remediation: `Corrija la sintaxis de ${label} antes de reintentar.`,
      cause: error,
    });
  }
}
