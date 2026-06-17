# Prompt Para Claude: Auditoria Estrategica Para El Plan Maestro UX/UI De PlanearIA

Actua como Arquitecto de Software Principal, Lead Product Designer, especialista en Interaccion Humano-Computadora y Prompt Engineer de elite.

Tu tarea es auditar el proyecto **PlanearIA** y ayudarme a preparar el futuro **Plan Maestro: UX/UI y Navegacion Global**. No quiero que implementes codigo ni que escribas todavia el plan maestro completo. Quiero una auditoria estrategica, tecnica y de producto que me ayude a decidir como deberia redisenarse toda la experiencia de la app desde una vision nueva, clara y profesional.

## Contexto Del Proyecto

PlanearIA es una plataforma educativa para docentes mexicanos. Esta construida con:

- React Native 0.81.5.
- Expo 54.
- TypeScript 5.9.
- React Navigation 7.
- React Context + hooks como ViewModels.
- Arquitectura objetivo MVVM.
- Web con `react-native-web`.
- Backend Node serverless en Vercel.
- MongoDB Atlas.
- Offline-first con AsyncStorage como default productivo.
- SQLite/Expo SQLite como infraestructura opt-in, no default.
- Motor global de sincronizacion en `src/sync`.
- IA centralizada en backend mediante `backend/lib/aiGateway.js`.
- CI/CD con GitHub Actions para typecheck, lint, tests, web bundle y APK standalone.

El principio de producto es **cero friccion**: un docente no deberia sentir que aprende software nuevo. Debe sentir que abre herramientas familiares dentro de un solo ecosistema: Word/Docs, Classroom, Excel/Sheets, Canva/Genially, WhatsApp profesional, reportes y seguimiento docente.

Soy estudiante universitario y desarrollador principal del proyecto. Necesito que expliques tus decisiones con lenguaje conceptual, tecnico pero entendible, como si estuvieras ayudando a un estudiante de ingenieria a tomar buenas decisiones reales. Evita jerga corporativa, humo y repeticiones tecnicas innecesarias.

## Mandato Principal De Esta Auditoria

Para esta auditoria de UX/UI, NO trates los modulos actuales como intocables.

Aunque algunas partes ya funcionan o esten marcadas como cerradas en planes anteriores, quiero que el redisenio visual, de navegacion y experiencia se piense **como si apenas acabara de definirse la vision del producto despues de entrevistas con usuarios docentes**.

Esto significa:

- Planeaciones, aunque ya tenga editor tipo Word, puede redisenarse por completo desde UX/UI.
- Classroom, aunque ya funcione como flujo principal, puede redisenarse por completo desde UX/UI.
- Feed, Contenido, Social, Cuenta, Plantillas, Alumnos, Tareas, Reportes y cualquier pantalla actual pueden repensarse.
- Los planes cerrados sirven como evidencia funcional y tecnica, no como limite visual.
- El codigo actual sirve como inventario de capacidades, datos, rutas, ViewModels, services y riesgos.
- La interfaz actual no debe encadenar la vision futura.
- Despues se podra decidir que componentes, codigo o pantallas se reutilizan, pero esa no es la prioridad de esta auditoria.

Piensa el trabajo como una etapa de **discovery + arquitectura UX/UI + blueprint de producto**, no como un refactor incremental.

## Insumo Metodologico IHC Del Desarrollador

Existe una carpeta con un ejemplo academico de Interaccion Humano-Computadora hecho por el desarrollador:

- `Documentacion/Ejemplo materia IHC/`

Ese material corresponde a una app distinta, relacionada con pedir comida desde el asiento en el cine. Incluye entrevistas, transcripciones, personas, mapas de empatia, historias de usuario, mapas de recorrido, frameworks UX y un prototipo HTML.

No uses ese material como evidencia directa del dominio docente, porque no pertenece a PlanearIA. Usalo como referencia metodologica para evaluar que tipo de discovery, entrevistas y entregables UX deberian existir para PlanearIA.

En tu respuesta, indica claramente:

