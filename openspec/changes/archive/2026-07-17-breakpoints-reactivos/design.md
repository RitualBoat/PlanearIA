# Design: breakpoints-reactivos

## Bounded contexts afectados

Segun `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`, este change toca un **unico** bounded context: **Experiencia y Preferencias** (presentacion responsive). El resto de las superficies (`LoginScreen`, biblioteca, grupos, plantillas) se tocan solo como **consumidoras de presentacion**: no se altera `Usuario`, `Rol`, `Sesion`, `AuthContext`, `src/sync` ni ninguna entidad de dominio.

**Declaracion explicita:** este change NO requiere contrato cruzado. No introduce providers globales nuevos, colas, eventos ni microservicios. `useBreakpoint()` es un hook de lectura puro sobre `useWindowDimensions()`; no escribe estado compartido, no toca `userId`, no toca almacenamiento.

## Verificacion de API (Context7)

`useWindowDimensions()` es API core de React Native (`react-native`): devuelve `{ width, height, scale, fontScale }` y re-renderiza al consumidor en cada evento de cambio de `Dimensions` (resize del navegador, rotacion). Es la API oficial preferida sobre `Dimensions.get()`+listener manual: gestiona la suscripcion y el cleanup. Verificado via Context7 (`/react/react-native`) el 2026-07-17. `fontScale` se expone para coordinar con `FontSizeContext` en el futuro sin acoplarlos aqui.

## Ground truth visual

Este change **no redisena**: es migracion de mecanismo. El ground truth es la propia pantalla renderizada antes del change; el criterio es equivalencia visual a igual ancho (antes == despues) y reflow correcto al cambiar de ancho. No se introduce motion nuevo, por lo que el presupuesto de animacion/`reduce-motion` no aplica. No hay Figma especifico para este mecanismo; no es bloqueo porque no hay aspecto nuevo que fijar.

## Decision 1: una fuente reactiva unica (`useBreakpoint`), no un helper con `Dimensions.get()`

`Dimensions.get("window")` devuelve una foto. Llamado dentro de un `StyleSheet.create` de modulo (`LoginScreen`), esa foto se congela al importar y nunca se actualiza. La correccion no es "volver a leer `Dimensions.get()` en cada render" (reintroduce el listener manual y su cleanup): es `useWindowDimensions()`, que ya es reactivo, envuelto en un hook unico.

`useBreakpoint()` devuelve:

```
{ width, height, fontScale, breakpoint, isMobile, isTablet, isDesktop }
```

Rangos (identicos al plan y a `openspec/config.yaml`): movil `<768`, tablet `768-1279`, escritorio `>=1280`.

Helpers puros exportados (para usarse dentro de fabricas de estilos, donde no se puede llamar un hook):

- `getBreakpoint(width): Breakpoint` — clasifica un ancho.
- `resolveResponsive(breakpoint, mobile, tablet, desktop?)` — elige por bucket; si falta `desktop`, cae a `tablet`; el reemplazo directo de `responsive()`.

### Nombre `desktop`, no `web`

El plan llama "web >=1280" al bucket superior. Se nombra `desktop` para no colisionar con el helper de plataforma `isWeb()` (`Platform.OS === "web"`), que es una dimension distinta: una tablet nativa de 1300px es `desktop` por ancho pero `isWeb()===false`; una ventana web de 500px es `mobile` por ancho pero `isWeb()===true`. Mezclar ambos conceptos es la clase de bug que este change corrige, asi que se mantienen separados por nombre.

## Decision 2: `ThemedStylesInput` gana `breakpoint?` opcional; `useAppTheme` NO absorbe dimensiones

#78 documento que este change agregaria `width` al contrato de la fabrica. Se agrega, con dos matices:

1. **Como bucket (`breakpoint`), no como ancho crudo.** Una fabrica memoizada por ancho crudo se recrearia en cada pixel de resize. Memoizada por `breakpoint` se recrea solo al cruzar 768/1280, que es cuando el layout realmente cambia de clase. El ancho continuo (umbrales a medida como 1080) se lee inline con `useBreakpoint().width`, no desde la fabrica.
2. **Opcional.** Cuatro fabricas consumen `ThemedStylesInput` (`Cuenta`, `Terminos`, `SesionesActivas`, `AdminRoles`); ninguna tiene estilo dependiente de ancho hoy. Un campo requerido obligaria a reabrir las 3 ajenas (churn fuera de alcance). Opcional: compilan sin cambios y la fabrica que lo necesite lo consume.

