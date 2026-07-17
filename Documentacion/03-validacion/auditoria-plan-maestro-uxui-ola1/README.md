# Auditoria del Plan Maestro UX/UI antes de Ola 1

> **Change:** `auditoria-plan-uxui-pre-ola1` (issue [#76](https://github.com/RitualBoat/PlanearIA/issues/76)).
> **Fecha:** 2026-07-16.
> **Alcance:** auditoria de solo lectura del `PLAN_UXUI_NAVEGACION_GLOBAL.md` y su ecosistema (gates, IHC, harness, Product OS, codigo). No modifica el plan ni estados externos existentes.

## Metodologia

- Cada afirmacion se etiqueta como **evidencia** (fuente verificable: archivo, comando con salida, enlace) o **inferencia** (confianza alta/media/baja).
- Severidad de hallazgos anclada a riesgo de Ola 1: **P0** bloquea/corrompe el inicio de Ola 1; **P1** degrada Ola 1 o encarece Ola 2; **P2** mejora relevante no bloqueante; **P3** oportunidad/limpieza.
- Costo estimado: S (<1 dia), M (1-3 dias), L (>3 dias o requiere decision humana previa).
- Consultas estructurales de codigo via GitNexus primario; CodeGraph solo como fallback documentado en `log-auditoria.md`.
- Investigacion web solo con fuentes primarias citadas y aplicabilidad explicita a PlanearIA (`investigacion-web.md`).

## Contenido

| Archivo | Funcion |
| --- | --- |
| `reporte-ejecutivo.md` | Sintesis, veredicto y primer issue ejecutable recomendado |
| `matriz-cobertura.md` | Fila por ola/gate: objetivo, dependencia, evidencia, riesgo, issues |
| `matriz-hallazgos.md` | Hallazgos con evidencia/inferencia, P0-P3, confianza, costo, ola, accion |
| `mapa-dependencias-roadmap.md` | Orden recomendado de changes y dependencias |
| `decisiones-abiertas.md` | Decisiones que requieren juicio humano; no se resuelven aqui |
| `investigacion-web.md` | Fuentes primarias con enlace y aplicabilidad |
| `snapshot-pre-auditoria.md` | Baseline de Product OS previo a crear issues |
| `snapshot-post-auditoria.md` | Comparacion final de no-mutacion |
| `log-auditoria.md` | Comandos, consultas GitNexus, fallbacks y su motivo |
