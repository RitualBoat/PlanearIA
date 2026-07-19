# Tasks: sheet-medicion-panel-qa

## 1. Adoptar el ancla de medicion del panel

- [x] 1.1 Confirmar por diff que `src/components/base/Sheet.tsx` conserva el `testID` derivado del panel y su comentario explicativo, sin cambios de estilo, layout ni contrato
- [x] 1.2 Verificar que `SheetProps` no cambia y que el ancla es `undefined` cuando el consumidor no entrega `testID`
- [x] 1.3 Verificar que el panel, el fondo oscurecido y la raiz exponen anclas distintas entre si
- [x] 1.4 Confirmar por diff que `src/components/assign/AssignSheet.tsx` no requiere cambios: ya reenvia `testID` a sus dos hojas y hereda el ancla

## 2. Adoptar la superficie de medicion

- [x] 2.1 Confirmar por diff que `src/screens/mas/CatalogoComponentesScreen.tsx` conserva `testID="sheet-catalogo"` y su comentario
- [x] 2.2 Verificar que `CatalogoComponentes` sigue siendo ruta solo de desarrollo y que la prueba `catalogoSoloDesarrollo.test.tsx` sigue en verde

## 3. Regresion de forma por breakpoint

- [x] 3.1 Confirmar que `src/__tests__/components/base/sheetResponsiva.test.tsx` cubre 375, 767, 768, 1279 y 1280
- [x] 3.2 Verificar que la clasificacion del ancho entra por `getBreakpoint` real via `jest.requireActual`, y que el mock se limita a la lectura de dimensiones
- [x] 3.3 Verificar que cada caso afirma dimension del panel, radios inferiores y alineacion de la raiz
- [x] 3.4 Demostrar que la suite **no es vacua**: mutar `Sheet` para ignorar el breakpoint debe hacerla fallar, y quitar el `testID` del panel tambien
- [x] 3.5 Ejecutar la suite focalizada de `Sheet` en verde

## 4. Runbook de QA visual

- [x] 4.1 Agregar a `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` seccion 5 la trampa de `[aria-modal="true"]`, con sintoma, causa y remedio prescrito
- [x] 4.2 Declarar en esa entrada la regla general: anclar por identificador propio del elemento, nunca por atributo que la plataforma pueda haber puesto en el envoltorio
- [x] 4.3 Verificar que no se edita ningun archivo bajo `openspec/changes/archive/`

## 5. QA visual y evidencia

- [x] 5.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar
- [x] 5.2 Navegar al catalogo con Playwright MCP usando clics reales y abrir la hoja de ejemplo
- [x] 5.3 Medir el panel por su `data-testid` en 375, 767, 768, 1279 y 1280 con `getBoundingClientRect`
- [x] 5.4 Registrar en la misma tabla la medicion del wrapper `[aria-modal="true"]` al mismo ancho, para dejar el contraste demostrado y no solo afirmado
- [x] 5.5 Capturar los cinco anchos y demostrar que la apariencia no cambia, por diff (`getStyles` intacto), por coincidencia numerica con lo que `getStyles` produce y por captura. **No** se compara contra un servidor de development: si `getStyles` no cambia y `testID` no participa del estilo, la apariencia no puede cambiar, y el diff lo prueba mejor que dos capturas
- [x] 5.6 Redactar `evidencia/README.md` con las siete secciones obligatorias, citando `openspec/changes/archive/2026-07-19-assign-sheet/evidencia/README.md:19` y su correccion
- [x] 5.7 Clasificar el ruido de consola y declarar cuanto es atribuible al change
- [x] 5.8 Ejecutar `npm run qa:visual:check -- --change sheet-medicion-panel-qa` en PASS

## 6. Validacion y cierre

- [x] 6.1 `npm run typecheck` en verde
- [x] 6.2 `npm run lint -- --quiet` en verde
- [x] 6.3 `npm test -- --runInBand` en verde, sin regresion de la linea base
- [x] 6.4 `npm run openspec:ready:archive -- --change sheet-medicion-panel-qa --run-local` en PASS
- [x] 6.5 Revision adversarial independiente registrada en `readiness.json` y en la evidencia
