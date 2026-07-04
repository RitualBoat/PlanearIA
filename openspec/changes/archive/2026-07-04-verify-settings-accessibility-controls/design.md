## Context

PlanearIA ya tiene providers locales para preferencias de cuenta/accesibilidad:

- `ThemeProvider` persiste `APP_THEME_MODE` y expone `theme`, `colors`, `isDark`, `toggleTheme` y `setTheme`.
- `FontSizeProvider` persiste `APP_FONT_SIZE_MODE` y expone `fontSizeMode`, `scaleFactor`, `setFontSizeMode` y `scaled`.
- `DaltonismoProvider` persiste `APP_DALTONISMO_MODE` y expone `daltonismoMode`, `setDaltonismoMode` y `applyDaltonismo`.

CodeGraph mostro que estos contexts no tienen tests focalizados. Este change es un smoke test del flujo SDD, por lo que evita tocar UI visual o arquitectura y se enfoca en evidencia automatizada de comportamiento.

## Goals / Non-Goals

**Goals:**

- Probar que los providers aplican cambios en runtime.
- Probar que guardan la preferencia en AsyncStorage.
- Probar que valores persistidos se restauran al montar.
- Mantener el alcance pequeno para validar OpenSpec de inicio a fin.

**Non-Goals:**

- No redisenar pantallas ni agregar componentes nuevos.
- No cambiar tokens de color ni copy visible.
- No crear rutas, sync, backend, IA ni persistencia SQLite default.
- No exigir validacion visual con Playwright, porque no se cambia la pantalla renderizada.

## Decisions

1. Agregar tests de providers en vez de tocar la pantalla de configuracion.
   - Razon: el objetivo del smoke es comprobar el ciclo SDD con un cambio reversible y de bajo riesgo.
   - Alternativa considerada: automatizar clicks sobre la pantalla de configuracion. Se descarta para esta prueba porque requeriria ubicar navegacion, fixtures y un entorno visual mas amplio sin aportar mas evidencia sobre los contexts.

2. Usar `@testing-library/react-native` con componentes consumidores minimos.
   - Razon: prueba el contrato publico de los hooks sin acoplarse a detalles internos.
   - Alternativa considerada: exportar constantes internas de storage. Se descarta para no ampliar API productiva.

3. Validar persistencia mediante el mock de AsyncStorage ya disponible en Jest.
   - Razon: mantiene el test local, rapido y compatible con Expo/Jest.
   - Alternativa considerada: pruebas end-to-end en navegador. Se descarta porque no hay cambio visual.

## Risks / Trade-offs

- Tests demasiado acoplados a textos de prueba -> Mitigacion: usar `testID` en consumidores internos del test, no en la app.
- AsyncStorage asincrono puede provocar flakes -> Mitigacion: usar `waitFor` despues del montaje y de acciones.
- La spec habla de comportamiento de UI sin captura visual -> Mitigacion: declarar que este smoke no cambia la pantalla renderizada; la validacion visual sigue siendo obligatoria para changes UI reales.

## Migration Plan

No hay migracion. Los tests nuevos corren con Jest y no modifican datos de usuarios.

Rollback: revertir el archivo de tests y el archivo de documentacion de la prueba SDD.

## Open Questions

- Ninguna para este smoke test. Un change futuro podria cubrir la pantalla de configuracion completa con Playwright si se decide redisenarla.
