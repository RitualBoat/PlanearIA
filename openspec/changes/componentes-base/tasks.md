## 1. Fundacion de la biblioteca

- [x] 1.1 Crear `src/components/base/` y el modulo compartido de primitivas internas (tipos de variante, helper de estado de foco, constante de area tactil minima de 44pt)
- [x] 1.2 Garantizar de forma automatica que `src/components/base/**` no use `COLORS`. La regla vigente de `.eslintrc.cjs` ya cubre `src/**/*.tsx` y la carpeta nueva **no** se agrega a `LEGACY_COLORS_ROLLOUT`, asi que no hizo falta editar la configuracion; se refuerza con una prueba de fuente que ademas prohibe literales hexadecimales
- [x] 1.3 Crear el barrel `src/components/base/index.ts` (se completa conforme avanzan las tandas)
- [x] 1.4 Crear `src/__tests__/components/base/` con el helper de render que monta los proveedores de tema, fuente, daltonismo y preferencias de accesibilidad

## 2. Tanda A: primitivas de superficie

- [x] 2.1 Implementar `Screen` (area segura, padding por breakpoint, scroll con el patron `WebScrollView`)
- [x] 2.2 Implementar `Card` (elevacion por token, variante presionable con `scale 0.97` y variante estatica bajo reduce-motion)
- [x] 2.3 Implementar `Banner` (variantes informativa, exito, advertencia y error; icono con intencion; texto no dependiente solo del color)
- [x] 2.4 Pruebas de la tanda A: consumo de tokens en runtime, cero `COLORS`, rol y etiqueta, reflujo por breakpoint en `Screen`
- [x] 2.5 Validar la tanda A: `npm run typecheck` y `npm run lint -- --quiet` en verde

## 3. Tanda B: controles

- [x] 3.1 Implementar `Button` (variantes primaria, secundaria, fantasma y destructiva; estados normal, pressed, disabled y loading; `accessibilityRole`, `accessibilityLabel`, `accessibilityState` con `disabled` y `busy`)
- [x] 3.2 Garantizar en `Button` el area tactil de 44pt y el anillo de foco visible en web por estado explicito
- [x] 3.3 Implementar `Input` (etiqueta, texto de ayuda, estado de error asociado al control, estado disabled, area tactil de 44pt, anillo de foco)
- [x] 3.4 Implementar `Chip` (seleccionable y descartable; `accessibilityState.selected`; area tactil de 44pt via extension sin alterar el tamano visual; desvanecido al descartar)
- [x] 3.5 Pruebas de la tanda B: un control disabled no ejecuta su accion; un control loading no la repite y se anuncia ocupado; el error del campo se asocia al control; el area tactil alcanza 44pt en los tres controles; el foco entra y sale
- [x] 3.6 Validar la tanda B: `npm run typecheck`, `npm run lint -- --quiet` y las pruebas de la tanda en verde

## 4. Tanda C: capas y estados

- [x] 4.1 Implementar `Sheet` (modal transparente, fondo con el token `overlay` solido sin blur, panel con elevacion, entrada y salida por spring, cierre accesible con etiqueta)
- [x] 4.2 Implementar `Toast` presentacional (variantes por tipo, sin cola ni provider, descartable, entrada y salida por spring)
- [x] 4.3 Implementar `Skeleton` (shimmer sutil animado; bloque solido sin destello cuando reduce-motion esta activo)
- [x] 4.4 Implementar `EmptyState` con variantes `empty`, `error` y `offline`, cada una con icono propio, mensaje propio y al menos una accion de salida
- [x] 4.5 Pruebas de la tanda C: cada variante de `EmptyState` presenta su propio icono, mensaje y accion; `Skeleton` sirve la variante estatica bajo reduce-motion; `Sheet` y `Toast` alcanzan su estado final sin transicion bajo reduce-motion
- [x] 4.6 Validar la tanda C: `npm run typecheck`, `npm run lint -- --quiet` y las pruebas de la tanda en verde

## 5. Catalogo y evidencia visual

- [x] 5.1 Implementar `CatalogoComponentesScreen` con cada componente y todos sus estados, incluidos loading, empty, error y offline
- [x] 5.2 Registrar la ruta del catalogo en `MasStack` bajo la guarda `__DEV__`, sin agregar rutas a la raiz de navegacion
- [x] 5.3 Prueba de guarda: la ruta del catalogo no se registra cuando `__DEV__` es falso, y la raiz de navegacion conserva su conteo de rutas hermanas
- [x] 5.4 Levantar `expo start --web`, confirmar HTTP 200 y navegar al catalogo solo despues de esa confirmacion
- [x] 5.5 QA visual N1 con Playwright MCP a 375, 768 y 1280: capturas por breakpoint, medicion de reflujo y de contraste, revision de consola sin errores
- [x] 5.6 Verificar en el catalogo el foco visible en web con recorrido de teclado, en tema claro y en tema oscuro
- [x] 5.7 Redactar `evidencia/README.md` con las secciones obligatorias del manifiesto de golden journeys: Entorno, Medicion por breakpoint, Journeys cubiertos, Checklist Nielsen, Checklist anti-slop 1.9.3, Consola y Limitaciones

## 6. Cierre del change

- [x] 6.1 Completar el barrel `src/components/base/index.ts` con los diez componentes y sus tipos publicos
- [x] 6.2 Verificar que el change es aditivo: diff vacio en pantallas existentes, en los componentes legacy que se solapan, en los cuatro contextos protegidos y en `package.json`
- [x] 6.3 Ejecutar la validacion completa: `npm run typecheck`, `npm run lint -- --quiet`, `npm test -- --runInBand` y `npm run qa:visual:check`
- [ ] 6.4 Actualizar `TLDR.md` si el alcance, los archivos, el comportamiento o el resultado esperado cambiaron durante la implementacion
- [ ] 6.5 Completar `readiness.json` con los enlaces de evidencia reales (issue, PR, revision adversarial, HTTP 200, breakpoints, Nielsen)
- [ ] 6.6 Ejecutar la revision adversarial independiente y registrar su veredicto
- [ ] 6.7 Ejecutar `npm run openspec:ready:archive -- --change componentes-base --run-local` y resolver cada FAIL antes de archivar
