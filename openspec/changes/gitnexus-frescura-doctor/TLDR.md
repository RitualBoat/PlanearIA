# TLDR: gitnexus-frescura-doctor

## Por que hacemos este cambio (proposal)

El doctor del harness dice que GitNexus esta sano cuando en realidad su indice esta atrasado: fue
construido en un commit viejo y nadie lo comprueba. El agente que llega despues lee ese verde y decide
que puede romper y que no usando un mapa vencido. Encima, el comando que deberia arreglarlo termina
diciendo "listo" sin arreglar nada. No falta una funcion nueva: ya existe una spec que exige comprobar
frescura y hacer una consulta real, y el doctor simplemente no la cumple. Este change cierra esa
distancia entre lo que la spec pide y lo que el codigo hace.

## Como lo vamos a resolver (design)

Cambiamos la forma de medir la salud. Hoy es "no vi ningun error conocido, luego todo bien", y por eso
cualquier problema no listado pasa como verde. Pasa a ser una clasificacion explicita: fresco, atrasado
o no interpretable, y solo el primero permite aprobar. Ademas el doctor hara una consulta estructural
real antes de aprobar, usando la misma funcion que ya usa el comando de verificacion, para que no
existan dos definiciones distintas de "sano". El comando de recuperacion pasa a reconstruir el indice de
verdad, conservando la bandera que impide que toque los archivos de instrucciones de los agentes.

## Que comportamiento queda garantizado (spec)

Un indice atrasado nunca da aprobado. Un indice fresco que no logra resolver la consulta de prueba
tampoco. Una salida que el clasificador no entiende falla en vez de pasar de largo, porque no encontrar
un error conocido no es prueba de salud. Un indice fresco y funcional si aprueba. El doctor sigue sin
tocar nada: no repara, no reconstruye, no escribe, y una prueba lo verifica revisando los comandos que
ejecuta, no solo el resultado. El comando de recuperacion deja de poder declarar exito si el indice
sigue atrasado, y sigue habiendo un solo camino de recuperacion, no dos.

## Como se implementa paso a paso (tasks)

Primero se deja registrada la falla actual con salidas reales, para poder demostrar despues que se
corrigio. Luego se escribe el clasificador de frescura y sus pruebas, incluida la ruta con espacios de
Windows. Despues se extrae la verificacion estructural a una funcion compartida, comprobando antes y
despues que nada cambio de comportamiento. Enseguida se reescribe el check del doctor y se corrige el
comando de recuperacion, verificando en un caso real que deja el indice al dia. Al final se anaden las
pruebas de los tres desenlaces, se corrige la documentacion de agente en su fuente y se ejecutan
validaciones, revision adversarial y el gate de archivo.

## Resumen integral del change

El harness aprobaba GitNexus sin comprobar si su indice estaba al dia ni si podia responder una
consulta, y su comando de recuperacion prometia un arreglo que no hacia. El resultado era un verde en el
que no se puede confiar, justo en la herramienta que los agentes usan para entender el codigo antes de
tocarlo. Este change convierte la salud en algo que se afirma con evidencia y no por descarte, hace que
el doctor pruebe la ruta antes de aprobarla, y arregla la recuperacion para que cumpla lo que promete.
Es tooling local: no toca producto, datos ni entrega, y revertir el commit restaura el estado anterior.
