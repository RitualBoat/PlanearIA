# Evidencia QA visual: breakpoints-reactivos

Fecha: 2026-07-17. Servidor: `expo start --web` (config `expo-web`, puerto 8081), HTTP 200 confirmado
(bundle compilado, pantalla renderizada). Consola sin errores en todos los estados probados.

## Metodo

El mecanismo de captura de pantalla del harness (`computer screenshot`) agota su tiempo de espera de
forma consistente en este entorno (renderer ocupado), asi que la evidencia se recogio por medicion
directa del DOM/estilos computados en la app real corriendo (`javascript_tool`), que ademas es
**numerica y exacta**: mide el valor de estilo dependiente de ancho que este change descongela.

### Limitacion del harness (no es un bug del producto)

`resize_window` del harness fija el viewport via CDP pero **no** emite el evento DOM `resize` que
React Native Web escucha para actualizar `useWindowDimensions`. Se probo instalando un contador de
eventos: tras `resize_window` de 375 a 1280, `window.__rc === 0` (cero eventos). Al despachar el
evento `resize` real (lo que un navegador de verdad emite al redimensionar), el contador sube a 1 y la
pantalla reacomoda. Por eso las mediciones "en vivo" disparan el `resize` real, equivalente a arrastrar
el borde de la ventana.

## Resultado 1: LoginScreen renderiza el rango correcto (end-to-end, app real)

Pantalla `LoginScreen` (la que tenia el congelamiento), viewport 1280 (rango escritorio):

| Medicion | Valor observado | Esperado `getStyles('desktop')` |
| --- | --- | --- |
| Logo (`img` PlanearIA.png) | 160 x 160 px | 160 |
| Titulo "Sistema de Planeaciones" `font-size` | 32 px | `FONT_SIZES.xxlarge + 8` = 32 |

Confirma que la ruta completa `useBreakpoint()` -> `resolveResponsive()` -> `StyleSheet` produce el
valor del rango vigente en la app real, ya no una foto congelada al importar.

## Resultado 2: reflow en vivo sin recargar (pantalla migrada)

Pantalla `Configuración` (`CuentaScreen`, migrada a `useBreakpoint`). Su columna derecha "Resumen
rapido" solo se renderiza con `wideLayout` (`width >= 1080`). Se midio el reflujo disparando el evento
`resize` real, sin recargar (`performance.navigation` = 1 en todo momento):

| Paso | Viewport | Columna ancha "Resumen rapido" | Recargas |
| --- | --- | --- | --- |
| Inicio (movil) | 375 | ausente | 1 |
| Resize a escritorio + evento resize | 1280 | **aparece** | 1 |
| Resize a movil + evento resize | 375 | **desaparece** | 1 |

La pantalla se reacomoda en ambos sentidos sin recargar: cumple el criterio "rotacion/resize se
reacomoda sin recargar".

## Cobertura complementaria (tests deterministas, 11 casos en verde)

- `src/__tests__/hooks/useBreakpoint.test.tsx`: limites de `getBreakpoint` (767/768/1279/1280),
  `resolveResponsive` por bucket y fallback, reactividad de `useBreakpoint` (el rango cambia al cambiar
  el ancho), y memoizacion por bucket.
- `src/__tests__/auth/LoginScreen.responsive.test.tsx`: `getStyles` reflow por rango
  (logo 120 movil / 140 tablet / 160 escritorio; titulo y `maxWidth` del formulario varian).

## Nielsen (heuristicas relevantes al change)

- Visibilidad del estado del sistema: el layout responde al tamano real; nada queda clavado.
- Consistencia y estandares: un unico origen de rango (`useBreakpoint`), rangos alineados al plan.
- Prevencion de errores: se elimino la lectura congelada (`Dimensions.get()`); `rg` en `src/` da cero.
- Sin regresion de accesibilidad: no se cambio texto, labels ni areas de toque; solo el mecanismo de ancho.
