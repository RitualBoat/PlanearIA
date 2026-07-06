# Validacion

> **Estado:** vigente.
> **Uso:** evidencia manual, visual y documental de cambios actuales.
> **Fuente de verdad:** reportes de validacion activos, comandos ejecutados y resultados.
> **No usar para:** reemplazar typecheck, lint, tests u OpenSpec.

## Reglas

- Todo reporte indica fecha, issue/change, plataforma o contexto y resultado.
- UI visible requiere capturas o evidencia Playwright por breakpoint cuando aplique.
- Los reportes documentan limitaciones honestas y ruido benigno.
- La evidencia historica completa vive en respaldo externo; el repo conserva reportes vigentes y stubs utiles.

## Reportes Vigentes

- `CHECKLIST_VALIDACION_MANUAL_AUTH.md`: validacion manual de Auth, Seguridad y Sesion Real.
- `repo-max-clean-context-2026-07-06/`: evidencia de limpieza maxima de contexto, issue #36.

## Plantilla Recomendada

Cada reporte nuevo incluye:

1. Issue/change.
2. Entorno y comandos.
3. Criterios de aceptacion.
4. Evidencia visual o documental.
5. Accesibilidad si toca UI.
6. Limitaciones honestas.
7. Resultado final.