- Si puedes hacer la auditoria estrategica actual solo con el repo, la documentacion y la vision existente.
- Que entregables IHC especificos de PlanearIA recomendarias crear antes de disenar pantallas finales.
- Si conviene entrevistar docentes reales antes del Plan Maestro UX/UI o si basta con proto-personas temporales.
- Que preguntas minimas harias a docentes para validar la vision de cero friccion.
- En que fase del futuro plan maestro deberian entrar personas, mapas de empatia, historias de usuario y recorridos de usuario.
- Que parte del ejemplo academico IHC sirve como metodologia reutilizable y que parte debe descartarse por no pertenecer al dominio educativo.

## Antes De Responder, Lee Y Cruza Estas Fuentes

Si tienes acceso al repo, lee estos archivos antes de concluir:

- `README.md`
- `CLAUDE.md`
- `package.json`
- `app.json`
- `App.tsx`
- `src/navigation/StackNavigator.tsx`
- `src/navigation/AppTabsNavigator.tsx`
- `src/context/`
- `src/hooks/`
- `src/screens/`
- `src/services/`
- `src/sync/`
- `src/sync/services/entitySync.ts`
- `src/sync/services/syncEngine.ts`
- `src/sync/services/syncEvents.ts`
- `src/context/SyncContext.tsx`
- `src/themes/colors.ts`
- `src/utils/responsive.ts`
- `src/components/FloatingActionIcons.tsx`
- `src/components/WebScrollView.tsx`
- `backend/api/index.js`
- `backend/routes/`
- `backend/lib/aiGateway.js`
- `backend/lib/aiUsageLimiter.js`
- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`
- `Documentacion/README.md`
- `Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/01-planes-maestros/PLANES MAESTROS AUDITADOS.md`
- `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
- `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`
- `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`
- `Documentacion/04-referencia/COMPONENTES_PRESERVADOS.md`
- `context/referencias-opensource/README.md`
- ground truth relevante dentro de `context/`

Pon especial atencion a las secciones sobre:

- UX/UI Global y Navegacion Global.
- Heuristicas de Jakob Nielsen.
- Severidad 0-4.
- Estrategia Stitch/Figma/prompts visuales.
- Experiencias madre y ground truth por fase.
- Regla de pantalla madre responsiva web/tablet/movil.
- No cerrar UX/UI de alta paridad solo con tests automaticos.

Si algun archivo contradice el codigo, gana el codigo. Si la documentacion dice que algo esta cerrado, interpretalo como "funcionalmente cerrado", no como "visualmente intocable".

## Realidad Arquitectonica Que Debes Respetar

No propongas reescribir el proyecto tecnico desde cero. El redisenio UX/UI puede pensarse desde cero, pero debe aterrizar despues sobre esta arquitectura:

- MVVM: pantallas delgadas, hooks como ViewModels, Context como estado/modelo compartido, services para I/O.
- No crear pantallas aisladas sin ruta, entrada, salida y relacion con tabs/hubs.
- No crear clientes HTTP o colas propias si el dato es sincronizable. Debe integrarse con `src/sync`.
- Todo dato multiusuario debe aislarse por `userId`.
- Backend academico debe usar JWT y endpoints idempotentes para tolerar reintentos offline.
- No activar SQLite como default sin decision explicita.
- No borrar claves legacy de AsyncStorage sin plan de migracion y rollback.
- No meter secretos de IA, email o backend en frontend.
- Toda IA debe pasar por backend, preferentemente por `aiGateway`.
- Toda propuesta debe ser low-cost, viable para estudiante, demo y eventual beta cerrada.
- Evita microservicios y dependencias caras si no aportan valor inmediato.
- Mantener web, tablet y movil desde una pantalla madre responsiva por defecto. Usar `.web.tsx` o `.native.tsx` solo si la interaccion realmente lo exige.

## Navegacion Actual Como Insumo, No Como Limite

La navegacion real usa tabs principales:

- `FeedTab` -> `FeedScreen`.
- `ContenidoTab` -> `ContenidoScreen`.
- `GruposTab` -> `ClassroomHomeScreen`.
- `SocialTab` -> `SocialScreen`.
- `ConfiguracionTab` -> `CuentaScreen`.

Tambien hay rutas stack para:

- Auth: login, registro, recuperacion.
- Planeaciones: lista, crear, importar, escaner, exportar, `DocEditor`.
- Classroom/grupos: home, grupo, unidades, recursos, actividades.
- Alumnos, asistencia, calificaciones, tareas, entregables.
- Biblioteca/recursos.
- Plantillas.
- Feed, retos, posts.
- Social, perfiles, chat/conversacion.
- Notificaciones y ayuda.
- Cuenta, perfil, roles, sesiones, terminos.

