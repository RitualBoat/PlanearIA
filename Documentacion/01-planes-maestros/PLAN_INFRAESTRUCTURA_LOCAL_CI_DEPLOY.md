# Plan Maestro: Infraestructura Local, CI y Deploy Basico - PlanearIA

> **Version:** 1.0
> **Fecha:** 2026-06-04
> **Ultima actualizacion:** 2026-06-05
> **Estado:** [~] Plan maestro activo. Fase 0 completada; Fase 1 pendiente.
> **Prioridad:** siguiente cimiento despues de cerrar Classroom.
> **Alcance:** estabilizar entorno local, scripts, CI, backend local/serverless, variables de entorno, evidencia de despliegue low-cost y preparacion futura para migracion SQLite.
> **Restriccion central:** estudiante/desarrollador solo, presupuesto cero o muy bajo, laptop potente como entorno principal, sin microservicios ni servicios empresariales.

---

## 1. Objetivo

Convertir PlanearIA en un proyecto facil de levantar, validar y demostrar sin gastar dinero ni sobredisenar infraestructura.

Este plan no busca "infra enterprise". Busca que el proyecto tenga:

- Entorno local reproducible.
- Scripts claros para frontend, backend, tests y validacion.
- GitHub Actions confiable y barato.
- Variables de entorno seguras y documentadas.
- Backend local/cloud low-cost listo para demos.
- Criterios claros para decidir Vercel, Render, Railway, Expo EAS o self-host local.
- Preparacion formal para migrar storage local de AsyncStorage a SQLite cuando toque.

---

## 2. Contexto Real

PlanearIA es un monolito modular en desarrollo activo. No hay usuarios reales ni datos productivos que proteger contra migraciones agresivas, pero si hay que preservar la capacidad de demo y el avance del proyecto.

Contexto del desarrollador:

- Proyecto construido por un estudiante/desarrollador solo.
- Presupuesto: cero o free tiers.
- Laptop principal potente: Ryzen 7, RTX 4060, 64 GB RAM.
- Puede usarse la laptop como servidor local, backend de demo o entorno Docker futuro si conviene.
- La prioridad es poder entregar avances de materia, mostrar una demo profesional y no perderse en configuracion.

---

## 3. Ground Truth y Fuentes Obligatorias

Este modulo no busca paridad visual tipo Word/Classroom, pero si requiere evidencia operativa. Antes de ejecutar fases, leer:

- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`
- `Documentacion/02-operacion/ENTORNO_LOCAL.md`
- `Documentacion/02-operacion/GUIA_PRUEBAS.md`
- `Documentacion/05-analisis-ia/INFRAESTRUCTURA_SUGERIDA.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `.github/workflows/ci.yml`
- `package.json`
- `backend/package.json`
- `backend/README.md`
- `.env.example`
- `backend/.env.example`

Carpeta de evidencia sugerida:

```text
context/infraestructura-ground-truth/
+-- 01-estado-actual/
+-- 02-evidencia-local/
+-- 03-evidencia-ci/
+-- 04-evidencia-deploy/
+-- 05-sqlite-actividad-academica/
```

Regla: no guardar secretos, URLs privadas con tokens, screenshots con API keys ni valores reales de `.env`.

---

## 4. Estado Actual Detectado

### 4.1 Frontend

- React Native 0.81.5, Expo 54.0.34, TypeScript 5.9.2.
- Scripts raiz:
  - `npm start`
  - `npm run start:dev`
  - `npm run web`
  - `npm run android`
  - `npm run ios`
  - `npm run lint`
  - `npm test`
  - `npm run format`
- Validacion global reciente:
  - `npx tsc --noEmit` OK.
  - `npm run lint -- --quiet` OK.
  - `npm test -- --runInBand` OK.

### 4.2 Backend

- Backend en `backend/api` con funciones serverless estilo Vercel.
- Dependencia principal: `mongodb`.
- Scripts backend actuales:
  - `npm start` -> `vercel dev`
  - `npm run deploy` -> `vercel --prod`
- Endpoints existentes:
  - `health`
  - `auth`
  - `sync`
  - `planeaciones`
  - `grupos`
  - `alumnos`
  - `recursos`
  - `plantillas`
  - `classroom/copiloto`
  - otros dominios academicos/sociales.
- IA multi-provider ya existe en `backend/lib/aiGateway.js`.

### 4.3 CI/GitHub

- GitHub Actions actual: `.github/workflows/ci.yml`.
- Jobs actuales:
  - TypeScript.
  - ESLint.
  - Jest.
