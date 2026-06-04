# Guia de Pruebas Vigente - PlanearIA

## Objetivo

Validar cambios sin depender de documentacion legacy. Esta guia reemplaza la guia 2025 archivada en `Documentacion/99-archivo/GUIA_PRUEBAS_LEGACY_2025.md`.

## Validacion tecnica base

Ejecutar desde la raiz:

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm test -- --runInBand
```

Para ahorrar tiempo, usar pruebas focalizadas del modulo tocado:

```bash
npx jest src/__tests__/classroom --runInBand
npx jest src/__tests__/planeaciones --runInBand
```

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

Estado: plan activo. Fases 0-5 completadas.

Smoke test actual:

- Entrar a tab Classroom/Grupos.
- Abrir una clase.
- Validar banner, tabs, resumen y stream.
- Agregar alumno desde clase.
- Importar/exportar alumnos desde clase y verificar filtro por grupo.
- Mover/quitar alumno sin eliminar perfil.
- Crear material desde clase.
- Adjuntar planeacion como material.
- Filtrar materiales por tipo.
- Abrir una planeacion adjunta en `DocEditor`.

## Backend e IA

- Confirmar `.env.local` y `backend/.env.local` sin comments en valores.
- Probar health/API local si se toca backend.
- IA debe usar gateway backend, no keys en frontend.
- Si no hay proveedor IA, debe existir fallback usable donde aplique.

## Antes de cerrar una fase

- Actualizar plan maestro.
- Actualizar issue/fase en GitHub Product OS.
- Registrar comandos ejecutados.
- Si hubo validacion manual, crear o actualizar checklist en `Documentacion/03-validacion/`.
