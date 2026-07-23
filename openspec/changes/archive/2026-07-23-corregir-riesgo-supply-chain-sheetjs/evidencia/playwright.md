# Evidencia Playwright y accesibilidad

Fecha: 2026-07-23. Servidor local `http://127.0.0.1:8081` confirmado con HTTP 200 antes de navegar.

## Breakpoints

| Perfil | Viewport | Resultado | Captura |
| --- | --- | --- | --- |
| Móvil | 390x844 | PASS | `playwright/mobile-390x844.png` |
| Tablet | 1024x768 | PASS | `playwright/tablet-1024x768.png` |
| Web | 1440x900 | PASS | `playwright/web-1440x900.png` |

En los tres perfiles se confirmó texto completo de SheetJS, tres pestañas sin desbordamiento, objetivo
táctil de 44 pt o mayor, botón Volver 44x44 y contenido legible. Términos y Privacidad permanecen.

## Accesibilidad

- Pestañas expuestas con rol `tab`, nombre accesible y estado seleccionado.
- Navegación de teclado verificada: `Tab` movió foco de Términos a Privacidad y `Enter` activó el
  Aviso de Privacidad.
- Botón Volver expuesto con rol y nombre; su objetivo se corrigió de 32x32 a 44x44 durante QA.
- Colores provienen del tema, texto escala con `scaled` y no se usa color como único nombre/estado.

## Checklist Nielsen proporcional

- Visibilidad: pestaña activa anunciada visualmente y por accesibilidad.
- Correspondencia: etiquetas legales directas y familiares.
- Control: salida Volver preservada; Términos/Privacidad siempre disponibles.
- Consistencia: se reutiliza la pantalla y patrón de pestañas vigente.
- Prevención/recuperación: no existen mutaciones ni acciones destructivas en esta superficie.
- Reconocimiento: atribución muestra producto, proveedor, licencia y enlace.
- Minimalismo: no se rediseñaron otras superficies.

## Exclusiones conocidas

La navegación previa a la pantalla produjo CORS del backend remoto en localhost y el error preexistente
de botón anidado del modal de cuenta. No nacen en `TerminosScreen`, no afectan la evidencia de la
superficie legal y no se corrigen en #137; los warnings/gates de proceso pertenecen a #136. Una vez
abierta la pantalla legal, la interacción y el render del cambio no generaron un error propio.
