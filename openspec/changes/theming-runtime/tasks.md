# Tasks: theming-runtime

Regla: una tarea a la vez. `[x]` solo con evidencia (salida de typecheck, lint y tests afectados).

## 1. Infraestructura de consumo

- [x] 1.1 Crear `src/themes/useAppTheme.ts`: hook que compone `useTheme`, `useFontSize`, `useDaltonismo` y `useAccessibilityPreferences`, y devuelve `{ colors, isDark, theme, scaled, highContrast }` con `colors` ya filtrado por daltonismo y memoizado. No modificar los contextos.
- [x] 1.2 Definir y exportar el tipo del parametro de la fabrica (`ThemedStylesInput`) con forma de objeto, documentando por que es objeto y no posicional (`breakpoints-reactivos` agregara `width`). En `src/themes/types.ts`.
- [x] 1.3 Tests de `useAppTheme` (9 casos): daltonismo aplicado sobre el tema activo; combinacion tema oscuro + daltonismo; escalado por `fontSizeMode`; identidad estable de `colors`; independencia de orden de proveedores; los tres contextos conservan su contrato publico; equivalencia `colors === COLORS` en claro. Evidencia: 9/9 PASS.

## 2. Trinquete de lint y rastreo del rollout

- [x] 2.1 Agregar a `.eslintrc.cjs` la regla `no-restricted-imports` que prohibe importar `COLORS`, con mensaje que nombre `useAppTheme` como reemplazo.
- [x] 2.2 Agregar el `overrides` con la lista explicita de archivos legacy autorizados, generada desde el codigo real. **Hallazgo:** los 64 archivos de produccion importan `COLORS` desde el barrel `types` (`types/index.ts:700`), no desde `themes/colors`. La regla cubre ambas rutas (`**/themes/colors` y `**/types`); restringir solo la primera la habria dejado sin efecto. Los tests quedan excluidos (importan `COLORS` para afirmar la equivalencia legacy).
- [x] 2.3 Verificar el trinquete en ambos sentidos: un import fuera de la lista falla `npm run lint` (probado con sonda temporal, ya eliminada); la lista legacy pasa. Evidencia registrada en la sesion.
- [x] 2.4 Documentar en la cabecera del `overrides` que la lista es el registro del rollout (H12a): su largo es el trabajo restante y solo puede reducirse.

## 3. Lote demostrativo: modulo `cuenta`

- [x] 3.1 Adaptar `CuentaScreen.tsx` (piloto) a `useAppTheme` y a la firma de objeto, memoizando `getStyles` con `useMemo`. Sin cambio visual (evidencia Playwright claro/oscuro).
- [x] 3.2 Migrar `TerminosScreen.tsx` (137 lineas): quitar `import { COLORS }`, consumir `useAppTheme`, fabrica memoizada, tipografia con `scaled()`.
- [x] 3.3 Migrar `SesionesActivasScreen.tsx` (195 lineas), preservando estados de carga, error, vacio y sin conexion. Literal `#FFEBEE` y `COLORS.surface` sobre botones reemplazados por tokens (`errorTint`, `textOnPrimary`) para que reaccionen al tema; identicos en claro.
- [x] 3.4 Migrar `AdminRolesScreen.tsx` (333 lineas), preservando el guard de permisos por rol. `rolColor()` recibe `colors`; el test guard mockea `useAppTheme`. Literal `rgba(0,0,0,0.4)` del modal reemplazado por `colors.overlay`. Los colores de identidad de rol siguen siendo literales (tokenizarlos es `tokens-completos`).
- [x] 3.5 Los 3 archivos del lote salen de la lista legacy; `CuentaScreen` ya no importaba `COLORS`. **Conteo corregido:** produccion baja de 64 a 61 importadores (el plan decia 65->62 contando un archivo de test). La lista legacy tiene 61 entradas exactas.

## 4. Validacion

- [x] 4.1 `npm run typecheck` en verde.
- [x] 4.2 `npm run lint -- --quiet` en verde con la regla nueva activa.
- [x] 4.3 `npm test -- --runInBand` en verde: 94 suites, 617 tests. Linea base 93/608 + 1 suite nueva (9 tests) = sin regresion.
- [x] 4.4 `npm exec -- openspec validate --all --strict --no-interactive` en verde (24/24).

## 5. QA visual (gate obligatorio de UI)

- [x] 5.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar.
- [x] 5.2 Playwright sobre pantallas del lote en breakpoints movil (375) y desktop (1280), tema claro y oscuro. Evidencia en `evidencia/`. Nota: `SesionesActivas` y `AdminRoles` requieren sesion con backend real (respondio 401 en esta corrida); se cubrio `TerminosScreen` (migrada) y `CuentaScreen` (piloto), y el daltonismo por test unitario con valores exactos.
- [x] 5.3 Capturas con fuente `xlarge` y daltonismo `deuteranopia` sembrados, comprobando propagacion real de tema y fuente. Daltonismo sobre estados: cubierto por `useAppTheme.test.tsx`.
- [x] 5.4 Los unicos errores de consola fueron 401 de backend; ninguno del render/theming. El fallback legacy es garantia estructural: las 61 pantallas no migradas siguen importando `lightTheme`.
- [x] 5.5 Evidencia visual y su README en `evidencia/`; se adjunta al issue #78 en el cierre.

## 6. Cierre

- [x] 6.1 TLDR y demas artefactos actualizados con el conteo real (64 produccion -> 61) y la ruta de import real (barrel `types`). Alcance y comportamiento sin cambio.
- [x] 6.2 Revision adversarial independiente (verificacion previa a archive): PASS CON HUECOS, 3 minors rastreados y mitigados, sin blockers ni majors. Referencia en `readiness.json`.

## Procedimiento de cierre (no son tareas de implementacion)

Estos pasos ejecutan el propio cierre y no se marcan como checkbox para no crear
autorreferencia con el gate `tasks-complete` (mismo criterio que changes previos archivados):

- `npm run openspec:ready:archive -- --change theming-runtime --run-local` debe reportar PASS.
- Archive del change, sync de specs y `npm run opsx:finish` (PR hacia `development`, espera de checks, merge).
