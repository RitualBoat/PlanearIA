## Intención de la propuesta

El change responde al issue #63: evitar que futuros cambios creen versiones distintas de las mismas entidades entre Office, Classroom, comunicación y capacidades compartidas. Dejará una referencia pequeña y verificable para decidir quién es dueño de cada dato antes de modificarlo.

## Enfoque del diseño

Se documentarán seis contextos pedagógicos y una matriz de ownership basada en el código actual, sin forzar que las carpetas actuales sean límites definitivos. Sync, adjuntos, notificaciones, seguridad e IA se tratan como capacidades transversales. Un contrato solo se documenta cuando un change cruza contextos.

## Comportamiento esperado de las specs

El mapa será encontrable, tendrá glosario, límites, owners, consumidores e invariantes. Las instrucciones de diseño distinguirán un change local de uno cruzado y pedirán owner, contrato y compatibilidad solo cuando haga falta. Nada de esto implica microservicios ni una migración de datos.

## Plan práctico de las tareas

Primero se contrasta el mapa con Contexts, servicios, rutas y sync. Después se escribe el documento, se enlaza y se ajusta la regla de diseño. Al final se verifican escenarios, OpenSpec estricto y paridad del harness; la revisión adversarial y archive quedan para después de aprobar la aplicación.

## Resumen integral del change

Esta propuesta crea una brújula documental para que PlanearIA conserve un solo significado y propietario por entidad mientras crece como monolito modular. Está lista para revisión de planificación; no aplica cambios de producto ni de datos.
