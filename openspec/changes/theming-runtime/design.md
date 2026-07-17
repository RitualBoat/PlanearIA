# Design: theming-runtime

## Contextos delimitados afectados

Fuente: `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`.

- **Owner de las decisiones: Experiencia y Preferencias.** Posee tema, fuente, daltonismo y accesibilidad. Todo lo que este change define (hook compuesto, contrato de fabrica, regla de lint) pertenece a este contexto.
- **Superficie tocada en Identidad y Cuenta.** Dos archivos del lote (`SesionesActivasScreen`, `AdminRolesScreen`) son UI propiedad de Identidad y Cuenta; `TerminosScreen` es informativa.

**Se afecta mas de un contexto en superficie, pero no se requiere contrato cruzado nuevo.** Justificacion: el flujo es unidireccional y solo de presentacion. Identidad y Cuenta **consume** tokens de presentacion que Experiencia y Preferencias posee, igual que ya lo hace `CuentaScreen`. Este change no lee, escribe, deriva ni redefine ningun dato de identidad: no toca `Usuario`, `Rol`, `Sesion`, `AuthContext`, `src/services/auth/` ni `backend/routes/auth.js`. No cambia permisos ni revocacion de sesion. La direccion es Experiencia y Preferencias -> consumidores, sin retorno.

Invariantes: `userId` no aplica (las preferencias son locales por dispositivo, no multiusuario sincronizable). `src/sync` no aplica: no hay dato academico sincronizable. Confirmacion IA no aplica: no hay IA.

## Decision 1: hook compuesto nuevo, sin mutar `useTheme`

**Contexto.** `useTheme()` devuelve `colors` crudo (`ThemeContext.tsx:42`). El daltonismo se aplica aparte con `applyDaltonismo(colors)` (`DaltonismoContext.tsx:69-75`). El unico consumidor que compone todo es `CuentaScreen:99-113`.

**Decision.** Agregar `useAppTheme()` en `src/themes/useAppTheme.ts` que compone los cuatro contextos y devuelve el resultado ya combinado y memoizado.

**Alternativa rechazada: hacer que `useTheme()` aplique daltonismo internamente.** Es tentadora porque arreglaria las 17 pantallas ciegas al daltonismo sin tocarlas. Se rechaza por tres razones:

1. **Acoplamiento de contextos.** `ThemeContext` pasaria a depender de `DaltonismoContext`, creando una dependencia de orden de proveedores en `App.tsx`. Hoy son independientes y montables en cualquier orden.
2. **Cambio silencioso sin QA.** Repintaria 17 pantallas con colores distintos sin evidencia visual por pantalla. El plan exige Playwright por breakpoint para UI visible; no se puede cumplir para 17 pantallas fuera del lote sin volver este change el rollout completo que el plan prohibe.
3. **Rompe el contrato publicado.** La spec archivada `settings-accessibility-preferences` fija que los consumidores reciben `daltonismoMode` y tokens ajustados desde el contexto de daltonismo. Mover ese filtro dentro del tema cambiaria una spec vigente sin necesidad.

**Consecuencia aceptada.** Las 17 pantallas con `useTheme` siguen ciegas al daltonismo hasta que su lote las migre. Es explicito, esta rastreado por la lista del lint y es coherente con "rollout rastreado".

## Decision 2: fabrica con parametro objeto

**Contexto.** El plan fija dos reglas que chocan con la firma del piloto:

- "Tocar cada archivo UNA sola vez"; `theming-runtime` establece la fabrica y `breakpoints-reactivos` "solo le agrega el parametro `width`".
- "Memoizar la fabrica para no recrear estilos en cada render".

El piloto usa posicional: `getStyles(DT, isDark, scaled, highContrast)` (`CuentaScreen:874-877`). Agregarle `width` obligaria a reabrir cada archivo migrado y editar su llamada, rompiendo la primera regla.

**Decision.** Contrato con parametro objeto:

```ts
const styles = useMemo(() => getStyles({ colors, isDark, scaled, highContrast }), [colors, isDark, scaled, highContrast]);
```

`breakpoints-reactivos` agrega `width` al objeto y a las dependencias sin cambiar la aridad ni el orden de nada ya migrado. El piloto `CuentaScreen` se adapta a la firma nueva dentro de este change: es el unico sitio con la firma vieja, y dejarlo divergente convertiria al pionero en la excepcion.

**Memoizacion.** `lightTheme`/`darkTheme` son constantes de modulo, asi que la identidad de `colors` es estable por tema; `scaled` ya viene memoizado por `fontSizeMode` (`FontSizeContext.tsx:41-44`). Por eso las dependencias del `useMemo` son estables y los estilos solo se recrean cuando una preferencia cambia de verdad. El piloto hoy llama `getStyles` sin memoizar (`CuentaScreen:113`), recreando el `StyleSheet` en cada render: la migracion tambien corrige eso.

