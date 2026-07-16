## Context

Este change responde al issue #63 y al gate R1 de `PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`. PlanearIA es un monolito modular: las pantallas, Contexts, servicios, registro de `src/sync` y rutas backend expresan responsabilidades reales, pero no existe una fuente única para decidir quién posee una entidad cuando una experiencia la consume.

La exploración contrastó la documentación vigente con `App.tsx`, la navegación, `src/sync/services/entitySync.ts`, `SyncContext`, servicios de Classroom y las rutas backend. GitNexus no devolvió una respuesta estructural suficiente para esta pregunta; CodeGraph se usó como fallback y confirmó el orquestador global de sync. No se detectó la necesidad de modificar runtime, datos o infraestructura.

## Goals / Non-Goals

**Goals:**

- Dejar una referencia breve, encontrable y basada en código para lenguaje ubicuo, contextos delimitados y propiedad de datos.
- Dar a cada entidad compartida un único owner, consumidores, tipo de referencia e invariantes que orienten futuros cambios.
- Hacer explícito cómo un diseño de change declara una integración cruzada sin imponer contratos donde no existen.
- Preservar las reglas vigentes: monolito modular, MVVM, `src/sync`, `userId`, IA solo por gateway y SQLite opt-in.

**Non-Goals:**

- Convertir la estructura actual de carpetas, providers o rutas en una reorganización DDD táctica.
- Cambiar modelos, endpoints, persistencia, sincronización, autorizaciones o UX.
- Introducir microservicios, CQRS, event sourcing o nuevas dependencias.

## Decisions

### 1. Un mapa estratégico documental es la fuente de decisión

Se creará `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md` y se enlazará desde la arquitectura o índice fundamental. El documento distinguirá el inventario técnico actual de los límites de dominio objetivo.

**Alternativas consideradas:** usar solo `MAPA_MODULOS_ACTUALES.md` conservaría una fotografía de carpetas, no ownership ni lenguaje; codificar los límites en tipos o carpetas convertiría una decisión estratégica en un refactor prematuro. Se elige documentación versionada, revisable y de bajo costo.

### 2. Se usarán seis contextos, con capacidades transversales separadas

El mapa describirá: Identidad y Cuenta; Planeación y Contenido Docente; Classroom y Organización Académica; Seguimiento y Evaluación; Comunicación Profesional; y Experiencia y Preferencias. Cada contexto tendrá propósito, términos permitidos, owner técnico actual y fronteras.

Sync/offline, adjuntos, notificaciones, seguridad/autorización y asistencia IA se documentarán como capacidades transversales. Pueden conservar metadatos técnicos o de entrega, pero no apropiarse de entidades académicas ni duplicar sus reglas. La notificación, por ejemplo, puede poseer su estado de entrega y debe referir un objeto fuente real.

**Alternativas consideradas:** agrupar todo bajo Classroom simplificaría la navegación actual pero ocultaría Office, comunicación y la reutilización de contenido; modelar cada carpeta como contexto multiplicaría límites frágiles. Se eligen límites pedagógicos que explican los módulos actuales sin exigir que coincidan uno a uno.

### 3. La matriz de entidades usa un único owner y referencias por identificador

La matriz incluirá Usuario/Rol/Sesión; Grupo/Unidad/Alumno; Planeación/Plantilla/Recurso; Tarea/Entregable; Asistencia/Calificación; Contacto/Conversación/Mensaje; y Notificación. Para cada fila declarará owner, consumidores, referencias permitidas e invariantes. Una entidad no se copia entre contextos: el consumidor conserva IDs o una proyección explícita, y el owner conserva sus reglas.

Los invariantes mínimos conservarán `userId` para datos multiusuario; relaciones académicas válidas por ID; escritura local y cola global para datos sincronizables; y confirmación docente para resultados IA revisables. La matriz indicará el estado actual cuando el código todavía concentre providers globales.

**Alternativas consideradas:** permitir múltiples owners por conveniencia reproduce la ambigüedad actual; exigir eventos de dominio añadiría infraestructura y cambios tácticos sin necesidad. Se elige ownership único más referencias simples.

### 4. El contrato cruzado es proporcional al diseño del change

La instrucción de artefacto `design` añadirá una sección obligatoria de contextos afectados. Si el change afecta más de uno, debe declarar owner de cada dato, dirección/forma del contrato, compatibilidad y cómo se preservan los invariantes. Si solo afecta uno, debe dejar constancia de que no existe contrato cruzado y no inventar eventos, APIs o capas de integración.

**Alternativas consideradas:** exigir contratos para todo change produce documentación de relleno; no exigirlos mantiene cambios cruzados implícitos. La decisión deja un umbral observable y ligero.

### 5. La evidencia se basa en consultas que llevan a una decisión

El mapa incluirá ejemplos que cubran cambios de Classroom, Planeación/Contenido, Comunicación y una capacidad transversal de Sync o IA. Cada ejemplo devolverá contexto owner, consumidores y el contrato requerido o la razón para no requerirlo. La implementación validará OpenSpec estricto y paridad del harness.

## Risks / Trade-offs

- [Los módulos actuales no coinciden perfectamente con los límites] → El mapa separa "owner de dominio" de "ubicación técnica actual" y no ordena mover código.
- [El glosario se vuelve obsoleto] → Todo change que altere ownership o contrato debe actualizar el mapa como parte de su diseño y revisión.
- [La regla de design genera burocracia] → El caso intra-contexto admite una declaración breve y prohíbe crear contratos ficticios.
- [Un agente trata una capacidad transversal como dueño académico] → La matriz exige owner único y los ejemplos muestran el patrón de referencia al objeto fuente.

## Migration Plan

1. Añadir el mapa y su enlace de encontrabilidad.
2. Añadir la regla proporcional de contextos y contrato al artefacto `design` de OpenSpec.
3. Verificar los escenarios de las nuevas specs, `openspec validate --all --strict` y `npm run agent:harness:check`.
4. Adoptar la referencia en proposals posteriores sin migrar código ni datos.

El rollback revierte únicamente el documento, su enlace y la regla de planificación en un commit aislado. No hay despliegue, backfill, migración ni restauración de datos.

## Open Questions

- Ninguna bloqueante. El mapa debe declarar las excepciones actuales como estado técnico y no como una autorización para duplicar ownership.