- Corre en `push` y `pull_request` contra `main` y `development`.
- GitHub Project `PlanearIA Product OS` ya existe.
- Classroom quedo cerrado con issue #8.

### 4.4 Riesgos Detectados

- Documentacion backend contiene ejemplos legacy con secretos reales o placeholders inseguros; debe limpiarse.
- Backend no tiene scripts claros de validacion, smoke test ni lint propio.
- `ENTORNO_LOCAL.md` todavia depende de `vercel dev`; hay que decidir si se mantiene como ruta principal o se crea wrapper local mas simple.
- `ARQUITECTURA.md` menciona Vercel y versiones/estado que pueden estar desfasados respecto a la vision low-cost actual.
- AsyncStorage sigue siendo storage local principal; la migracion a SQLite requiere plan separado, evidencia y rollback.
- No hay estrategia formal para capturas/evidencia academica de cambios infra/storage.

---

## 5. Decisiones Arquitectonicas Base

- Mantener **monolito modular**. No microservicios.
- Mantener **frontend y backend en el mismo repositorio** mientras sea un proyecto solo.
- Usar GitHub Actions solo para validacion, no como tablero.
- Usar GitHub Projects para seguimiento operativo.
- Mantener Vercel como backend actual hasta que una fase compare y justifique Render/Railway/self-host.
- No introducir Docker en la primera pasada salvo que resuelva una demo o backend local con menos friccion.
- No migrar a SQLite dentro de esta fase sin plan especifico de storage.
- Preparar SQLite como proximo gran cambio de persistencia local, con evidencia antes/despues y entregables academicos.
- No ejecutar deploys, tuneles publicos, Docker o cambios de proveedor cloud sin decision explicita del usuario.
- No instalar dependencias nuevas para infraestructura si un script/documentacion resuelve el problema.

### 5.1 Alcance de la Siguiente Fase

La Fase 1 debe enfocarse solo en **reproducibilidad local**:

- Scripts de `package.json`.
- Scripts o wrappers para backend si reducen friccion.
- Comandos focalizados de tests.
- Documentacion clara en README/ENTORNO_LOCAL.
- Evidencia de validacion.

No pertenece a Fase 1:

- Migrar a SQLite.
- Cambiar Vercel/Render/Railway.
- Activar deploy automatico.
- Instalar Docker.
- Crear dev builds/EAS.
- Tocar secretos reales.

---

## 6. Modo de Trabajo Recomendado

- `NORMAL`: Fase 0, decisiones de hosting, seguridad, costos, SQLite y documentacion academica.
- `CAVEMAN`: scripts, ajustes de docs, workflows, env examples, smoke tests y actualizacion de GitHub Project.
- Modelo sugerido:
  - Planear/auditar: razonamiento alto.
  - Implementar scripts/docs mecanicos: razonamiento medio.
  - Seguridad/variables/deploy: razonamiento alto.

---

## 7. Fases de Ejecucion

### FASE 0: Auditoria Operativa y Cierre de Classroom

Objetivo: dejar oficialmente atras Classroom y abrir Infraestructura con estado real, no supuesto.

GitHub/CI - Fase 0:

- Issue/Project item: `https://github.com/RitualBoat/PlanearIA/issues/9`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `docs`, `testing`, `low-cost`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Done`.
- Scripts obligatorios:
  - `git status --short`
  - `gh project item-list 1 --owner RitualBoat`
  - `npx tsc --noEmit`
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand`
- GitHub Actions: revisar ultimo run de CI en `development`.

Tareas:

- [x] **0.1 Confirmar que `PLAN_CLASSROOM.md` esta cerrado.**
- [x] **0.2 Confirmar que issue #8 y epic Classroom estan en `Done`.**
- [x] **0.3 Inventariar scripts de raiz y backend.**
- [x] **0.4 Inventariar workflows actuales.**
- [x] **0.5 Inventariar env examples sin leer/filtrar secretos reales.**
- [x] **0.6 Crear carpeta `context/infraestructura-ground-truth/` para evidencia.**
- [x] **0.7 Registrar baseline tecnico de validaciones.**

Criterio de cierre:

- [x] Classroom queda marcado como cerrado en README, roadmap, plan e indices.
- [x] Infraestructura queda como plan activo.
- [x] Existe evidencia de estado actual y comandos base.

---

### FASE 1: Scripts Reproducibles Para Desarrollador Solo

Objetivo: que levantar y validar PlanearIA sea obvio desde la raiz del repo.

GitHub/CI - Fase 1:

- Issue/Project item: `Infraestructura Fase 1 - Scripts reproducibles`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `testing`, `docs`, `low-cost`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Done`.
- Scripts obligatorios:
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand`
  - `npx tsc --noEmit`

Tareas:

- [ ] **1.1 Evaluar si agregar script raiz `check` que corra typecheck, lint y tests.**
- [ ] **1.2 Evaluar scripts raiz para backend: `backend:install`, `backend:dev`, `backend:deploy`.**
- [ ] **1.3 Crear scripts focalizados utiles: `test:classroom`, `test:planeaciones`, `test:sync`.**
- [ ] **1.4 Documentar comandos en `ENTORNO_LOCAL.md` y README.**
- [ ] **1.5 Evitar scripts que dependan de herramientas globales no documentadas.**

Criterio de cierre:

- [ ] Un agente nuevo puede saber que comando correr para validar todo.
- [ ] Un estudiante puede levantar frontend/backend local sin buscar en cinco documentos.

---

### FASE 2: Variables de Entorno, Secrets y Perfiles Local/Web/Movil

Objetivo: evitar errores de red, secrets expuestos y configuraciones ambiguas entre web, celular y backend.

GitHub/CI - Fase 2:

- Issue/Project item: `Infraestructura Fase 2 - Env vars y perfiles locales`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `docs`, `low-cost`, `needs-input` si requiere decision.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Review Manual` si requiere pruebas en celular.
- Scripts obligatorios:
  - `npx tsc --noEmit`
  - `npm run lint -- --quiet`

Tareas:

- [ ] **2.1 Revisar `.env.example` y `backend/.env.example`.**
- [ ] **2.2 Eliminar cualquier ejemplo que parezca secreto real en docs backend.**
- [ ] **2.3 Documentar matriz de URLs: web localhost, celular LAN, backend local, backend cloud.**
- [ ] **2.4 Validar que API keys IA solo vivan en backend.**
- [ ] **2.5 Documentar `AI_DEV_MODE` con warning y limite dev.**
- [ ] **2.6 Confirmar `.gitignore` para `.env`, `.env.local`, produccion local y archivos sensibles.**
- [ ] **2.7 Preparar checklist de prueba de red para celular fisico.**

Criterio de cierre:

- [ ] Ningun secreto real queda en README/docs.
- [ ] Hay guia clara para web y celular fisico.
- [ ] Backend y frontend comparten `API_SECRET` solo como configuracion local segura.

---

### FASE 3: Backend Local y Smoke Tests

Objetivo: comprobar backend sin depender de intuicion o clicks manuales.

GitHub/CI - Fase 3:

- Issue/Project item: `Infraestructura Fase 3 - Backend local y health smoke`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `testing`, `low-cost`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Done` o `Review Manual` si se valida celular.
- Scripts obligatorios:
  - `npm test -- --runInBand`
  - smoke local documentado: `GET /api/health`

Tareas:

- [ ] **3.1 Decidir si `vercel dev` sigue siendo backend local principal.**
- [ ] **3.2 Evaluar wrapper local simple si `vercel dev` genera friccion.**
- [ ] **3.3 Crear/documentar smoke test para `/api/health`.**
- [ ] **3.4 Documentar prueba de `EXPO_PUBLIC_API_URL` desde web y celular.**
- [ ] **3.5 Verificar timeouts y errores de red para contextos que hacen polling.**
- [ ] **3.6 Registrar capturas/logs sin secretos en `context/infraestructura-ground-truth/02-evidencia-local/`.**

Criterio de cierre:

- [ ] Backend local responde health check.
- [ ] Web y celular pueden apuntar al backend correcto.
- [ ] Los errores de red quedan como estados manejados, no LogBox ruidoso.

---

### FASE 4: CI Robusto Pero Barato

Objetivo: mejorar GitHub Actions sin gastar minutos innecesarios ni bloquear el desarrollo solo.

GitHub/CI - Fase 4:

- Issue/Project item: `Infraestructura Fase 4 - CI barato y confiable`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `testing`, `docs`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Done`.
- Scripts obligatorios:
  - CI remoto en branch/PR.
  - `npx tsc --noEmit`
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand`

Tareas:

- [ ] **4.1 Revisar si CI debe instalar tambien `backend/` con `npm ci`.**
- [ ] **4.2 Evaluar agregar job de smoke/static check para backend.**
- [ ] **4.3 Mantener cache npm y concurrency actual.**
- [ ] **4.4 Evitar EAS/deploy automatico hasta tener decision de release.**
- [ ] **4.5 Documentar como leer runs de GitHub Actions.**
- [ ] **4.6 Registrar evidencia en `context/infraestructura-ground-truth/03-evidencia-ci/`.**

