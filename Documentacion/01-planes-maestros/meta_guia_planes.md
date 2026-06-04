# Meta Guia de Planes Arquitectonicos - PlanearIA

> **Proposito:** esta guia define el estandar obligatorio para crear futuros planes maestros de refactorizacion o construccion de modulos en PlanearIA.  
> **Uso previsto:** entregar este archivo a futuras IAs antes de pedirles un plan de modulo.  
> **Regla central:** no generar planes superficiales. Cada plan debe partir del estado real del repo, del flujo docente real, del presupuesto disponible y de la arquitectura objetivo de PlanearIA.

---

## 1. Contexto Real de PlanearIA

PlanearIA es una plataforma integral para docentes, construida principalmente por un solo estudiante. Esto cambia las decisiones tecnicas:

- Se debe priorizar una ruta profesional pero alcanzable.
- Se debe cuidar el costo mensual.
- Se deben favorecer servicios con free tier, self-hosting local o despliegues simples.
- Se debe evitar infraestructura empresarial innecesaria antes de validar la app.
- Se debe documentar claramente cuando una opcion requiere pago, cuenta externa, dominio, tarjeta, build service o mantenimiento continuo.
- Se debe preferir una arquitectura que pueda lanzarse al final de una materia sin sacrificar calidad basica.

El desarrollador cuenta con una laptop potente:

- Ryzen 7 7735h.
- RTX 4060 8GB VRAM GDDR6.
- 64 GB RAM DDR5 4800MHZ.

Por lo tanto, futuros planes de infraestructura deben considerar tambien:

- Backend local para desarrollo.
- Docker local si aporta valor real.
- Servidor local temporal para demos.
- Procesos batch locales para IA, conversion de documentos o pruebas.
- Alternativas self-hosted cuando reduzcan costo sin romper la experiencia.

Antes de decidir infraestructura de produccion, la IA futura debe preguntar explicitamente que camino se desea:

- Free tier cloud simple.
- Backend local/self-hosted.
- VPS economico.
- Vercel/Serverless.
- Docker.
- FastAPI/Node.
- Hibrido.

---

## 2. Stack y Arquitectura Base

Todo plan futuro debe asumir este punto de partida, salvo que el codigo demuestre que cambio:

- Frontend: React Native 0.81.5 + Expo 54.
- Web: react-native-web.
- Lenguaje: TypeScript 5.9.
- Navegacion: React Navigation 7.
- Estado: React Context + hooks ViewModel.
- Arquitectura objetivo: MVVM.
- Persistencia local actual: AsyncStorage.
- Persistencia local objetivo para datos relacionales/pesados: SQLite/Expo SQLite o una capa equivalente evaluada en el plan de infraestructura.
- Sync: offline-first con cola de operaciones.
- Backend actual: funciones serverless Node en `backend/api`.
- Base remota actual: MongoDB Atlas.
- Auth actual: `AuthContext`, backend `auth.js`, JWT/API secret en evolucion.
- IA actual: endpoints en `backend/api/planeaciones/*`, proveedor OpenAI cuando hay `OPENAI_API_KEY`.
- Testing: Jest + Testing Library React Native.

Regla: la documentacion puede estar desfasada. La fuente de verdad para planear es el codigo actual, especialmente:

- `src/navigation/StackNavigator.tsx`.
- `src/navigation/AppTabsNavigator.tsx`.
- `src/context/`.
- `src/hooks/`.
- `src/services/`.
- `src/screens/`.
- `backend/api/`.
- `types/`.
- `Documentacion/01-planes-maestros/plan_planeaciones.md`.

---

## 3. Estado Actual Detectado de Modulos

Esta seccion no es un plan de refactorizacion. Es un mapa de referencia para que futuras IAs sepan que existe hoy.

### 3.1 Planeaciones

Estado:

- Tiene plan maestro cerrado en `Documentacion/01-planes-maestros/plan_planeaciones.md`.
- Ya existe modelo V2, contexto nuevo, editor, escaner, exportacion y copiloto IA.
- Fase 9 quedo aprobada; no reabrir salvo bug nuevo o decision explicita del usuario.

Archivos principales:

- `src/screens/planeaciones/`.
- `src/hooks/useCrearPlaneacionViewModel.ts`.
- `src/hooks/useDocEditorViewModel.ts`.
- `src/context/PlaneacionesContext.tsx`.
- `types/planeacionV2.ts`.
- `types/plantillaDocumento.ts`.
- `backend/api/planeaciones.js`.
- `backend/api/planeaciones/*`.

Regla: no crear otro plan de planeaciones sin leer completo `Documentacion/01-planes-maestros/plan_planeaciones.md`.

### 3.2 Contenido / Hub de Recursos

Estado:

- `ContenidoScreen` funciona como hub para planeaciones, recursos, entregables y plantillas.
- Es una pantalla transversal y puede bloquear o duplicar flujos si no se audita.

Archivos principales:

- `src/screens/contenido/ContenidoScreen.tsx`.
- `src/hooks/useContenidoViewModel.ts`.
- `src/components/CrearNuevoModal.tsx`.

Regla: cualquier plan de recursos, plantillas, entregables o planeaciones debe auditar este hub.

### 3.3 Recursos Didacticos / Biblioteca

Estado:

- Existe modulo `biblioteca` con lista y creacion de recursos.
- Hay `RecursosContext`, `useCrearRecursoViewModel`, `useListaRecursosViewModel`.
- Los recursos se conectan con contenido, grupos y asignaciones.
- Regla vigente: Classroom debe organizar, asignar, subir archivos simples o enlazar contenido; la creacion profunda de documentos, presentaciones, examenes visuales, hojas o piezas tipo Canva/Word/Excel debe vivir en sus modulos especializados.

Archivos principales:

- `src/screens/biblioteca/`.
- `src/context/RecursosContext.tsx`.
- `src/hooks/useCrearRecursoViewModel.ts`.
- `src/hooks/useListaRecursosViewModel.ts`.
- `backend/api/recursos.js`.
- Tipos `Recurso` en `types/index.ts`.

### 3.4 Recursos Evaluables / Tareas / Entregables

Estado:

- Hay rutas de tareas dentro de grupos.
- Hay `ListaEntregablesScreen`.
- Hay `EntregablesContext`.
- Existen flujos de calificar entregas y asignar recursos.
- Regla vigente: la calificacion debe nacer desde una actividad asignada y una entrega real; evitar pantallas de calificacion sueltas sin contexto de actividad/alumno.

Archivos principales:

- `src/screens/grupos/tareas/`.
- `src/screens/tareas/ListaEntregablesScreen.tsx`.
- `src/context/EntregablesContext.tsx`.
- `src/hooks/useCrearTareaGrupoViewModel.ts`.
- `src/hooks/useCalificarEntregasViewModel.ts`.
- `backend/api/entregables.js`.
- Tipos `Tarea` y `EntregaTarea` en `types/index.ts`.

### 3.5 Grupos

Estado:

- Modulo amplio con dashboard, lista, detalle, reportes, importacion y tareas.
- Es el centro operativo para alumnos, asistencia, calificaciones y entregables.
- Decision actual: dentro de una clase activa, la estructura principal debe parecerse a Classroom: `Tablon`, `Trabajo de clase` por secciones/unidades y `Personas`. No debe existir `Sin seccion` como apartado visible.

Archivos principales:

