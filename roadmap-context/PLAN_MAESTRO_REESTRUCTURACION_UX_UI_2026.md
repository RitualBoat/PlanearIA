# PLAN MAESTRO DE REESTRUCTURACION UX/UI 2026 - PLANEARIA

## 1) Objetivo

Redisenar de forma integral toda la aplicacion para tener:

- Navegacion moderna, estable y consistente en iOS, Android, tablet y web.
- Estilo visual unificado basado en la referencia de la pantalla de importacion.
- Experiencia de uso clara, con dashboard real en Home y modulos persistentes.
- Comportamiento responsive profesional en web (scroll correcto, layout adaptativo, sin recortes).

## 2) Nueva arquitectura de navegacion

## 2.1 Shell principal (obligatorio)

Migrar de Stack monolitico a estructura anidada:

- RootStack
  - AuthStack (Login)
  - AppTabs (post-login)

## 2.2 Bottom tabs persistentes (objetivo UX)

Tabs persistentes visibles en la app:

1. Home (nuevo dashboard de resumen)
2. Planeaciones
3. Grupos
4. Recursos
5. Configuracion (antes Cuenta)

Nota UX solicitada:

- Se mantienen presentes Planeaciones, Grupos, Recursos y Configuracion en barra inferior.
- Home deja de ser menu y pasa a ser resumen operativo del sistema.

## 2.3 Subnavegacion por modulo

Cada tab tendra su stack interno:

- HomeStack: HomeDashboard
- PlaneacionesStack: Hub planeaciones, crear, editar, importar, lista
- GruposStack: lista, detalle, tareas, calificar
- RecursosStack: biblioteca, examenes, presentaciones, mapas, lineas de tiempo, lista
- ConfiguracionStack: configuracion general + perfil/cuenta

## 3) Sistema de diseno (Design System V2)

Basado en la referencia visual de Importar Planeacion.

## 3.1 Tokens visuales

- Fondo base suave (gris-azulado claro).
- Superficies blancas con cards redondeadas.
- Primario azul vibrante para CTA y elementos activos.
- Texto principal oscuro de alto contraste.
- Texto secundario gris azulado.
- Estados: exito, error, warning, info.

## 3.2 Componentes base reutilizables

Crear componentes UI compartidos:

- AppShell (contenedor responsivo + safe area + scroll)
- AppHeader (titulo/subtitulo/acciones)
- AppCard
- AppButton (primary/secondary/ghost/destructive)
- StatusChip
- EmptyState
- LoadingState (incluye spinner animado)
- ErrorBanner
- SectionTitle
- BottomTabBarCustom (si se requiere estilo custom sobre tabs)

## 3.3 Animaciones UX

- Indicadores de carga con rotacion real para iconos/spinner.
- Transiciones suaves en cards (aparicion/estado).
- Microinteracciones en botones (pressed/active).
- Nada invasivo ni excesivo.

## 4) Estrategia responsive profesional (Web + Mobile)

## 4.1 Reglas de layout

- Evitar alturas fijas para contenedores principales.
- Todos los flujos largos con ScrollView/WebScrollView funcional.
- Layout web con max-width de contenido y centrado.
- Sidebar solo si aporta valor; por defecto, experiencia app-shell responsive.

## 4.2 Breakpoints objetivo

- mobile: < 768
- tablet: 768-1199
- desktop/web: >= 1200

## 4.3 Buenas practicas obligatorias

- Overflow controlado y visible.
- `keyboardShouldPersistTaps` y jerarquia de scroll correcta.
- Focus visible en web (accesibilidad).
- Tap targets minimos adecuados.

## 5) Home nuevo (Dashboard)

Home deja de ser menu de accesos y pasa a resumen operativo:

- Tarjeta de resumen de grupos (cantidad activos, proximos pendientes).
- Borradores recientes de planeaciones.
- Recursos editados recientemente.
- Ultimas entregas/tareas de alumnos (cuando exista data).
- Acciones rapidas (crear planeacion, crear grupo, importar).

## 6) Configuracion + Perfil

Renombrar Cuenta -> Configuracion.
Dentro de Configuracion:

- Preferencias de app
- Seguridad y sesion
- Sincronizacion
- Notificaciones
- Subseccion Perfil/Cuenta (datos personales)

## 7) Flujo Stitch obligatorio para tareas de diseno

Regla operativa permanente:

1. Antes de implementar una pantalla marcada como diseno, generar prompt detallado para Stitch.
2. Esperar capturas del usuario (pantalla por pantalla con scroll).
3. Implementar UI fiel al diseno aprobado.
4. Conectar navegacion y estados de UX.
5. Crear/ajustar pruebas.
6. Validar errores + tests + roadmap + sync Azure.

## 8) Plan de ejecucion por fases

## Fase 0 - Fundaciones (tecnica y visual)

- Crear design tokens y componentes base.
- Crear AppShell responsivo para web/mobile/tablet.
- Preparar arquitectura de tabs + stacks.

Entregables:

- tema/tokens centralizados
- componentes base listos
- navegacion base nueva montada

## Fase 1 - Navegacion principal

- Implementar AppTabs persistente con 5 tabs.
- Integrar stacks por modulo.
- Migrar rutas actuales sin romper flujos existentes.

Entregables:

- tabs funcionales
- deep links internos basicos
- navegacion consistente sin barra inferior heredada antigua

## Fase 2 - Rediseno visual modulo por modulo

Orden recomendado:

1. Home dashboard
2. Planeaciones
3. Grupos
4. Recursos
5. Configuracion/Perfil

Por cada pantalla:

- Prompt Stitch
- Capturas aprobadas
- Implementacion
- Pruebas de pantalla y navegacion

## Fase 3 - Web adaptation pro

- Ajustes de grids y max-width en desktop.
- Scroll y overflow revisados en todas las vistas largas.
- Accesibilidad web base (focus, contraste, labels).

## Fase 4 - Pulido y estandarizacion

- Consistencia de estilos y estados.
- Animaciones finales.
- QA cruzado por plataforma.

## 9) Matriz de migracion de pantallas

- HomeScreen -> Dashboard real
- PlaneacionesScreen -> Hub limpio + accesos principales
- CrearPlaneacionScreen -> alineacion visual V2
- EditorPlaneacionScreen -> densidad visual mejorada y panel IA pulido
- ListaPlaneacionesScreen -> cards y filtros V2
- ImportarPlaneacionScreen -> mantener referencia visual
- Modulo Grupos completo -> cards, tabs internas, detalle y tareas
- Modulo Recursos -> coherencia visual y placeholders controlados
- CuentaScreen -> ConfiguracionScreen + subseccion Perfil

## 10) Calidad y pruebas

## 10.1 Pruebas por capa

- Unit: hooks/viewmodels
- Integration: navegacion entre tabs/stacks
- UI: render y estados criticos por pantalla

## 10.2 Checklists minimos por pantalla

- Render ok en mobile/tablet/web
- Scroll funcional cuando hay contenido largo
- Sin recortes ni elementos fuera de viewport
- Estados loading/error/empty definidos
- Contraste y foco minimo aceptable

## 11) Gobierno del roadmap y Azure

Para ejecutar este plan sin romper trazabilidad:

- Mantener tareas existentes activas segun roadmap actual.
- Registrar esta reestructuracion como plan transversal de ejecucion.
- Al iniciar cada bloque real, mover estado en ROADMAP_COMPLETO.md y sincronizar con `actualizar_estados_api.py --auto`.
- Si se decide crear nuevas tareas explicitas para UX/UI global, primero generar import CSV para Azure y luego sincronizar.

## 12) Secuencia inmediata recomendada

1. Implementar Fase 0 (tokens + componentes base + shell responsive).
2. Implementar Fase 1 (tabs persistentes + stacks modulares).
3. Iniciar Home Dashboard con prompt Stitch especifico y captura de validacion.
4. Continuar modulo por modulo con la regla Stitch obligatoria.

## 13) Avance ejecutado (2026-03-29)

Estado general: Fase 1 y gran parte de Fase 2 completadas.

### 13.1 Fase 1 - Navegacion principal

- AppTabs persistente implementado con 5 tabs: Home, Planeaciones, Grupos, Recursos, Configuracion.
- Login redirige al shell principal con tabs.
- Barra de tabs pulida para web y movil (compacta, centrada y con espaciado consistente).

### 13.2 Fase 2 - Modulos migrados visualmente

- HomeDashboard redisenado (mobile + web responsive).
- Planeaciones:
  - Hub principal redisenado.
  - Pantalla de importacion redisenada.
  - Lista principal y flujo de acceso conservados.
- Grupos:
  - Hub principal redisenado.
  - Lista de grupos redisenada.
  - Crear grupo y detalle de grupo modernizados.
  - Pantallas de tareas (crear, asignar, detalle, calificar) alineadas visualmente.
- Recursos:
  - Hub principal redisenado.
  - Lista de recursos redisenada.
  - Pantallas secundarias (examenes, presentaciones, mapas mentales, lineas de tiempo) unificadas.
- Configuracion:
  - Cuenta migrada visualmente al esquema de Configuracion con tarjetas y estados consistentes.

### 13.3 Fase 3 - Web adaptation (parcial)

- Layouts con max-width y centrado en pantallas principales.
- Scroll funcional en vistas largas con WebScrollView o ScrollView segun corresponda.
- Eliminacion progresiva de barra inferior heredada en pantallas ya migradas para evitar doble navegacion.

### 13.4 Validacion rapida ejecutada

- Jest smoke test: OK.
- Tests de importacion/planeaciones intervenidos: OK.

### 13.5 Siguiente tramo recomendado

1. Completar estandarizacion de pantallas legacy restantes con BottomNavBar heredado.
2. Cerrar Fase 3 con checklist de accesibilidad web base por modulo.
3. Ejecutar suite corta de navegacion e interaccion tras consolidar la limpieza final.
