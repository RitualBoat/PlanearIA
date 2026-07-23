import {
  lstat,
  readFile,
} from 'node:fs/promises';

import { OWNERS } from './constants.mjs';
import { packageDistributionEntries } from './distribution.mjs';
import { ConstructorError } from './errors.mjs';
import {
  normalizeLf,
  sha256,
  sha256Json,
} from './hash.mjs';
import { sortJson, stableStringify } from './json.mjs';
import {
  assertNoSymlinkEscape,
  resolveInside,
} from './paths.mjs';

export const PROJECT_OS_SOURCES = Object.freeze({
  capabilityMatrix: '.project-os/harness-capabilities.json',
  instructions: '.project-os/instructions.md',
  mcp: '.project-os/mcp.json',
  pathRules: '.project-os/path-rules.json',
  permissions: '.project-os/permissions.json',
  profiles: '.project-os/profiles.json',
  skills: '.project-os/skills.json',
});

export const HARNESS_CAPABILITY_STATES = Object.freeze([
  'native',
  'generated',
  'documented',
  'unsupported',
]);

export const HARNESS_CAPABILITY_SCHEMA = Object.freeze({
  capabilities: [
    'instructions',
    'pathRules',
    'skills',
    'permissions',
    'mcp',
    'profiles',
  ],
  harnesses: [
    'claude-code',
    'codex',
    'cursor',
    'github-copilot',
    'opencode',
  ],
});

const TOKENS = Object.freeze({
  PROJECT_OS_CAPABILITY_MATRIX: 'capabilityMatrix',
  PROJECT_OS_INSTRUCTIONS: 'instructions',
  PROJECT_OS_MCP: 'mcp',
  PROJECT_OS_PATH_RULES: 'pathRules',
  PROJECT_OS_PERMISSIONS: 'permissions',
  PROJECT_OS_PROFILES: 'profiles',
  PROJECT_OS_SKILLS: 'skills',
});

const TOKEN_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

function listFrom(raw, primary, fallback = null) {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && Array.isArray(raw[primary])) {
    return raw[primary];
  }
  if (fallback && raw && Array.isArray(raw[fallback])) {
    return raw[fallback];
  }
  throw new ConstructorError(
    'PROJECT_OS_SCHEMA_INVALID',
    `La fuente canónica debe declarar una lista "${primary}".`,
  );
}

function uniqueIdList(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || item.id === '') {
      throw new ConstructorError(
        'PROJECT_OS_ID_INVALID',
        `${label} contiene una entrada sin id.`,
      );
    }
    if (ids.has(item.id)) {
      throw new ConstructorError(
        'PROJECT_OS_ID_DUPLICATE',
        `${label} contiene el id duplicado ${item.id}.`,
      );
    }
    ids.add(item.id);
  }
}

function textList(value, label) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? [value] : null;
  if (!list || list.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new ConstructorError('PROJECT_OS_TEXT_LIST_INVALID', `${label} debe ser texto o lista de textos.`);
  }
  return list.map((item) => normalizeLf(item));
}

function normalizePathRules(raw) {
  const rules = listFrom(raw, 'rules', 'pathRules').map((rule) => ({
    globs: textList(rule.globs ?? rule.paths ?? rule.applyTo, `globs de ${rule.id}`),
    id: rule.id,
    instructions: textList(
      rule.instructions ?? rule.content ?? rule.rule,
      `instructions de ${rule.id}`,
    ),
  }));
  uniqueIdList(rules, 'path-rules.json');
  return rules.sort((left, right) => left.id.localeCompare(right.id));
}

function normalizeSkills(raw) {
  const skills = listFrom(raw, 'skills').map((skill) => ({
    description: String(skill.description ?? ''),
    enabled: skill.enabled !== false,
    id: skill.id,
    instructions: textList(
      skill.instructions ?? skill.content ?? skill.body,
      `instructions de skill ${skill.id}`,
    ),
  }));
  uniqueIdList(skills, 'skills.json');
  return skills.sort((left, right) => left.id.localeCompare(right.id));
}

