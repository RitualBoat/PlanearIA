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

- Ryzen 7.
- RTX 4060.
- 64 GB RAM.

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
- Persistencia local: AsyncStorage.
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
- `plan_planeaciones.md`.

---

## 3. Estado Actual Detectado de Modulos

Esta seccion no es un plan de refactorizacion. Es un mapa de referencia para que futuras IAs sepan que existe hoy.

### 3.1 Planeaciones

Estado:

- Tiene plan maestro activo en `plan_planeaciones.md`.
- Ya existe modelo V2, contexto nuevo, editor, escaner, exportacion y copiloto IA.
- Sigue en Fase 9 con hotfixes y evolucion de DocEditor.

Archivos principales:

- `src/screens/planeaciones/`.
- `src/hooks/useCrearPlaneacionViewModel.ts`.
- `src/hooks/useDocEditorViewModel.ts`.
- `src/context/PlaneacionesContext.tsx`.
- `types/planeacionV2.ts`.
- `types/plantillaDocumento.ts`.
- `backend/api/planeaciones.js`.
- `backend/api/planeaciones/*`.

Regla: no crear otro plan de planeaciones sin leer completo `plan_planeaciones.md`.

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
- Leer `Documentacion/ARQUITECTURA.md`.
- Leer `Documentacion/FLUJO_SINCRONIZACION.md`.
- Leer `Documentacion/meta_guia_planes.md`.
- Leer `plan_planeaciones.md` como ejemplo de calidad y tracking.
- Revisar `src/navigation/StackNavigator.tsx`.
- Revisar `src/navigation/AppTabsNavigator.tsx`.
- Revisar carpetas del modulo objetivo en `src/screens`, `src/hooks`, `src/context`, `src/services`, `types` y `backend/api`.
- Revisar tests existentes del modulo.
- Revisar si hay datos reales o ejemplos en `context/`.
- Ejecutar busquedas con `rg` para detectar rutas legacy, nombres duplicados y dependencias cruzadas.
- Verificar si la documentacion esta desfasada contra el codigo.
- Identificar que otros modulos dependen del modulo objetivo.
- Identificar restricciones de costo, despliegue y tiempo de entrega.

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

Si no hay ground truth, la IA debe pedirlo o crear una investigacion local basada en pantallas existentes, tipos y casos docentes realistas.

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
- Claves AsyncStorage.
- Forma de sync.
- Forma de exportacion/importacion.
- Campos de auditoria: `userId`, `fechaCreacion`, `fechaModificacion`, `syncStatus` o equivalente.

### 6.6 UX/UI Objetivo

Debe incluir:

- Flujo principal.
- Flujos alternos.
- Estados vacios.
- Estados loading/error/offline.
- Web/tablet/movil.
- Accesibilidad.
- Criterios visuales.
- Eliminacion de pasos duplicados.
- Pantallas legacy a eliminar o redirigir.

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
- AsyncStorage como cache/fuente local.
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

---

## 10. Reglas de IA

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

## 11. Directrices por Modulo Futuro

### 11.1 Planeaciones

No generar un plan nuevo sin leer `plan_planeaciones.md`.

Si se retoma:

- Continuar desde la fase activa.
- Priorizar Fase 9 hasta cerrar web, movil, editor tipo Docs/Word e IA.
- Actualizar README/documentacion si cambia arquitectura.

### 11.2 Recursos Evaluables

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

### 11.3 Recursos Didacticos

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

### 11.4 Gestion de Grupos y Alumnos

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

### 11.5 Red Social Educativa

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

### 11.6 Chat y Mensajeria

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

### 11.7 Plantillas

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

### 11.8 Seguridad y Autenticacion

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

Debe exigir:

- Hash seguro.
- Tokens seguros.
- Almacenamiento seguro.
- Validacion backend.
- Rate limiting si aplica.
- Politica de privacidad.
- Manejo de secretos.
- Plan de bajo costo para email.

### 11.9 Infraestructura y DevOps

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

### 11.10 Despliegue y Distribucion

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

### 11.11 Notificaciones

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

### 11.12 Cuenta, Perfil, Configuracion y Accesibilidad

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

### 11.13 Onboarding y Ayuda

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

## 12. Tracking Obligatorio

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

---

## 13. Reglas para IAs Durante Ejecucion

Cuando una IA implemente una fase:

- Debe leer la fase completa.
- Debe revisar `git status`.
- Debe no revertir cambios ajenos.
- Debe actualizar el plan al completar avances.
- Debe actualizar documentacion si cambia arquitectura.
- Debe correr validaciones proporcionales.
- Debe hacer commit solo si el usuario lo pide.
- Debe pedir confirmacion antes de saltar a otra fase grande si el usuario lo solicito.
- Debe detenerse si una decision de producto cambia el rumbo.

---

## 14. Plantilla Rapida para Nuevo Plan

```markdown
# Plan Maestro: [Modulo] - PlanearIA

> **Version:** 1.0
> **Fecha:** YYYY-MM-DD
> **Alcance:** [descripcion]
> **Stack:** React Native - Expo - TypeScript - MongoDB Atlas - AsyncStorage - MVVM
> **Modulo:** [nombre]
> **Estado actual:** [resumen basado en codigo]

---

## Analisis del Ground Truth

## Inventario del Codigo Actual

## Decisiones Tecnicas

## Modelo de Datos Objetivo

## UX/UI Objetivo

## IA y Automatizacion

## Offline-First y Sync

## Costos e Infraestructura

## Limpieza Legacy

## Fases de Ejecucion

### FASE 0: Auditoria y Preparacion
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

### FASE FINAL: Limpieza, Validacion y Documentacion
- [ ] ...

## Resumen de Archivos

## Open Questions

## Criterio de Cierre
```

---

## 15. Criterio de Calidad de un Buen Plan

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
- Define criterio de cierre en lenguaje de usuario.

---

## 16. Mandato Final

PlanearIA debe crecer como una app profesional, pero con una estrategia realista para un estudiante que trabaja solo. Cada plan futuro debe ayudar a construir algo que pueda demostrarse, mantenerse y eventualmente lanzarse sin quedar atrapado en complejidad innecesaria.

La meta no es impresionar con tecnologia. La meta es que la app funcione bien para docentes reales, cueste lo minimo razonable, sea mantenible, aproveche IA con responsabilidad y pueda evolucionar modulo por modulo.
