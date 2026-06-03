# Plan Maestro: Pasos Iniciales de Reorientacion - PlanearIA

> **Version:** 1.0  
> **Fecha:** 2026-05-30  
> **Estado:** [x] Plan inicial completado
> **Alcance:** ordenar el proyecto despues del cierre de Planeaciones Fase 9, alinear GitHub/GitHub Projects, preparar entorno local, definir la secuencia de nuevos planes maestros y convertir la nueva vision de producto en una ruta ejecutable.  
> **Stack base:** React Native 0.81.5, Expo 54, TypeScript 5.9, React Navigation 7, AsyncStorage, backend Node actual en `backend/api`, MongoDB Atlas/free tier, IA gateway multi-provider, Jest + Testing Library.  
> **Mandato:** monolito modular, desarrollo local primero, bajo costo, cero friccion para docentes y UX inspirada en Word, Classroom, Canva, Excel y WhatsApp.

---

## 1. Resumen Ejecutivo

PlanearIA deja de organizarse como una suma de modulos sueltos y pasa a organizarse como un conjunto de experiencias docentes familiares:

- **Planeaciones = Word/Docs.**
- **Grupos, alumnos, tareas, materiales, asistencia y calificaciones = Classroom.**
- **Diseno didactico = Canva/Genially.**
- **Listas, asistencia libre, boletas y registros = Excel.**
- **Chat, contactos y colaboracion docente = WhatsApp profesional.**
- **Reportes y gamificacion = hub separado para cierre de ciclo.**

La prioridad inmediata ya no es agregar mas funciones aisladas. La prioridad es ordenar el proyecto para que cada modulo futuro tenga un plan maestro, se integre al flujo global y no rompa navegacion, costos ni mantenibilidad.

Este plan no construye todavia Classroom, Canva ni Excel. Este plan prepara el terreno para hacerlo bien.

---

## 2. Ground Truth Leido Para Este Plan

Este plan se basa en los documentos y estado actual siguientes:

- `README.md`.
- `Documentacion/README.md`.
- `Documentacion/meta_guia_planes.md`.
- `Documentacion/VISION_ACTUAL.md`.
- `Documentacion/INFRAESTRUCTURA_SUGERIDA.md`.
- `Documentacion/OPINION_DE_IA_TRAS_LEER_META_GUIA_PLANEACIONES.md`.
- `Documentacion/REVISION-GPT-TRAS-LEER-ARCHIVOS-DOCUMENTACION.md`.
- `Documentacion/plan_planeaciones.md`.
- `context/referencias-opensource/README.md`.
- Estructura actual de `src/screens`, `src/context`, `src/hooks`, `src/services`, `src/navigation`, `backend/api` y `types`.

Hallazgo principal: PlanearIA ya tiene suficiente base funcional para avanzar, pero necesita una capa de organizacion fuerte antes de que los siguientes refactors aumenten la deuda.

---

## 3. Estado Actual del Proyecto

### 3.1 Producto

- La app no esta en produccion.
- No hay usuarios reales ni datos productivos que proteger.
- Se permiten cambios fuertes, poda de legacy, reorganizacion de flujos y reseteos de datos de prueba.
- La nueva vision exige cero friccion y herramientas familiares.

### 3.2 Codigo

- Frontend React Native + Expo con soporte web/movil.
- Navegacion con stack + tabs.
- Muchos modulos existentes pero fragmentados: planeaciones, contenido, grupos, alumnos, asistencia, calificaciones, tareas, biblioteca, plantillas, feed, social, chat, notificaciones, cuenta, auth, onboarding y ayuda.
- Planeaciones Fase 9 queda cerrada como primera gran refactorizacion del proyecto.
- Existen cambios pendientes en working tree relacionados con hardening offline/network, documentos fundacionales y referencias open source.

### 3.3 Documentacion