Criterio de cierre:

- [ ] CI valida lo importante sin volverse lento.
- [ ] Un fallo de CI indica accion clara.
- [ ] El plan documenta que Actions valida, Project gestiona trabajo.

---

### FASE 5: Estrategia Low-Cost de Deploy y Demo

Objetivo: elegir una ruta realista para mostrar PlanearIA fuera de la laptop cuando sea necesario.

GitHub/CI - Fase 5:

- Issue/Project item: `Infraestructura Fase 5 - Deploy low-cost y demo`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `low-cost`, `docs`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Review Manual`.
- Scripts obligatorios:
  - Validaciones locales antes de cualquier deploy.
  - Si se hace deploy, registrar URL y health check sin secretos.

Tareas:

- [ ] **5.1 Comparar Vercel, Render, Railway, self-host laptop y MongoDB Atlas M0.**
- [ ] **5.2 Decidir si se mantiene Vercel actual para backend o se migra a Render.**
- [ ] **5.3 Definir demo web: local, tunnel temporal, Vercel/Render o Expo.**
- [ ] **5.4 Definir demo movil: Expo Go/dev build/EAS segun necesidades nativas.**
- [ ] **5.5 Documentar costos, limites free tier, cold starts y riesgos.**
- [ ] **5.6 Registrar evidencia en `context/infraestructura-ground-truth/04-evidencia-deploy/`.**

Criterio de cierre:

- [ ] Hay decision de deploy para demos.
- [ ] Hay opcion de fallback local si el free tier falla.
- [ ] No se agregan costos recurrentes sin decision explicita del usuario.

---

### FASE 6: Preparacion SQLite y Evidencia Academica

Objetivo: preparar la futura migracion AsyncStorage -> SQLite sin mezclarla todavia con deploy.

Esta fase existe por dos razones:

- PlanearIA necesitara SQLite/Expo SQLite para datos relacionales mas robustos.
- El usuario tiene una actividad academica relacionada con exploracion de alternativas y necesitara evidencia antes/despues cuando se haga la migracion.

GitHub/CI - Fase 6:

- Issue/Project item: `Infraestructura Fase 6 - Preparacion SQLite y evidencia academica`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI` o futuro `Ciclo Storage SQLite`.
- Labels: `fase`, `infra`, `offline-first`, `docs`, `testing`, `needs-input`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Review Manual`.
- Scripts obligatorios:
  - `npx tsc --noEmit`
  - `npm test -- --runInBand`
  - tests focalizados de sync/storage cuando existan.

Tareas:

- [ ] **6.1 Inventariar claves AsyncStorage actuales por modulo.**
- [ ] **6.2 Identificar datos relacionales que sufren en AsyncStorage: grupos, alumnos, unidades, actividades, entregas, calificaciones, asistencia.**
- [ ] **6.3 Comparar alternativas: AsyncStorage, Expo SQLite, WatermelonDB, Realm, Mongo local.**
- [ ] **6.4 Definir decision preliminar: Expo SQLite como primera opcion low-cost si no aparece bloqueo.**
- [ ] **6.5 Crear plan futuro especifico `Plan Maestro: Storage Local SQLite y Migracion Offline`.**
- [ ] **6.6 Preparar checklist de capturas antes/despues para la tarea academica.**
- [ ] **6.7 Pedir o leer el PDF de la actividad cuando toque ejecutar la migracion.**

Evidencia academica sugerida para `Actividad 8 - Fase 2 - Exploracion de alternativas`:

Capturas antes:

- [ ] Pantalla/app funcionando con datos locales actuales.
- [ ] Fragmento o diagrama del flujo actual `Screen -> ViewModel -> Context/Service -> AsyncStorage`.
- [ ] Terminal con `npx tsc --noEmit` y tests pasando antes de migrar.
- [ ] Ejemplo de modulo que usa AsyncStorage sin mostrar datos sensibles.
- [ ] Problema actual: datos relacionales dispersos o dificultad de consultas, explicado con captura/diagrama.

Capturas despues:

- [ ] Nuevo diagrama `Screen -> ViewModel -> Repository -> SQLite -> Sync`.
- [ ] Evidencia de schema/tablas o migracion ejecutada.
- [ ] Misma pantalla funcionando despues de migrar.
- [ ] Terminal con typecheck/tests pasando despues.
- [ ] Evidencia de rollback o backup local.

Entregables probables:

- [ ] Matriz de alternativas con criterios: costo, complejidad, offline, relaciones, performance, mantenimiento, compatibilidad Expo.
- [ ] Justificacion de decision.
- [ ] Diagrama antes/despues.
- [ ] Plan de migracion incremental.
- [ ] Riesgos y mitigaciones.
- [ ] Evidencia visual y tecnica.

Criterio de cierre:

- [ ] No se migra a SQLite todavia salvo decision explicita.
- [ ] La tarea academica queda preparada con lista de evidencias.
- [ ] Existe plan futuro recomendado para storage.

---

### FASE 7: Documentacion, Runbooks y Cierre

Objetivo: dejar infraestructura documentada como sistema operativo del proyecto.

GitHub/CI - Fase 7:

- Issue/Project item: `Infraestructura Fase 7 - Docs, runbooks y cierre`.
- Milestone: `Ciclo 3 - Infraestructura Local y CI`.
- Labels: `fase`, `infra`, `docs`, `testing`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Done`.
- Scripts obligatorios:
  - `npx tsc --noEmit`
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand`

Tareas:

- [ ] **7.1 Actualizar `README.md`.**
- [ ] **7.2 Actualizar `Documentacion/README.md`.**
- [ ] **7.3 Actualizar `ENTORNO_LOCAL.md`.**
- [ ] **7.4 Actualizar `GUIA_PRUEBAS.md`.**
- [ ] **7.5 Actualizar `GITHUB_PRODUCT_OS.md` si cambian reglas.**
- [ ] **7.6 Registrar decisiones de deploy y storage pendiente.**
- [ ] **7.7 Actualizar GitHub Project y cerrar issues.**
- [ ] **7.8 Commit solo cuando el usuario lo pida o confirme.**

Criterio de cierre:

- [ ] Cualquier IA/desarrollador puede levantar el proyecto.
- [ ] CI local/remoto tiene comandos claros.
- [ ] No hay secretos en docs.
- [ ] La ruta de deploy/demo queda decidida o explicitamente pospuesta.
- [ ] SQLite queda como plan futuro con evidencia academica preparada.

---

## 8. Checklist Manual de Cierre

- [ ] `npm install` funciona desde raiz.
- [ ] `npm run web` levanta la app.
- [ ] `npx tsc --noEmit` pasa.
- [ ] `npm run lint -- --quiet` pasa.
- [ ] `npm test -- --runInBand` pasa.
- [ ] Backend local responde `/api/health`.
- [ ] Web puede hablar con backend local.
- [ ] Celular fisico puede hablar con backend local usando IP LAN.
- [ ] CI remoto en GitHub Actions pasa.
- [ ] No hay secretos reales en README/docs.
- [ ] GitHub Project refleja fases activas/cerradas.

---

## 9. Open Questions

- [ ] Confirmar si el backend debe seguir en Vercel o evaluar Render como default para demo.
- [ ] Confirmar si se permitira instalar Vercel CLI globalmente o se prefiere `npx vercel`.
- [ ] Confirmar si se desea tunnel temporal para demos externas desde laptop.
- [ ] Confirmar si Expo EAS se usara solo cuando haya build movil real o antes para previews.
- [ ] Confirmar cuando leer/extraer formalmente requisitos del PDF de la actividad de SQLite.

---

## 10. Tracking Operativo en GitHub Projects

Estado inicial recomendado:

- [x] Epic `Plan Maestro: Infraestructura Local, CI y Deploy Basico` movida a `In progress`.
- [x] Crear issue de Fase 0 al iniciar ejecucion: `https://github.com/RitualBoat/PlanearIA/issues/9`.
- [x] Issue #9 cerrado y movido a `Done` con evidencia baseline.
- [ ] Crear issues de fases posteriores solo cuando esten cercanas.
- [ ] Mantener tareas internas como checkboxes del issue activo.

Regla:

- Si una fase cambia a `[~]`, mover item a `In progress`.
- Si una fase cambia a `[x]`, mover item a `Done` o `Review Manual`.
- Si requiere decision del usuario, agregar `needs-input`.

---

## 11. Criterio de Cierre del Plan

Este plan se considera completado cuando:

- [ ] Entorno local documentado y probado.
- [ ] Scripts reproducibles existen o estan justificados.
- [ ] CI local/remoto pasa.
- [ ] Backend local/cloud tiene ruta de demo clara.
- [ ] Variables de entorno estan documentadas sin secretos.
- [ ] Se decidio mantener o cambiar Vercel/Render/Railway/self-host.
- [ ] SQLite queda preparado como plan futuro con evidencia academica.
- [ ] GitHub Project y README quedan actualizados.
