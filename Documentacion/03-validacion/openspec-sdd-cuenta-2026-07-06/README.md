# QA visual - Accesibilidad y preferencias reales en CuentaScreen

Change OpenSpec: `apply-cuenta-runtime-accessibility`
Issue: [#34](https://github.com/RitualBoat/PlanearIA/issues/34)
Fecha: 2026-07-06
Metodo: Playwright MCP contra `expo start --web` (http://localhost:8081), sesion invitado.
Protocolo de Interaccion Guiada, Paso 3 (Audit & QA). Gate visual del config.yaml (UI que cambia pantalla => capturas por breakpoint).

## Como se levanto el entorno

1. `expo start --web --port 8081` en background.
2. Se esperó a que el bundler respondiera HTTP 200 en `http://localhost:8081` ANTES de navegar
   (la causa del fallo anterior era navegar antes de que el server estuviera listo).
3. Playwright: Onboarding -> "Saltar introduccion" -> tab "Configuracion".

## Resultado por criterio de aceptacion

| # | Criterio | Resultado | Evidencia |
|---|----------|-----------|-----------|
| 1 | Modo oscuro re-pinta TODA la pantalla (fondos, tarjetas, textos) | PASS | `01` (claro) vs `02` (oscuro) desktop; `06/07` movil; `08/09` tablet |
| 2 | Tamano de fuente reescala el texto via `scaled()` | PASS | `02` (Medio) vs `03` (Grande): titulos y controles crecen |
| 3 | Daltonismo transforma colores de estado via `applyDaltonismo` | PASS | `04` (Ninguno: boton peligro rojo) vs `05` (Deuteranopia: boton peligro naranja) |
| 4 | Los 3 toggles dejan de ser `useState` locales; persisten con default OFF; efecto real u honesto | PASS | `01`: Contraste alto OFF, Lectura de voz OFF + subtitulo "Proximamente", Reducir movimiento OFF. Roles `switch` con label accesible en el arbol de accesibilidad |
| 5 | Persistencia entre sesiones | PASS (unit) | Tests de `AccessibilityPreferencesProvider` (persistencia/restauracion/invalido->off) + los 3 contexts de tema |
| 6 | Sin regresiones (claro identico, web y movil OK) | PASS | Claro (`01/06/08`) identico al diseno previo (COLORS === lightTheme); responsive intacto en 3 breakpoints |
| 7 | Gate visual: capturas claro vs oscuro y Medio vs Grande por breakpoint | PASS | 9 capturas en `capturas/` (movil 375, tablet 768, web 1280) |

## Capturas

- `capturas/01-desktop-light-medium.png` - Web 1280, claro, fuente Medio (baseline).
- `capturas/02-desktop-dark-medium.png` - Web 1280, oscuro, fuente Medio (re-pintado completo).
- `capturas/03-desktop-dark-grande.png` - Web 1280, oscuro, fuente Grande (escalado tipografico).
- `capturas/04-desktop-dark-daltonismo-none.png` - Web 1280, oscuro, daltonismo Ninguno (boton peligro rojo).
- `capturas/05-desktop-dark-daltonismo-deuteranopia.png` - Web 1280, oscuro, Deuteranopia (boton peligro naranja).
- `capturas/06-mobile-light.png` - Movil 375, claro.
- `capturas/07-mobile-dark.png` - Movil 375, oscuro.
- `capturas/08-tablet-light.png` - Tablet 768, claro.
- `capturas/09-tablet-dark.png` - Tablet 768, oscuro.

## Accesibilidad observada (arbol de Playwright)

Los controles exponen roles y labels correctos y area de toque >= 44pt (hitSlop):
- `switch "Contraste alto"`, `switch "Lectura de voz (proximamente)"`, `switch "Reducir movimiento"`, `switch "Modo oscuro"`.
- `radio "Modo daltonismo Ninguno/Deuteranopia/Protanopia/Tritanopia"`.
- `button "Tamano de fuente Pequeno/Medio/Grande"` con estado seleccionado.

## Alcance / limitaciones honestas

- El pill superior "Configuracion" y la barra de tabs/superior NO se re-pintan en oscuro: son
  chrome compartido (AnimatedTopPill + navegador de tabs), fuera del alcance de este piloto de una pantalla.
  Corresponden al change `theming-runtime` completo (Ola 0), no a este.
- "Lectura de voz" queda como preferencia persistida marcada "Proximamente"; no hay TTS real (fuera de alcance).
- Errores de consola durante la QA: todos HTTP 401 de `/api/mensajes|grupos|notificaciones` por sesion
  invitado sin token (polling de sync/mensajeria preexistente); no atribuibles a este change. Warnings RN-web
  benignos (shadow*, pointerEvents, useNativeDriver JS fallback).

## Evidencia no visual

- `npx tsc --noEmit` -> exit 0.
- `npx eslint <archivos cambiados> --quiet` -> exit 0.
- `npx jest src/__tests__/settings --runInBand` -> 3 suites, 15 tests en verde.
