import { join } from 'node:path';

import {
  CONSTRUCTOR_VERSION,
  PACKAGE_NAME,
  STATE_FORMAT_VERSION,
  STATE_RELATIVE_PATH,
} from './constants.mjs';
import { ConstructorError } from './errors.mjs';
import { sha256Json } from './hash.mjs';
import { readJsonFile, sortJson } from './json.mjs';
import { resolveInside } from './paths.mjs';

const LEGACY_OWNER_ALIASES = Object.freeze({
  external: 'external-openspec',
  generated: 'constructor',
  'managed-section': 'human-overlay',
  'seed-once': 'project',
});
const STATE_OWNERS = new Set([
  'constructor',
  'external-openspec',
  'human-overlay',
  'project',
]);

function migrateOwner(owner, target) {
  const migrated = Object.hasOwn(LEGACY_OWNER_ALIASES, owner)
    ? LEGACY_OWNER_ALIASES[owner]
    : owner;
  if (!STATE_OWNERS.has(migrated)) {
    throw new ConstructorError(
      'STATE_OWNER_INVALID',
      `El estado declara owner inválido en ${target}.`,
      {
        details: String(owner),
      },
    );
  }
  return migrated;
}

function migrateLegacyFiles(rawFiles) {
  if (Array.isArray(rawFiles)) {
    const files = {};
    for (const record of rawFiles) {
      const target = record?.target ?? record?.path;
      if (typeof target !== 'string' || target === '' || files[target]) {
        throw new ConstructorError(
          'STATE_V0_FILES_INVALID',
          'El estado v0 contiene rutas ausentes o duplicadas.',
        );
      }
      files[target] = {
        ...record,
        id: record.id ?? target,
        owner: migrateOwner(record.owner ?? record.ownership, target),
      };
      delete files[target].path;
      delete files[target].target;
      delete files[target].ownership;
    }
    return files;
  }
  if (rawFiles && typeof rawFiles === 'object') {
    return Object.fromEntries(
      Object.entries(rawFiles)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([target, record]) => [
          target,
          {
            ...record,
            id: record.id ?? target,
            owner: migrateOwner(record.owner ?? record.ownership, target),
          },
        ]),
    );
  }
  throw new ConstructorError(
    'STATE_V0_FILES_INVALID',
    'El estado v0 no contiene files migrable.',
  );
}

export function migrateInstalledState(rawState) {
  if (!Number.isInteger(rawState?.stateFormatVersion)) {
    throw new ConstructorError(
      'STATE_FORMAT_INVALID',
      `${STATE_RELATIVE_PATH} no declara stateFormatVersion válido.`,
    );
  }
  if (rawState.stateFormatVersion > STATE_FORMAT_VERSION) {
    throw new ConstructorError(
      'STATE_FROM_FUTURE',
      'El repositorio fue administrado por una versión más reciente del constructor.',
      {
        details: `state=${rawState.stateFormatVersion}, runtime=${STATE_FORMAT_VERSION}`,
        remediation: 'Use la versión registrada por el repositorio o aplique una migración explícita.',
      },
    );
  }

  let state = structuredClone(rawState);
  const migrations = [];
  if (state.stateFormatVersion === 0) {
    state = sortJson({
      activeProfiles: state.activeProfiles ?? state.profiles ?? [],
      blueprintHash: state.blueprintHash ?? state.manifestHash ?? null,
      configurationHash: state.configurationHash ?? state.configHash ?? null,
      constructorVersion:
        state.constructorVersion
        ?? state.installedVersion
        ?? state.version
        ?? '0.0.0',
      files: migrateLegacyFiles(state.files),
      lastTransaction: state.lastTransaction ?? null,
      packageHash: state.packageHash ?? state.distributionHash ?? null,
      schemaVersion: String(state.schemaVersion ?? '0.0.0'),
      stateFormatVersion: 1,
    });
    migrations.push({
      from: 0,
      id: 'state-format-0-to-1',
      kind: 'state-schema',
      reversibleBy: 'transaction-rollback',
      to: 1,
    });
  }

  if (state.stateFormatVersion === 1) {
    const legacyVersion = state.packageVersion
      ?? state.constructorVersion
      ?? state.installedVersion
      ?? '0.0.0';
    const {
      constructorVersion: _constructorVersion,
      installedVersion: _installedVersion,
      ...rest
    } = state;
    state = sortJson({
      ...rest,
      packageName: PACKAGE_NAME,
      packageVersion: legacyVersion,
      stateFormatVersion: 2,
    });
    migrations.push({
      from: 1,
      id: 'state-format-1-to-2-release-identity',
      kind: 'state-schema',
      reversibleBy: 'transaction-rollback',
      to: 2,
    });
  }

  if (state.stateFormatVersion !== STATE_FORMAT_VERSION) {
    throw new ConstructorError(
      'STATE_MIGRATION_PATH_MISSING',
      `No existe migración desde stateFormatVersion ${state.stateFormatVersion}.`,
    );
  }
  if (!state.files || typeof state.files !== 'object' || Array.isArray(state.files)) {
    throw new ConstructorError('STATE_FILES_INVALID', `${STATE_RELATIVE_PATH} no declara files válido.`);
  }

  const files = {};
  for (const [target, record] of Object.entries(state.files).sort(([left], [right]) => left.localeCompare(right))) {
    files[target] = {
      ...record,
      owner: migrateOwner(record.owner, target),
    };
  }

  return {
    migrations,
    state: sortJson({
      ...state,
      files,
      stateFormatVersion: STATE_FORMAT_VERSION,
    }),
  };
}

export async function readInstalledStateWithMigrations(targetRoot) {
  const statePath = resolveInside(targetRoot, STATE_RELATIVE_PATH);
  const rawState = await readJsonFile(statePath, {
    label: STATE_RELATIVE_PATH,
    optional: true,
  });

  if (rawState === null) {
    return {
      migrations: [],
      state: null,
    };
  }

  return migrateInstalledState(rawState);
}

export async function readInstalledState(targetRoot) {
  return (await readInstalledStateWithMigrations(targetRoot)).state;
}

export function createNextState({
  blueprint,
  configurationHash,
  files,
  previousState,
  transactionId,
}) {
  return sortJson({
    activeProfiles: blueprint.activeProfiles,
    blueprintHash: blueprint.blueprintHash,
    configurationHash,
    packageName: PACKAGE_NAME,
    packageVersion: CONSTRUCTOR_VERSION,
    files,
    lastTransaction: transactionId ?? previousState?.lastTransaction ?? null,
    packageHash: blueprint.distributionHash,
    packageHashAlgorithm: 'sha256-tree-v1',
    schemaVersion: blueprint.manifest.schemaVersion,
    stateFormatVersion: STATE_FORMAT_VERSION,
  });
}

export function comparableState(state) {
  if (state === null) {
    return null;
  }
  const { lastTransaction: _lastTransaction, ...comparable } = state;
  return sortJson(comparable);
}

export function stateNeedsWrite(previousState, nextState) {
  return sha256Json(comparableState(previousState)) !== sha256Json(comparableState(nextState));
}

export function stateAbsolutePath(targetRoot) {
  return join(targetRoot, ...STATE_RELATIVE_PATH.split('/'));
}