function normalizePermissions(raw) {
  const permissions = listFrom(raw, 'rules', 'permissions').map((permission) => {
    const effect = permission.effect ?? permission.mode ?? permission.action;
    if (!['allow', 'ask', 'deny'].includes(effect)) {
      throw new ConstructorError(
        'PROJECT_OS_PERMISSION_EFFECT',
        `El permiso ${permission.id} debe usar allow, ask o deny.`,
      );
    }
    return {
      commands: textList(
        permission.commands ?? permission.patterns ?? permission.command,
        `commands de permiso ${permission.id}`,
      ),
      effect,
      id: permission.id,
      reason: String(permission.reason ?? ''),
    };
  });
  uniqueIdList(permissions, 'permissions.json');
  return permissions.sort((left, right) => left.id.localeCompare(right.id));
}

function normalizeCapabilityMatrix(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_MATRIX_SCHEMA',
      'harness-capabilities.json debe contener un objeto.',
    );
  }

  const vocabulary = raw.vocabulary;
  if (!Array.isArray(vocabulary)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_VOCABULARY',
      'La matriz debe declarar vocabulary.',
    );
  }
  const actualVocabulary = [...new Set(vocabulary)].sort();
  const expectedVocabulary = [...HARNESS_CAPABILITY_STATES].sort();
  if (
    actualVocabulary.length !== expectedVocabulary.length
    || actualVocabulary.some((value, index) => value !== expectedVocabulary[index])
  ) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_VOCABULARY',
      'La matriz debe usar exactamente native, generated, documented y unsupported.',
      {
        details: vocabulary,
      },
    );
  }

  if (!Array.isArray(raw.harnesses)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_HARNESSES',
      'La matriz debe declarar harnesses.',
    );
  }
  uniqueIdList(raw.harnesses, 'harness-capabilities.json');
  const actualHarnesses = raw.harnesses.map((harness) => harness.id).sort();
  const expectedHarnesses = [...HARNESS_CAPABILITY_SCHEMA.harnesses].sort();
  if (
    actualHarnesses.length !== expectedHarnesses.length
    || actualHarnesses.some((value, index) => value !== expectedHarnesses[index])
  ) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_HARNESS_SET',
      'La matriz debe cubrir exactamente los cinco harnesses soportados.',
      {
        details: actualHarnesses,
      },
    );
  }

  const harnesses = raw.harnesses.map((harness) => {
    if (
      !harness.capabilities
      || typeof harness.capabilities !== 'object'
      || Array.isArray(harness.capabilities)
    ) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_SET',
        `${harness.id} no declara capabilities.`,
      );
    }
    const actualCapabilities = Object.keys(harness.capabilities).sort();
    const expectedCapabilities = [...HARNESS_CAPABILITY_SCHEMA.capabilities].sort();
    if (
      actualCapabilities.length !== expectedCapabilities.length
      || actualCapabilities.some((value, index) => value !== expectedCapabilities[index])
    ) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_SET',
        `${harness.id} debe declarar exactamente seis capacidades.`,
        {
          details: actualCapabilities,
        },
      );
    }

    const capabilities = {};
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const contract = harness.capabilities[capability];
      if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_CONTRACT',
          `${harness.id}/${capability} no declara un contrato.`,
        );
      }
      if (!HARNESS_CAPABILITY_STATES.includes(contract.support)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_STATE',
          `${harness.id}/${capability} usa el estado ${String(contract.support)}.`,
        );
      }
      if (typeof contract.target !== 'string' || contract.target === '') {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_TARGET',
          `${harness.id}/${capability} no declara target.`,
        );
      }
      if (!OWNERS.includes(contract.owner)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_OWNER',
          `${harness.id}/${capability} usa owner no soportado.`,
        );
      }
      if (typeof contract.validation !== 'string' || contract.validation === '') {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_VALIDATION',
          `${harness.id}/${capability} no declara validation.`,
        );
      }
      capabilities[capability] = {
        owner: contract.owner,
        support: contract.support,
        target: contract.target,
        validation: contract.validation,
      };
    }

    return {
      capabilities,
      id: harness.id,
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  return sortJson({
    definitions: raw.definitions ?? {},
    harnesses,
    parityPolicy: raw.parityPolicy ?? {},
    schemaVersion: String(raw.schemaVersion ?? '1.0.0'),
    vocabulary: [...HARNESS_CAPABILITY_STATES],
  });
}

