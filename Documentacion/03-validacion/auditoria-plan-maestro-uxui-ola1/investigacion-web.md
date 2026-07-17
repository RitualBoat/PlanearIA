# Investigacion web (fuentes primarias)

Regla: solo fuentes primarias o repositorios relevantes; cada una con enlace y aplicabilidad explicita a PlanearIA. Consultadas el 2026-07-16. Sin copiar codigo.

## F1. React Navigation 7.0 (blog oficial)

- **Enlace:** https://reactnavigation.org/blog/2024/11/06/react-navigation-7.0/
- **Que dice:** RN7 trae animaciones en Bottom Tabs configurables y extrae el drawer a `react-native-drawer-layout` standalone; el Bottom Tab Navigator soporta `labelPosition`/comportamiento adaptativo en tablets.
- **Aplicabilidad:** PlanearIA ya usa React Navigation 7. Para `app-shell-navegacion` (D7: tabs movil / rail tablet / sidebar web) el drawer standalone permite construir el rail/sidebar propio por breakpoint sin adoptar otro paquete de navegacion. Las animaciones de tabs deben pasar por los tokens de movimiento y reduce-motion (1.9.4), no por defaults.

## F2. Material Design 3: navigation rail, breakpoints y window size classes

- **Enlaces:** https://m3.material.io/components/navigation-rail/guidelines , https://m3.material.io/foundations/layout/applying-layout/window-size-classes , https://developer.android.com/develop/adaptive-apps/guides/build-adaptive-navigation
- **Que dice:** compact (<600dp) usa navigation bar; medium (600-839dp) navigation rail; expanded+ rail o drawer; nunca bar y rail simultaneos; el rail se transforma en bar al encoger.
- **Aplicabilidad:** valida la decision D7 del plan (5 tabs movil, rail tablet, sidebar web) y sus breakpoints (movil <768, tablet 768-1279, web >=1280 son compatibles con las clases M3 aunque no identicos; la diferencia 600 vs 768 queda registrada como decision consciente del plan, no error). Regla "nunca bar+rail a la vez" debe entrar como criterio observable del change `app-shell-navegacion`.

## F3. WCAG 2.2 SC 2.5.8 Target Size (Minimum)

- **Enlace:** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **Que dice:** minimo normativo 24x24 CSS px (AA), con excepciones por espaciado; 2.5.5 (Enhanced, AAA) recomienda 44x44.
- **Aplicabilidad:** el estandar del repo (config OpenSpec y `componentes-base`: toque >=44pt) es MAS estricto que el minimo AA y coincide con AAA/plataformas moviles (44pt iOS / 48dp Android). Mantener 44pt como criterio de `componentes-base` es correcto y defendible; no hay hallazgo, solo confirmacion.

## F4. Reanimated: useReducedMotion y ReducedMotionConfig

- **Enlaces:** https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/ , https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/
- **Que dice:** `useReducedMotion` lee el ajuste del sistema de forma sincrona (valor al iniciar la app); `ReducedMotionConfig` puede desactivar todas las animaciones reanimated cuando el sistema pide reducir movimiento.
- **Aplicabilidad:** el plan 1.9.4 prescribe `AccessibilityInfo.isReduceMotionEnabled` (asincrono). Para el catalogo de micro-interacciones de `tokens-completos`/`componentes-base` conviene estandarizar sobre las primitivas reanimated (hook + config global) con la salvedad documentada de que el hook no re-renderiza si el ajuste cambia en caliente. Registrado como refinamiento tecnico en la matriz (H9).

## F5. NN/g: pruebas cualitativas con 5 usuarios

- **Enlaces:** https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/ , https://www.nngroup.com/articles/5-test-users-qual-quant/
- **Que dice:** 5 participantes detectan ~85% de los problemas en pruebas cualitativas formativas; el numero sube si hay grupos de usuarios muy distintos.
- **Aplicabilidad:** respalda el 3-5 de #47 e IHC seccion 5. Matiz relevante: las proto-personas (Maria/Luis/Carmen) son perfiles bastante distintos (multigrupo gama media, early adopter, proxima a jubilarse); si el reclutamiento solo logra 3, conviene cubrir los tres perfiles antes que repetir uno. Registrado como nota para el hito IHC, sin cerrar el gate.

## F6. SheetJS xlsx: CVE-2023-30533 y CVE-2024-22363

- **Enlaces:** https://github.com/advisories/GHSA-4r6h-8v6p-xvw6 , https://osv.dev/GHSA-4r6h-8v6p-xvw6
- **Que dice:** prototype pollution al LEER archivos manipulados en xlsx <=0.19.2 (fix 0.19.3 solo distribuido via cdn.sheetjs.com; el paquete npm `xlsx` quedo sin mantenimiento) y ReDoS (fix 0.20.2). Flujos de solo-exportacion no estan afectados.
- **Aplicabilidad:** el repo fija `xlsx@^0.18.5` y SI lee archivos arbitrarios del docente (import de alumnos hoy; `calcuplan-hoja` en Ola 3 lo ampliara). Es deuda de seguridad viva que el plan UX/UI amplificara; requiere decision estilo `dependency-risk-decision` (esa spec cubrio pdfjs-dist, no xlsx). Hallazgo H6 -> issue propio.

## F7. React Native: useWindowDimensions

- **Enlace:** https://reactnative.dev/docs/usewindowdimensions
- **Que dice:** es la API preferida para dimensiones porque se actualiza automaticamente ante resize/rotacion y expone fontScale, a diferencia de `Dimensions.get()`.
- **Aplicabilidad:** confirma la solucion de R2 (`useBreakpoint()` sobre `useWindowDimensions()`) y agrega un dato no explicito en el plan: `fontScale` viene en el mismo hook, util para coordinar breakpoints con `FontSizeContext` en la misma fabrica de estilos.

## Fuentes descartadas

- Tutoriales de terceros sobre navegacion RN (oneuptime.com y similares): no primarias; descartadas en favor de reactnavigation.org.
- Guias M2 (m2.material.io): sustituidas por M3, que es la referencia declarada del sistema visual del repo.
