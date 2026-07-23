import { readFileSync } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

// Gate de la dependencia xlsx (issue #133, spec secure-spreadsheet-import).
// Fija que el build resuelto sea el parcheado del CDN oficial, no el 0.18.5 de npm.

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

  it("el lockfile fija xlsx desde el CDN oficial con integrity", () => {
    const lock = JSON.parse(
      readFileSync(path.join(process.cwd(), "package-lock.json"), "utf8")
    ) as { packages: Record<string, { version: string; resolved?: string; integrity?: string }> };

    const entry = lock.packages["node_modules/xlsx"];
    expect(entry).toBeDefined();
    expect(compareSemver(entry.version, "0.20.2")).toBeGreaterThanOrEqual(0);
    expect(entry.resolved).toContain("cdn.sheetjs.com");
    expect(entry.integrity).toMatch(/^sha\d+-/);
  });
});
