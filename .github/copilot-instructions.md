# Instrucciones para GitHub Copilot -- PlanearIA

## Contexto Vigente

PlanearIA es una app React Native + Expo SDK 54 + TypeScript para docentes mexicanos. Usa una arquitectura modular monolitica con MVVM pragmatico:

- Screens como vistas delgadas.
- Hooks como ViewModels.
- Context para estado compartido.
- Services/repositories para I/O.
- Backend serverless en Vercel con MongoDB Atlas.
- AsyncStorage como persistencia local productiva.
- Expo SQLite instalado como infraestructura opt-in, no default.
- Motor de sync offline-first en `src/sync`.
- IA centralizada en backend mediante `backend/lib/aiGateway.js`.
- Futuro Asistente IA / ChatGPT Docente conectado a Office, Classroom, Canva y proveedores cloud/locales via AI Gateway.
- IA silenciosa puede sugerir solicitudes al LLM en segundo plano, como correcciones de documentos, pero nunca debe sobrescribir originales sin revision docente.

La vision actual no es "muchos modulos separados". La vision es una suite docente conectada:

- Inicio / Sistema Operativo Docente.
- Asistente IA / ChatGPT Docente.
- Office Docente: documentos, planeaciones, hojas, listas, rubricas, asistencia, calificaciones e import/export.
- Classroom / Clases: grupos, unidades, materiales, actividades, alumnos, entregas y seguimiento.
- Canva / Genially Docente.
- WhatsApp Docente.
- Calendario, reportes, cuenta, seguridad y accesibilidad.

El principio de producto es cero friccion: si el docente crea algo, PlanearIA debe sugerir como conectarlo, asignarlo y darle seguimiento sin cambiar de app.

## Fuentes Obligatorias

Antes de trabajos relevantes, leer en este orden:

1. `README.md`
2. `CLAUDE.md`
3. `Documentacion/README.md`
4. `Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`
5. `Documentacion/00-fundamentos/VISION_ACTUAL.md`
6. `Documentacion/00-fundamentos/ARQUITECTURA.md`
7. `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`
8. `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
9. `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
10. `Documentacion/01-planes-maestros/meta_guia_planes.md`

Para UX/UI global, leer tambien `Documentacion/prompt_mejorado.md`.

## Planes

- Plan activo/en cierre: `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`.
- Proximo plan recomendado: `Plan Maestro: UX/UI y Navegacion Global`.
- Los planes cerrados viven en `Documentacion/01-planes-maestros/cerrados/`.
- Los planes cerrados son evidencia funcional y tecnica; no son limite visual para el rediseno UX/UI.
- Usar estados `[ ]`, `[~]`, `[x]` solo cuando exista evidencia.

Cuando el usuario pida trabajar en una tarea de plan:

1. Leer `Documentacion/README.md`.
2. Leer el plan activo o indicado.
3. Encontrar la siguiente tarea pendiente `[ ]`.
4. Implementar de forma acotada.
5. Validar.
6. Marcar `[x]` solo si hay evidencia real.

## Reglas De Arquitectura

- Mantener MVVM: no convertir screens en contenedores gigantes.
- Nueva data academica sincronizable debe pasar por `src/sync`; no crear colas ni clientes HTTP paralelos.
- Disenar nuevos datos academicos con ports/repositories compatibles con futura migracion SQLite.
- No activar SQLite como default sin aprobacion explicita.
- No borrar claves `@planearia:*` sin migracion, validacion y rollback.
- Toda entidad multiusuario debe aislarse por `userId`.
- Toda IA debe pasar por backend; no poner provider keys ni URLs privadas de LM Studio en frontend.
- Correcciones IA: entregar copia, borrador, comparacion o resumen revisable antes de aplicar.
- No proponer microservicios ni infraestructura costosa sin justificacion fuerte.
- Web, tablet y movil deben partir de una pantalla madre responsiva. Archivos platform-specific requieren justificacion.

## Backend

- Cada endpoint CRUD debe filtrar por `userId`.
- Decodificar JWT con `getUserFromToken` desde `backend/lib/auth.js`.
- Usar headers `Authorization: Bearer <JWT>` y `Content-Type: application/json`.
- Crear indices MongoDB con `createIndex`; es idempotente.
- Aplicar rate limiting a login, register, recovery, sync, bulk create e IA.
- No guardar secretos en codigo ni commits.

## Frontend

- Usar `src/themes/colors.ts` y utilidades responsive existentes.
- Preservar ThemeContext, FontSizeContext y DaltonismoContext.
- Manejar loading, error, empty y offline states.
- No dejar botones que parezcan funcionales si realmente son "proximamente".
- Si una pantalla actual contradice la nueva vision, documentar la migracion en vez de copiar el patron viejo.

## Testing

Para cambios funcionales:

1. Buscar tests existentes en `src/__tests__/`.
2. Ejecutar tests afectados.
3. Agregar tests si el cambio toca logica compartida, sync, auth, backend o flujos de usuario.
4. Arreglar fallas antes de marcar tareas como completadas.

Comandos utiles:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

En Windows, si Jest tiene conflictos de Haste Map:

```bash
--rootDir c:\Users\jarco\dev\PlanearIA
```

## Estilo

- Sin emojis en codigo, docs, commits o logs.
- Lenguaje claro, practico y estudiantil.
- Explicar decisiones con razon tecnica, no con jerga.
- No copiar codigo open source sin revisar licencia, stack y compatibilidad.

## Python

Ejecutable local:

```text
C:/Users/jarco/AppData/Local/Programs/Python/Python312/python.exe
```
