## Why

Los controles de Accesibilidad y Preferencias de la pantalla de Configuracion (`CuentaScreen`) hoy son decorativos: la pantalla lee los contexts reales (`useTheme`, `useFontSize`, `useDaltonismo`) pero su `StyleSheet.create` esta atado al `COLORS` estatico, nunca usa `scaled()` ni `applyDaltonismo()`, y "Contraste alto", "Lectura de voz" y "Reducir movimiento" son `useState` locales con default `true`, sin persistencia ni efecto. El docente activa un switch y no pasa nada, lo que rompe la confianza en el producto. Es la primera aplicacion real, sobre una pantalla, del change `theming-runtime` (Ola 0) del plan UX/UI activo. Issue GitHub: #34.

## What Changes

- `CuentaScreen` consume el tema en runtime: el `StyleSheet` estatico se convierte en una fabrica dependiente del tema `getStyles(DT, isDark, scaled)` con `DT = applyDaltonismo(colors)`, siguiendo el patron ya usado en `ChatScreen`/`SocialScreen`. Al activar Modo oscuro toda la pantalla se re-pinta (fondos, tarjetas, textos), no solo el subtitulo.
- El tamano de fuente escala de verdad: los textos usan `scaled()`, de modo que Pequeno/Medio/Grande reescala la tipografia.
- El modo Daltonismo se aplica visiblemente en la pantalla via `applyDaltonismo(colors)` sobre los tokens de estado, no solo se guarda.
- Los 3 toggles locales (Contraste alto, Lectura de voz, Reducir movimiento) dejan de ser `useState` locales y pasan a un nuevo `AccessibilityPreferencesContext` persistido en AsyncStorage con default **OFF**. Decision de efecto por toggle (documentada en design.md):
  - Reducir movimiento: efecto real (desactiva la animacion de entrada/scroll del pill superior de `CuentaScreen`).
  - Contraste alto: efecto real y ligero, basado en tokens (refuerza texto secundario y bordes) aplicado en la fabrica de estilos.
  - Lectura de voz: preferencia persistida marcada honestamente como "Proximamente" (TTS real fuera de alcance); no simula comportamiento.
- La pantalla se mantiene delgada (MVVM): la lectura/escritura de preferencias vive en contexts/hook, no en la vista.

## Capabilities

### New Capabilities
- Ninguna. La capacidad `settings-accessibility-preferences` ya existe y se extiende.

### Modified Capabilities
- `settings-accessibility-preferences`: se agregan requisitos para que (1) una pantalla real consuma tema, tamano de fuente y daltonismo en runtime (no solo los contexts), y (2) las preferencias de Contraste alto, Lectura de voz y Reducir movimiento sean locales, persistidas y con default seguro (off).

## Impact

- Codigo afectado: `src/screens/cuenta/CuentaScreen.tsx` (vista delgada + fabrica de estilos por tema), nuevo `src/context/AccessibilityPreferencesContext.tsx`, registro del provider en `App.tsx`.
- Tests: nuevos/actualizados bajo `src/__tests__/settings/` (persistencia y defaults del nuevo context; consumo de tokens en la pantalla).
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, change `theming-runtime` (Ola 0) — primer piloto real sobre pantalla.
- Sin impacto en `src/sync` (no es dato academico sincronizable), backend, IA gateway, SQLite default, rutas de navegacion, dependencias productivas ni CI/CD. No se borran llaves legacy `@planearia:*`.

## No objetivos

- Rediseno visual completo de `CuentaScreen`.
- Migrar TODAS las pantallas a `useTheme` (eso es el change `theming-runtime` completo; aqui solo `CuentaScreen` como piloto real).
- Implementar TTS real para "Lectura de voz" (queda como preferencia persistida + "Proximamente").
- Cambiar los tokens de color existentes o el copy visible mas alla de lo necesario para el efecto de los toggles.
- Tocar `src/sync`, activar SQLite como default o introducir nuevas dependencias.