## Decision 3: la regla de lint es el mecanismo de rastreo (H12a)

**Contexto.** 65 archivos importan `COLORS` (64 de produccion + 1 test, verificado al implementar) legitimamente como fallback legacy. Una prohibicion global romperia CI. H12a reporta que no existe mecanismo de rastreo del rollout restante.

**Ruta real del import.** Los consumidores no importan `COLORS` desde `src/themes/colors` sino desde el barrel `types` (`types/index.ts:700` lo reexporta). La regla debe restringir ambas rutas (`**/themes/colors` y `**/types`, solo el especificador `COLORS`); cubrir unicamente la primera dejaria el trinquete sin efecto.

**Decision.** Un unico artefacto sirve para ambas cosas: `no-restricted-imports` prohibe `COLORS` de forma global, y un `overrides` re-autoriza el import solo en una lista explicita de rutas legacy.

- Archivo nuevo o redisenado: error por defecto, sin necesidad de recordar la regla.
- Archivo migrado: sale de la lista y no puede reincidir (trinquete).
- La longitud de la lista **es** el trabajo restante, verificado por CI en cada PR.

No hace falta un tablero paralelo, un comentario `TODO` ni un conteo manual que se desincronice. El rastreador no puede mentir porque CI lo ejecuta.

**Alternativa rechazada: script contador aparte.** Duplicaria la fuente de verdad y no impediria que un archivo nuevo naciera en deuda.

**Consecuencia.** La lista arranca con 61 rutas de produccion (64 de produccion menos las 3 del lote; los tests quedan fuera de la regla). El piloto `CuentaScreen` ya no importa `COLORS`, asi que no aparece.

## Decision 4: lote demostrativo = cerrar el modulo `cuenta`

**Decision.** Migrar los 3 archivos de `src/screens/cuenta/` que aun importan `COLORS`:

| Archivo | Lineas |
| --- | --- |
| `TerminosScreen.tsx` | 137 |
| `SesionesActivasScreen.tsx` | 195 |
| `AdminRolesScreen.tsx` | 333 |

**Justificacion.** Es el modulo donde ya vive el piloto migrado, asi que el lote deja un modulo entero coherente en vez de una migracion salpicada; son pantallas de cuenta contiguas a las de preferencias, donde el docente comprueba el efecto de lo que acaba de cambiar; y su tamano permite QA visual real por breakpoint sin convertir el change en el rollout completo.

**Riesgo de migracion: bajo y acotado.** Los importadores de `COLORS` y los consumidores de `useTheme` son conjuntos disjuntos (0 archivos hibridos, verificado 2026-07-17). No hay archivo a medio migrar, asi que la frontera legacy/migrado es limpia y ningun archivo del lote arrastra estado previo ambiguo.

## Decision 5: alcance de R5 (mojibake)

Los 6 archivos con mojibake estan verificados: `src/__tests__/planeaciones/ExportarPlaneacionScreen.test.tsx`, `src/__tests__/planeaciones/useListaPlaneacionesViewModel.test.tsx`, `src/__tests__/sync/syncEngine.test.ts`, `src/components/editor/sections/SeccionCurricular.tsx`, `src/navigation/StackNavigator.tsx`, `src/screens/planeaciones/ExportarPlaneacionScreen.tsx`.

Ninguno cae en el lote. R5 dice "normalizar al tocar cada archivo", asi que este change no los toca y no los normaliza. Se declara explicito para que no se lea como omision: el conteo queda registrado en #78 y su normalizacion viaja con el lote que toque cada archivo.

## Evidencia y validacion

- **Ground truth visual: no aplica.** El plan declara paridad funcional para este change. No hay Figma de referencia y el lote no cambia de aspecto: la migracion debe verse igual en tema claro y reaccionar en oscuro.
- **QA Playwright** en 3 breakpoints (movil <768, tablet 768-1279, web >=1280) sobre el lote, solo tras `expo start --web` con HTTP 200.
- **Tests** del hook compuesto: composicion de daltonismo sobre tema, escalado, memoizacion e independencia de orden de proveedores.
- **Regla de lint**: se verifica que falla ante un `import { COLORS }` fuera de la lista y que pasa dentro de ella.

## Estandar de Excelencia Visual

Aplica de forma acotada: este change no redisena. No introduce micro-interacciones ni motion nuevos, asi que no consume el presupuesto de `reanimated` ni la regla de reduce-motion. Lo que si sostiene: contraste via tokens en ambos temas, y que el daltonismo ajuste colores de estado (el proposito de accesibilidad del change). Las pantallas del lote conservan sus estados actuales de loading, empty, error y offline sin cambio de comportamiento.
