#!/usr/bin/env node

/**
 * Check determinista de doble codificacion UTF-8 (spec: source-encoding-integrity).
 *
 * Firma estructural del mojibake: un lead byte UTF-8 reinterpretado como
 * Latin-1 (À-Å) seguido de un byte de continuacion huerfano (U+0080-U+00BF),
 * y las secuencias de puntuacion "â€" / "â†" + byte C1. El espanol legitimo
 * (á é í ó ú ü ñ ¿ ¡ ° — → … •) nunca produce esas secuencias, asi que el
 * check no tiene falsos positivos sobre el texto del repo.
 *
 * Los regex usan escapes Unicode (no literales) para que este archivo sea
 * ASCII-only e immune a su propia deteccion.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const DEFAULT_EXCLUDES = ["node_modules", path.join("src", "__tests__", "harness", "fixtures")];

// [À-Å] + continuacion huerfana (U+0080-U+00BF): Ã¡ Ã© Ã­ Ã³ Ãº Ã± Ã¼ Â¡ Â¿ Â° Âª ...
const MOJIBAKE_LATIN = /[\u00C0-\u00C5][\u0080-\u00BF]/;
// â + (€ o †) + (C1 U+0080-U+009F o ¦): â€" â€" â€™ â€¢ â€¦ â€œ â€ â†'
// Continuaciones CP1252 de 2o/3er byte (C1, Latin-1 alto y puntuacion mapeada).
const CP1252_HIGH = "\\u0080-\\u00BF\\u0152\\u0153\\u0160\\u0161\\u0178\\u017D\\u017E\\u0192\\u02C6\\u02DC\\u2013\\u2014\\u2018-\\u201E\\u2020\\u2021\\u2022\\u2026\\u2030\\u2039\\u203A\\u20AC\\u2122";
// Secuencias de 3 bytes mojibakeadas: comillas, guiones, vinetas, flechas, box-drawing.
const MOJIBAKE_3BYTE = new RegExp("\\u00E2[" + CP1252_HIGH + "][" + CP1252_HIGH + "]");
// Secuencias de 4 bytes (emoji mojibakeado).
const MOJIBAKE_4BYTE = new RegExp("\\u00F0[" + CP1252_HIGH + "][" + CP1252_HIGH + "][" + CP1252_HIGH + "]");

export function findEncodingIssuesInText(text, { lineOffset = 0 } = {}) {
  const issues = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (MOJIBAKE_LATIN.test(line) || MOJIBAKE_3BYTE.test(line) || MOJIBAKE_4BYTE.test(line)) {
      issues.push({ line: lineOffset + index + 1, snippet: line.trim().slice(0, 160) });
    }
  }
  return issues;
}

function walk(dir, excludes, files) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(process.cwd(), full);
    if (excludes.some((excluded) => rel === excluded || rel.startsWith(`${excluded}${path.sep}`))) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, excludes, files);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

export function findEncodingIssues(root = "src", { excludes = DEFAULT_EXCLUDES } = {}) {
  const resolved = path.resolve(process.cwd(), root);
  // La raiz puede ser un archivo individual (fixtures, uso puntual) o un directorio.
  const files = statSync(resolved).isDirectory() ? walk(resolved, excludes, []) : [resolved];
  const findings = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const issue of findEncodingIssuesInText(text)) {
      findings.push({ file: path.relative(process.cwd(), file), ...issue });
    }
  }
  return findings;
}

// Deteccion de entrypoint independiente de plataforma: en POSIX process.argv[1]
// empieza con "/" y el antiguo `file:///${...}` producia cuatro barras, por lo
// que el bloque CLI nunca corria en Linux/CI y el gate pasaba vacio. pathToFileURL
// normaliza en Windows y POSIX por igual.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? "src";
  const findings = findEncodingIssues(root);
  if (findings.length) {
    console.error(`Doble codificacion UTF-8 detectada en ${findings.length} linea(s):`);
    for (const finding of findings) {
      console.error(`  ${finding.file}:${finding.line}  ${finding.snippet}`);
    }
    process.exit(1);
  }
  console.log(`Sin doble codificacion UTF-8 en ${root}.`);
}
