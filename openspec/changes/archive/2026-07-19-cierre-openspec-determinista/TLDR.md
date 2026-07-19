# TLDR: cierre-openspec-determinista

## Que problema resuelve (intencion del proposal)

Archivar un change es el unico paso del flujo que no tiene comando propio. Se ejecuta leyendo prosa, y
esa prosa recomienda justo el paso que rompe: sincronizar las specs antes de archivar. Cuando eso pasa,
la CLI intenta aplicar las mismas deltas otra vez y aborta. Tambien manda mover carpetas a mano, lo que
choca con un bloqueo de Windows, y nadie verifica la rama ni crea el commit. Resultado: tres cierres
seguidos (#84, #85, #112) necesitaron rescates manuales distintos. Este change convierte ese tramo en
un comando reproducible.

## Como lo aborda (enfoque del design)

Se agrega `npm run opsx:archive`, que orquesta sin reinventar: la CLI de OpenSpec sigue siendo la unica
que escribe las specs y mueve carpetas, porque ya sabe hacerlo bien. Lo que aporta el comando es la
decision previa. Mira si las deltas ya se aplicaron y responde una de tres cosas: no aplicadas,
aplicadas, o a medias. Las dos primeras tienen accion clara. La tercera se detiene y dice cual
requirement no cuadra, porque adivinar ahi corrompe la spec en cualquier direccion.

## Que cambia al usarlo (comportamiento de la spec)

Antes de tocar nada, el comando revisa que no estes en `development` ni en una rama protegida, y que no
haya trabajo ajeno sin guardar. Corre el gate de readiness y se detiene si falla. Archiva, deja todo
rastreado y crea el commit con el mensaje de siempre, asi que `opsx:finish` encuentra el arbol limpio y
ya no aborta. Si lo corres dos veces, no duplica nada: detecta que ya estaba archivado y lo dice. Los
workflows que leen los agentes dejan de recomendar sincronizar antes y de mandar mover carpetas a mano.

## Como se construye (plan de tasks)

Seis bloques. Primero la logica de clasificacion como funciones puras, para poder probarla sin git ni
red. Luego el comando que las usa, con sus guardias y su commit. Despues la normalizacion de los
workflows, que va en el parcheador y no en los archivos generados, porque esos se regeneran. Enseguida
las pruebas, que cubren los tres estados de sincronizacion, los cuatro de repositorio y los abortos.
Al final la documentacion del orden canonico y la evidencia de validacion.

## Resumen integral del change

El cierre OpenSpec falla porque dos herramientas escriben las mismas specs y ninguna regla dice cual
manda. Este change nombra un solo owner: la CLI, durante el archive. Encima pone un comando que decide
antes de escribir, verifica la rama, corre el gate, consolida en un commit y es seguro de repetir. Los
workflows dejan de recomendar la ruta rota. Lo que hoy son tres rescates manuales distintos pasa a ser
un camino unico y probado. No toca producto, ni la espera de checks de #96, ni la evidencia archivada.
