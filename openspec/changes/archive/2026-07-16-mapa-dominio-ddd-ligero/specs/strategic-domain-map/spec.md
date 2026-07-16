## ADDED Requirements

### Requirement: Mapa DDD estratégico ligero y encontrable

PlanearIA SHALL mantener un único mapa DDD estratégico ligero en la documentación fundamental y SHALL enlazarlo desde una entrada arquitectónica vigente. El mapa SHALL declarar que los bounded contexts organizan lenguaje, responsabilidad y contratos dentro del monolito modular; SHALL NOT exigir microservicios, CQRS, event sourcing ni un refactor global.

#### Scenario: Agente inicia un change arquitectónico

- **WHEN** un agente abre la arquitectura o su índice para preparar un change
- **THEN** puede localizar el mapa DDD y entender que es una referencia estratégica dentro del monolito modular

### Requirement: Glosario y límites de contexto explícitos

El mapa SHALL definir un glosario docente y los límites de Identidad y Cuenta, Planeación y Contenido Docente, Classroom y Organización Académica, Seguimiento y Evaluación, Comunicación Profesional, y Experiencia y Preferencias. Cada límite SHALL declarar propósito, términos propios, owner técnico actual y responsabilidad que queda fuera de su alcance.

#### Scenario: Términos de aula se consultan antes de extender un flujo

- **WHEN** un change necesita relacionar Grupo, Clase, Unidad, Alumno, Tarea o Entregable
- **THEN** el mapa permite distinguir su significado y el contexto responsable antes de proponer un modelo o servicio nuevo

### Requirement: Propiedad única de entidades compartidas

El mapa SHALL incluir una matriz para Usuario, Rol, Sesión, Grupo, Unidad, Alumno, Planeación, Plantilla, Recurso, Tarea, Entregable, Asistencia, Calificación, Contacto, Conversación, Mensaje y Notificación. Cada fila SHALL declarar un único contexto owner, consumidores autorizados, referencia por identificador o proyección explícita e invariantes aplicables.

#### Scenario: Cambio consume una entidad de otro contexto

- **WHEN** un agente necesita usar una entidad compartida fuera de su contexto owner
- **THEN** la matriz identifica al owner, los consumidores permitidos y las invariantes que el cambio debe preservar sin duplicar la entidad

### Requirement: Capacidades transversales respetan los dueños de dominio

El mapa SHALL modelar Sync/offline, adjuntos, notificaciones, seguridad/autorización y asistencia IA como capacidades transversales. Estas capacidades SHALL coordinar almacenamiento, entrega, permisos o procesamiento sin apropiarse de entidades académicas; los datos multiusuario SHALL conservar aislamiento por `userId`, los datos sincronizables SHALL conservar `src/sync` y los resultados IA SHALL permanecer revisables por el docente.

#### Scenario: Capacidad transversal coordina un objeto académico

- **WHEN** Sync, adjuntos, notificaciones, seguridad o IA intervienen sobre una Planeación, Recurso, Tarea, Entregable, Asistencia o Calificación
- **THEN** el mapa conserva el contexto académico owner y describe la capacidad como coordinación, referencia o estado técnico asociado

### Requirement: Consultas de decisión verifican el mapa

El mapa SHALL incluir consultas de ejemplo para una extensión de Classroom, una de Planeación o Contenido, una de Comunicación Profesional y una integración transversal de Sync u IA. Cada ejemplo SHALL conducir a un contexto owner, consumidores e indicación de contrato cruzado o de ausencia justificada.

#### Scenario: Agente evalúa una integración transversal

- **WHEN** un agente consulta cómo agregar una acción de IA o sync a un flujo docente existente
- **THEN** el ejemplo le permite identificar el owner del objeto, la capacidad transversal aplicable y la regla que evita una integración o duplicación no autorizada