function normalizeEnvironment(raw, serverId) {
  if (raw === undefined || raw === null) {
    return {};
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'PROJECT_OS_MCP_ENV_INVALID',
      `env de MCP ${serverId} debe ser un objeto.`,
    );
  }

  const result = {};
  for (const [name, value] of Object.entries(raw).sort(([left], [right]) => left.localeCompare(right))) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ENV_NAME',
        `La variable ${name} de MCP ${serverId} no es válida.`,
      );
    }
    const reference = typeof value === 'object' && value !== null
      ? value.fromEnv
      : value;
    if (
      typeof reference !== 'string'
      || (
        reference !== name
        && reference !== `\${${name}}`
        && !/^\$\{[A-Z][A-Z0-9_]*\}$/.test(reference)
      )
    ) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_LITERAL_SECRET',
        `MCP ${serverId} debe referenciar ${name} mediante entorno, no declarar un valor literal.`,
        {
          remediation: `Use "\${${name}}" o {"fromEnv":"${name}"}.`,
        },
      );
    }
    result[name] = `\${${reference.replace(/^\$\{|\}$/g, '')}}`;
  }
  return result;
}

function normalizeHeaders(raw, serverId) {
  if (raw === undefined || raw === null) {
    return {};
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'PROJECT_OS_MCP_HEADERS_INVALID',
      `headers de MCP ${serverId} debe ser un objeto.`,
    );
  }

  const result = {};
  for (const [name, value] of Object.entries(raw).sort(([left], [right]) => left.localeCompare(right))) {
    if (name.trim() === '') {
      throw new ConstructorError(
        'PROJECT_OS_MCP_HEADER_NAME',
        `MCP ${serverId} contiene un header sin nombre.`,
      );
    }
    const reference = typeof value === 'object' && value !== null
      ? value.fromEnv
      : value;
    if (
      typeof reference !== 'string'
      || !/^(?:[A-Z][A-Z0-9_]*|\$\{[A-Z][A-Z0-9_]*\})$/.test(reference)
    ) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_LITERAL_SECRET',
        `MCP ${serverId} debe referenciar el header ${name} mediante entorno.`,
        {
          remediation: 'Use "${VARIABLE_DE_ENTORNO}" o {"fromEnv":"VARIABLE_DE_ENTORNO"}.',
        },
      );
    }
    result[name] = `\${${reference.replace(/^\$\{|\}$/g, '')}}`;
  }
  return result;
}

function normalizeMcp(raw) {
  let entries;
  if (Array.isArray(raw)) {
    entries = raw;
  } else if (Array.isArray(raw?.servers)) {
    entries = raw.servers;
  } else if (raw?.servers && typeof raw.servers === 'object') {
    entries = Object.entries(raw.servers).map(([id, server]) => ({ id, ...server }));
  } else {
    throw new ConstructorError('PROJECT_OS_MCP_SCHEMA', 'mcp.json debe declarar servers.');
  }

  const servers = entries.map((server) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(server.id ?? '')) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ID',
        `El ID MCP ${String(server.id)} no puede contener puntos ni caracteres ambiguos.`,
      );
    }
    const hasCommand = typeof server.command === 'string' && server.command !== '';
    const hasUrl = typeof server.url === 'string' && server.url !== '';
    if (server.enabled !== false && hasCommand === hasUrl) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ENDPOINT',
        `MCP ${server.id} requiere exactamente uno de command o url.`,
      );
    }
    const args = server.args ?? [];
    if (!Array.isArray(args) || args.some((value) => typeof value !== 'string')) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ARGS',
        `args de MCP ${server.id} debe ser una lista de strings.`,
      );
    }
    return {
      args,
      command: server.command ?? null,
      enabled: server.enabled !== false,
      env: normalizeEnvironment(server.env, server.id),
      headers: normalizeHeaders(server.headers, server.id),
      id: server.id,
      url: server.url ?? null,
    };
  });
  uniqueIdList(servers, 'mcp.json');
  return servers.sort((left, right) => left.id.localeCompare(right.id));
}