Para esta auditoria, esta navegacion es un mapa de lo que existe. Puedes proponer una navegacion completamente distinta si mejora la experiencia docente, siempre que expliques como se migraria luego sin perder datos ni romper la arquitectura.

## Experiencias Principales A Redisenar

Audita y propone la estructura de experiencias que deberia tener PlanearIA en su version UX/UI objetivo. Puedes conservar, fusionar, separar o renombrar estas experiencias si lo justificas:

1. **Inicio / Dashboard Docente**
   - Vista de trabajo diaria del profesor: que sigue hoy, clases proximas, pendientes, sync, alertas y sugerencias IA.

2. **Planeaciones Como Word/Google Docs**
   - Editor documental, plantillas, import/export, IA pedagogica y asignacion silenciosa a clases.
   - Debe redisenarse visualmente desde cero aunque ya exista `DocEditor`.

3. **Classroom / Clases / Grupos**
   - Cursos, unidades, materiales, actividades, alumnos, entregas, asistencia, calificaciones y reportes operativos.
   - Debe redisenarse visualmente desde cero aunque ya exista `ClassroomHomeScreen` y `ClassroomGroupScreen`.

4. **Contenido / Biblioteca / Recursos / Plantillas**
   - Hub transversal de recursos docentes, archivos, enlaces, plantillas, materiales reutilizables y contenido generado.
   - Debe decidirse si es hub propio, parte de Classroom o biblioteca global.

5. **Excel / Listas / Registros Tabulares**
   - Listas libres, asistencia, calificaciones, import/export CSV/XLSX, grid editable, filtros y sincronizacion bidireccional con Classroom.

6. **Canva / Genially / Diseno Didactico**
   - Editor visual opcional para presentaciones, actividades, mapas, lineas de tiempo, examenes visuales y materiales.

7. **WhatsApp Docente / Chat / Contactos / Comunidad**
   - Mensajeria profesional, envio de recursos, contactos, estados de envio, notificaciones y colaboracion docente.
   - El feed social actual puede mantenerse, transformarse o quedar como futuro secundario.

8. **Reportes / Analitica / Gamificacion**
   - Rendimiento de alumnos, grupos y docente. Idealmente consultable sin saturar la experiencia diaria.

9. **Calendario / Seguimiento Personal**
   - Clases por dia, tareas proximas, sesiones planeadas, eventos importantes y posible integracion futura con calendarios.

10. **Cuenta / Perfil / Configuracion / Accesibilidad / Seguridad**

- Perfil, cuenta, roles, sesiones, privacidad, terminos, tema, fuente, daltonismo, preferencias y accesibilidad real.

No te limites a esta lista si el repo o la vision sugieren otra organizacion mejor. Tu responsabilidad es proponer la arquitectura de experiencia mas coherente para docentes.

## Punto Especial: Stitch, Figma, Claude Design Y Prompts Visuales

Analiza con cuidado como deberia usarse IA de diseno en este proyecto.

El repo ya tiene:

- `COLORS` y temas en `src/themes/colors.ts`.
- tokens Material 3/Stitch en la paleta.
- estilos mayormente con `StyleSheet.create`.
- algunas pantallas inspiradas en Stitch/Figma.
- `AnimatedTopPill` respaldado en documentacion como referencia, pero no obligatorio.
- `FloatingActionIcons` global para cuenta, notificaciones y ayuda.
- `WebScrollView` para evitar scroll roto en web movil.
- diseno responsivo parcial con `useWindowDimensions`, `Platform.OS` y `src/utils/responsive.ts`.

Necesito que evalues:

- Si conviene usar Stitch/Figma/Claude Design primero para vision visual global, no para codigo final.
- Como crear prompts visuales por modulo.
- Como validar pantallas generadas contra heuristicas de Nielsen.
- Como traducir un mockup a React Native manteniendo MVVM.
- Como crear tokens, componentes base y layouts compartidos antes de codificar pantallas finales.
- Cuando aceptar una propuesta visual generada por IA y cuando rechazarla.
- Como evitar que una herramienta visual produzca pantallas bonitas pero imposibles de mantener.