- `meta_guia_planes.md` ya define estandar de planes maestros.
- `VISION_ACTUAL.md` define el manifiesto de cero friccion.
- `INFRAESTRUCTURA_SUGERIDA.md` confirma monolito modular y bajo costo.
- `context/referencias-opensource/README.md` deja referencias externas curadas con restricciones de licencia.

### 3.4 Riesgo Principal

El mayor riesgo no es tecnico. Es de enfoque: intentar construir todos los modulos al mismo tiempo. La respuesta es trabajar por planes maestros y ciclos cortos, empezando por Classroom como siguiente experiencia central.

---

## 4. Decisiones Arquitectonicas Rectoras

- [x] **Monolito modular.** Un solo producto y un solo backend logico por ahora, con carpetas y dominios internos bien separados.
- [x] **Monorepo por ahora.** Mantener frontend, backend y documentacion en el mismo repositorio para reducir friccion.
- [x] **Desarrollo local primero.** La laptop del desarrollador es el laboratorio principal.
- [x] **Bajo costo antes que infraestructura elegante.** No pagar por APIs, hosting o servicios hasta que haya demo/piloto real que lo justifique.
- [x] **Offline-first.** Mantener fuente local inmediata y sincronizacion posterior.
- [x] **IA como copiloto.** La IA sugiere, transforma, escanea o resume; no reemplaza decision docente.
- [x] **UX familiar.** Cada modulo debe parecerse a una herramienta que el docente ya conoce.
- [x] **Poda sobre acumulacion.** Pantalla que duplica flujo, se fusiona, redirige u oculta.

---

## FASE 0: Organizacion de GitHub y Proyecto

### Objetivo

Convertir GitHub en el centro de control del desarrollo, sin burocracia de empresa grande.

### Tareas

- [x] **0.1 Definir ramas oficiales:**
  - `main`: estable, solo commits validados.
  - `development`: rama activa diaria.
  - `feature/*`: cambios por plan/fase.
  - `docs/*`: cambios documentales grandes.
  - `fix/*`: bugs puntuales.

- [x] **0.2 Crear GitHub Project principal:**
  - **Avance:** guia operativa creada en `Documentacion/GITHUB_PRODUCT_OS.md`.
  - **Cierre 2026-06-03:** Project v2 verificado en GitHub (`PlanearIA Product OS`) y vinculado al repo.
  - Nombre recomendado: `PlanearIA Product OS`.
  - Vista 1: Kanban operativo.
  - Vista 2: Roadmap por epic.
  - Vista 3: Bugs y validacion manual.

- [x] **0.3 Definir columnas del tablero:**
  - **Avance:** columnas definidas en `Documentacion/GITHUB_PRODUCT_OS.md`.
  - **Cierre 2026-06-03:** campo `Status` verificado con columnas Inbox, Backlog, Ready, In progress, Review Manual, Blocked, Done y Parked.
  - `Inbox`.
  - `Backlog`.
  - `Ready`.
  - `In Progress`.
  - `Review Manual`.
  - `Blocked`.
  - `Done`.
  - `Parked`.

- [x] **0.4 Crear labels base:**
  - **Avance:** labels documentadas y script `scripts/github-bootstrap.ps1` preparado.
  - **Cierre 2026-06-03:** `scripts/github-bootstrap.ps1` ejecutado con `gh`; labels base creadas/verificadas.
  - `epic`.
  - `plan-maestro`.
  - `fase`.
  - `bug`.
  - `ux-ui`.
  - `legacy`.
  - `offline-first`.
  - `ai`.
  - `infra`.
  - `docs`.
  - `testing`.
  - `needs-input`.
  - `low-cost`.

- [x] **0.5 Crear milestones/ciclos ligeros:**
  - **Avance:** milestones documentados y script `scripts/github-bootstrap.ps1` preparado.
  - **Cierre 2026-06-03:** `scripts/github-bootstrap.ps1` ejecutado con `gh`; milestones creados/verificados.
  - `Ciclo 0 - Reorientacion y GitHub`.
  - `Ciclo 1 - Plan Classroom`.
  - `Ciclo 2 - Fundacion Classroom`.
  - `Ciclo 3 - UX/Navegacion Global`.