function requireNonEmpty(value, aliases, profileId, label) {
  for (const alias of aliases) {
    const candidate = value[alias];
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.map((item) => String(item));
    }
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return [candidate];
    }
  }
  throw new ConstructorError(
    'PROJECT_OS_PROFILE_INCOMPLETE',
    `El perfil ${profileId} no declara ${label}.`,
  );
}

function normalizeProfiles(raw) {
  const profileList = listFrom(raw, 'profiles', 'catalog').map((profile) => ({
    automaticValidations: requireNonEmpty(
      profile,
      ['automaticValidations', 'validations'],
      profile.id,
      'validaciones automáticas',
    ),
    closureGate: requireNonEmpty(
      profile,
      ['closureGate', 'closeGate', 'gate'],
      profile.id,
      'gate de cierre',
    ),
    id: profile.id,
    manualEvidence: requireNonEmpty(
      profile,
      ['manualEvidence', 'evidence'],
      profile.id,
      'evidencia manual',
    ),
    naConditions: requireNonEmpty(
      profile,
      ['naConditions', 'notApplicableWhen'],
      profile.id,
      'condiciones N/A',
    ),
    negativeCases: requireNonEmpty(
      profile,
      ['negativeCases', 'negativeTests'],
      profile.id,
      'casos negativos',
    ),
    rollback: requireNonEmpty(
      profile,
      ['rollback'],
      profile.id,
      'rollback',
    ),
  }));
  uniqueIdList(profileList, 'profiles.json');
  profileList.sort((left, right) => left.id.localeCompare(right.id));

  const activeRaw = raw.activeProfiles ?? raw.active ?? [];
  if (!Array.isArray(activeRaw)) {
    throw new ConstructorError(
      'PROJECT_OS_ACTIVE_PROFILES',
      'profiles.json debe declarar activeProfiles como lista.',
    );
  }
  const known = new Set(profileList.map((profile) => profile.id));
  const active = [...new Set(activeRaw.map(String))].sort((left, right) => left.localeCompare(right));
  const missing = active.filter((id) => !known.has(id));
  if (missing.length > 0) {
    throw new ConstructorError(
      'PROJECT_OS_ACTIVE_PROFILE_UNKNOWN',
      'Hay perfiles activos que no existen en el catálogo.',
      {
        details: missing,
      },
    );
  }
  return {
    active,
    profiles: profileList,
  };
}

async function readCanonicalSource(targetRoot, baseBlueprint, relativePath) {
  const manifestEntry = baseBlueprint.entries.find((entry) => entry.target === relativePath);
  if (!manifestEntry) {
    throw new ConstructorError(
      'PROJECT_OS_SOURCE_UNDECLARED',
      `${relativePath} no está declarado en manifest.json.`,
    );
  }
  if (manifestEntry.owner !== 'project') {
    throw new ConstructorError(
      'PROJECT_OS_SOURCE_OWNER',
      `${relativePath} debe usar owner project (seed-once).`,
    );
  }

  await assertNoSymlinkEscape(targetRoot, relativePath);
  const absolute = resolveInside(targetRoot, relativePath);
  try {
    const stats = await lstat(absolute);
    if (!stats.isFile()) {
      throw new ConstructorError(
        'PROJECT_OS_SOURCE_NOT_FILE',
        `${relativePath} existe pero no es un archivo regular.`,
      );
    }
    return await readFile(absolute);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      if (manifestEntry.content === null) {
        throw new ConstructorError(
          'PROJECT_OS_SOURCE_MISSING',
          `${relativePath} no existe y el blueprint no ofrece semilla.`,
        );
      }
      return manifestEntry.content;
    }
    throw error;
  }
}

