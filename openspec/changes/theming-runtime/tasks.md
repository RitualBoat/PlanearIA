# Tasks: theming-runtime

Regla: una tarea a la vez. `[x]` solo con evidencia (salida de typecheck, lint y tests afectados).

## 1. Infraestructura de consumo

- [ ] 1.1 Crear `src/themes/useAppTheme.ts`: hook que compone `useTheme`, `useFontSize`, `useDaltonismo` y `useAccessibilityPreferences`, y devuelve `{ colors, isDark, theme, scaled, highContrast }` con `colors` ya filtrado por daltonismo y memoizado. No modificar los contextos.
- [ ] 1.2 Definir y exportar el tipo del parametro de la fabrica (`ThemedStylesInput`) con forma de objeto, documentando por que es objeto y no posicional (`breakpoints-reactivos` agregara `width`).
- [ ] 1.3 Tests de `useAppTheme`: daltonismo aplicado sobre el tema activo; combinacion tema oscuro + daltonismo; escalado por `fontSizeMode`; identidad estable de `colors` mientras las preferencias no cambian; los tres contextos conservan su contrato publico.

## 2. Trinquete de lint y rastreo del rollout

- [ ] 2.1 Agregar a `.eslintrc.cjs` la regla `no-restricted-imports` que prohibe importar `COLORS` desde `src/themes/colors`, con mensaje que nombre `useAppTheme` como reemplazo.
- [ ] 2.2 Agregar el `overrides` con la lista explicita de los 62 archivos legacy autorizados (65 vigentes menos los 3 del lote), generada desde el codigo real, no a mano.
- [ ] 2.3 Verificar el trinquete en ambos sentidos: un import fuera de la lista falla `npm run lint`; un import dentro de la lista pasa. Dejar la evidencia de ambas corridas.
- [ ] 2.4 Documentar en la cabecera del `overrides` que la lista es el registro del rollout (H12a): su largo es el trabajo restante y solo puede reducirse.

## 3. Lote demostrativo: modulo `cuenta`

- [ ] 3.1 Adaptar `CuentaScreen.tsx` (piloto) a `useAppTheme` y a la firma de objeto, memoizando `getStyles` con `useMemo`. Sin cambio visual.
- [ ] 3.2 Migrar `TerminosScreen.tsx` (137 lineas): quitar `import { COLORS }`, consumir `useAppTheme`, mover estilos a fabrica memoizada.
- [ ] 3.3 Migrar `SesionesActivasScreen.tsx` (195 lineas), preservando sus estados de carga, error y sin conexion.
- [ ] 3.4 Migrar `AdminRolesScreen.tsx` (333 lineas), preservando su comportamiento de permisos por rol.
- [ ] 3.5 Quitar los 4 archivos migrados de la lista legacy del lint y confirmar que baja de 65 a 62 importadores.

## 4. Validacion

- [ ] 4.1 `npm run typecheck` en verde.
- [ ] 4.2 `npm run lint -- --quiet` en verde con la regla nueva activa.
- [ ] 4.3 `npm test -- --runInBand` en verde, sin regresion en las 93 suites vigentes.
- [ ] 4.4 `npm exec -- openspec validate --all --strict --no-interactive` en verde.

## 5. QA visual (gate obligatorio de UI)

- [ ] 5.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar.
- [ ] 5.2 Playwright sobre las 4 pantallas del lote en 3 breakpoints (movil <768, tablet 768-1279, web >=1280): capturas en tema claro y oscuro.
- [ ] 5.3 Capturas con un modo de daltonismo activo y con fuente `xlarge`, comprobando propagacion real.
- [ ] 5.4 Comprobar que una pantalla legacy no migrada sigue intacta con tema oscuro activo (no regresion del fallback).
- [ ] 5.5 Checklist Nielsen sobre el lote; adjuntar evidencia visual al issue #78.

## 6. Cierre

- [ ] 6.1 Actualizar `TLDR.md` si cambiaron alcance, archivos, comportamiento o resultado esperado.
- [ ] 6.2 Revision adversarial (`/adversarial-review`) y registro de su referencia en `readiness.json`.
- [ ] 6.3 `npm run openspec:ready:archive -- --change theming-runtime --run-local` en PASS.
- [ ] 6.4 Archive, sync de specs y `npm run opsx:finish`.