- `src/screens/grupos/`.
- `src/context/GruposContext.tsx`.
- `src/hooks/useGruposDashboardViewModel.ts`.
- `src/hooks/useDetalleGrupoViewModel.ts`.
- `src/hooks/useCrearGrupoViewModel.ts`.
- `src/services/gruposService.ts`.
- `src/services/grupoImportService.ts`.
- `src/services/grupoExportService.ts`.
- `src/services/grupoReportesService.ts`.
- `backend/api/grupos.js`.

### 3.6 Alumnos

Estado:

- Tiene pantallas CRUD, detalle, notas, importacion, exportacion y reportes.
- Debe integrarse con grupos, asistencia, calificaciones, entregables y reportes.

Archivos principales:

- `src/screens/alumnos/`.
- `src/context/AlumnosContext.tsx`.
- `src/hooks/useCrearAlumnoViewModel.ts`.
- `src/hooks/useNotasAlumnoViewModel.ts`.
- `src/hooks/useReportesAlumnoViewModel.ts`.
- `src/services/alumnoImportService.ts`.
- `src/services/alumnoExportService.ts`.
- `src/services/alumnoReportesService.ts`.
- `backend/api/alumnos.js`.

### 3.7 Asistencia

Estado:

- Tiene registro e historial.
- Depende de grupos y alumnos.

Archivos principales:

- `src/screens/asistencia/`.
- `src/context/AsistenciaContext.tsx`.
- `backend/api/asistencias.js`.
- Tipo `Asistencia` en `types/index.ts`.

### 3.8 Calificaciones

Estado:

- Tiene captura y promedios.
- Depende de grupos, alumnos, tareas y entregables.

Archivos principales:

- `src/screens/calificaciones/`.
- `src/context/CalificacionesContext.tsx`.
- `src/services/promediosService.ts`.
- `backend/api/calificaciones.js`.
- Tipo `Calificacion` en `types/index.ts`.

### 3.9 Plantillas

Estado:

- Existen plantillas legacy/generales separadas de `PlantillaDocumento` de planeaciones.
- Hay biblioteca, lista, detalle y editor.

Archivos principales:

- `src/screens/plantillas/`.
- `src/context/PlantillasContext.tsx`.
- `src/hooks/useEditorPlantillaViewModel.ts`.
- `src/hooks/useListaPlantillasViewModel.ts`.
- `backend/api/plantillas.js`.
- Tipo `Plantilla` en `types/index.ts`.

Regla: futuros planes deben decidir si se integran, migran o reemplazan, no mezclar sin criterio.

### 3.10 Feed / Red Social Educativa

Estado:

- Existe feed, detalle de post, retos, editor de preguntas y resultados.
- Se conecta con recursos y planeaciones compartidas.

Archivos principales:

- `src/screens/feed/`.
- `src/context/PostsContext.tsx`.
- `src/hooks/useFeedViewModel.ts`.
- `backend/api/posts.js`.
- Tipos `Post`, `PostComment`, `PostAttachment` en `types/index.ts`.

### 3.11 Social / Contactos

Estado:

- Existe pantalla social y buscador de perfiles.
- Hay contexto de contactos y servicio de invitacion.

Archivos principales:

- `src/screens/social/`.
- `src/context/ContactosContext.tsx`.
- `src/hooks/useSocialViewModel.ts`.
- `src/hooks/useBuscadorPerfilesViewModel.ts`.
- `src/services/inviteLinkService.ts`.
- `backend/api/contactos.js`.

### 3.12 Chat / Mensajeria

Estado:

- Existe lista de chat y pantalla de conversacion.
- Puede enviar texto, planeaciones y recursos.

Archivos principales:

- `src/screens/chat/`.
- `src/context/MensajesContext.tsx`.
- `src/hooks/useChatViewModel.ts`.
- `src/hooks/useConversacionViewModel.ts`.
- `backend/api/mensajes.js`.
- Tipos `Mensaje` y `Conversacion` en `types/index.ts`.

### 3.13 Notificaciones

Estado:

- Existe contexto, pantalla y servicio push.
- Expo Go tiene limitaciones para push en SDK moderno; planes futuros deben considerar dev build.

Archivos principales:

- `src/screens/notificaciones/`.
- `src/context/NotificacionesContext.tsx`.
- `src/services/pushNotificationService.ts`.
- `backend/api/notificaciones.js`.

### 3.14 Cuenta, Perfil, Configuracion y Accesibilidad

Estado:

- Cuenta tiene perfil, roles, terminos.
- Perfil tambien existe como modulo/pantalla.
- Hay providers de tema, fuente y daltonismo.

Archivos principales:

- `src/screens/cuenta/`.
- `src/screens/perfil/`.
- `src/context/ThemeContext.tsx`.
- `src/context/FontSizeContext.tsx`.
- `src/context/DaltonismoContext.tsx`.
- `src/hooks/useCuentaViewModel.ts`.
- `src/hooks/useEditarPerfilViewModel.ts`.
- `src/hooks/useAdminRolesViewModel.ts`.

### 3.15 Auth / Seguridad

Estado:

- Existe login, registro y recuperar contrasena.
- Hay `AuthContext`.
- Backend tiene `auth.js`.
- Seguridad real todavia debe endurecerse.

Archivos principales:

- `src/screens/auth/`.
- `src/context/AuthContext.tsx`.
- `src/hooks/useLoginViewModel.ts`.
- `src/hooks/useRegistroViewModel.ts`.
- `src/hooks/useRecuperarContrasenaViewModel.ts`.
- `backend/api/auth.js`.
- `backend/lib/auth.js`.

### 3.16 Onboarding y Ayuda

Estado:

- Existe onboarding.
- Existe centro de ayuda.
- Deben actualizarse cuando cambien flujos principales.

Archivos principales:

- `src/screens/onboarding/`.
- `src/screens/ayuda/`.

### 3.17 Infraestructura, Sync y Backend

Estado:

- Backend serverless en `backend/api`.
- Sync engine en `src/sync`.
- API config en `src/sync/config/apiConfig.ts`.
- Hay endpoints para alumnos, asistencias, auth, calificaciones, contactos, entregables, grupos, mensajes, notificaciones, planeaciones, plantillas, posts, recursos y sync.

Regla: cualquier plan grande debe auditar costos, free tiers y posibilidad de correr localmente.

---

## 4. Rol de la IA que Genere Planes

Toda IA que use esta guia debe actuar como:

- Arquitecto de software senior.
- Product designer orientado a docentes.
- Lead engineer de React Native, Expo y TypeScript.
- Auditor de legacy.
- Arquitecto offline-first.
- Lead prompt engineer para IA pedagogica.
- Consejero pragmatico de infraestructura de bajo costo.

La IA no debe generar el plan de un modulo sin revisar antes el estado actual del codigo.

---

## 5. Procedimiento Obligatorio Antes de Escribir un Plan

Antes de redactar cualquier plan futuro, la IA debe:

- Leer `README.md`.
- Leer `Documentacion/README.md`.
- Leer `Documentacion/00-fundamentos/ARQUITECTURA.md`.
- Leer `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`.
- Leer `Documentacion/01-planes-maestros/meta_guia_planes.md`.
- Leer `Documentacion/01-planes-maestros/plan_planeaciones.md` como ejemplo de calidad y tracking.
- Revisar `src/navigation/StackNavigator.tsx`.
- Revisar `src/navigation/AppTabsNavigator.tsx`.
- Revisar carpetas del modulo objetivo en `src/screens`, `src/hooks`, `src/context`, `src/services`, `types` y `backend/api`.
- Revisar tests existentes del modulo.
- Revisar si hay datos reales o ejemplos en `context/`.
- Ejecutar busquedas con `rg` para detectar rutas legacy, nombres duplicados y dependencias cruzadas.
- Verificar si la documentacion esta desfasada contra el codigo.
- Identificar que otros modulos dependen del modulo objetivo.
- Identificar restricciones de costo, despliegue y tiempo de entrega.
- Leer `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` si el plan tendra ejecucion inmediata.
- Revisar el estado del GitHub Project si `gh` esta disponible y el usuario permite tocar work items.

