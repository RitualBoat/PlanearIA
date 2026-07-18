# Evidencia QA visual: tokens-completos

Fecha: 2026-07-17. Deliverable visible del change: la **pagina de preview de tokens**
(`tokens-preview.html`), espejo fiel de los valores definidos en `src/themes/`. Este change no
migra ninguna pantalla de la app; por eso la superficie visible es la preview, no un flujo de la app.

## Metodo

El mecanismo de captura de pantalla del harness (`computer screenshot`) agota su tiempo de espera de
forma consistente en este entorno (misma limitacion registrada en #79). Por eso la evidencia por
breakpoint se recogio por **medicion directa del DOM/estilos computados** (`javascript_tool`), que es
numerica y exacta: mide el reflow real (columnas del grid) y los valores de token renderizados.

A diferencia de React Native Web (que depende del evento JS `resize` para `useWindowDimensions`), esta
preview es HTML/CSS con `@media queries`, que el viewport de CDP (`resize_window`) SI activa. El reflujo
por breakpoint se midio directo tras cada `resize_window`. Consola sin errores en los tres tamanos.

## Resultado 1: reflujo responsive por breakpoint

La grilla de `main` reacomoda por rango, segun el plan (movil <768, tablet 768-1279, web >=1280):

| Viewport | Rango | Columnas del grid (`grid-template-columns`) |
| --- | --- | --- |
| 375 | movil | **1** |
| 768 | tablet | **2** |
| 1280 | escritorio | **3** |

## Resultado 2: valores de token verificados en el render

- **Espaciado (4pt):** barras de 4, 8, 12, 16, 24, 32, 48 px (valores no cero multiplos de 4, ascendente).
- **Radios:** 8/12/16 y `pill` (9999) presentes.
- **Tipografia base:** `display` 40px/800, `title` 29px/800, `heading` 22px/700 (medidos por estilos
  computados). La columna de escalado muestra `xlarge` (factor 1.4): display 56, title 41, body 21;
  peso e interletrado se conservan.
- **Elevacion theme-aware:** `level1` claro = `rgba(0,93,168,0.06) 0px 1px 3px` vs `level1` oscuro =
  `rgba(0,0,0,0.2) 0px 1px 3px`. Difieren: la sombra toma su color del tema. Los 3 niveles crecen en
  offset/difuminado (0 1 3 / 0 4 12 / 0 10 24).
- **Movimiento:** duraciones 0/150/250/400 ms; springs standard/gentle/snappy; todos con
  `ReduceMotion.System`. Primitiva de decision: `useReducedMotionPreference()` = SO OR in-app.
- **z-index:** [0, 1, 1000, 1100, 1200, 1300, 1400, 1500, 1600], estrictamente ascendente.

## Cobertura complementaria (tests deterministas, 18 casos en verde)

- `src/__tests__/themes/tokens.test.ts`: espaciado 4pt y ascendente; radios 8/12/16/pill; z-index
  ascendente por rol; tipografia con tamanos positivos; `scaleType` (factor 1 conserva base, factor 1.4
  multiplica fontSize/lineHeight sin tocar peso/interletrado, omite letterSpacing ausente); `getElevation`
  difiere claro/oscuro y los 3 niveles son distintos; motion expone 150/250, springs con
  amortiguacion/rigidez, `reduceMotionPolicy === ReduceMotion.System`, spring y timing honran la politica.
- `src/__tests__/themes/useReducedMotionPreference.test.tsx`: el OR (SO true, in-app true, ambos, ninguno).

## Nielsen (heuristicas relevantes al change)

- Consistencia y estandares: un origen unico de tokens por grupo; nombres por rol, no numeros magicos.
- Reconocimiento antes que recuerdo: escala tipografica con jerarquia (display...overline) y radios/espaciado
  nombrados; el autor elige de un set, no inventa valores.
- Flexibilidad y eficiencia: la tipografia escala con `FontSizeContext` y la elevacion con el tema, sin que
  cada pantalla lo recuerde.
- Accesibilidad: reduce-motion unificado (SO + in-app) con la salvedad del SO documentada; ningun cambio de
  contraste ni de area de toque (no se toca ninguna pantalla).
- Sin regresion: change puramente aditivo; 98 suites / 646 tests en verde.
