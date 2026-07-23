#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_ROOT = path.join(ROOT, "Documentacion");
const CONSTRUCTOR_DOCS = path.join(DOCS_ROOT, "02-operacion", "constructor-proyectos");
const PLAN = path.join(DOCS_ROOT, "01-planes-maestros", "PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md");
const DOCUMENTATION_INDEX = path.join(DOCS_ROOT, "README.md");
const CONTEXT_INDEX = path.join(DOCS_ROOT, "05-context-engineering", "README.md");
const PROMPT_00 = path.join(CONSTRUCTOR_DOCS, "PROMPT_00_BOOTSTRAP_ENTORNO.md");
const PROMPT_01 = path.join(
  ROOT,
  "node_modules",
  "create-project-engineering-os",
  "blueprint",
  "core",
  "docs",
  "engineering",
  "PROMPT_01_DISCOVERY_PROYECTO.md",
);
const MATRIX = path.join(CONSTRUCTOR_DOCS, "MATRIZ_TRANSFERIBILIDAD.md");

const ROOT_ARTIFACTS = [
  PLAN,
  path.join(CONSTRUCTOR_DOCS, "README.md"),
  path.join(CONSTRUCTOR_DOCS, "AUDITORIA_AS_IS.md"),
  MATRIX,
  path.join(CONSTRUCTOR_DOCS, "GAP_ANALYSIS.md"),
  path.join(CONSTRUCTOR_DOCS, "RUNBOOK_CONSTRUCTOR.md"),
  path.join(CONSTRUCTOR_DOCS, "ACTUALIZACION_Y_ROLLBACK.md"),
  path.join(CONSTRUCTOR_DOCS, "COMPATIBILIDAD_AGENTES_SO.md"),
  path.join(CONSTRUCTOR_DOCS, "COSTOS_LICENCIAS_SEGURIDAD.md"),
  PROMPT_00,
  PROMPT_01,
  path.join(CONSTRUCTOR_DOCS, "GUIA_MANUAL_USUARIO.md"),
];

const REQUIRED_MATRIX_COLUMNS = [
  "#",
  "Elemento",
  "Fuente y ruta",
  "Estado actual",
  "Propósito",
  "Clasificación",
  "Acción",
  "Dependencias",
  "Validación",
  "Riesgo",
  "Costo/licencia",
  "Recomendación",
];

const REQUIRED_OWNERS = ["constructor", "human-overlay", "external-openspec", "project"];
const GRAPHIFY_CONTRACT_FILES = [
  PLAN,
  MATRIX,
  path.join(CONSTRUCTOR_DOCS, "RUNBOOK_CONSTRUCTOR.md"),
  path.join(CONSTRUCTOR_DOCS, "COSTOS_LICENCIAS_SEGURIDAD.md"),
  PROMPT_00,
];

const failures = [];
const contentByFile = new Map();

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function fail(message) {
  failures.push(message);
}