- Consultar el directorio `context/referencias-opensource/README.md`. Si el modulo a planificar tiene una arquitectura de referencia asignada en ese documento, la IA debe analizar los archivos curados de esa subcarpeta. La IA usara estas referencias estrictamente como inspiracion arquitectonica, sin copiar codigo literal y traduciendo los conceptos logicos a nuestro stack local.

### 5.1 Contrato de Experiencia Madre y Ground Truth por Fase

Antes de escribir o ejecutar un plan, la IA debe clasificar el modulo por nivel de paridad esperado:

- `Clon/paridad alta`: debe sentirse casi como una experiencia conocida. Aplica a Word/Docs, Classroom/Classroomio, Excel/Sheets, Canva/Genially y WhatsApp profesional.
- `Inspirado/paridad media`: toma patrones de una app conocida, pero puede adaptar la experiencia. Aplica a social, chat docente si no se busca clon exacto, reportes y notificaciones.
- `Funcional/administrativo`: prioriza robustez, seguridad, costo y mantenibilidad. Aplica a infraestructura, auth/seguridad, sync y configuracion interna.

Si el modulo es `Clon/paridad alta`, el plan no puede quedarse en frases como "tipo Classroom" o "tipo Canva". Debe convertir las referencias en contrato verificable:

- Rutas exactas de capturas en `context/<modulo>-ground-truth/`.
- Rutas exactas de referencias reales dentro de `context/<modulo>-ground-truth/03-referencias-reales/`.
- Repos open source relevantes segun `context/referencias-opensource/README.md`.
- Pantallas/flujos que se desean clonar.
- Pantallas/flujos que se prohibe introducir porque rompen la experiencia madre.
- Rutas legacy que no deben aparecer en el flujo principal.
- Checklist visual y de navegacion por fase.

Antes de implementar cualquier fase de un modulo de paridad alta, la IA debe generar un `Brief de Implementacion de Fase` dentro del plan o del issue activo. Ese brief debe incluir:

```markdown
### Brief Ground Truth - Fase X

- Nivel de paridad: Clon/paridad alta.
- Referencias reales obligatorias:
  - `context/<modulo>-ground-truth/03-referencias-reales/...`
- Capturas actuales a comparar:
  - `context/<modulo>-ground-truth/02-capturas-actuales-de-la-app/...`
- Referencias open source obligatorias:
  - `context/referencias-opensource/<repo>/FUENTE.md`
  - `context/referencias-opensource/<repo>/ARCHITECTURE_PATHS.md`
- Pantallas/flujo a imitar:
  - ...
- Flujos legacy prohibidos:
  - ...
- Criterio de cierre UX:
  - El usuario confirma que se siente como [Word/Classroom/Excel/Canva/WhatsApp], no como modulos sueltos.
```

Si no existe carpeta de ground truth para el modulo, la IA debe crear o pedir al desarrollador esta estructura antes de cerrar el plan:

```text
context/<modulo>-ground-truth/
  01-errores-actuales/README.md
  02-capturas-actuales-de-la-app/
  03-referencias-reales/
  04-flujos-deseados/
  05-notas-del-desarrollador/README.md
```

Si faltan referencias open source para el modulo objetivo, la IA debe pedir URLs de repositorios GitHub y registrar la necesidad en `context/referencias-opensource/README.md`. No debe inventar que tiene referencia open source si no existe.

Regla de cierre: en modulos de paridad alta, TypeScript, lint y tests no bastan. La fase solo puede cerrarse como `[x]` cuando tambien exista validacion manual o checklist visual contra ground truth.

---

## 6. Estructura Obligatoria de Todo Plan Maestro

Todo plan futuro debe seguir esta estructura:

### 6.1 Encabezado

Debe incluir:

- Nombre del plan.
- Version.
- Fecha.
- Alcance.
- Stack.
- Modulo.
- Estado actual.
- Relacion con otros modulos.

### 6.2 Analisis de Ground Truth

Debe incluir:

- Ejemplos reales o representativos del trabajo docente.
- Comparacion entre flujo actual y flujo ideal.
- Tabla de brechas.
- Hallazgos clave.
- Implicaciones en datos, UX, IA, backend y offline-first.
- Nivel de paridad esperado: `Clon/paridad alta`, `Inspirado/paridad media` o `Funcional/administrativo`.
- Tabla de referencias obligatorias con rutas concretas a `context/<modulo>-ground-truth/` y `context/referencias-opensource/`.
- Lista de capturas o repositorios faltantes que el desarrollador debe proporcionar antes de ejecutar fases UI.

Si no hay ground truth suficiente, la IA debe pedirlo o crear una investigacion local basada en pantallas existentes, tipos y casos docentes realistas. Para modulos de `Clon/paridad alta`, pedir ground truth no es opcional: se debe indicar exactamente que carpetas crear y que capturas/URLs entregar antes de implementar pantallas.

### 6.3 Inventario del Codigo Actual

Debe incluir:

- Pantallas.
- ViewModels/hooks.
- Contextos.
- Servicios.
- Tipos.
- Backend.
- Tests.
- Navegacion.
- Componentes compartidos.
- Dependencias cruzadas.
- Archivos legacy.

### 6.4 Decisiones Tecnicas

Debe incluir:

- Arquitectura elegida.
- Alternativas evaluadas.
- Por que se descartan o aceptan.
- Riesgos.
- Dependencias nuevas.
- Impacto en Expo Go, dev client, web, Android e iOS.
- Impacto en costo.
- Impacto en offline-first.
- Estrategia de migracion.

### 6.5 Modelo de Datos

Debe incluir:

- Tipos nuevos o modificados.
- Compatibilidad o reemplazo legacy.
- Entidades relacionadas.
- Indices locales/remotos.
- Claves locales actuales o futuras: AsyncStorage actual, tablas SQLite futuras o repositorio local equivalente.
- Forma de sync.
- Forma de exportacion/importacion.
- Campos de auditoria: `userId`, `fechaCreacion`, `fechaModificacion`, `syncStatus` o equivalente.

### 6.6 UX/UI Objetivo

Debe incluir:

- Flujo principal.
- Flujos alternos.
- Mapa de entrada y salida del modulo.
- Botones, CTAs y rutas que llevan al modulo.
- Acciones internas que conectan con otros modulos.
- Pantallas desde donde se puede crear, editar, ver, compartir, exportar o eliminar una entidad.
- Estados vacios.
- Estados loading/error/offline.
- Web/tablet/movil.
- Accesibilidad.
- Criterios visuales.
- Eliminacion de pasos duplicados.
- Pantallas legacy a eliminar o redirigir.
- Validacion de que el modulo no queda aislado ni inaccesible desde tabs, hubs, menus, buscadores o acciones contextuales.
- Recomendaciones de redisenio del flujo si la navegacion actual es redundante, confusa o profunda.

### 6.7 IA y Automatizacion

Debe incluir:

- Casos de uso IA.
- Endpoints requeridos.
- Proveedor/modelo.
- Variables de entorno.
- Fallback si no hay API key.
- Timeout y errores.
- Prompting esperado.
- Validacion humana.
- Costos y limites.

