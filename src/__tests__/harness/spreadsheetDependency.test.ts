import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import * as XLSX from "xlsx";

// Gate de la dependencia xlsx (issue #133, spec secure-spreadsheet-import).
// Fija que el build resuelto sea el tarball oficial vendorizado, no el CDN ni npm 0.18.5.

const compareSemver = (a: string, b: string): number => {
  const pa = a.split(".").map((n) => Number.parseInt(n, 10));
  const pb = b.split(".").map((n) => Number.parseInt(n, 10));
  for (let i = 0; i < 3; i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

describe("dependencia xlsx (build parcheado)", () => {
  it("el runtime carga una version >= 0.20.2", () => {
    expect(typeof XLSX.version).toBe("string");
    expect(compareSemver(XLSX.version, "0.20.2")).toBeGreaterThanOrEqual(0);
  });

  it("el lockfile fija xlsx 0.20.3 desde el tarball vendorizado con integrity", () => {
    const lock = JSON.parse(
      readFileSync(path.join(process.cwd(), "package-lock.json"), "utf8")
    ) as { packages: Record<string, { version: string; resolved?: string; integrity?: string }> };

    const entry = lock.packages["node_modules/xlsx"];
    expect(entry).toBeDefined();
    expect(entry.version).toBe("0.20.3");
    expect(entry.resolved).toBe("file:vendor/sheetjs/xlsx-0.20.3.tgz");
    expect(entry.integrity).toMatch(/^sha\d+-/);
  });

  it("verifica origen, checksum, version, dependencia local y atribucion", () => {
    expect(() =>
      execFileSync(process.execPath, [path.join(process.cwd(), "scripts/verifySheetJsVendor.mjs")], {
        cwd: process.cwd(),
        stdio: "pipe",
      })
    ).not.toThrow();
  });

  it("detecta alteracion sobre una copia temporal sin tocar el tarball real", () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), "planearia-sheetjs-vendor-"));
    try {
      const fixtureVendor = path.join(fixtureRoot, "vendor", "sheetjs");
      mkdirSync(fixtureVendor, { recursive: true });
      cpSync(path.join(process.cwd(), "package.json"), path.join(fixtureRoot, "package.json"));
      cpSync(
        path.join(process.cwd(), "THIRD_PARTY_NOTICES.md"),
        path.join(fixtureRoot, "THIRD_PARTY_NOTICES.md")
      );
      cpSync(
        path.join(process.cwd(), "vendor", "sheetjs", "origin.json"),
        path.join(fixtureVendor, "origin.json")
      );
      const copiedTarball = path.join(fixtureVendor, "xlsx-0.20.3.tgz");
      cpSync(
        path.join(process.cwd(), "vendor", "sheetjs", "xlsx-0.20.3.tgz"),
        copiedTarball
      );
      appendFileSync(copiedTarball, Buffer.from([0x00]));

      expect(() =>
        execFileSync(
          process.execPath,
          [path.join(process.cwd(), "scripts/verifySheetJsVendor.mjs"), "--root", fixtureRoot],
          { cwd: process.cwd(), stdio: "pipe" }
        )
      ).toThrow();
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("reproduce el bloqueo solo en un hijo con timeout y terminacion", () => {
    const output = execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/reproduceSheetJsHang.mjs")],
      { cwd: process.cwd(), encoding: "utf8", timeout: 5000 }
    );
    expect(output).toContain("proceso hijo");
    expect(output).toContain("terminacion controlada");
  });
});
