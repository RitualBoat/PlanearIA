# Ground Truth de Infraestructura - PlanearIA

Esta carpeta guarda evidencia operativa para el `Plan Maestro: Infraestructura Local, CI y Deploy Basico`.

Reglas:

- No guardar secretos, API keys, tokens, URIs completas de MongoDB ni capturas de `.env` con valores reales.
- Si una captura muestra una terminal, revisar que no incluya credenciales.
- Guardar evidencia antes/despues cuando haya cambios de scripts, CI, backend, deploy o storage local.
- Para la futura migracion a SQLite, usar `05-sqlite-actividad-academica/` como carpeta de apoyo para capturas y entregables.

Estructura sugerida:

```text
context/infraestructura-ground-truth/
+-- 01-estado-actual/
+-- 02-evidencia-local/
+-- 03-evidencia-ci/
+-- 04-evidencia-deploy/
+-- 05-sqlite-actividad-academica/
```

Checklist de evidencia minima:

- [x] Captura o log de comandos locales pasando.
- [x] Captura o enlace de GitHub Actions exitoso.
- [ ] Evidencia de backend local `/api/health`.
- [x] Evidencia de app web/celular apuntando al backend correcto.
- [x] Matriz de alternativas si se decide deploy o storage.
- [x] Preparacion SQLite con inventario, matriz y checklist academico.

URL Publica en ngrok: https://spouse-padded-shredder.ngrok-free.dev/

Evidencia SQLite:

- `05-sqlite-actividad-academica/fase-6-preparacion-sqlite-2026-06-06.md`
