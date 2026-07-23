import {
  lstat,
  readFile,
} from 'node:fs/promises';

import { ConstructorError } from './errors.mjs';
import { stableStringify } from './json.mjs';
import {
  assertNoSymlinkEscape,
  resolveInside,
} from './paths.mjs';

const DEFAULT_SOURCES = Object.freeze([
  '.project-os/github/product-os.json',
  '.project-os/github/project.json',
]);
const DEFAULT_DISCOVERY_SOURCE = '.project-os/github/discovery-issues.json';

function sortByStableIdentity(items) {
  return [...items].sort((left, right) => {
    const leftId = String(left.id ?? left.title ?? left.name ?? '');
    const rightId = String(right.id ?? right.title ?? right.name ?? '');
    return leftId.localeCompare(rightId);
  });
}

function resourcesFrom(payload, key, fallback = []) {
  const value = payload?.[key] ?? fallback;
  if (!Array.isArray(value)) {
    throw new ConstructorError(
      'GITHUB_PLAN_SCHEMA',
      `El manifiesto Product OS debe declarar ${key} como lista.`,
    );
  }
  return sortByStableIdentity(value).map((resource) => ({
    action: 'propose-create-or-reuse',
    desired: resource,
    remoteStatus: 'not-verified',
  }));
}

async function readPayloadFromTargetOrSeed({
  baseBlueprint,
  source,
  targetRoot,
}) {
  await assertNoSymlinkEscape(targetRoot, source);
  const absolute = resolveInside(targetRoot, source);
  try {
    const stats = await lstat(absolute);
    if (!stats.isFile()) {
      throw new ConstructorError(
        'GITHUB_PLAN_SOURCE_NOT_FILE',
        `${source} no es un archivo regular.`,
      );
    }
    return JSON.parse(await readFile(absolute, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      if (error instanceof SyntaxError) {
        throw new ConstructorError(
          'GITHUB_PLAN_JSON_INVALID',
          `${source} no contiene JSON válido.`,
          {
            details: error.message,
            cause: error,
          },
        );
      }
      throw error;
    }

    const seed = baseBlueprint.entries.find((entry) => entry.target === source);
    if (!seed?.content) {
      return null;
    }
    try {
      return JSON.parse(seed.content.toString('utf8'));
    } catch (parseError) {
      throw new ConstructorError(
        'GITHUB_PLAN_SEED_INVALID',
        `La semilla ${seed.source} no contiene JSON válido.`,
        {
          details: parseError.message,
          cause: parseError,
        },
      );
    }
  }
}

export async function buildGithubPlan({
  baseBlueprint,
  targetRoot,
}) {
  const inline = baseBlueprint.manifest.githubPlan;
  const declaredSource = typeof inline === 'string'
    ? inline
    : inline?.source;
  const candidates = declaredSource
    ? [declaredSource]
    : DEFAULT_SOURCES;

  let payload = typeof inline === 'object' && inline !== null && !inline.source
    ? inline
    : null;
  let source = payload ? 'manifest.json#githubPlan' : null;

  for (const candidate of candidates) {
    if (payload) {
      break;
    }
    const read = await readPayloadFromTargetOrSeed({
      baseBlueprint,
      source: candidate,
      targetRoot,
    });
    if (read) {
      payload = read;
      source = candidate;
    }
  }

  if (!payload) {
    throw new ConstructorError(
      'GITHUB_PLAN_SOURCE_MISSING',
      'No existe un manifiesto declarativo de GitHub Product OS.',
      {
        remediation:
          `Declare githubPlan.source en manifest.json o añada ${DEFAULT_SOURCES[0]}.`,
      },
    );
  }

  let discoveryIssues = payload.discoveryIssues ?? payload.issues ?? null;
  if (discoveryIssues === null) {
    const discoveryPayload = await readPayloadFromTargetOrSeed({
      baseBlueprint,
      source: payload.discoveryIssuesSource ?? DEFAULT_DISCOVERY_SOURCE,
      targetRoot,
    });
    discoveryIssues = discoveryPayload?.issues ?? discoveryPayload?.discoveryIssues ?? [];
  }
  const templates = payload.templates ?? baseBlueprint.entries
    .filter((entry) => entry.target.startsWith('.github/ISSUE_TEMPLATE/')
      || entry.target === '.github/pull_request_template.md')
    .map((entry) => ({
      path: entry.target,
    }));

  return {
    mode: 'dry-run',
    mutationPerformed: false,
    remote: {
      reason:
        'El runtime base no consume OAuth ni infiere que recursos remotos ausentes estén disponibles.',
      status: 'not-verified',
    },
    resources: {
      discoveryIssues: resourcesFrom({ discoveryIssues }, 'discoveryIssues'),
      fields: resourcesFrom(payload, 'fields'),
      labels: resourcesFrom(payload, 'labels'),
      milestones: resourcesFrom(payload, 'milestones'),
      statuses: resourcesFrom(payload, 'statuses'),
      templates: resourcesFrom({ templates }, 'templates'),
    },
    schemaVersion: '1.0.0',
    source,
    manualGates: sortByStableIdentity(payload.manualGates ?? []).map((gate, index) => (
      typeof gate === 'string'
        ? {
          description: gate,
          id: `manual-gate-${String(index + 1).padStart(2, '0')}`,
          status: 'pending-manual',
        }
        : {
          ...gate,
          status: 'pending-manual',
        }
    )),
  };
}

export function githubPlanText(plan) {
  const lines = [
    'GitHub Product OS (dry-run)',
    `Fuente: ${plan.source}`,
    `Estado remoto: ${plan.remote.status}`,
    'Mutaciones: ninguna',
  ];
  for (const [kind, resources] of Object.entries(plan.resources)) {
    lines.push(`${kind}: ${resources.length}`);
  }
  if (plan.manualGates.length > 0) {
    lines.push(`Gates manuales: ${plan.manualGates.length}`);
  }
  return `${lines.join('\n')}\n`;
}

export function githubPlanJson(plan) {
  return stableStringify(plan);
}
