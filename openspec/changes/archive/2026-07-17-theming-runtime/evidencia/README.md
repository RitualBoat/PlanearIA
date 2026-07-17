# Evidencia visual: theming-runtime

QA Playwright sobre `expo start --web` (HTTP 200 confirmado antes de navegar).
Fecha: 2026-07-17. Sesion docente persistida en el dispositivo.

Metodo de propagacion: se sembraron las preferencias en almacenamiento local
(`APP_THEME_MODE`, `APP_FONT_SIZE_MODE`, `APP_DALTONISMO_MODE`) y se recargo la app,
de modo que los proveedores las leyeran al montar y las pantallas migradas las
consumieran via `useAppTheme`.

## Capturas

| Archivo | Pantalla | Tema | Fuente | Breakpoint |
| --- | --- | --- | --- | --- |
| `terminos-dark-xlarge-desktop.png` | TerminosScreen (migrada) | oscuro | xlarge | 1280 |
| `terminos-dark-xlarge-mobile.png` | TerminosScreen (migrada) | oscuro | xlarge | 375 |
| `terminos-light-medium-desktop.png` | TerminosScreen (migrada) | claro | medium | 1280 |
| `cuenta-dark-xlarge-deuteranopia-desktop.png` | CuentaScreen (piloto, firma nueva) | oscuro | xlarge | 1280 |
| `cuenta-light-medium-desktop.png` | CuentaScreen (piloto, firma nueva) | claro | medium | 1280 |

## Que prueba cada criterio

- **Cambiar tema oscuro repinta la pantalla migrada, sin reiniciar.** Comparar
  `terminos-light-medium-desktop.png` (fondo blanco, texto oscuro) con
  `terminos-dark-xlarge-desktop.png` (fondo oscuro, texto claro). Antes de este
  change `TerminosScreen` importaba `COLORS` estatico y se veia SIEMPRE en claro;
  ahora responde al tema.
- **Sin cambio visual en tema claro.** `terminos-light-medium-desktop.png` es
  identica al estilado legacy porque `COLORS === lightTheme` (`colors.ts:73`).
- **La fuente escala la tipografia.** El texto legal e interlineado de la version
  `xlarge` es visiblemente mayor que el de `medium` en las dos pantallas.
- **Responsive.** `terminos-dark-xlarge-mobile.png` (375) mantiene la propagacion
  y el reflujo sin romperse.
- **El piloto sigue integro tras adoptar la firma de objeto.** Las dos capturas de
  `CuentaScreen` muestran la pantalla del piloto ya migrada a `getStyles({ ... })`
  respondiendo a tema y fuente igual que antes.

## Daltonismo

La propagacion del daltonismo esta cubierta por el test unitario
`src/__tests__/settings/useAppTheme.test.tsx` con valores exactos (deuteranopia
sobre tema oscuro: `error` = `#D4A017`, `success` = `#2196F3`, `background` =
`darkTheme.background`, sin que una preferencia anule a la otra). No se capturo
visualmente porque las pantallas del lote con colores de estado prominentes
(`SesionesActivasScreen`, `AdminRolesScreen`) requieren datos del backend con
sesion valida, y en esta corrida el backend remoto respondio 401. Los unicos
errores de consola observados fueron esos 401 de red; ninguno provino del render,
del theming ni de JavaScript del change.