function parseCanonicalJson(buffer, relativePath) {
  try {
    return JSON.parse(normalizeLf(buffer.toString('utf8')));
  } catch (error) {
    throw new ConstructorError(
      'PROJECT_OS_JSON_INVALID',
      `${relativePath} no contiene JSON válido.`,
      {
        details: error.message,
        cause: error,
      },
    );
  }
}

async function loadCanonicalProjectOs(targetRoot, baseBlueprint) {
  const buffers = {};
  for (const [id, relativePath] of Object.entries(PROJECT_OS_SOURCES)) {
    buffers[id] = await readCanonicalSource(targetRoot, baseBlueprint, relativePath);
  }

  const instructions = normalizeLf(buffers.instructions.toString('utf8'));
  if (instructions.trim() === '') {
    throw new ConstructorError(
      'PROJECT_OS_INSTRUCTIONS_EMPTY',
      `${PROJECT_OS_SOURCES.instructions} no puede estar vacío.`,
    );
  }

  return {
    capabilityMatrix: normalizeCapabilityMatrix(
      parseCanonicalJson(buffers.capabilityMatrix, PROJECT_OS_SOURCES.capabilityMatrix),
    ),
    instructions,
    mcp: normalizeMcp(parseCanonicalJson(buffers.mcp, PROJECT_OS_SOURCES.mcp)),
    pathRules: normalizePathRules(
      parseCanonicalJson(buffers.pathRules, PROJECT_OS_SOURCES.pathRules),
    ),
    permissions: normalizePermissions(
      parseCanonicalJson(buffers.permissions, PROJECT_OS_SOURCES.permissions),
    ),
    profiles: normalizeProfiles(
      parseCanonicalJson(buffers.profiles, PROJECT_OS_SOURCES.profiles),
    ),
    skills: normalizeSkills(parseCanonicalJson(buffers.skills, PROJECT_OS_SOURCES.skills)),
  };
}

function markdownPathRules(rules) {
  return rules.map((rule) => [
    `### ${rule.id}`,
    '',
    `Globs: ${rule.globs.map((glob) => `\`${glob}\``).join(', ')}`,
    '',
    ...rule.instructions.map((instruction) => `- ${instruction}`),
  ].join('\n')).join('\n\n');
}

function markdownSkills(skills) {
  return skills.map((skill) => [
    `### ${skill.id}`,
    '',
    skill.description || 'Sin descripción adicional.',
    '',
    `Estado: ${skill.enabled ? 'activa' : 'inactiva'}.`,
    '',
    ...skill.instructions.map((instruction) => `- ${instruction}`),
  ].join('\n')).join('\n\n');
}

function markdownPermissions(permissions) {
  return permissions.map((permission) => [
    `- \`${permission.effect}\` ${permission.commands.map((command) => `\`${command}\``).join(', ')}`,
    permission.reason ? `  Motivo: ${permission.reason}` : null,
  ].filter(Boolean).join('\n')).join('\n');
}

function markdownMcp(servers) {
  if (servers.length === 0) {
    return 'No hay MCP universales activos.';
  }
  return servers.map((server) => {
    const envNames = Object.keys(server.env);
    return [
      `- \`${server.id}\`: ${server.enabled ? 'activo' : 'inactivo'}.`,
      envNames.length > 0 ? `  Variables requeridas: ${envNames.join(', ')}.` : null,
    ].filter(Boolean).join('\n');
  }).join('\n');
}

function markdownProfiles(profiles) {
  return [
    `Perfiles activos: ${profiles.active.length > 0 ? profiles.active.join(', ') : 'ninguno'}.`,
    '',
    ...profiles.profiles.map((profile) => (
      `- \`${profile.id}\`: ${profiles.active.includes(profile.id) ? 'activo' : 'inactivo'}; gate: ${profile.closureGate.join('; ')}`
    )),
  ].join('\n');
}

