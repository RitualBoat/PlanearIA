import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_DEPENDENCY = "file:vendor/sheetjs/xlsx-0.20.3.tgz";

export function verifySheetJsVendor(root = process.cwd()) {
  const vendorDir = path.join(root, "vendor", "sheetjs");
  const tarball = path.join(vendorDir, "xlsx-0.20.3.tgz");
  const originPath = path.join(vendorDir, "origin.json");
  const packagePath = path.join(root, "package.json");
  const noticesPath = path.join(root, "THIRD_PARTY_NOTICES.md");

  for (const required of [tarball, originPath, packagePath, noticesPath]) {
    if (!existsSync(required)) throw new Error(`Falta artefacto requerido: ${required}`);
  }

  const origin = JSON.parse(readFileSync(originPath, "utf8"));
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const notices = readFileSync(noticesPath, "utf8");
  const digest = createHash("sha256").update(readFileSync(tarball)).digest("hex");

  if (origin.version !== "0.20.3") throw new Error("La metadata no declara xlsx 0.20.3");
  if (origin.source !== "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz") {
    throw new Error("El origen no es el canal oficial aprobado");
  }
  if (digest !== origin.sha256) throw new Error("El SHA-256 del tarball no coincide");
  if (packageJson.dependencies?.xlsx !== EXPECTED_DEPENDENCY) {
    throw new Error("package.json debe consumir el tarball vendorizado mediante file:");
  }

  const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).split(/\r?\n/);
  if (!entries.includes("package/LICENSE")) throw new Error("El tarball no incluye package/LICENSE");
  const embeddedPackage = JSON.parse(
    execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" })
  );
  if (embeddedPackage.name !== "xlsx" || embeddedPackage.version !== "0.20.3") {
    throw new Error("El tarball no contiene xlsx 0.20.3");
  }
  if (embeddedPackage.license !== "Apache-2.0") throw new Error("Licencia inesperada");

  for (const fragment of [
    "SheetJS Community Edition -- https://sheetjs.com/",
    "Copyright (C) 2012-present   SheetJS LLC",
    "Apache License, Version 2.0",
  ]) {
    if (!notices.includes(fragment)) throw new Error(`Falta atribucion requerida: ${fragment}`);
  }

  return { digest, version: embeddedPackage.version, source: origin.source };
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "");
if (isMain) {
  const rootIndex = process.argv.indexOf("--root");
  const root = rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : process.cwd();
  const result = verifySheetJsVendor(root);
  console.log(`SheetJS vendor OK: ${result.version} sha256=${result.digest}`);
}
