# TLDR: golden-journeys-qa-visual

## Que problema resolvemos (Proposal)

Antes de rediseñar pantallas hay un requisito llamado R2 que exige "recorridos dorados": los caminos
del docente que nunca deben romperse. Tres documentos los mencionan y ninguno dice cuales son, en que
tamaños de pantalla se revisan ni que pruebas hay que guardar. El cambio anterior hizo esa revision
visual muy bien, pero su forma de trabajo quedo encerrada en su carpeta: el siguiente cambio tiene que
inventarla otra vez. Y una revision que se reinventa se degrada sin que nadie lo note, porque no se ve
la captura que no se tomo. El problema real no es que falte una herramienta, sino que falta el acuerdo
escrito.

## Como lo resolvemos (Design)

Escribimos los recorridos en un archivo que las herramientas pueden leer, no solo las personas. Cada
recorrido dice si hoy se puede hacer completo o solo a medias, y cuando esta a medias nombra al cambio
futuro que lo completara. Asi nunca pedimos revisar pantallas que todavia no existen. Definimos tres
niveles de esfuerzo, para que un ajuste de color no cueste lo mismo que rehacer la navegacion. Y
agregamos una revision automatica que confirma que no falte ninguna captura ni ninguna seccion del
reporte. No instalamos Playwright en el proyecto: la revision sigue conduciendose con la herramienta
ya conectada, y esa decision queda escrita con sus razones.

## Que cambia para el docente (Spec)

Nada cambia hoy en la aplicacion: este trabajo no toca ninguna pantalla. Lo que cambia es la
proteccion del docente de aqui en adelante. A partir de ahora, cualquier rediseño tiene que demostrar
que la aplicacion sigue funcionando en telefono, tablet y computadora antes de darse por terminado, y
que los caminos importantes siguen abiertos: entrar y llegar a su escritorio, preparar el dia, crear
una planeacion y asignarla, pasar calificaciones. Si alguna de esas pruebas falta, la revision
automatica lo detecta. Es la diferencia entre confiar en que alguien reviso y poder comprobarlo.

## Como lo hicimos (Tasks)

Cinco bloques en orden. Primero el archivo de recorridos, con los cuatro definidos y dos reservados
para mas adelante, verificando que cada pantalla mencionada exista de verdad en el codigo. Luego la
revision automatica y sus casos de prueba, incluidos los que deben fallar. Despues el documento que
explica el procedimiento, con las cuatro trampas del navegador que producen pruebas engañosas si se
ignoran. Enseguida ejecutamos el recorrido base sobre la aplicacion real en tres tamaños, con capturas
verdaderas. Cierran las validaciones del proyecto y una revision critica independiente.

## Resumen integral

Este cambio convierte un requisito escrito en prosa en algo que se puede ejecutar y comprobar. Define
cuatro recorridos criticos del docente, fija los tamaños de pantalla que se revisan, establece que
pruebas hay que guardar y añade una verificacion que detecta lo que falta. Su decision mas importante
es honesta: los recorridos que dependen de pantallas futuras se declaran a medias, con nombre y dueño,
en vez de fingir que ya se pueden revisar. Tambien decide no instalar Playwright todavia, porque el
problema era el acuerdo y no la herramienta, y deja escrito cuando habria que reconsiderarlo. No cierra
R2: la aprobacion visual y el reclutamiento de docentes siguen pendientes aparte.