function markdownCapabilityMatrix(matrix) {
  const rows = [
    '| Harness | Capacidad | Estado | Destino | Validación |',
    '|---|---|---|---|---|',
  ];
  for (const harness of matrix.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const entry = harness.capabilities[capability];
      rows.push(
        `| ${harness.id} | ${capability} | ${entry.support} | ${entry.target} | ${entry.validation} |`,
      );
    }
  }
  return rows.join('\n');
}

export function jsonMcpServers(servers, target) {
  return Object.fromEntries(
    servers
      .filter((server) => server.enabled)
      .map((server) => [
        server.id,
        target === 'opencode.json'
          ? sortJson(server.command
            ? {
              command: [server.command, ...(server.args ?? [])],
              enabled: true,
              ...(Object.keys(server.env ?? {}).length > 0
                ? { environment: server.env }
                : {}),
              type: 'local',
            }
            : {
              enabled: true,
              ...(Object.keys(server.headers ?? {}).length > 0
                ? { headers: server.headers }
                : {}),
              type: 'remote',
              url: server.url,
            })
          : sortJson({
            ...(server.command ? { command: server.command } : {}),
            ...((server.args ?? []).length > 0 ? { args: server.args } : {}),
            ...(Object.keys(server.env ?? {}).length > 0 ? { env: server.env } : {}),
            ...(Object.keys(server.headers ?? {}).length > 0 ? { headers: server.headers } : {}),
            ...(server.url ? { url: server.url } : {}),
          }),
      ]),
  );
}

function jsonPermissions(permissions, target) {
  if (target === 'opencode.json' || target === '.claude/settings.json') {
    return {};
  }

  return {
    allow: permissions
      .filter((permission) => permission.effect === 'allow')
      .flatMap((permission) => permission.commands)
      .sort(),
    ask: permissions
      .filter((permission) => permission.effect === 'ask')
      .flatMap((permission) => permission.commands)
      .sort(),
    deny: permissions
      .filter((permission) => permission.effect === 'deny')
      .flatMap((permission) => permission.commands)
      .sort(),
  };
}

function tomlString(value) {
  return JSON.stringify(value);
}

function tomlMcp(servers) {
  const blocks = [];
  for (const server of servers.filter((candidate) => candidate.enabled)) {
    blocks.push(`[mcp_servers.${server.id}]`);
    if (server.command) {
      blocks.push(`command = ${tomlString(server.command)}`);
    }
    if (server.args.length > 0) {
      blocks.push(`args = [${server.args.map(tomlString).join(', ')}]`);
    }
    if (server.url) {
      blocks.push(`url = ${tomlString(server.url)}`);
    }
    if (Object.keys(server.env).length > 0) {
      const env = Object.entries(server.env)
        .map(([name, value]) => `${name} = ${tomlString(value)}`)
        .join(', ');
      blocks.push(`env = { ${env} }`);
    }
    blocks.push('');
  }
  return blocks.join('\n').trimEnd();
}

function tomlPermissions(permissions) {
  return [
    '# Permisos documentales: Codex no debe interpretarlos como enforcement equivalente.',
    ...permissions.map((permission) => (
      `# ${permission.effect}: ${permission.commands.join(', ')}${permission.reason ? ` - ${permission.reason}` : ''}`
    )),
  ].join('\n');
}