### 6.8 Offline-First y Sync

Debe incluir:

- Fuente local de verdad.
- Fuente remota de verdad.
- Cola de operaciones.
- Reintentos.
- Conflictos.
- Eliminacion logica.
- Recuperacion de borradores.
- Validacion offline/reconexion.
- Estrategia de migracion si el modulo debe pasar de AsyncStorage a SQLite o a otra base local.

### 6.9 Limpieza Legacy

Debe incluir:

- Rutas a eliminar o redirigir.
- Pantallas obsoletas.
- Tipos duplicados.
- Contextos viejos.
- Servicios duplicados.
- Tests obsoletos.
- Criterio para borrar compatibilidad temporal.

### 6.10 Fases Numeradas

Cada plan debe tener fases numeradas con checkboxes:

- `[ ]` Pendiente.
- `[~]` En progreso.
- `[x]` Completado.

No usar otros estados.

Cada fase que toque UX, navegacion, pantallas, modales, flujos de creacion/edicion o integracion con otros modulos debe incluir un bloque `Brief Ground Truth - Fase X`. Ese bloque debe citar referencias concretas y no solo una descripcion general.

Formato obligatorio para fases de paridad alta:

```markdown
### FASE X: [Nombre]

Brief Ground Truth - Fase X:

- Experiencia madre a imitar: [Word/Docs | Classroom/Classroomio | Excel/Sheets | Canva/Genially | WhatsApp].
- Referencias reales:
  - `context/<modulo>-ground-truth/03-referencias-reales/...`
- Capturas actuales:
  - `context/<modulo>-ground-truth/02-capturas-actuales-de-la-app/...`
- Referencias open source:
  - `context/referencias-opensource/<repo>/FUENTE.md`
- Flujos prohibidos:
  - [rutas legacy, modales antiguos, CTAs administrativos sueltos].
- Validacion visual:
  - [comparacion manual requerida antes de cerrar].

- [ ] **X.1 ...**
```

Estructura recomendada:

- Fase 0: Auditoria y preparacion.
- Fase 1: Tipos y modelo.
- Fase 2: Datos, contexto y sync.
- Fase 3: Componentes base.
- Fase 4: Pantallas y flujo principal.
- Fase 5: IA/import/export/funciones avanzadas.
- Fase 6: Integracion con otros modulos.
- Fase 7: Limpieza legacy.
- Fase final: validacion, docs y release.

### 6.11 Validacion

Debe incluir:

- `npx tsc --noEmit`.
- `npm run lint -- --quiet`.
- `npm test -- --runInBand`.
- Tests focalizados.
- Validacion web.
- Validacion Android/iOS.
- Validacion offline.
- Validacion backend.
- Validacion de costo/configuracion cuando aplique.
- Validacion de navegacion: entrar al modulo desde todos los puntos esperados, ejecutar acciones principales y volver sin perder contexto.
- Validacion UX/UI: revisar redundancia, claridad de CTAs, contraste, jerarquia visual, estados vacios y accesibilidad basica.
- Validacion de paridad para experiencias madre: comparar pantalla/flujo contra las rutas de ground truth citadas en la fase.
- Confirmacion del desarrollador cuando el objetivo sea un clon/paridad alta: no cerrar como `[x]` solo por pasar validaciones automaticas.

---

## 7. Reglas de Consistencia Arquitectonica

Todo plan futuro debe cumplir:

- Mantener MVVM.
- Pantallas delgadas.
- Hooks como ViewModels.
- Contextos para estado compartido.
- Servicios para I/O, storage, import/export, IA y API.
- Tipos centralizados y versionados.
- Offline-first desde el diseno.
- Persistencia local mediante una capa desacoplada.
- AsyncStorage es la implementacion actual para cache/datos simples.
- SQLite/Expo SQLite debe evaluarse como destino preferente para modulos con relaciones, busquedas, volumen o sync complejo.
- Ningun modulo nuevo debe acoplarse directamente a AsyncStorage si eso bloquea una migracion futura a SQLite.
- MongoDB/API como respaldo remoto cuando aplique.
- `userId` en toda entidad sincronizable.
- No duplicar fuente de verdad.
- No mezclar legacy con nuevo modelo sin migracion clara.
- No introducir dependencia cara o compleja sin justificar.
- No romper web si el modulo se usa desde web.
- No dejar spinners infinitos.
- No dejar pantallas sin estados de error.

---

## 8. Reglas de Presupuesto e Infraestructura

Cada plan debe incluir una seccion de costos si toca backend, IA, almacenamiento, notificaciones, hosting o distribucion.

La IA debe:

- Evaluar opciones gratis o de bajo costo.
- Separar costos de desarrollo, demo, beta y produccion.
- Verificar precios actuales antes de recomendar servicios.
- No asumir que hay presupuesto mensual.
- Considerar uso local de la laptop del desarrollador.
- Considerar Docker solo si simplifica desarrollo, pruebas o despliegue.
- Considerar Vercel/MongoDB Atlas free tier si sigue siendo suficiente.
- Considerar alternativas como backend local, VPS barato o self-hosting cuando el modulo lo justifique.
- Documentar riesgos de depender de la maquina local.
- Documentar riesgos de free tiers: limites, suspension, cold starts, almacenamiento, cuotas.
- Preguntar antes de elegir infraestructura definitiva.

Regla de oro: profesional no significa caro. La solucion debe poder crecer, pero empezar simple.

---

## 9. Reglas de UX/UI

Todo plan debe exigir:

- Flujos de maximo sentido para docentes reales.
- Interfaces profesionales, no demos.
- Acciones principales visibles.
- Estados claros.
- Sin pasos duplicados.
- Sin formularios legacy cuando el modulo requiera editor moderno.
- Buen contraste.
- Botones seleccionados legibles.
- Accesibilidad basica.
- Experiencia responsive.
- Validacion manual en web y movil.

Cuando un modulo tenga edicion compleja, se debe preferir una experiencia tipo herramienta real, no solo un formulario.

### 9.0 Estrategia UX/UI Hibrida por Modulo

Cada modulo debe tener una UX base profesional dentro de su propio plan, pero el redisenio final de toda la app debe reservarse para `Plan Maestro: UX/UI y Navegacion Global`.

Reglas:

- En el plan del modulo se corrigen problemas propios del flujo: scroll roto, pantallas cortadas, botones inaccesibles, jerarquia confusa, estados vacios pobres y responsive movil/web.
- En el plan del modulo se implementa una plantilla visual base alineada con referencias reales y ground truth local.
- No convertir cada modulo en un mega redisenio final si eso bloquea funcionalidad.
- Antes de tocar UI, revisar `context/<modulo>-ground-truth/` si existe.
- Si el desarrollador entrega pantallas de Stitch/Figma, HTML, MD, tokens o capturas, ese material tiene prioridad como ground truth visual.
- El plan UX/UI Global debe consolidar: prompts para Stitch/Figma, sistema visual, tokens, navegacion global, Nielsen, accesibilidad y severidad 0-4.

### 9.1 Metodologia IHC obligatoria para el Plan Maestro UX/UI

El `Plan Maestro: UX/UI y Navegacion Global - PlanearIA` sera una fase de pulido posterior a los modulos funcionales principales. Cuando se genere, no debe basarse en gustos subjetivos. Debe usar rigor de Interaccion Humano-Computadora:

- Usar las **10 Heuristicas de Usabilidad de Jakob Nielsen** como marco obligatorio de auditoria y propuesta.
- Clasificar cada hallazgo con severidad clasica: `0` no es problema, `1` cosmetico, `2` menor, `3` mayor, `4` catastrofe.
- Priorizar reduccion de carga cognitiva y cero friccion.
- Auditar consistencia entre sistema y mundo real docente.
- Prevenir errores: ocultar, eliminar o desactivar botones `Proximamente`, acciones sin destino, rutas aisladas y CTAs que no hacen nada.
- Revisar accesibilidad: labels, roles, contraste, tamanos tocables, navegacion por teclado/web y lectores de pantalla en acciones principales.
- Centralizar tokens visuales en `ThemeContext` o capa equivalente para evitar interfaces Frankenstein entre modulos.
- Convertir recomendaciones en cambios accionables, con criterio de aceptacion verificable en web, tablet y movil.

### 9.2 Estado Actual del Diseno Visual

PlanearIA no tiene un diseno maestro definido todavia. No existe un sistema de tokens visual final, no hay Figma/Stitch aprobado como fuente de verdad global y no hay una guia de estilo cerrada.

Reglas mientras no exista un diseno maestro:

- Las pantallas nuevas o modificadas deben ser lo mas homogeneas posible con el estado actual de la app.
- No inventar paletas, tipografias o estilos nuevos que contradigan lo que ya existe.
- Si un modulo necesita pantallas nuevas, basarse en los patrones visuales existentes: spacing, colores de `ThemeContext`, cards, botones y tab bars internas.
- La app no esta en produccion y todo puede cambiar. Ningun plan debe asumir que el diseno actual es definitivo.
- El diseno final se definira cuando se cree el `Plan Maestro: UX/UI y Navegacion Global`.

### 9.3 Workflow de Diseno con Google Stitch

Este workflow aplica exclusivamente al futuro `Plan Maestro: UX/UI y Navegacion Global`. Los planes de modulos individuales no deben incluir fases de Stitch ni bloquear su avance por diseno visual. Los modulos deben implementar una UX base funcional y profesional; el pulido visual global se hace despues.

Cuando se cree el plan de UX/UI Global, la IA debe seguir este flujo iterativo con el desarrollador:

#### Paso 1: Generar prompts para Stitch

La IA debe proponer entre 2 y 4 prompts alternativos para Google Stitch por cada pantalla o flujo pequeno. Cada prompt debe:

- Describir la pantalla, el contenido, la jerarquia visual y las acciones principales.
- Basarse en las reglas de UX/UI de esta guia, las heuristicas de Nielsen y el ground truth del modulo.
- Consultar las carpetas `context/referencias-opensource/` y `context/<modulo>-ground-truth/` para inspirar flujos coherentes con experiencias reales.
- Tener en cuenta como funciona la app actualmente para no proponer flujos desconectados del estado real.
- Variar entre si: una opcion puede priorizar compacidad, otra puede priorizar jerarquia visual, otra puede explorar un layout alternativo.

Ejemplo de formato:

```markdown
## Prompts para Stitch: Classroom Home

**Prompt 1:** Pantalla Classroom con clases activas como cards grandes, acceso rapido a materiales
recientes y barra de busqueda superior. Estilo inspirado en Google Classroom.

**Prompt 2:** Pantalla Classroom con tres secciones: Mis Cursos, Actividad Reciente y Pendientes.
Cada seccion es colapsable. Navegacion por pestanas internas.

**Prompt 3:** Pantalla Classroom minimalista: lista vertical de grupos/clases con KPIs inline
(alumnos, tareas, asistencia). FAB para crear grupo. Sin secciones separadas.
```

#### Paso 2: El desarrollador elige

El desarrollador usa los prompts en Google Stitch, genera los disenos, descarga los resultados y los coloca en `context/stitch-results/<tarea>/` como HTML, preview y JSON/MD.

#### Paso 3: Implementar e iterar

La IA lee el resultado de Stitch, implementa la pantalla y permite iteracion hasta que el desarrollador este satisfecho. Solo cuando el desarrollador apruebe el diseno se pasa al siguiente flujo.

#### Paso 4: Avanzar al siguiente flujo

Al iniciar el siguiente flujo de UX/UI, la IA debe tener en cuenta los disenos ya aprobados para mantener homogeneidad visual.

#### Paso 5: Diseno global opcional

La IA tambien puede proponer prompts para Stitch sobre el diseno global de la app: paleta de colores, tipografia, tokens, navegacion y estilo general. Esto permite que todos los flujos posteriores se basen en un sistema visual coherente desde el principio.

#### Paso 6: Auditoria final

Al cerrar el ciclo de diseno, se debe hacer una auditoria estricta de UX/UI y homogeneidad visual. Se daran varias repasadas hasta que quede pulido.

Regla de trazabilidad:

- Los resultados de Stitch se guardan en `context/stitch-results/` siguiendo la estructura documentada en `context/stitch-results/README.md`.
- Los prompts generados por la IA se incluyen en el plan maestro de UX/UI Global.
- Las imagenes aprobadas se conservan como ground truth dentro de la carpeta del modulo correspondiente en `context/<modulo>-ground-truth/`.

### 9.4 Respaldo de Componentes Visuales

El archivo `Documentacion/04-referencia/COMPONENTES_PRESERVADOS.md` contiene el codigo fuente de componentes visuales que el desarrollador quiere tener respaldados como referencia. Este archivo es solo un respaldo documental; no obliga a futuras IAs a mantener esos componentes en la app. Si un plan de modulo o de UX/UI Global decide reemplazar o eliminar un componente documentado ahi, puede hacerlo sin restriccion.

### 9.5 Navegacion Global: Estructura de Tabs y Modulos

La estructura de tabs actual es provisional y puede cambiar radicalmente. Las 5 tabs actuales de la barra inferior son:

1. Feed.
2. Recursos.
3. Classroom (antes Grupos).
4. Social.
5. Configuracion.

Esta estructura no es definitiva. El desarrollador ha planteado varias alternativas posibles:

- **Modelo actual:** tabs globales fijas en la barra inferior, cada tab es un modulo.
- **Home supremo:** sin tab bar global, una pantalla home con accesos a modulos. Al entrar a un modulo, ese modulo tiene sus propias pestanas internas.
- **Tabs por modulo con swipe:** cada modulo tiene tabs propias en la barra inferior. Para cambiar de modulo se desliza horizontalmente o se usa un boton flotante/selector de modulo siempre visible.
- **Hibrido:** una tab bar global reducida con los modulos principales y tabs internas dentro de cada modulo para sus secciones.

Regla para futuras IAs:

- No asumir que la estructura de tabs actual es permanente.
- Si un plan de modulo necesita tabs internas, implementarlas de forma que puedan convivir con cualquier estructura global.
- La decision final sobre la estructura de navegacion debe tomarse en el `Plan Maestro: UX/UI y Navegacion Global` o cuando el desarrollador lo decida.
- Cualquier plan que toque tabs principales debe documentar el impacto si la estructura cambia.
- No bloquear funcionalidad por esperar la decision de tabs. Construir modulos con entradas claras que funcionen con cualquier modelo de navegacion.

---

## 10. Reglas de Navegacion y UX/UI Global

Cada plan de modulo debe incluir una auditoria de navegacion. No basta con que el modulo funcione aislado.

Todo plan debe responder:

- Desde donde entra el usuario al modulo.
- A donde vuelve despues de crear, editar, guardar, cancelar, exportar o eliminar.
- Que tab, hub, FAB, menu contextual, card, buscador o deep link lleva al modulo.
- Que rutas deben desaparecer, redirigirse o quedar ocultas por legacy.
- Que acciones cruzadas conectan con otros modulos.
- Que ocurre en web, tablet y movil.
- Que estado se conserva al volver: filtros, busqueda, tab activa, borrador o seleccion.
- Que pantallas quedan bloqueadas si el usuario esta offline.
- Que botones principales y secundarios deben existir.
- Que flujos son redundantes y deben fusionarse.

Todo plan debe incluir un mapa minimo de flujos:

```markdown
## Mapa de Navegacion del Modulo

- Entrada principal: [tab/hub/ruta].
- Entradas secundarias: [FAB/menu/card/deep link].
- Crear: [origen] -> [selector/configuracion] -> [editor/detalle] -> [lista/detalle].
- Editar: [lista/card/buscador] -> [editor] -> [detalle/lista].
- Compartir/exportar/asignar: [origen] -> [accion] -> [resultado].
- Salidas seguras: cancelar, guardar, volver, cerrar modal.
- Rutas legacy: eliminar, ocultar o redirigir.
```

Todo plan debe incluir una fase o bloque dedicado a UX/UI y navegacion cuando:

- El modulo toca tabs principales.
- El modulo toca `ContenidoScreen`.
- El modulo crea rutas nuevas.
- El modulo elimina rutas legacy.
- El modulo se conecta con otros modulos.
- El modulo agrega FAB, modales, menus contextuales o cards.
- El flujo actual queda profundo, duplicado o poco intuitivo.

Puede existir un plan independiente llamado `Plan Maestro: UX/UI y Navegacion Global - PlanearIA` cuando el objetivo sea:

- Auditar toda la app.
- Redisenar tabs principales.
- Unificar hubs.
- Revisar todos los CTAs.
- Reducir redundancia.
- Mejorar accesibilidad.
- Modernizar visualmente la app.
- Asegurar que ningun modulo quede aislado.
- Definir estandares visuales y de interaccion para todos los modulos.

Ese plan global debe revisar como minimo:

- `src/navigation/StackNavigator.tsx`.
- `src/navigation/AppTabsNavigator.tsx`.
- `src/screens/contenido/ContenidoScreen.tsx`.
- `src/components/CrearNuevoModal.tsx`.
- `src/components/FloatingActionIcons.tsx`.
- Todos los menus contextuales.
- Todos los empty states.
- Todas las acciones de crear/editar/ver/detalle/exportar/compartir/asignar.

Checklist obligatorio para UX/UI y navegacion:

- [ ] Cada modulo tiene entrada principal clara.
- [ ] Cada modulo tiene ruta para volver sin perder contexto.
- [ ] Cada accion primaria tiene un CTA visible.
- [ ] No hay doble captura de datos.
- [ ] No hay dos pantallas haciendo lo mismo sin justificacion.
- [ ] No hay rutas modernas escondidas detras de hubs legacy.
- [ ] No hay modales que bloqueen clicks al cerrarse.
- [ ] No hay botones activos ilegibles.
- [ ] No hay cards sin accion clara.
- [ ] No hay flujos que terminen en una pantalla sin salida evidente.
- [ ] Los empty states llevan a la accion correcta.
- [ ] Web, tablet y movil tienen navegacion usable.
- [ ] Los lectores de pantalla tienen labels basicos en acciones principales.

---

## 11. Reglas de IA

Todo plan con IA debe exigir:

- Proveedor/modelo documentado.
- Variables de entorno documentadas.
- Prompt y schema definidos.
- Fallback si falta API key.
- Timeout.
- Errores visibles.
- Validacion humana.
- Pruebas de exito/error/fallback.
- Estimacion o control de costos.
- Debounce y limites si hay IA predictiva.
- No guardar contenido IA sin oportunidad de revision docente.

---

## 12. Directrices por Modulo Futuro

### 12.0 Experiencias Madre Declaradas

Cuando un plan toque estos dominios, debe tratarlos como `Clon/paridad alta` salvo que el desarrollador diga lo contrario:

| Dominio | Experiencia madre | Ground truth esperado |
| --- | --- | --- |
| Planeaciones | Word/Google Docs | Documento paginado, toolbar, plantillas, import/export. |
| Classroom/Grupos | Google Classroom/Classroomio | Cursos, tablon, trabajo por unidades, personas, detalle de actividad/material. |
| Recursos visuales | Canva/Genially | Canvas, templates, panel lateral, capas, paginas, exportacion. |
| Listas/registros | Excel/Google Sheets | Grid editable, columnas, formulas, filtros, import/export. |
| Chat/mensajeria | WhatsApp profesional | Lista de chats, conversacion, adjuntos, estados de envio, busqueda. |

Si falta una carpeta `context/<modulo>-ground-truth/` o una referencia open source para cualquiera de estas experiencias, la IA debe pedirla antes de implementar fases visuales.

### 12.1 Planeaciones

No generar un plan nuevo sin leer `Documentacion/01-planes-maestros/plan_planeaciones.md`.

Si se retoma:

- Continuar desde la fase activa.
- Priorizar Fase 9 hasta cerrar web, movil, editor tipo Docs/Word e IA.
- Actualizar README/documentacion si cambia arquitectura.

### 12.2 Recursos Evaluables

Debe cubrir:

- Examenes.
- Trabajos.
- Rubricas.
- Proyectos con revisiones.
- Entregables.
- Correccion.
- Calificacion.
- Retroalimentacion.

Debe conectarse con:

- Grupos.
- Alumnos.
- Calificaciones.
- Entregables.
- Recursos didacticos.
- Notificaciones.

Debe exigir:

- Banco de preguntas.
- Rubricas reutilizables.
- Estados por alumno.
- Asignacion individual/grupal.
- Calificacion offline.
- Exportacion.
- IA para crear reactivos, revisar respuestas y sugerir retroalimentacion.
- Revision humana obligatoria.

### 12.3 Recursos Didacticos

Debe cubrir:

- Diapositivas.
- PDFs.
- Videos.
- Notas de voz.
- Mapas mentales.
- Lineas de tiempo.
- Documentos.
- Enlaces.

Debe exigir:

- Galeria/biblioteca profesional.
- Previews.
- Metadatos.
- Tags.
- Versiones.
- Asignacion a grupos.
- Compartir en feed/chat.
- IA para resumir, transformar, generar diapositivas y crear mapas.
- Control de almacenamiento local.
- Cache offline.

### 12.4 Gestion de Grupos y Alumnos

Debe cubrir:

- Grupos.
- Alumnos.
- Asistencia.
- Calificaciones.
- Notas.
- Reportes.
- Estadisticas.

Debe exigir:

- Tablero docente.
- Historial por alumno.
- Alertas de riesgo.
- Importacion/exportacion CSV/XLSX.
- Reportes PDF.
- Integracion con tareas, entregables y recursos.
- Cuidado de datos personales.
- Offline-first robusto.

### 12.5 Red Social Educativa

Debe cubrir:

- Feed.
- Posts.
- Comentarios.
- Reacciones.
- Retos.
- Contactos.
- Solicitudes.
- Compartir recursos/planeaciones.

Debe exigir:

- Privacidad por audiencia.
- Moderacion.
- Reportes.
- Anti-spam basico.
- Notificaciones.
- IA opcional para resumir, redactar y moderar.
- Separacion entre contenido privado y compartido.

### 12.6 Chat y Mensajeria

Debe cubrir:

- Conversaciones.
- Mensajes.
- Adjuntos.
- Planeaciones compartidas.
- Recursos compartidos.
- Estados de envio.