function read(file) {
  if (contentByFile.has(file)) return contentByFile.get(file);
  try {
    const content = readFileSync(file, "utf8");
    contentByFile.set(file, content);
    return content;
  } catch (error) {
    fail(`${relative(file)} no pudo leerse: ${error.message}`);
    return "";
  }
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function splitMarkdownRow(line) {
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let cell = "";
  let escaped = false;
  let inCode = false;

  for (const character of body) {
    if (escaped) {
      cell += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      cell += character;
      escaped = true;
      continue;
    }
    if (character === "`") {
      inCode = !inCode;
      cell += character;
      continue;
    }
    if (character === "|" && !inCode) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }
    cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

function parseRelativeLinks(file) {
  const content = read(file);
  const links = [];
  const pattern = /!?\[[^\]]*]\(([^)\r\n]+)\)/g;

  for (const match of content.matchAll(pattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.replace(/\s+["'][^"']*["']$/, "");
    if (/^(?:https?:|mailto:|tel:|data:)/i.test(target) || target.startsWith("#")) continue;

    const pathPart = target.split("#", 1)[0].split("?", 1)[0];
    if (!pathPart) continue;

    let decoded;
    try {
      decoded = decodeURIComponent(pathPart);
    } catch {
      fail(`${relative(file)}:${lineNumberAt(content, match.index)} contiene un enlace no decodificable: ${target}`);
      continue;
    }

    const resolved = path.resolve(path.dirname(file), decoded.replaceAll("/", path.sep));
    links.push({ target, resolved, line: lineNumberAt(content, match.index) });
  }

  return links;
}

function validateArtifacts() {
  for (const file of ROOT_ARTIFACTS) {
    if (!existsSync(file)) {
      fail(`falta artefacto obligatorio: ${relative(file)}`);
      continue;
    }
    if (!statSync(file).isFile()) fail(`el artefacto obligatorio no es archivo: ${relative(file)}`);
  }
}

function validateMatrix() {
  const content = read(MATRIX);
  const lines = content.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim().startsWith("| # |"));
  if (headerIndex < 0) {
    fail(`${relative(MATRIX)} no contiene la tabla principal con encabezado "| # |"`);
    return;
  }

  const actualColumns = splitMarkdownRow(lines[headerIndex]);
  if (actualColumns.length !== REQUIRED_MATRIX_COLUMNS.length) {
    fail(
      `${relative(MATRIX)} tiene ${actualColumns.length} columnas; se esperaban ${REQUIRED_MATRIX_COLUMNS.length}`,
    );
  }
  for (let index = 0; index < REQUIRED_MATRIX_COLUMNS.length; index += 1) {
    if (actualColumns[index] !== REQUIRED_MATRIX_COLUMNS[index]) {
      fail(
        `${relative(MATRIX)} columna ${index + 1}: "${actualColumns[index] ?? "<ausente>"}"; ` +
          `se esperaba "${REQUIRED_MATRIX_COLUMNS[index]}"`,
      );
    }
  }

  const rows = lines
    .slice(headerIndex + 2)
    .map((line, offset) => ({ line, lineNumber: headerIndex + offset + 3 }))
    .filter(({ line }) => /^\|\s*\d+\s*\|/.test(line));

  if (rows.length !== 50) {
    fail(`${relative(MATRIX)} contiene ${rows.length} filas numeradas; se esperaban exactamente 50`);
  }

  rows.forEach(({ line, lineNumber }, index) => {
    const cells = splitMarkdownRow(line);
    if (cells.length !== REQUIRED_MATRIX_COLUMNS.length) {
      fail(
        `${relative(MATRIX)}:${lineNumber} tiene ${cells.length} celdas; ` +
          `se esperaban ${REQUIRED_MATRIX_COLUMNS.length}`,
      );
    }
    const expectedNumber = index + 1;
    if (cells[0] !== String(expectedNumber)) {
      fail(
        `${relative(MATRIX)}:${lineNumber} numera la fila como "${cells[0]}"; ` +
          `se esperaba "${expectedNumber}"`,
      );
    }
    cells.forEach((cell, cellIndex) => {
      if (!cell.trim()) {
        fail(
          `${relative(MATRIX)}:${lineNumber} deja vacía la columna "${REQUIRED_MATRIX_COLUMNS[cellIndex] ?? cellIndex + 1}"`,
        );
      }
    });
  });
}

function validateLinks() {
  const files = [...ROOT_ARTIFACTS, DOCUMENTATION_INDEX, CONTEXT_INDEX];
  const resolvedByFile = new Map();

  for (const file of files) {
    const links = parseRelativeLinks(file);
    resolvedByFile.set(file, new Set(links.map((link) => path.normalize(link.resolved))));
    for (const link of links) {
      if (!existsSync(link.resolved)) {
        fail(`${relative(file)}:${link.line} enlaza una ruta inexistente: ${link.target}`);
      }
    }
  }

  const requiredIndexTargets = new Map([
    [
      DOCUMENTATION_INDEX,
      [
        PLAN,
        path.join(CONSTRUCTOR_DOCS, "README.md"),
        path.join(CONSTRUCTOR_DOCS, "RUNBOOK_CONSTRUCTOR.md"),
        PROMPT_00,
        path.join(CONSTRUCTOR_DOCS, "GUIA_MANUAL_USUARIO.md"),
      ],
    ],
    [
      CONTEXT_INDEX,
      [PLAN, path.join(CONSTRUCTOR_DOCS, "README.md"), PROMPT_00],
    ],
  ]);

  for (const [indexFile, requiredTargets] of requiredIndexTargets) {
    const actual = resolvedByFile.get(indexFile) ?? new Set();
    for (const target of requiredTargets) {
      if (!actual.has(path.normalize(target))) {
        fail(`${relative(indexFile)} no contiene el enlace requerido a ${relative(target)}`);
      }
    }
  }
}