**`useAppTheme` queda intacto (solo tema).** Alternativa evaluada y rechazada: que `useAppTheme` lea `useWindowDimensions()` internamente y provea `breakpoint`. Se rechaza porque acoplaria ~10 pantallas themeadas a re-render por resize que la mayoria no necesita, y cambiaria la identidad memoizada que los tests de #78 fijan. En su lugar, `useBreakpoint()` es la **unica** suscripcion a dimensiones; una pantalla que necesite tema + ancho compone ambos hooks: `getStyles({ ...useAppTheme(), breakpoint })`. Esto mantiene "una sola fuente reactiva" literal.

## Decision 3: migrar `LoginScreen` sin migrar su tema

`LoginScreen` usa `COLORS`/`FONT_SIZES` estaticos (no esta en el contrato de #78). Migrar su tema a runtime es `tokens-completos`, fuera de alcance. Este change solo descongela el ancho:

- El `StyleSheet.create` de modulo pasa a una fabrica local `getStyles(breakpoint: Breakpoint)` que conserva `COLORS`/`FONT_SIZES` estaticos.
- Cada `responsive(a, b, c)` pasa a `resolveResponsive(breakpoint, a, b, c)`.
- `isWeb()` (plataforma) se conserva dentro de la fabrica para el estilado de la tarjeta web.
- Al render: `const { breakpoint } = useBreakpoint()` y `const styles = useMemo(() => getStyles(breakpoint), [breakpoint])`.

La firma de la fabrica de `LoginScreen` es `getStyles(breakpoint)` (posicional simple), no `ThemedStylesInput`, porque no consume tema: no tiene sentido inflar su firma con tokens que no usa. El contrato `ThemedStylesInput.breakpoint` de la Decision 2 es para las fabricas **themeadas** que en el futuro necesiten ancho.

## Decision 4: cambio semantico intencional de `responsive()` a `resolveResponsive()`

El viejo `responsive(mobile, tablet, web?)`:

```
if (Platform.OS === "web" && web !== undefined) return web;   // por plataforma, no ancho
if (width >= 768) return tablet;
return mobile;
```

Devolvia el valor `web` segun **plataforma**: una ventana web de 500px recibia el valor "grande/web". `resolveResponsive` es puramente por **ancho**: esa misma ventana recibe el valor movil. Es la conducta correcta para "no congelar estilos al redimensionar web": una ventana web angosta debe verse como movil. En escritorio real (`>=1280`) ambos coinciden. La diferencia solo aparece en web angosto y es una **correccion**, no una regresion. Se documenta aqui y se cubre con QA en `LoginScreen` (unico afectado).

## Decision 5: jubilar el API congelado, conservar `isWeb()`

Se retiran de `responsive.ts`:

- `responsive()` — unico consumidor era `LoginScreen`, que se migra en el mismo change.
- `getScreenDimensions()` — sin consumidores externos (solo lo usaba `responsive()`).

Con esto **desaparece todo `Dimensions.get()` de `src/`**. Se conserva `isWeb()` (lee `Platform.OS`, no es ancho ni foto) para no tocar los 9 imports que solo lo usan: reducir el blast radius y la superficie de QA. Se agrega un comentario en `responsive.ts` que redirige la responsividad de ancho a `useBreakpoint`.

Alternativa evaluada: mover `isWeb()` a `src/utils/platform.ts` y borrar `responsive.ts` (retiro total). Se difiere: obligaria a editar 10 imports (incluidos 3 archivos fuera del alcance de QA) por un cambio de ruta, ampliando el riesgo sin beneficio funcional. Queda como limpieza opcional para un change futuro.

## Migracion incremental y segura (orden de tareas)

1. Infra pura primero: `useBreakpoint` + helpers + tests unitarios. No cambia ningun consumidor todavia.
2. Contrato: `ThemedStylesInput.breakpoint?` (tipo) + test de una fabrica de muestra que memoiza por bucket.
3. Descongelar `LoginScreen` (el bug real) + test de reflow.
4. Unificar la fuente en los 6 mixtos (umbrales intactos), uno a uno.
5. Jubilar `responsive()`/`getScreenDimensions()` cuando ya no queden consumidores.
6. Validacion + QA visual por breakpoint.

Cada paso deja el arbol compilando y verde: si el review se detiene en el paso 3, el bug real ya esta corregido y el resto es unificacion sin riesgo.

## Riesgos y mitigaciones

- **Re-render por resize en los mixtos:** ya ocurria (usaban `useWindowDimensions`); `useBreakpoint` no lo empeora. Solo se mueve el mounted screen, no las 57 pantallas.
- **Regresion visual en `LoginScreen` web angosto:** es el cambio semantico intencional (Decision 4); QA lo verifica como mejora.
- **Olvidar un `Dimensions.get()`:** el gate es objetivo — `rg "Dimensions.get" src/` debe dar cero tras el change.
- **Tests de RN y dimensiones:** `jest-expo` provee defaults de `Dimensions`; la reactividad se prueba mockeando `useWindowDimensions`.
