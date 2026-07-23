import {
  lstat,
  readFile,
  realpath,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  CONSTRUCTOR_VERSION,
  DEFAULT_BLUEPRINT_ROOT,
  MANIFEST_FILE,
  MAX_BLUEPRINT_FILE_BYTES,
  OPSX_OWNED_PATTERNS,
  OWNERS,
  OWNER_ALIASES,
  RESERVED_TARGETS,
  TRANSACTIONS_RELATIVE_PATH,
} from './constants.mjs';
import { ConstructorError } from './errors.mjs';
import {
  normalizeLf,
  normalizeTextBuffer,
  sha256,
  sha256Json,
} from './hash.mjs';
import { sortJson, stableStringify } from './json.mjs';
import {
  isInside,
  normalizeRelativePath,
  resolveInside,
} from './paths.mjs';

function canonicalOwner(rawOwner) {
  const aliased = Object.hasOwn(OWNER_ALIASES, rawOwner)
    ? OWNER_ALIASES[rawOwner]
    : rawOwner;
  if (!OWNERS.includes(aliased)) {
    throw new ConstructorError('BLUEPRINT_OWNER_INVALID', 'El blueprint declara un owner desconocido.', {
      details: String(rawOwner),
      remediation: `Use uno de: ${OWNERS.join(', ')}.`,
    });
  }
  return aliased;
}

function normalizeManagedSection(rawSection, owner, target) {
  if (rawSection === undefined || rawSection === null) {
    return null;
  }

  if (owner !== 'human-overlay') {
    throw new ConstructorError(
      'BLUEPRINT_MANAGED_SECTION_OWNER',
      `Solo human-overlay puede declarar una sección administrada: ${target}.`,
    );
  }

  if (
    typeof rawSection !== 'object'
    || typeof rawSection.start !== 'string'
    || rawSection.start.trim() === ''
    || typeof rawSection.end !== 'string'
    || rawSection.end.trim() === ''
    || rawSection.start === rawSection.end
  ) {
    throw new ConstructorError(
      'BLUEPRINT_MANAGED_SECTION_INVALID',
      `Los delimitadores de ${target} no son válidos.`,
      {
        remediation: 'Declare managedSection.start y managedSection.end como cadenas distintas.',
      },
    );
  }

  return {
    end: normalizeLf(rawSection.end),
    start: normalizeLf(rawSection.start),
  };
}

function normalizeProfiles(rawProfiles, rawProfile) {
  const values = rawProfiles ?? (rawProfile ? [rawProfile] : []);
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string' || value === '')) {
    throw new ConstructorError(
      'BLUEPRINT_PROFILE_INVALID',
      'La selección de perfiles de una entrada debe ser una lista de IDs no vacíos.',
    );
  }
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function assertTargetOwnership(target, owner) {
  if (RESERVED_TARGETS.has(target)) {
    throw new ConstructorError(
      'BLUEPRINT_RESERVED_TARGET',
      `El manifiesto no puede poseer la ruta reservada ${target}.`,
    );
  }

  if (
    target === TRANSACTIONS_RELATIVE_PATH
    || target.startsWith(`${TRANSACTIONS_RELATIVE_PATH}/`)
  ) {
    throw new ConstructorError(
      'BLUEPRINT_TRANSACTION_TARGET',
      `El manifiesto no puede poseer metadata transaccional: ${target}.`,
    );
  }

  if (target === '.git' || target.startsWith('.git/')) {
    throw new ConstructorError('BLUEPRINT_GIT_TARGET', 'El blueprint no puede escribir dentro de .git.', {
      details: target,
    });
  }

  if (OPSX_OWNED_PATTERNS.some((pattern) => pattern.test(target))) {
    throw new ConstructorError(
      'BLUEPRINT_OPSX_OWNERSHIP',
      `La ruta ${target} pertenece al flujo OPSX y no puede entrar al renderer general.`,
      {
        remediation: 'Delegue esa ruta a la CLI local fijada de OpenSpec y a su checker separado.',
      },
    );
  }

  if (
    owner !== 'external-openspec'
    && /^openspec\/(?:changes|specs)(?:\/|$)/i.test(target)
  ) {
    throw new ConstructorError(
      'BLUEPRINT_OPENSPEC_OWNERSHIP',
      `${target} debe conservar ownership external-openspec.`,
    );
  }
}