function validatePrompt00() {
  const content = read(PROMPT_00);
  const lines = content.split(/\r?\n/);
  const productKeywords =
    /\b(?:producto|aplicaci[oó]n|app|stack|usuarios?|problema|funcionalidades?|plataformas?|product|application|users?)\b/i;
  const interrogative =
    /[¿?]|\b(?:qu[eé]|cu[aá]l(?:es)?|qui[eé]n(?:es)?|c[oó]mo|what|which|who|how)\b/i;
  const directRequest =
    /\b(?:describe|indica|explica|define|cu[eé]ntame|tell me|describe your)\b/i;
  const negated =
    /\b(?:no|nunca|sin)\b.{0,60}\b(?:pregunt|entrevist|solicit|pedir|ask|interview)\b/i;

  lines.forEach((line, index) => {
    const looksLikeQuestion =
      productKeywords.test(line) && (interrogative.test(line) || directRequest.test(line));
    if (looksLikeQuestion && !negated.test(line)) {
      fail(`${relative(PROMPT_00)}:${index + 1} contiene una pregunta o solicitud de producto: ${line.trim()}`);
    }
  });

  const exactBootstrap =
    /^\s*npx --yes create-project-engineering-os@0\.1\.4 bootstrap --target \.$/m;
  const exactDryRun =
    /^\s*npx --yes create-project-engineering-os@0\.1\.4 bootstrap --target \. --dry-run$/m;
  if (!exactBootstrap.test(content) || !exactDryRun.test(content)) {
    fail(`${relative(PROMPT_00)} no fija bootstrap y dry-run públicos en 0.1.4`);
  }
  if (!/^\s*npm ci\s*$/m.test(content)) {
    fail(`${relative(PROMPT_00)} no instala el lockfile con npm ci`);
  }
  if (
    /create-project-engineering-os@(?!0\.1\.4\b)(?:latest|next|beta|[^\s`]+)/i.test(content)
    || /^\s*npx\s+(?!--yes create-project-engineering-os@0\.1\.4\b)/im.test(content)
  ) {
    fail(`${relative(PROMPT_00)} conserva una versión flotante o un npx fuera del contrato aprobado`);
  }
}

function validateOwners() {
  const content = read(PLAN);
  const section = content.match(/^### 4\.2 Owners\s*$(.*?)(?=^##\s|\Z)/ms)?.[1];
  if (!section) {
    fail(`${relative(PLAN)} no contiene la sección "### 4.2 Owners"`);
    return;
  }

  const owners = section
    .split(/\r?\n/)
    .map((line) => line.match(/^\|\s*`([^`]+)`\s*\|/)?.[1])
    .filter(Boolean);

  const actual = [...owners].sort();
  const expected = [...REQUIRED_OWNERS].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(
      `${relative(PLAN)} owners=${JSON.stringify(owners)}; ` +
        `se esperaban exactamente ${JSON.stringify(REQUIRED_OWNERS)}`,
    );
  }
}

function validateGraphify() {
  const graphifySkip = /(?:Graphify[^\r\n]{0,160}\bSKIP\b|\bSKIP\b[^\r\n]{0,160}Graphify)/i;
  for (const file of GRAPHIFY_CONTRACT_FILES) {
    if (!graphifySkip.test(read(file))) {
      fail(`${relative(file)} no declara Graphify como SKIP`);
    }
  }
}

function validatePrompt01Handoff() {
  const documentationIndex = read(DOCUMENTATION_INDEX);
  const constructorIndex = read(path.join(CONSTRUCTOR_DOCS, "README.md"));
  const prompt00 = read(PROMPT_00);
  const prompt01 = read(PROMPT_01);
  const plan = read(PLAN);

  if (!/PROMPT_01_DISCOVERY_PROYECTO[^\r\n]{0,100}\bdiferid/i.test(documentationIndex)) {
    fail(`${relative(DOCUMENTATION_INDEX)} no declara PROMPT_01_DISCOVERY_PROYECTO explícitamente diferido`);
  }
  if (
    !/PROMPT_01_DISCOVERY_PROYECTO/i.test(constructorIndex)
    || !/(?:handoff\s+inerte|ejecución pertenece a discovery)/i.test(constructorIndex)
  ) {
    fail(`${relative(path.join(CONSTRUCTOR_DOCS, "README.md"))} no separa el handoff inerte de su ejecución en Ola 1`);
  }
  if (!/No ejecutes PROMPT_01_DISCOVERY_PROYECTO/i.test(prompt00)) {
    fail(`${relative(PROMPT_00)} no prohíbe ejecutar Prompt 01 durante bootstrap`);
  }
  if (!/^\| 1\. Discovery \| Ejecución de `PROMPT_01_DISCOVERY_PROYECTO`/m.test(plan)) {
    fail(`${relative(PLAN)} no ubica la ejecución de PROMPT_01_DISCOVERY_PROYECTO en Ola 1`);
  }
  if (!/(?:tarea|chat)\s+independiente/i.test(prompt01) || !/Etapa A/i.test(prompt01)) {
    fail(`${relative(PROMPT_01)} no declara independencia y gate de Etapa A`);
  }
  if (!/(?:detente|no continúes|no continuar|no entrevistes)/i.test(prompt01)) {
    fail(`${relative(PROMPT_01)} no falla de forma cerrada ante un gate de Etapa A incompleto`);
  }
}

try {
  validateArtifacts();
  validateMatrix();
  validateLinks();
  validatePrompt00();
  validateOwners();
  validateGraphify();
  validatePrompt01Handoff();
} catch (error) {
  fail(`error interno no controlado: ${error.stack ?? error.message}`);
}

if (failures.length > 0) {
  for (const message of failures) console.error(`project-constructor-docs: FAIL - ${message}`);
  process.exitCode = 1;
} else {
  console.log(
    `project-constructor-docs: PASS (${ROOT_ARTIFACTS.length} artefactos, 50 filas, enlaces y contratos válidos)`,
  );
}