- [x] **0.6 Crear templates de issues:**
  - Bug report.
  - Tarea tecnica.
  - Validacion manual.
  - Solicitud de plan maestro.
  - Decision arquitectonica.

- [x] **0.7 Crear plantilla de Pull Request:**
  - Resumen.
  - Archivos tocados.
  - Validacion ejecutada.
  - Riesgos.
  - Screenshots/capturas si aplica.
  - Checklist de no romper navegacion.

---

## FASE 1: Preparacion del Entorno Local

### Objetivo

Que el proyecto pueda levantarse de forma repetible en la laptop y en celular fisico sin depender de produccion.

### Tareas

- [x] **1.1 Documentar flujo local frontend:**
  - `npm install`.
  - `npm run web`.
  - `npm run android`.
  - `npm run start:dev` para dev client cuando haga falta.

- [x] **1.2 Documentar flujo local backend:**
  - `cd backend`.
  - `npm install`.
  - `vercel dev` o alternativa local Node si se migra.
  - Confirmar puerto local.

- [x] **1.3 Corregir/documentar uso de IP LAN:**
  - En web puede usarse `http://localhost:3000`.
  - En celular fisico debe usarse `http://IP_DE_LA_LAPTOP:3000`.
  - Documentar esto en `.env.example` y docs de desarrollo.

- [x] **1.4 Preparar variables de entorno seguras:**
  - `.env.example` raiz.
  - `backend/.env.example`.
  - No commitear secrets.
  - Explicar `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_SECRET`, `API_SECRET`, proveedores IA y `AI_DEV_MODE`.

- [x] **1.5 Decidir estrategia IA local temporal:**
  - Mantener gateway multi-provider actual.
  - Usar fallbacks heuristicos durante desarrollo.
  - Evaluar despues Ollama/LM Studio si aporta valor real.
  - No gastar APIs salvo demo o validacion especifica.

- [x] **1.6 Registrar comandos de verificacion rapida:**
  - `npx tsc --noEmit`.
  - `npm run lint -- --quiet`.
  - `npm test -- --runInBand`.
  - Tests focalizados por modulo.

---

## FASE 2: GitHub Actions y Quality Gates

### Objetivo

Automatizar validaciones basicas sin sobredisenar CI/CD.

### Tareas

- [x] **2.1 Crear workflow `ci.yml`:**
  - **Avance:** workflow creado en `.github/workflows/ci.yml`.
  - **Validacion local:** `npx tsc --noEmit`, `npm run lint -- --quiet` y `npm test -- --runInBand` OK.
  - **Cierre 2026-06-03:** corrida remota de GitHub Actions observada en verde despues del push a `development`; jobs TypeScript, ESLint y Jest OK.
  - **Hardening 2026-06-03:** `actions/checkout` y `actions/setup-node` actualizados a v6 para evitar la advertencia de deprecacion de Node 20 en Actions.
  - Instalar dependencias.
  - Ejecutar TypeScript.
  - Ejecutar lint.
  - Ejecutar tests.

- [x] **2.2 Agregar cache de npm:**
  - Reducir tiempo de CI.
  - Evitar pasos innecesarios.

- [x] **2.3 Separar jobs opcionales:**
  - `typecheck`.
  - `lint`.
  - `test`.

- [x] **2.4 No desplegar todavia:**
  - El primer GitHub Actions debe validar, no publicar.
  - Deploy vendra cuando haya beta cerrada o demo estable.

- [x] **2.5 Agregar proteccion contra secrets:**
  - Verificar que `.env.local`, `backend/.env.local` y keys no se suban.
  - Revisar `.gitignore`.

- [x] **2.6 Definir criterio de merge:**
  - No mergear a `main` si CI falla.
  - No cerrar plan/fase sin validacion manual cuando toque UX.

