/**
 * Pruebas de la guardia de senal de consola (spec: test-console-signal-guard).
 *
 * La guardia global esta cableada por jest.setup.consoleGuard.ts. Estas
 * pruebas ejercitan su logica llamando directamente a verifyConsoleSignal,
 * que siempre deja el estado limpio: asi se observa el fallo sin romper la
 * corrida y el afterEach global encuentra un estado ya verificado.
 */
import {
  expectConsoleError,
  expectConsoleWarn,
  verifyConsoleSignal,
} from "../helpers/consoleSignal";

describe("consoleSignalGuard", () => {
  it("hace fallar un console.error inesperado e incluye el contenido capturado", () => {
    console.error("fallo inesperado de prueba");
    expect(() => verifyConsoleSignal()).toThrow(/fallo inesperado de prueba/);
  });

  it("hace fallar un console.warn inesperado", () => {
    console.warn("aviso inesperado de prueba");
    expect(() => verifyConsoleSignal()).toThrow(/aviso inesperado de prueba/);
  });

  it("un error esperado declarado no falla y no sale a la consola", () => {
    expectConsoleError(/MAX_RETRIES/);
    console.error("[syncEngine] create test_entity supero MAX_RETRIES (5)");
    expect(() => verifyConsoleSignal()).not.toThrow();
  });

  it("una declaracion no consumida falla pidiendo retirarla", () => {
    expectConsoleError(/nunca-ocurre/);
    expect(() => verifyConsoleSignal()).toThrow(/no consumidas/);
  });

  it("declarar una salida no silencia una llamada inesperada distinta", () => {
    expectConsoleError(/mensaje esperado/);
    console.error("mensaje esperado");
    console.error("otro error no declarado");
    expect(() => verifyConsoleSignal()).toThrow(/otro error no declarado/);
  });

  it("una declaracion consumida cubre repeticiones del mismo aviso", () => {
    expectConsoleWarn("aviso repetido de terceros");
    console.warn("aviso repetido de terceros");
    console.warn("aviso repetido de terceros");
    expect(() => verifyConsoleSignal()).not.toThrow();
  });

  it("acepta patrones string (substring) y RegExp", () => {
    expectConsoleError("texto literal", /con\s+regex/);
    console.error("este texto literal aparece");
    console.error("mensaje con   regex flexible");
    expect(() => verifyConsoleSignal()).not.toThrow();
  });

  describe("aislamiento entre tests", () => {
    it("test A: declara y consume una salida esperada", () => {
      expectConsoleError("mensaje aislado");
      console.error("mensaje aislado");
      expect(() => verifyConsoleSignal()).not.toThrow();
    });

    it("test B: la declaracion del test A no protege esta emision identica", () => {
      console.error("mensaje aislado");
      expect(() => verifyConsoleSignal()).toThrow(/mensaje aislado/);
    });
  });
});
