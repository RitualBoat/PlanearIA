import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ASSESSMENTS_DIR,
  CONFIG_FILE,
  DEBT_DIR,
  REGISTRY_FILE,
  REGISTRY_SCHEMA_VERSION,
} from './constants.mjs';
import { formatErrors, validateConfig, validateRegistry } from './schema.mjs';

export class DebtError extends Error {
  constructor(message, { recovery = null } = {}) {
    super(message);
    this.name = 'DebtError';
    this.recovery = recovery;
  }
}

export function debtDir(root) {
  return path.join(root, ...DEBT_DIR.split('/'));
}

export function configPath(root) {
  return path.join(debtDir(root), CONFIG_FILE);
}

export function registryPath(root) {
  return path.join(debtDir(root), REGISTRY_FILE);
}

export function assessmentsDir(root) {
  return path.join(debtDir(root), ASSESSMENTS_DIR);
}

export function assessmentPath(root, flow) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(flow ?? '')) {
    throw new DebtError(`El flujo debe usar kebab-case y no puede contener rutas; recibio '${flow}'.`, {
      recovery: 'Usa el nombre del change en kebab-case como identificador de flujo.',
    });
  }
  return path.join(assessmentsDir(root), `${flow}.json`);
}

export function isConfigured(root) {
  return existsSync(configPath(root));
}

function readJson(file, label, recovery) {
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    throw new DebtError(`No se pudo leer ${label} (${file}).`, { recovery });
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new DebtError(`${label} no contiene JSON valido (${file}).`, { recovery });
  }
}

export function loadConfig(root) {
  const config = readJson(configPath(root), 'config.json', 'Restaura o corrige .project-os/debt/config.json desde el control de versiones.');
  const errors = validateConfig(config);
  if (errors.length) {
    throw new DebtError(`config.json no cumple el esquema:\n${formatErrors(errors)}`, {
      recovery: 'Corrige los campos indicados en .project-os/debt/config.json.',
    });
  }
  return config;
}

export function loadRegistry(root, config) {
  const file = registryPath(root);
  if (!existsSync(file)) {
    throw new DebtError('Falta registry.json con el motor de deuda configurado.', {
      recovery: 'Restaura .project-os/debt/registry.json desde el control de versiones; borrar el registro no reanuda planes.',
    });
  }
  const registry = readJson(file, 'registry.json', 'Restaura .project-os/debt/registry.json desde el control de versiones.');
  const errors = validateRegistry(registry, config);
  if (errors.length) {
    throw new DebtError(`registry.json no cumple el esquema:\n${formatErrors(errors)}`, {
      recovery: 'Corrige los campos indicados o restaura el registro desde el control de versiones.',
    });
  }
  return registry;
}

export function loadAssessment(root, flow, { optional = false } = {}) {
  const file = assessmentPath(root, flow);
  if (!existsSync(file)) {
    if (optional) return null;
    throw new DebtError(`No existe assessment para el flujo '${flow}'.`, {
      recovery: `Captura el cierre con: project-os debt capture --flow ${flow} --input <archivo>.`,
    });
  }
  return readJson(file, `assessments/${flow}.json`, 'Restaura el assessment desde el control de versiones.');
}

export function listAssessments(root) {
  const dir = assessmentsDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => entry.endsWith('.json'))
    .sort()
    .map((entry) => ({
      flow: entry.slice(0, -'.json'.length),
      assessment: readJson(path.join(dir, entry), `assessments/${entry}`, 'Restaura el assessment desde el control de versiones.'),
    }));
}

export function emptyRegistry() {
  return { schemaVersion: REGISTRY_SCHEMA_VERSION, items: [] };
}

// Escritura atomica: temporal + rename. Una interrupcion deja el archivo previo intacto o el
// temporal huerfano, nunca un JSON a medias.
export function writeJsonAtomic(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  try {
    renameSync(temp, file);
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
}