---

## FASE 3: Poda y Mapa de Modulos Existentes

### Objetivo

Crear una fotografia real de modulos actuales antes de empezar Classroom.

### Tareas

- [x] **3.1 Crear inventario de pantallas actuales:**
  - `src/screens/grupos`.
  - `src/screens/alumnos`.
  - `src/screens/asistencia`.
  - `src/screens/calificaciones`.
  - `src/screens/tareas`.
  - `src/screens/biblioteca`.
  - `src/screens/plantillas`.
  - `src/screens/feed`.
  - `src/screens/social`.
  - `src/screens/chat`.

- [x] **3.2 Clasificar cada pantalla:**
  - Fusionar dentro de experiencia madre.
  - Mantener como subflujo.
  - Ocultar temporalmente.
  - Eliminar cuando haya reemplazo.

- [x] **3.3 Auditar navegacion global:**
  - `StackNavigator`.
  - `AppTabsNavigator`.
  - Entradas desde `ContenidoScreen`.
  - FAB y modales de creacion.

- [x] **3.4 Definir mapa de experiencias madre:**
  - Word.
  - Classroom.
  - Canva.
  - Excel.
  - WhatsApp.
  - Reportes.
  - Cuenta/Auth.

- [x] **3.5 Crear decision record:**
  - Que se fusiona primero.
  - Que se deja congelado.
  - Que no se tocara todavia.

---

## FASE 4: Secuencia de Planes Maestros Nuevos

### Objetivo

Definir el orden de planes futuros sin escribirlos todavia.

### Orden recomendado

- [x] **4.1 Plan Maestro: Classroom / Grupos y Recursos.**
  - Siguiente prioridad real.
  - Debe fusionar grupos, alumnos, tareas, recursos, entregables, asistencia y calificaciones dentro de una experiencia tipo Google Classroom.
  - Debe leer `context/referencias-opensource/classroomio-classroom`, `kalvi-classroom` y `webdesk-legacy-classroom` como inspiracion, sin copiar codigo AGPL/no-license.

- [x] **4.2 Plan Maestro: UX/UI y Navegacion Global.**
  - Debe asegurar que los modulos no queden aislados.
  - Puede ir antes o en paralelo al plan Classroom si la navegacion actual empieza a estorbar.

- [x] **4.3 Plan Maestro: Infraestructura Local, GitHub Actions y Deploy Basico.**
  - Debe formalizar entorno local, CI, variables, backend, GitHub Actions y opcion de demo.
  - No debe saltar a infraestructura cara.

- [x] **4.4 Plan Maestro: Auth, Seguridad y Sesion Real.**
  - Necesario antes de beta con usuarios reales.
  - JWT, recovery, emails, secure storage y roles.

- [x] **4.5 Plan Maestro: Excel / Listas y Sincronizacion Bidireccional.**
  - Despues de Classroom base.
  - Debe conectar listas libres con alumnos, asistencia y calificaciones.

- [x] **4.6 Plan Maestro: Calificacion y Revision de Tareas.**
  - Debe construir post-its inteligentes IA sin que la IA califique automaticamente.
  - Puede integrarse al plan Classroom si se decide reducir planes.

- [x] **4.7 Plan Maestro: Calendario y Seguimiento Personal.**
  - Debe sincronizar con calendario nativo/web cuando sea viable.

- [x] **4.8 Plan Maestro: WhatsApp Docente / Chat y Contactos.**
  - Debe reemplazar el enfoque de red social pesada por comunicacion directa.

- [x] **4.9 Plan Maestro: Canva / Diseno Didactico.**
  - Debe esperar a que Classroom tenga base, salvo que se necesite demo visual.
  - Debe leer `yft-canva` y `rishah-canvas`.

- [x] **4.10 Plan Maestro: Reportes y Gamificacion.**
  - Debe dejarse al final porque depende de datos reales de clases, tareas, asistencia y calificaciones.

---