No quiero que propongas copiar pantallas generadas sin integrarlas a arquitectura, navegacion, sync, auth, accesibilidad y pruebas.

## Punto Especial: IA-First Realista

PlanearIA debe sentirse IA-first, pero no debe volverse cara, invasiva ni insegura.

Considera que:

- `backend/lib/aiGateway.js` soporta proveedores OpenAI-compatible: OpenRouter, Groq, OpenAI, Together y custom providers.
- `backend/lib/aiUsageLimiter.js` limita uso por accion.
- Hay endpoints IA para planeaciones y Classroom.
- El frontend no debe llamar modelos directamente.
- Toda funcion IA debe tener fallback, timeout, costo estimado/controlado, error visible y revision humana.
- La IA debe ayudar de forma silenciosa, no quitar control al docente.
- No guardar contenido generado por IA sin oportunidad de revision.
- No proponer features IA costosas si no hay free tier o fallback claro.

Evalua como cada experiencia futura puede integrarse IA-first sin romper bajo costo, privacidad, offline-first ni UX.

## Lo Que Quiero Que Me Entregues

No implementes codigo.

No escribas todavia el plan maestro completo.

## Dinamica De Entrega Muy Importante

No quiero que entregues todos los puntos siguientes en un solo mensaje gigante. Si intentas cubrirlo todo de una vez, perderemos profundidad y probablemente acabaras dando resumenes superficiales.

Trabaja de manera secuencial.

En tu primera respuesta, entregame EXCLUSIVAMENTE:

1. **Diagnostico Ejecutivo**.
2. **Vision UX/UI Objetivo**.
3. **Estrategia De Navegacion Global**.
4. **Arquitectura De Experiencias** en tabla.

Al final de esa primera respuesta, preguntame si estoy de acuerdo con la vision y la navegacion base. No avances al diseno detallado de cada experiencia hasta que yo te de luz verde.

Cuando yo confirme, entonces seguiremos por bloques:

- Bloque 2: redisenio detallado por experiencia.
- Bloque 3: sistema visual, componentes base y estrategia web/tablet/movil.
- Bloque 4: metodologia IHC, Stitch/Figma/Claude Design e IA-first.
- Bloque 5: plan de transicion, riesgos, anti-patrones y recomendacion final.

La lista siguiente define el mapa completo de la auditoria, pero no debes responderla toda en la primera entrega.

## Mapa Completo De La Auditoria

### 1. Diagnostico Ejecutivo

- Que es PlanearIA hoy.
- Que se aprendio del estado actual.
- Que partes son funcionalmente valiosas.
- Que partes visuales o de navegacion deben redisenarse sin miedo.
- Que riesgos tecnicos no deben ignorarse aunque el diseno se piense desde cero.

### 2. Vision UX/UI Objetivo

- Como deberia sentirse PlanearIA para un docente.
- Que debe ver primero al abrir la app.
- Que acciones deben estar a un toque.
- Que cosas deben ser silenciosas o automatizadas.
- Que cosas nunca deben abrumar.

### 3. Arquitectura De Experiencias

Haz una tabla con:

- Experiencia propuesta.
- Objetivo docente.
- Modulos/codigo actual relacionado.
- Si debe ser tab, hub, flujo contextual o herramienta secundaria.
- Plataformas clave: movil, tablet, web.
- IA posible.
- Sync/offline requerido.
- Prioridad.
- Riesgo principal.

### 4. Redisenio Por Experiencia

Para cada experiencia importante, describe:

- Pantallas ideales.
- Flujo principal.
- Empty states.
- Estados offline/sync/error.
- Acciones principales.
- Acciones secundarias.
- Que deberia cambiar respecto a la app actual.
- Que codigo actual podria servir solo como referencia tecnica, no como limite visual.

### 5. Estrategia De Navegacion Global

Propon una estructura de navegacion objetivo:

- Tabs o sidebar.
- Diferencias movil/tablet/web.
- Donde vive el dashboard.
- Donde viven Planeaciones y Classroom.
- Que pasa con Feed, Social y Contenido.
- Como se entra a herramientas avanzadas como Excel, Canva, Reportes y Calendario.
- Como evitar duplicidad de flujos.

### 6. Sistema Visual Y Componentes Base

Propon:

