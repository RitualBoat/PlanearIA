/**
 * PDF text extraction (web / default).
 *
 * pdfjs-dist uses `import.meta` and a dynamic `import()` for its worker, which
 * the Hermes engine cannot compile. The native variant
 * (pdfTextExtractor.native.ts) is a stub, so pdfjs-dist never enters the
 * Android/iOS Hermes bundle and the standalone APK can build.
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getDocument: (options: Record<string, unknown>) => { promise: Promise<any> };
  };

  const data = new Uint8Array(arrayBuffer);
  const documentTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await documentTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = (content.items || [])
      .map((item: { str?: string }) => item?.str || "")
      .join(" ")
      .trim();

    if (text) pages.push(text);
  }

  return pages.join("\n");
}