## FASE 5: Primer Ciclo de Trabajo Recomendado

### Ciclo 0 - Reorientacion y GitHub

Duracion sugerida: 3 a 5 dias.

- [x] Cerrar/documentar Fase 9 de Planeaciones.
- [x] Commitear documentos fundacionales y referencias open source.
- [x] Crear GitHub Project.
- [x] Crear labels y milestones.
- [x] Crear templates de issue/PR.
- [x] Crear primer workflow CI sin deploy.
- [x] Actualizar `.env.example` y docs de entorno local.

### Ciclo 1 - Plan Classroom

Duracion sugerida: 2 a 4 dias para planear, no programar.

- [x] Leer meta guia completa.
- [x] Leer referencias Classroom curadas.
- [x] Auditar codigo actual de grupos/alumnos/tareas/asistencia/calificaciones.
- [x] Crear plan maestro Classroom con fases y tracking.
- [x] Decidir que se fusiona, que se oculta y que se elimina.

**Cierre 2026-06-03:** se creo `Documentacion/PLAN_CLASSROOM.md` como siguiente plan maestro. Classroom queda definido como experiencia madre para grupos, alumnos, materiales, actividades, entregables, asistencia, calificaciones y reportes operativos.

### Ciclo 2 - Fundacion Classroom

Duracion sugerida: 1 a 2 semanas.

Estado: transferido a `Documentacion/PLAN_CLASSROOM.md`. Este ciclo ya no se ejecuta dentro del plan inicial; se retomara cuando el usuario confirme empezar el Plan Maestro Classroom.

- [ ] Implementar solo la primera fase del plan Classroom.
- [ ] Crear flujo central: grupo -> unidades -> materiales/actividades -> alumnos.
- [ ] No construir gamificacion ni IA avanzada todavia.

---

## Criterios de Cierre de Este Plan

Este plan se puede cerrar cuando:

- [x] GitHub Project existe y refleja los modulos madre.
- [x] Labels, milestones e issue templates estan listos.
- [x] CI basico corre en GitHub Actions. Workflow creado, validado localmente y observado en verde en `development`.
- [x] README y documentacion explican la nueva vision.
- [x] El entorno local esta documentado para web y celular fisico.
- [x] Existe un orden aceptado de planes maestros futuros.
- [x] El siguiente plan maestro elegido es Classroom.
- [x] Existe `Documentacion/PLAN_CLASSROOM.md` como plan maestro listo para ejecutar.
- [x] No quedan dudas sobre que Planeaciones Fase 9 esta cerrada y el proyecto entra a reorientacion.

---

## Notas Para Futuras IAs

- No generar planes nuevos sin leer `Documentacion/meta_guia_planes.md`.
- No proponer microservicios.
- No proponer gastos recurrentes antes de justificar valor.
- No copiar codigo de referencias AGPL/GPL/custom/no-license.
- No construir pantallas aisladas sin revisar navegacion.
- No revivir formularios legacy si contradicen la vision de cero friccion.
- Si una decision requiere cuenta externa, tarjeta, hosting o API key, pedir confirmacion antes.

---

## Estado Inicial de Tracking

- [x] **T.1 Crear este plan maestro inicial.**
- [x] **T.2 Registrar nueva prioridad: organizacion + Classroom como siguiente gran plan.**
- [x] **T.3 Vincular este plan con README y documentacion principal.**
- [x] **T.4 Ejecutar Ciclo 0.** Project, labels, milestones, templates, docs, commit/push y CI remoto observados en verde.
- [x] **T.5 Crear Plan Maestro Classroom.** Creado en `Documentacion/PLAN_CLASSROOM.md`.

**Cierre del plan inicial 2026-06-03:** PlanearIA queda organizado para la nueva vision: Planeaciones Fase 9 cerrada, GitHub Product OS creado, CI inicial operativo, entorno local documentado y `PLAN_CLASSROOM.md` listo como siguiente ciclo de trabajo.
