## Dependency Risk Decision: pdfjs-dist

Date: 2026-07-07

Decision: keep `pdfjs-dist` temporarily, pin the installed version, and accept the current React Doctor low supply-chain score as a tracked risk.

Dependency:

- Package: `pdfjs-dist`
- Version: `5.6.205`
- Pin status: exact version in `package.json` and `package-lock.json`

Why it is still required:

- `src/services/pdfTextExtractor.ts` dynamically imports `pdfjs-dist/legacy/build/pdf.mjs`.
- That extractor is called by `src/services/planeacionImportService.ts` for PDF files.
- The user-facing flow is `src/screens/planeaciones/ImportarPlaneacionScreen.tsx`, where teachers can import an existing PDF planeacion and convert it into an editable draft.
- Native does not bundle `pdfjs-dist`: `src/services/pdfTextExtractor.native.ts` intentionally throws and asks for DOCX because Hermes cannot compile the pdfjs worker/import.meta path.

Risk rationale:

- React Doctor reports a low supply-chain score, not a confirmed vulnerability in this version.
- Removing it now would break web PDF import.
- Moving PDF extraction to backend is the better long-term boundary, but it is outside this React Doctor baseline cleanup and would need a separate SDD because it changes file upload, privacy, auth, and offline expectations.

Mitigations:

- Pin `pdfjs-dist` to `5.6.205` instead of using a range.
- Keep the import dynamic and web-only.
- Keep native protected by `pdfTextExtractor.native.ts`.
- Re-review before public beta or when a PDF-import/backend-file-processing SDD starts.

Owner: PlanearIA maintainer.

Review date: 2026-09-30.
