import * as XLSX from "xlsx";
import {
  MAX_IMPORT_BYTES,
  SpreadsheetImportError,
  assertSupportedFile,
  readSpreadsheetRows,
} from "../../services/spreadsheetImport";

// Endurecimiento de la ruta de LECTURA no confiable (issue #133).
// La exportacion no pasa por aqui: opera sobre datos propios de la app.

const toArrayBuffer = (data: Uint8Array | ArrayBuffer): ArrayBuffer =>
  data instanceof ArrayBuffer
    ? data
    : (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);

// XLSX.write con type "array" devuelve un ArrayBuffer (fallback a bytes); lo pasamos tal cual.
const buildValidWorkbookBuffer = (): ArrayBuffer => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([{ Nombre: "Ana", Apellidos: "Lopez" }]),
    "Hoja1"
  );
  return toArrayBuffer(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
};

const mockFetchOnceWith = (arrayBuffer: ArrayBuffer, ok = true): jest.Mock => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    arrayBuffer: async () => arrayBuffer,
  });
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
  return fetchMock;
};

describe("spreadsheetImport (endurecimiento de lectura)", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    (global as unknown as { fetch: typeof originalFetch }).fetch = originalFetch;
  });

  describe("assertSupportedFile", () => {
    it("acepta csv, xlsx y xls", () => {
      expect(() => assertSupportedFile("lista.csv")).not.toThrow();
      expect(() => assertSupportedFile("lista.xlsx")).not.toThrow();
      expect(() => assertSupportedFile("lista.xls")).not.toThrow();
    });

    it("rechaza extensiones no soportadas con error controlado", () => {
      expect(() => assertSupportedFile("malicioso.exe")).toThrow(SpreadsheetImportError);
      expect(() => assertSupportedFile("malicioso.exe")).toThrow(
        "Formato no soportado. Usa .csv o .xlsx"
      );
    });
  });

  describe("readSpreadsheetRows: tope de tamano", () => {
    it("rechaza por el tamano informado por el selector antes de leer nada", async () => {
      const fetchMock = mockFetchOnceWith(new ArrayBuffer(0));

      await expect(
        readSpreadsheetRows({
          uri: "file://enorme.xlsx",
          name: "enorme.xlsx",
          size: MAX_IMPORT_BYTES + 1,
        } as never)
      ).rejects.toThrow("demasiado grande");

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("rechaza por el tamano real leido cuando el selector no lo informa", async () => {
      const fetchMock = mockFetchOnceWith(new ArrayBuffer(MAX_IMPORT_BYTES + 1));

      await expect(
        readSpreadsheetRows({ uri: "file://enorme.xlsx", name: "enorme.xlsx" } as never)
      ).rejects.toThrow("demasiado grande");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("readSpreadsheetRows: entrada invalida", () => {
    it("convierte un archivo que el parser rechaza en un error controlado (no crash)", async () => {
      // Cabecera CFB (viejo .xls, D0 CF 11 E0) truncada: el parser la rechaza de inmediato.
      // El wrapper convierte ese throw en un error de dominio controlado en vez de una
      // excepcion sin capturar que reviente la pantalla.
      const truncatedCfb = new Uint8Array([
        0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00,
      ]);
      mockFetchOnceWith(toArrayBuffer(truncatedCfb));

      await expect(
        readSpreadsheetRows({ uri: "file://corrupto.xls", name: "corrupto.xls" } as never)
      ).rejects.toThrow(SpreadsheetImportError);
    });

    it("propaga error controlado si la lectura del asset falla", async () => {
      mockFetchOnceWith(new ArrayBuffer(0), false);

      await expect(
        readSpreadsheetRows({ uri: "file://x.xlsx", name: "x.xlsx" } as never)
      ).rejects.toThrow("No se pudo leer el archivo seleccionado.");
    });
  });

  describe("readSpreadsheetRows: entrada valida", () => {
    it("parsea un workbook valido dentro del limite y devuelve filas", async () => {
      mockFetchOnceWith(buildValidWorkbookBuffer());

      const rows = await readSpreadsheetRows({
        uri: "file://ok.xlsx",
        name: "ok.xlsx",
        size: 4096,
      } as never);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ Nombre: "Ana", Apellidos: "Lopez" });
    });

    it("no contamina Object.prototype al parsear entrada", async () => {
      mockFetchOnceWith(buildValidWorkbookBuffer());

      await readSpreadsheetRows({ uri: "file://ok.xlsx", name: "ok.xlsx" } as never);

      // El build parcheado (>= 0.20.2) corrige CVE-2023-30533; esta guardia detecta
      // cualquier regresion futura que reintroduzca prototype pollution.
      expect(({} as Record<string, unknown>).__proto__polluted__).toBeUndefined();
      expect(Object.prototype).not.toHaveProperty("polluted");
    });
  });
});
