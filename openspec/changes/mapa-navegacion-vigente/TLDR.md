# TLDR: mapa-navegacion-vigente

## Que problema resuelve (Proposal)

La documentacion que describe la navegacion de PlanearIA quedo desfasada tras el change #81. El mapa de
referencia sigue anunciando cinco pestanas que ya no existen (Feed, Contenido, Grupos, Social y
Configuracion), cita un archivo borrado como fuente y afirma que el Asistente no tiene pantalla propia,
cuando si la tiene. Ese mismo error esta repetido en un documento de fundamentos con mas autoridad, y
ambos son lectura obligatoria de la skill de diseno. El siguiente hito del proyecto es construir los
prototipos de Figma: si nadie corrige esto antes, se disenaran pantallas sobre una estructura inexistente.

## Como se resuelve (Design)

El mapa se reescribe copiando el manifiesto de rutas del codigo, que es el unico archivo cuya exactitud
esta garantizada por la compilacion, y declara abiertamente que es un documento derivado de el. Las
pantallas antiguas no se borran ni se etiquetan solo como "viejas": se registran diciendo dentro de que
hub viven hoy, que es lo que un disenador necesita saber. Se descarto generar el mapa con un script, por
ser demasiada maquinaria para un change documental urgente, y queda anotado como el siguiente paso si el
problema reaparece. Tambien se corrige el documento de fundamentos, sin el cual el objetivo no se cumple.

## Que comportamiento queda garantizado (Spec)

Quien abra el mapa encontrara los cinco hubs reales con su ruta y su pantalla de entrada, y sabra que el
documento describe lo construido y no lo planeado. Buscar cualquiera de las cinco pestanas antiguas en la
documentacion activa ya no devolvera nada que las presente como navegacion vigente. Feed, Social y
Contenido apareceran indicando en que hub viven. El plan maestro dira con claridad que es una foto de su
fecha y que el estado real del trabajo se sigue en GitHub. Las decisiones ya tomadas dejaran de figurar
como preguntas abiertas, conservando su rastro.

## Como se ejecuta (Tasks)

Primero se congela la informacion del codigo con su commit exacto, para no escribir de memoria. Despues se
rehace el mapa hub por hub y se corrige el documento de fundamentos. Luego se separa el plan del estado
operativo: aviso de foto fechada, cuatro changes marcados como archivados y dos decisiones marcadas como
resueltas con su enlace. Enseguida se corrige el estado del milestone en el documento de operacion. Al
final se verifica todo con busquedas y revision de enlaces, se comprueba que no se toco codigo, y se
derivan a issues propios los pendientes que quedan fuera de alcance.

## Resumen integral del change

Es un change puramente documental que pone al dia la descripcion de la navegacion de PlanearIA para que
sirva de entrada confiable al trabajo de Figma. Toca cuatro archivos de documentacion y ninguna linea de
codigo. Corrige tres cosas: un mapa que describe una app que ya no existe, un plan maestro que se lee como
si fuera el estado real del proyecto, y un documento de operacion que declara abierto un milestone
cerrado. Amplia el alcance original del issue con un archivo mas, porque sin el no se puede cumplir lo
pedido. Si algo sale mal, revertir el commit deja todo como estaba.
