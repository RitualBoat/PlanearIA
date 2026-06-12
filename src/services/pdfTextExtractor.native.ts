/**
 * Native stub for PDF text extraction.
 *
 * pdfjs-dist cannot run under Hermes (it uses import.meta and dynamic
 * import()), so PDF import is web-only. Bundling pdfjs here would break the
 * Android/iOS release build. On device, ask the user for a DOCX instead.
 */
export async function extractTextFromPdf(_arrayBuffer: ArrayBuffer): Promise<string> {
  throw new Error(
    "La importacion de PDF solo esta disponible en la version web. En la app usa un archivo DOCX."
  );
}