function tokenValue(tokenId, target, canonical) {
  const isJson = target.toLowerCase().endsWith('.json');
  const isToml = target.toLowerCase().endsWith('.toml');

  switch (tokenId) {
    case 'instructions':
      if (isJson) {
        if (target === 'opencode.json') {
          return JSON.stringify(['AGENTS.md', '.opencode/project-os.md']);
        }
        return JSON.stringify(canonical.instructions);
      }
      return canonical.instructions.trimEnd();
    case 'pathRules':
      return isJson
        ? JSON.stringify(canonical.pathRules, null, 2)
        : markdownPathRules(canonical.pathRules);
    case 'skills':
      return isJson
        ? JSON.stringify(canonical.skills, null, 2)
        : markdownSkills(canonical.skills);
    case 'permissions':
      if (isToml) {
        return tomlPermissions(canonical.permissions);
      }
      return isJson
        ? JSON.stringify(jsonPermissions(canonical.permissions, target), null, 2)
        : markdownPermissions(canonical.permissions);
    case 'mcp':
      if (isToml) {
        return tomlMcp(canonical.mcp);
      }
      return isJson
        ? JSON.stringify(jsonMcpServers(canonical.mcp, target), null, 2)
        : markdownMcp(canonical.mcp);
    case 'profiles':
      return isJson
        ? JSON.stringify(canonical.profiles, null, 2)
        : markdownProfiles(canonical.profiles);
    case 'capabilityMatrix':
      return isJson
        ? JSON.stringify(canonical.capabilityMatrix, null, 2)
        : markdownCapabilityMatrix(canonical.capabilityMatrix);
    default:
      throw new ConstructorError('PROJECT_OS_TOKEN_UNKNOWN', `Token interno desconocido: ${tokenId}.`);
  }
}

function renderShell(entry, canonical) {
  if (entry.content === null || !['constructor', 'human-overlay'].includes(entry.owner)) {
    return entry;
  }
  let text = normalizeLf(entry.content.toString('utf8'));
  const declaredTokens = [...text.matchAll(TOKEN_PATTERN)].map((match) => match[1]);
  for (const rawToken of [...new Set(declaredTokens)]) {
    const tokenId = TOKENS[rawToken];
    if (!tokenId) {
      throw new ConstructorError(
        'PROJECT_OS_TOKEN_UNKNOWN',
        `El shell ${entry.source} usa el token no soportado {{${rawToken}}}.`,
      );
    }
    text = text.replaceAll(`{{${rawToken}}}`, tokenValue(tokenId, entry.target, canonical));
  }

  const unresolved = [...text.matchAll(TOKEN_PATTERN)].map((match) => match[0]);
  if (unresolved.length > 0) {
    throw new ConstructorError(
      'PROJECT_OS_TOKEN_UNRESOLVED',
      `El shell de ${entry.target} conserva tokens sin resolver.`,
      {
        details: [...new Set(unresolved)],
      },
    );
  }

  let content = Buffer.from(text, 'utf8');
  if (entry.target.toLowerCase().endsWith('.json')) {
    try {
      content = Buffer.from(stableStringify(JSON.parse(text)), 'utf8');
    } catch (error) {
      throw new ConstructorError(
        'PROJECT_OS_RENDERED_JSON_INVALID',
        `El shell renderizado de ${entry.target} no es JSON válido.`,
        {
          details: error.message,
          remediation:
            'Asegure que los tokens JSON ocupen una posición de valor y que el shell use comas correctas.',
          cause: error,
        },
      );
    }
  }

  return {
    ...entry,
    content,
    sourceHash: sha256(content),
  };
}

export function parseCodexMcpServerIds(toml) {
  const ids = new Set();
  const rootTable = /^\s*\[\s*mcp_servers\.(?:"([^"]+)"|([a-zA-Z0-9_-]+))\s*\]\s*(?:#.*)?$/;
  for (const line of normalizeLf(toml).split('\n')) {
    const match = rootTable.exec(line);
    if (match) {
      ids.add(match[1] ?? match[2]);
    }
  }
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function jsonMcpIds(target, text) {
  const parsed = JSON.parse(text);
  let servers;
  if (target === 'opencode.json') {
    servers = parsed.mcp ?? parsed.mcpServers ?? {};
  } else {
    servers = parsed.mcpServers ?? parsed.mcp ?? parsed;
  }
  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) {
    return [];
  }
  return Object.keys(servers).sort((left, right) => left.localeCompare(right));
}

function assertSameIds(actual, expected, target) {
  if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
    throw new ConstructorError(
      'PROJECT_OS_MCP_PARITY',
      `El adaptador ${target} no conserva los MCP activos.`,
      {
        details: [
          `esperados=${expected.join(',')}`,
          `actuales=${actual.join(',')}`,
        ],
      },
    );
  }
}