Debe exigir:

- Offline/pendiente/error.
- Reintentos.
- Adjuntos seguros.
- Busqueda.
- Notificaciones.
- Privacidad.
- No duplicar mensajes en sync.

### 12.7 Plantillas

Debe cubrir:

- Plantillas legacy.
- Plantillas de recursos.
- Plantillas de planeaciones.
- Galeria del sistema.
- Plantillas del usuario.

Debe exigir:

- Decidir si se unifican o se mantienen separadas por dominio.
- Modelo de preview.
- Metadata.
- Versionado.
- Importacion/exportacion.
- Sanitizacion de datos personales antes de compartir.

### 12.8 Seguridad y Autenticacion

Debe cubrir:

- Login real.
- Registro.
- Recuperacion de contrasena.
- JWT.
- Refresh token.
- Emails.
- Roles.
- Permisos.
- Proteccion de rutas.
- RBAC pragmatico para roles `Dev/Desarrollador`, `Admin`, `Docente` y `Alumno`.

Debe exigir:

- Hash seguro.
- Tokens seguros.
- Almacenamiento seguro.
- Validacion backend.
- Rate limiting si aplica.
- Politica de privacidad.
- Manejo de secretos.
- Plan de bajo costo para email.

Reglas obligatorias de seguridad pragmatica y low-cost:

- El plan debe asumir presupuesto cero o muy bajo: local primero, free tiers y servicios con HTTPS/SSL incluido cuando aplique.
- No proponer servicios empresariales de seguridad salvo que se justifique como opcional futuro.
- Implementar RBAC en frontend solo como ayuda UX; la autorizacion real debe validarse en backend, APIs y queries a base de datos.
- Toda consulta multiusuario debe filtrar por `userId`, rol y permisos cuando corresponda.
- El rol `Dev/Desarrollador` debe existir para desarrollo, soporte y pruebas internas; debe quedar separado de `Admin` y no debe habilitar privilegios peligrosos en produccion sin validacion explicita.
- Endpoints criticos como login, recuperacion, registro, sync, creacion masiva e IA deben evaluar rate limiting.
- Contrasenas con `bcrypt` o equivalente estandar; nunca texto plano.
- Sesiones con JWT y plan claro para expiracion, refresh token y revocacion basica.
- Variables de entorno y secretos nunca deben almacenarse en frontend ni en commits.
- Agregar cabeceras HTTP seguras y CORS estricto con herramientas simples como `helmet`/config equivalente si el backend lo permite.
- Debe funcionar en local, Render/Vercel/EAS/MongoDB Atlas free tier o alternativas gratuitas razonables.

### 12.9 Infraestructura y DevOps

Debe cubrir:

- Backend.
- Base de datos.
- CI/CD.
- Entornos.
- Docker.
- FastAPI vs Node.
- Vercel vs VPS vs local.
- Backups.
- Logs.
- Monitoreo.

Debe exigir:

- Evaluacion de costos.
- Camino minimo viable para entrega escolar.
- Camino profesional escalable.
- Uso posible de laptop local.
- Riesgos de self-hosting.
- Scripts reproducibles.
- Rollback.
- Seguridad de secretos.

### 12.10 Despliegue y Distribucion

Debe cubrir:

- Android.
- iOS.
- Web.
- Landing page.
- Hosting.
- Dominio.
- App stores.
- Builds.
- Versionado.

Debe exigir:

- Checklist de release.
- Costos de cuentas.
- EAS/dev build si aplica.
- Politicas legales.
- Pruebas en dispositivos reales.
- Beta testing.
- Crash reporting.
- Analitica basica.

### 12.11 Notificaciones

Debe cubrir:

- Push notifications.
- Notificaciones internas.
- Preferencias.
- Relacion con tareas, mensajes, social y grupos.

Debe exigir:

- Compatibilidad con Expo Go/dev build.
- Fallback local/in-app.
- Permisos.
- Opt-in/opt-out.
- Costos.

### 12.12 Cuenta, Perfil, Configuracion y Accesibilidad

Debe cubrir:

- Perfil docente.
- Preferencias.
- Tema.
- Tamano de fuente.
- Daltonismo.
- Roles.
- Terminos.
- Privacidad.

Debe exigir:

- Accesibilidad real.
- Persistencia offline.
- Sincronizacion de preferencias.
- Separacion entre perfil publico y configuracion privada.

### 12.13 Onboarding y Ayuda

Debe cubrir:

- Primer uso.
- Tutoriales.
- Ayuda contextual.
- Guia de modulos.

Debe exigir:

- Actualizarse despues de refactors grandes.
- No bloquear flujo experto.
- Explicar IA, offline y sync con lenguaje docente.

---

## 13. Tracking Obligatorio

Cada tarea debe usar:

- `[ ]` Pendiente.
- `[~]` En progreso.
- `[x]` Completado.

Formato recomendado:

```markdown
- [x] **3.2 Crear ViewModel principal**
  - **Completado 2026-05-28:** se creo `useModuloViewModel`, se agregaron tests y paso `npx tsc --noEmit`.
```

Cada avance debe registrar:

- Fecha.
- Que cambio.
- Archivos principales.
- Validacion ejecutada.
- Riesgos pendientes.

### 13.1 Markdown + GitHub Projects

Los planes maestros no deben quedarse solo en markdown cuando entren a ejecucion. La regla operativa es:

- El archivo markdown es la fuente de verdad arquitectonica, historica y de decisiones.
- GitHub Projects es la fuente de verdad operativa diaria: Kanban, prioridad, estado, bloqueo y seguimiento.
- GitHub Actions no debe usarse para guardar tareas; Actions solo valida automatizaciones como typecheck, lint, tests y deploy.

Modelo recomendado para un desarrollador solo:

- Crear un issue o draft item tipo `epic` por cada plan maestro.
- Crear work items por fase cuando el plan este por ejecutarse.
- No crear desde el primer dia un issue por cada checkbox interno si eso genera demasiado ruido.
- Convertir a issues las tareas de la fase activa y de la siguiente fase inmediata.
- Mantener las tareas futuras como checklist dentro del markdown hasta que esten cerca de ejecutarse.
- Usar milestones como ciclos/sprints/release goals, no como epicas permanentes.
- Usar labels para clasificar trabajo: `fase`, `legacy`, `ux-ui`, `offline-first`, `ai`, `infra`, `testing`, `docs`, `needs-input`, `low-cost`.
- Al completar una fase, actualizar tanto el markdown como el Project.

Mapping recomendado:

| Elemento | Donde vive | Uso |
| --- | --- | --- |
| Plan maestro | Markdown + issue/draft `epic` | Vision, alcance y seguimiento macro. |
| Fase | Issue o Project item | Trabajo accionable en Kanban. |
| Tarea pequena | Checklist del issue activo | Detalle diario sin llenar el Project de ruido. |
| Milestone | GitHub Milestone | Ciclo de trabajo o release parcial. |
| Label | GitHub Label | Clasificacion tecnica/producto. |
| Validacion CI | GitHub Actions | Evidencia automatica de calidad. |

---

## 14. Reglas para IAs Durante Ejecucion

Cuando una IA implemente una fase:

- Debe leer la fase completa.
- Debe leer el `Brief Ground Truth - Fase X` de esa fase si existe.
- Si la fase no tiene brief y toca UX/UI o flujo de un modulo de paridad alta, debe detenerse y crear/pedir ese brief antes de programar.
- Debe leer `.agents/skills/token-efficiency/SKILL.md` y decidir modo `NORMAL` o `CAVEMAN` antes de actuar.
- Debe revisar `git status`.
- Debe no revertir cambios ajenos.
- Debe actualizar el plan al completar avances.
- Debe actualizar GitHub Project si el plan ya esta en ejecucion y hay work items creados.
- Debe actualizar documentacion si cambia arquitectura.
- Debe validar que las rutas nuevas queden enlazadas desde tabs, hubs, CTAs, menus o cards reales.
- Debe comparar los flujos implementados contra capturas/referencias reales citadas en la fase.
- Debe correr validaciones proporcionales.
- Debe hacer commit solo si el usuario lo pide.
- Debe pedir confirmacion antes de saltar a otra fase grande si el usuario lo solicito.
- Debe detenerse si una decision de producto cambia el rumbo.

### 14.1 Uso Obligatorio de `token-efficiency` / Modo Caveman

Cada plan maestro debe indicar en que fases conviene usar la skill:

- Skill fuente: `.agents/skills/token-efficiency/SKILL.md`.
- Modo `NORMAL`: usar para auditoria, planeacion, arquitectura, decisiones UX/UI, decisiones de producto, investigacion, prompts de IA, dudas, checkpoints y entregables documentales.
- Modo `CAVEMAN`: usar para ejecutar tareas ya aprobadas y mecanicas: crear archivos desde una especificacion, mover/renombrar, actualizar imports, implementar helpers/facades, escribir tests definidos, corregir lint/typecheck, correr validaciones, marcar checkboxes y sincronizar GitHub Project.
- No usar `CAVEMAN` cuando todavia haya ambiguedad, riesgo de arquitectura, decision de navegacion, decision de costo, seguridad o UX/IHC.
- Si una fase mezcla pensamiento y ejecucion, la IA debe trabajar primero en `NORMAL`, cerrar decision, y despues cambiar a `CAVEMAN` para la implementacion mecanica.
- Al final de una fase, volver a `NORMAL` para resumir evidencia, riesgos y pedir confirmacion si aplica.

Regla de trazabilidad:

- En cada plan nuevo debe existir una seccion breve llamada `Modo de Trabajo Recomendado` o notas por fase indicando si se espera `NORMAL`, `CAVEMAN` o mixto.
- Las issues de GitHub pueden incluir una linea `Modo sugerido: NORMAL/CAVEMAN/Mixto` para orientar a futuras IAs.

### 14.2 Guia Opcional de Modelos y Razonamiento

Esta guia es orientativa y no debe bloquear el trabajo si los modelos disponibles cambian:

- Planeacion estrategica, arquitectura, auditorias profundas, seguridad, UX/IHC con Nielsen: usar modelos fuertes con razonamiento `high` o `xhigh` como Codex 5.5, Claude Opus thinking o Gemini 3.1 Pro.
- Implementacion extensa con contexto de repo, refactors, tests y fixes: usar Codex 5.4 o 5.5 en `medium/high`; subir a `xhigh` si hay bugs dificiles o migraciones delicadas.
- Cambios mecanicos, documentacion menor, checkboxes, labels, issues y validaciones repetitivas: usar Codex 5.4 mini o modelo rapido en `low/medium`, siempre con modo `CAVEMAN`.
- Revisiones cruzadas de producto, copy UX o alternativas de diseno: usar un segundo modelo fuerte en `high` como contraste, sin copiar codigo externo.
- IA/costos/infraestructura: preferir razonamiento alto para decidir, pero implementacion en modo eficiente una vez aprobada la ruta.

---

## 15. Plantilla Rapida para Nuevo Plan

```markdown
# Plan Maestro: [Modulo] - PlanearIA

> **Version:** 1.0
> **Fecha:** YYYY-MM-DD
> **Alcance:** [descripcion]
> **Stack:** React Native - Expo - TypeScript - MongoDB Atlas - AsyncStorage actual / SQLite futuro - MVVM
> **Modulo:** [nombre]
> **Estado actual:** [resumen basado en codigo]

---

## Analisis del Ground Truth

## Contrato de Experiencia Madre

- Nivel de paridad: [Clon/paridad alta | Inspirado/paridad media | Funcional/administrativo]
- Ground truth local:
  - `context/[modulo]-ground-truth/01-errores-actuales/README.md`
  - `context/[modulo]-ground-truth/02-capturas-actuales-de-la-app/`
  - `context/[modulo]-ground-truth/03-referencias-reales/`
- Referencias open source:
  - `context/referencias-opensource/[repo]/FUENTE.md`
- Referencias faltantes a pedir:
  - ...

## Inventario del Codigo Actual

## Decisiones Tecnicas

## Modelo de Datos Objetivo

## UX/UI Objetivo

## Mapa de Navegacion y UX/UI Global

## IA y Automatizacion

## Offline-First y Sync

## Costos e Infraestructura

## Limpieza Legacy

## Modo de Trabajo Recomendado

- NORMAL: auditoria, decisiones, arquitectura, UX/UI, seguridad, IA, costos y checkpoints.
- CAVEMAN: implementacion mecanica aprobada, tests, validaciones, updates de plan y GitHub Project.
- Modelo sugerido: [opcional, segun complejidad y disponibilidad].

## Fases de Ejecucion

### FASE 0: Auditoria y Preparacion

Brief Ground Truth - Fase 0:

- Referencias reales:
  - ...
- Capturas actuales:
  - ...
- Referencias open source:
  - ...
- Flujos prohibidos:
  - ...

- [ ] ...

### FASE 1: Modelo y Tipos

- [ ] ...

### FASE 2: Datos, Contexto y Sync

- [ ] ...

### FASE 3: Componentes Base

- [ ] ...

### FASE 4: Pantallas y Flujo Principal

- [ ] ...

### FASE 5: IA / Funciones Avanzadas

- [ ] ...

### FASE 6: Integracion, Navegacion y UX/UI Global

- [ ] ...

### FASE FINAL: Limpieza, Validacion y Documentacion

- [ ] ...

## Resumen de Archivos

## Open Questions

## Criterio de Cierre
```

---

## 16. Criterio de Calidad de un Buen Plan

Un plan es aceptable solo si:

- Una IA futura puede implementarlo sin redescubrir todo.
- Distingue legacy vs objetivo.
- Integra offline-first desde el inicio.
- Considera presupuesto bajo.
- Considera web, Android e iOS.
- Define IA con fallback.
- Incluye validacion.
- Incluye costos cuando aplica.
- Considera dependencias entre modulos.
- Garantiza que el modulo no queda aislado y que sus flujos de entrada/salida son claros.
- Detecta redundancias de UX/UI y propone eliminarlas o consolidarlas.
- Define criterio de cierre en lenguaje de usuario.
- Define nivel de paridad y ground truth por fase cuando el modulo imita una experiencia madre.
- Pide capturas, URLs o repos open source faltantes antes de implementar pantallas si no existen referencias suficientes.
- No permite cerrar fases visuales de paridad alta solo con tests automaticos.

---

## 17. Mandato Final

PlanearIA debe crecer como una app profesional, pero con una estrategia realista para un estudiante que trabaja solo. Cada plan futuro debe ayudar a construir algo que pueda demostrarse, mantenerse y eventualmente lanzarse sin quedar atrapado en complejidad innecesaria.

La meta no es impresionar con tecnologia. La meta es que la app funcione bien para docentes reales, cueste lo minimo razonable, sea mantenible, aproveche IA con responsabilidad y pueda evolucionar modulo por modulo.