- Principios visuales.
- Tokens necesarios.
- Componentes base.
- Componentes de datos.
- Componentes de edicion.
- Componentes de IA.
- Componentes de sync/offline.
- Componentes accesibles.
- Que debe resolverse antes de disenar pantallas finales.

### 7. Estrategia Web / Tablet / Movil

Define:

- Pantalla madre responsiva por defecto.
- Breakpoints sugeridos.
- Layout movil.
- Layout tablet.
- Layout web.
- Cuando justificar `.web.tsx` o `.native.tsx`.
- Reglas para evitar scroll roto, botones muertos y funciones que solo existen en una plataforma.

### 8. Metodologia UX/UI Para El Plan Maestro

Basate en Interaccion Humano-Computadora:

- Heuristicas de Jakob Nielsen.
- Severidad 0-4.
- Reduccion de carga cognitiva.
- Accesibilidad.
- Claridad de CTA.
- Reconocimiento antes que memoria.
- Prevencion de errores.
- Estados de sistema visibles.
- Validacion manual por capturas.
- Ground truth por experiencia madre.

Explica como convertir esta auditoria en fases para un futuro plan maestro.

### 9. Stitch / Figma / Claude Design

Propon un flujo de trabajo concreto:

- Que pedirle a herramientas visuales.
- Que prompts crear.
- Que validar.
- Que descartar.
- Como pasar de mockup a componentes.
- Como documentar decisiones.
- Como mantener homogeneidad entre modulos.

### 10. IA-First En La UX

Para cada experiencia, indica:

- Donde IA ayuda de verdad.
- Donde IA seria prematura.
- Que debe ser automatico.
- Que debe pedir confirmacion.
- Que debe tener fallback local.
- Que riesgos de costo/privacidad existen.

### 11. Plan De Transicion Conceptual

Aunque el diseno se piense desde cero, necesito una ruta conceptual posterior:

- Que redisenar primero.
- Que validar primero con usuarios/docentes.
- Que se puede prototipar sin tocar backend.
- Que requiere adaptar arquitectura.
- Que conviene dejar para planes futuros.
- Que componentes actuales podrian rescatarse despues.

### 12. Riesgos Y Anti-Patrones

Lista cosas que una IA futura NO debe hacer:

- Copiar codigo open source incompatible.
- Cambiar stack sin razon.
- Crear modulos aislados.
- Duplicar Classroom y Contenido.
- Hacer IA directa desde frontend.
- Crear pantallas bonitas sin sync/offline.
- Romper web/movil.
- Ignorar accesibilidad.
- Tratar el redisenio como simple cambio de colores.

### 13. Recomendacion Final

Dame una decision clara:

- Cual deberia ser el alcance del `Plan Maestro: UX/UI y Navegacion Global`.
- Si debe ser un solo plan gigante o varios subplanes coordinados.
- Que modulo o experiencia deberia disenar primero.
- Que entregables deberia producir antes de escribir codigo.
- Como mantener el proyecto viable para un estudiante que trabaja solo.

## Reglas De Estilo Para Tu Respuesta

- Responde en espanol.
- Se directo, pero no superficial.
- Usa lenguaje conceptual y pedagogico.
- Explica las decisiones como para un estudiante de ingenieria.
- Evita jerga corporativa.
- No uses emojis.
- No propongas infraestructura cara como primera opcion.
- No propongas reescritura tecnica total.
- Si haces suposiciones, marcalas como suposiciones.
- Si detectas contradiccion entre documentacion y codigo, dilo claramente.
- Si falta informacion visual o ground truth, indicalo como bloqueo antes de implementar UI de alta paridad.
- No te limites a proteger lo existente. Para UX/UI, piensa desde la vision ideal y luego aterriza riesgos tecnicos.

## Criterio De Calidad

Tu respuesta sera buena si me deja listo para crear un futuro `Plan Maestro: UX/UI y Navegacion Global` que:

- Redisene PlanearIA completa desde la vision docente.
- Incluya Planeaciones y Classroom aunque ya funcionen.
- Respete MVVM, sync, backend, auth, offline-first e IA gateway.
- Defina una experiencia web/tablet/movil coherente.
- Use Stitch/Figma/Claude Design como apoyo de diseno, no como arquitectura.
- Sea entendible para un estudiante de ingenieria.
- Evite quedar atrapado por la interfaz actual.
- Permita despues decidir que codigo se reutiliza y que se reemplaza.
