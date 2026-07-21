/**
 * Gate permanente de integridad de codificacion (spec: source-encoding-integrity).
 *
 * Ejercita el CLI real scripts/checkSourceEncoding.mjs via execFileSync:
 * asi se prueba el contrato completo (codigo de salida y reporte archivo:linea)
 * sin depender de transforms de Jest para .mjs.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

const SCRIPT = path.resolve(__dirname, "../../../scripts/checkSourceEncoding.mjs");
const FIXTURES = path.resolve(__dirname, "fixtures/encoding");

interface CliResult {
  status: number;
  output: string;
}

function runCheck(root: string): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [SCRIPT, root], { encoding: "utf8" });
    return { status: 0, output: stdout };
  } catch (error) {
    const execError = error as { status?: number; stdout?: string; stderr?: string };
    return {
      status: execError.status ?? 1,
      output: `${execError.stdout ?? ""}${execError.stderr ?? ""}`,
    };
  }
}

describe("checkSourceEncoding", () => {
  it("detecta el fixture positivo con sus seis lineas de mojibake", () => {
    const result = runCheck(path.join(FIXTURES, "mojibake.sample.tsx"));
    expect(result.status).toBe(1);
    expect(result.output).toContain("mojibake.sample.tsx:6");
    expect(result.output).toContain("mojibake.sample.tsx:7");
    expect(result.output).toContain("mojibake.sample.tsx:8");
    expect(result.output).toContain("mojibake.sample.tsx:9");
    expect(result.output).toContain("mojibake.sample.tsx:10");
    expect(result.output).toContain("mojibake.sample.tsx:11");
  });

  it("acepta el fixture negativo con el repertorio legitimo del espanol", () => {
    const result = runCheck(path.join(FIXTURES, "utf8-legitimo.sample.tsx"));
    expect(result.status).toBe(0);
    expect(result.output).toContain("Sin doble codificacion");
  });

  it("gate del repo: src queda libre de doble codificacion", () => {
    const result = runCheck("src");
    expect(result.status).toBe(0);
  });
});