function normalizeEntry(rawEntry, index) {
  if (!rawEntry || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) {
    throw new ConstructorError(
      'BLUEPRINT_ENTRY_INVALID',
      `La entrada ${index + 1} del blueprint no es un objeto.`,
    );
  }

  const target = normalizeRelativePath(
    rawEntry.target ?? rawEntry.path ?? rawEntry.destination,
    `files[${index}].target`,
  );
  const owner = canonicalOwner(rawEntry.owner ?? rawEntry.ownership);
  assertTargetOwnership(target, owner);

  const sourceInput = rawEntry.source ?? rawEntry.template ?? null;
  const source = sourceInput === null
    ? null
    : normalizeRelativePath(sourceInput, `files[${index}].source`);

  if (owner !== 'external-openspec' && source === null) {
    throw new ConstructorError(
      'BLUEPRINT_SOURCE_REQUIRED',
      `La entrada ${target} requiere una fuente estática.`,
    );
  }

  const mode = rawEntry.mode ?? (source?.toLowerCase().endsWith('.json') ? 'json' : 'text');
  if (!['json', 'text', 'copy'].includes(mode)) {
    throw new ConstructorError(
      'BLUEPRINT_MODE_INVALID',
      `El modo ${String(mode)} de ${target} no está soportado.`,
    );
  }

  const managedSection = normalizeManagedSection(
    rawEntry.managedSection ?? rawEntry.managedBlock,
    owner,
    target,
  );
  const profiles = normalizeProfiles(rawEntry.profiles, rawEntry.profile);
  const profileMode = rawEntry.profileMode ?? 'any';
  if (!['any', 'all'].includes(profileMode)) {
    throw new ConstructorError(
      'BLUEPRINT_PROFILE_MODE_INVALID',
      `profileMode de ${target} debe ser "any" o "all".`,
    );
  }

  return {
    id: String(rawEntry.id ?? target),
    managedSection,
    mode,
    owner,
    profileMode,
    profiles,
    required: rawEntry.required !== false,
    source,
    target,
  };
}

function assertUniqueEntries(entries) {
  const ids = new Set();
  const targets = new Set();

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new ConstructorError('BLUEPRINT_ID_DUPLICATE', `ID duplicado en el blueprint: ${entry.id}.`);
    }
    if (targets.has(entry.target)) {
      throw new ConstructorError(
        'BLUEPRINT_TARGET_DUPLICATE',
        `Dos entradas intentan poseer ${entry.target}.`,
      );
    }
    ids.add(entry.id);
    targets.add(entry.target);
  }
}

function activeProfileIds(configuration, manifest) {
  const configured = configuration?.activeProfiles
    ?? configuration?.profiles?.active
    ?? manifest?.defaults?.activeProfiles
    ?? [];

  if (!Array.isArray(configured)) {
    throw new ConstructorError(
      'CONFIG_PROFILES_INVALID',
      'activeProfiles debe ser una lista de IDs.',
    );
  }

  return new Set(configured.map(String));
}

function isEntryActive(entry, activeProfiles) {
  if (entry.profiles.length === 0) {
    return true;
  }
  if (entry.profileMode === 'all') {
    return entry.profiles.every((profile) => activeProfiles.has(profile));
  }
  return entry.profiles.some((profile) => activeProfiles.has(profile));
}

async function readSource(blueprintRoot, entry) {
  if (entry.source === null) {
    return {
      content: null,
      sourceHash: null,
    };
  }

  const sourcePath = resolveInside(blueprintRoot, entry.source, `source de ${entry.target}`);
  let sourceStats;

  try {
    sourceStats = await lstat(sourcePath);
  } catch (error) {
    if (error?.code === 'ENOENT' && !entry.required) {
      return {
        content: null,
        sourceHash: null,
      };
    }
    throw new ConstructorError(
      'BLUEPRINT_SOURCE_MISSING',
      `No existe la fuente ${entry.source} para ${entry.target}.`,
      {
        remediation: 'Restaure el paquete del constructor o corrija manifest.json.',
        cause: error,
      },
    );
  }

  if (!sourceStats.isFile()) {
    throw new ConstructorError(
      'BLUEPRINT_SOURCE_NOT_FILE',
      `La fuente ${entry.source} no es un archivo regular.`,
    );
  }
  if (sourceStats.size > MAX_BLUEPRINT_FILE_BYTES) {
    throw new ConstructorError(
      'BLUEPRINT_SOURCE_TOO_LARGE',
      `La fuente ${entry.source} supera el límite del renderer.`,
      {
        details: `${sourceStats.size} bytes`,
      },
    );
  }

  const [rootReal, sourceReal] = await Promise.all([
    realpath(blueprintRoot),
    realpath(sourcePath),
  ]);
  if (!isInside(rootReal, sourceReal)) {
    throw new ConstructorError(
      'BLUEPRINT_SOURCE_ESCAPE',
      `La fuente ${entry.source} apunta fuera del blueprint.`,
    );
  }

  const raw = await readFile(sourcePath);
  let content;
  if (entry.mode === 'copy') {
    content = raw;
  } else if (entry.mode === 'json') {
    try {
      content = Buffer.from(stableStringify(JSON.parse(normalizeLf(raw.toString('utf8')))), 'utf8');
    } catch (error) {
      throw new ConstructorError(
        'BLUEPRINT_SOURCE_JSON_INVALID',
        `${entry.source} no contiene JSON válido.`,
        {
          details: error.message,
          cause: error,
        },
      );
    }
  } else {
    content = normalizeTextBuffer(raw.toString('utf8'));
  }

  return {
    content,
    sourceHash: sha256(content),
  };
}

