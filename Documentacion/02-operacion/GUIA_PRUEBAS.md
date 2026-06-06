# Guia de Pruebas Vigente - PlanearIA

## Objetivo

Validar cambios sin depender de documentacion legacy. Esta guia reemplaza la guia 2025 archivada en `Documentacion/99-archivo/GUIA_PRUEBAS_LEGACY_2025.md`.

## Validacion tecnica base

Ejecutar desde la raiz:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run check
```

Para ahorrar tiempo, usar pruebas focalizadas del modulo tocado:

```bash
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

## CI y GitHub Actions

El workflow `.github/workflows/ci.yml` valida en cada push/PR a `main` y `development`:

| Job | Que valida | Comando principal |
| --- | --- | --- |
| `TypeScript` | Tipado del frontend/app | `npm run typecheck` |
| `ESLint` | Lint sin ruido informativo | `npm run lint -- --quiet` |
| `Jest` | Suite automatizada completa | `npm test -- --runInBand` |
| `Backend smoke` | Instalacion del backend y smoke estatico de `/api/health` | `npm ci --prefix backend` + `npm run backend:check` |

Como leer un fallo:

- Si falla `TypeScript`, corregir tipos antes de revisar UI.
- Si falla `ESLint`, resolver errores reportados; warnings no deben bloquear en modo `--quiet`.
- Si falla `Jest`, revisar el primer test fallido y confirmar si es regresion o fixture desactualizado.
- Si falla `Backend smoke`, revisar `backend/package-lock.json`, `backend/vercel.json` y `backend/api/health.js`.
- No usar GitHub Actions como tablero de tareas; el estado operativo vive en GitHub Project.

## Validacion manual base

- Web carga sin zoom out obligatorio.
- Movil fisico no muestra errores de LogBox.
- Scroll funciona en pantallas largas.
- Botones seleccionados mantienen texto legible.
- Modales se cierran sin bloquear clicks.
- Volver/cancelar no pierde contexto.
- Empty states llevan a la accion correcta.

## Planeaciones

Estado: Fase 9 cerrada.

Checklist detallado: `Documentacion/03-validacion/CHECKLIST_VALIDACION_MANUAL_FASE9.md`.

Smoke test recomendado:

- Crear planeacion desde `Contenido`.
- Seleccionar plantilla default.
- Abrir `DocEditor`.
- Editar documento.
- Sincronizar formulario/documento en movil.
- Guardar y reabrir.
- Probar una accion IA con fallback si no hay proveedor.

## Classroom

Estado: cerrado. Fases 0-10, cierre final e issue #8 completados.

Smoke test actual:

- Entrar a tab Classroom/Grupos.
- Abrir una clase.
- Confirmar tabs `Tablon`, `Trabajo de clase` y `Personas`.
- Confirmar pildora hero en dashboard Classroom.
- Crear clase desde Classroom y confirmar regreso a dashboard Classroom.
- Crear seccion/unidad desde `Trabajo de clase`.
- Confirmar que el boton `+` de una seccion abre `AgregarContenidoClassroom`.
- Crear material con varios archivos/enlaces y confirmar detalle en `DetalleRecursoClassroom`.
- Crear actividad con fecha de asignacion, fecha de entrega, entrega tardia y notas.
- Editar material/actividad desde sus detalles y confirmar que no abre formulario legacy.
- Confirmar flujo contextual de entregas/calificacion.
- Validar offline/reconexion si se toca storage/sync.
- Confirmar web sin scroll roto y movil sin pantallas cortadas.

## Backend e IA

- Confirmar `.env.local` y `backend/.env.local` sin comments en valores.
- Probar health/API local si se toca backend.
- Smoke estatico backend: `npm run backend:check`.
- Smoke local con servidor: `npm run backend:dev:local` en una terminal y `npm run backend:health` en otra.
- IA debe usar gateway backend, no keys en frontend.
- Si no hay proveedor IA, debe existir fallback usable donde aplique.

## Antes de cerrar una fase

- Actualizar plan maestro.
- Actualizar issue/fase en GitHub Product OS.
- Registrar comandos ejecutados.
- Registrar bloque `GitHub/CI - Fase X` en planes nuevos o issues activos.
- Si hubo validacion manual, crear o actualizar checklist en `Documentacion/03-validacion/`.