function validateRenderedMcp(entries, canonical) {
  const expected = canonical.mcp
    .filter((server) => server.enabled)
    .map((server) => server.id)
    .sort((left, right) => left.localeCompare(right));
  const targets = ['.codex/config.toml', '.cursor/mcp.json', '.mcp.json', 'opencode.json'];
  for (const target of targets) {
    const entry = entries.find((candidate) => candidate.target === target);
    if (!entry) {
      continue;
    }
    const text = entry.content.toString('utf8');
    const actual = target.endsWith('.toml')
      ? parseCodexMcpServerIds(text)
      : jsonMcpIds(target, text);
    assertSameIds(actual, expected, target);
  }
}

function validateCapabilityMatrix(entries, matrix) {
  const targets = new Map(entries.map((entry) => [entry.target, entry]));
  for (const harness of matrix.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const contract = harness.capabilities[capability];
      if (!HARNESS_CAPABILITY_STATES.includes(contract.support)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_STATE',
          `${harness.id}/${capability} usa un estado no soportado.`,
        );
      }
      const targetEntry = targets.get(contract.target);
      if (!targetEntry) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_UNPROVEN',
          `${harness.id}/${capability} declara ${contract.target}, pero manifest.json no lo instala.`,
          {
            remediation: 'Añada el shell correspondiente o degrade la capacidad de forma explícita.',
          },
        );
      }
      if (targetEntry.owner !== contract.owner) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_OWNER_DRIFT',
          `${harness.id}/${capability} declara owner ${contract.owner}, pero ${contract.target} usa ${targetEntry.owner}.`,
        );
      }
    }
  }
}

export async function materializeHarnessBlueprint({
  baseBlueprint,
  targetRoot,
}) {
  const canonical = await loadCanonicalProjectOs(targetRoot, baseBlueprint);
  const configuredProfiles = [...baseBlueprint.activeProfiles].sort();
  if (
    configuredProfiles.length !== canonical.profiles.active.length
    || configuredProfiles.some((profile, index) => profile !== canonical.profiles.active[index])
  ) {
    throw new ConstructorError(
      'PROJECT_OS_PROFILE_SELECTION_DRIFT',
      'config.json y .project-os/profiles.json declaran perfiles activos distintos.',
      {
        details: [
          `config=${configuredProfiles.join(',')}`,
          `project-os=${canonical.profiles.active.join(',')}`,
        ],
        remediation:
          'Registre una decisión y actualice ambas superficies en una migración explícita antes de sincronizar.',
      },
    );
  }
  const renderedEntries = baseBlueprint.entries.map((entry) => renderShell(entry, canonical));
  const distributionEntries = await packageDistributionEntries();
  const distributionHash = sha256Json(distributionEntries.map((entry) => ({
    hash: entry.sourceHash,
    source: entry.source,
    target: entry.target,
  })));
  // La identidad se calcula sobre el paquete completo, pero el consumidor no recibe una copia
  // editable del runtime. El binario se resuelve desde la dependencia exacta del lockfile.
  const entries = renderedEntries;
  const targets = new Set();
  for (const entry of entries) {
    if (targets.has(entry.target)) {
      throw new ConstructorError(
        'BLUEPRINT_TARGET_COLLISION',
        `El blueprint renderizado contiene dos owners para ${entry.target}.`,
      );
    }
    targets.add(entry.target);
  }
  validateCapabilityMatrix(entries, canonical.capabilityMatrix);
  validateRenderedMcp(entries, canonical);

  const blueprintHash = sha256Json({
    baseBlueprintHash: baseBlueprint.blueprintHash,
    canonical,
    rendered: entries.map(({ content, ...entry }) => ({
      ...entry,
      contentHash: content === null ? null : sha256(content),
    })),
  });

  return {
    ...baseBlueprint,
    blueprintHash,
    canonical,
    distributionHash,
    entries: entries.sort((left, right) => left.target.localeCompare(right.target)),
  };
}
