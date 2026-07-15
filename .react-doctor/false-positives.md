# React Doctor — Falsos positivos verificados

Diagnosticos que se confirmaron como falsos positivos tras verificar el codigo
(grep + CodeGraph). No re-marcar.

## deslop/unused-export

- `extractTextFromPdf` en `src/services/pdfTextExtractor.ts`: SI se usa. Lo importa
  la variante especifica de plataforma `src/services/pdfTextExtractor.native.ts` y
  `src/services/planeacionImportService.ts`. deslop no sigue la resolucion de
  plataforma de React Native (`.native.ts`/`.web.ts`), por eso lo cree huerfano.

- `TipoEvaluacion` en `types/planeacionLegacy.ts`: SI se usa. Lo re-exporta/consume
  `types/index.ts` (barrel de tipos). deslop no resuelve la propagacion de
  re-export de tipos, por eso lo cree huerfano.
