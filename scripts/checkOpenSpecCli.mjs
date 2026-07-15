#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const PACKAGE_NAME = "@fission-ai/openspec";
const ROOT_PACKAGE_PATH = path.join(ROOT, "package.json");
const INSTALLED_PACKAGE_PATH = path.join(ROOT, "node_modules", "@fission-ai", "openspec", "package.json");
const CLI_PATH = path.join(ROOT, "node_modules", "@fission-ai", "openspec", "bin", "openspec.js");
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function fail(message, recovery, details = "") {
  console.error(`openspec-check: FAIL - ${message}`);
  if (details.trim()) console.error(details.trim());
  console.error(`openspec-check: recovery - ${recovery}`);
  process.exit(1);
}

function readJson(file, label, recovery) {
  if (!existsSync(file)) fail(`falta ${label}: ${file}`, recovery);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} no contiene JSON valido`, recovery, String(error));
  }
}

function parseVersion(value, label) {
  const match = String(value).match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) fail(`no se pudo interpretar ${label}: ${value}`, "Alinea Node y la CLI con package.json y package-lock.json.");
  return match.slice(1).map(Number);
}

function isAtLeast(actual, minimum) {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] > minimum[index]) return true;
    if (actual[index] < minimum[index]) return false;
  }
  return true;
}

function runCli(args, label, recovery) {
  const result = spawnSync(process.execPath, [CLI_PATH, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, CI: "true", NO_COLOR: "1" },
  });

  if (result.error) fail(`${label} no pudo iniciar`, recovery, String(result.error));
  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n");
    fail(`${label} termino con codigo ${result.status}`, recovery, details);
  }

  return result.stdout.trim();
}

function parseCliJson(raw, label) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`${label} no devolvio JSON valido`, "Ejecuta npm ci y vuelve a correr npm run openspec:check.", `${error}\n${raw}`);
  }
}

const rootPackage = readJson(ROOT_PACKAGE_PATH, "package.json", "Ejecuta este comando desde la raiz del repositorio.");
const declaredVersion = rootPackage.devDependencies?.[PACKAGE_NAME];

if (!declaredVersion) {
  fail(`package.json no declara ${PACKAGE_NAME} en devDependencies`, `Ejecuta npm install --save-dev --save-exact ${PACKAGE_NAME}@<version-aprobada>.`);
}
if (!EXACT_VERSION.test(declaredVersion)) {
  fail(`la version declarada no es exacta: ${declaredVersion}`, `Quita ^/~ y fija ${PACKAGE_NAME} a una version exacta.`);
}

const installedPackage = readJson(INSTALLED_PACKAGE_PATH, `paquete local ${PACKAGE_NAME}`, "Ejecuta npm ci.");
if (installedPackage.version !== declaredVersion) {
  fail(`version declarada ${declaredVersion} != instalada ${installedPackage.version}`, "Ejecuta npm ci para restaurar el lockfile.");
}
if (!existsSync(CLI_PATH)) {
  fail(`falta el binario local: ${CLI_PATH}`, "Ejecuta npm ci.");
}

const engine = installedPackage.engines?.node;
const minimumMatch = typeof engine === "string" ? engine.match(/^>=(\d+\.\d+\.\d+)$/) : null;
if (!minimumMatch) {
  fail(`engines.node no tiene el formato soportado >=x.y.z: ${engine ?? "ausente"}`, "Revisa manualmente el nuevo requisito de Node antes de actualizar OpenSpec.");
}

const actualNode = parseVersion(process.versions.node, "la version activa de Node");
const minimumNode = parseVersion(minimumMatch[1], "engines.node");
if (!isAtLeast(actualNode, minimumNode)) {
  fail(`Node ${process.versions.node} no satisface ${engine}`, `Actualiza Node a ${minimumMatch[1]} o superior y ejecuta npm ci.`);
}

const reportedVersion = runCli(["--version"], "openspec --version", "Ejecuta npm ci.").replace(/^v/, "");
if (reportedVersion !== declaredVersion) {
  fail(`el binario reporta ${reportedVersion}; se esperaba ${declaredVersion}`, "Ejecuta npm ci y confirma que no exista un shim modificado.");
}

const listed = parseCliJson(
  runCli(["list", "--json"], "openspec list", "Revisa openspec/config.yaml y la estructura openspec/ del repositorio."),
  "openspec list",
);
const validation = parseCliJson(
  runCli(
    ["validate", "--all", "--strict", "--no-interactive", "--json"],
    "openspec validate",
    "Ejecuta npm run openspec:validate y corrige los changes/specs reportados.",
  ),
  "openspec validate",
);

const listedCount = Array.isArray(listed) ? listed.length : (listed.changes?.length ?? listed.items?.length ?? 0);
const validatedCount = validation.summary?.totals?.items ?? validation.items?.length ?? 0;
console.log(
  `openspec-check: OK (CLI ${reportedVersion}, Node ${process.versions.node}, ${listedCount} change(s), ${validatedCount} item(s) validado(s))`,
);