export function validateManifest(rawManifest) {
  if (!rawManifest || typeof rawManifest !== 'object' || Array.isArray(rawManifest)) {
    throw new ConstructorError('BLUEPRINT_INVALID', 'manifest.json debe contener un objeto JSON.');
  }

  const rawEntries = rawManifest.files ?? rawManifest.entries;
  if (!Array.isArray(rawEntries) || rawEntries.length === 0) {
    throw new ConstructorError(
      'BLUEPRINT_FILES_REQUIRED',
      'manifest.json debe declarar una lista no vacía en "files".',
    );
  }

  const schemaVersion = rawManifest.schemaVersion;
  if (
    (typeof schemaVersion !== 'string' && typeof schemaVersion !== 'number')
    || String(schemaVersion).trim() === ''
  ) {
    throw new ConstructorError(
      'BLUEPRINT_SCHEMA_VERSION_REQUIRED',
      'manifest.json debe declarar schemaVersion.',
    );
  }

  const entries = rawEntries.map(normalizeEntry);
  assertUniqueEntries(entries);

  return {
    constructorVersion: String(rawManifest.constructorVersion ?? CONSTRUCTOR_VERSION),
    defaults: sortJson(rawManifest.defaults ?? {}),
    entries,
    githubPlan: sortJson(rawManifest.githubPlan ?? rawManifest.github ?? null),
    schemaVersion: String(schemaVersion),
  };
}

export async function loadBlueprint({
  blueprintRoot = DEFAULT_BLUEPRINT_ROOT,
  configuration = null,
} = {}) {
  const root = resolve(blueprintRoot);
  const manifestPath = join(root, MANIFEST_FILE);
  let raw;

  try {
    raw = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    const invalidJson = error instanceof SyntaxError;
    throw new ConstructorError(
      invalidJson ? 'BLUEPRINT_MANIFEST_JSON_INVALID' : 'BLUEPRINT_MANIFEST_MISSING',
      invalidJson
        ? 'El manifest.json del blueprint no contiene JSON válido.'
        : 'No se pudo leer el manifest.json del blueprint.',
      {
        details: error.message,
        remediation: 'Restaure blueprint/manifest.json desde la release exacta del paquete.',
        cause: error,
      },
    );
  }

  const manifest = validateManifest(raw);
  const profiles = activeProfileIds(configuration, manifest);
  const activeEntries = manifest.entries
    .filter((entry) => isEntryActive(entry, profiles))
    .sort((left, right) => left.target.localeCompare(right.target));

  const entries = [];
  for (const entry of activeEntries) {
    const source = await readSource(root, entry);
    if (source.content === null && entry.owner !== 'external-openspec') {
      continue;
    }
    entries.push({
      ...entry,
      ...source,
    });
  }

  const blueprintHash = sha256Json({
    entries: entries.map(({ content, ...entry }) => ({
      ...entry,
      contentHash: content === null ? null : sha256(content),
    })),
    manifest: {
      constructorVersion: manifest.constructorVersion,
      defaults: manifest.defaults,
      githubPlan: manifest.githubPlan,
      schemaVersion: manifest.schemaVersion,
    },
  });

  return {
    activeProfiles: [...profiles].sort((left, right) => left.localeCompare(right)),
    blueprintHash,
    entries,
    manifest,
    root,
  };
}
