# TLDR: sanear-senal-tests-y-codificacion

## Intencion del Proposal (por que existe)

Las 116 suites pasan verdes pero ~18 emiten ruido de consola que esconde regresiones, y 5 archivos de `src` tienen mojibake UTF-8 doble visible al docente. Este change de saneamiento (issue #132, epic #129) corrige ambos hallazgos y agrega dos guardias permanentes: una que hace fallar `console.error`/`console.warn` inesperados en Jest y un check determinista que bloquea la doble codificacion en `src`. Resuelve la deuda `debt-cbe0188191b5` y `debt-f466da64b58a` sin tocar comportamiento de producto.

## Enfoque del Design (como se resuelve)

Tres decisiones: la guardia vive en un setup de Jest con helper importable que exige declarar la salida esperada por test y falla ante declaraciones no usadas; cada origen de ruido tiene su tratamiento (`act()` se corrige, terceros se justifican, logs de app se declaran); el check de codificacion es un script Node con fixtures positivo/negativo cableado como test permanente. La correccion de mojibake se limita a los 5 archivos verificados. No hay dependencias nuevas ni contrato cruzado entre contextos.

## Comportamiento esperado del Spec (que se promete)

La suite falla cuando un test emite `console.error`/`console.warn` no declarado, con el contenido capturado en el reporte. La salida esperada se declara por patron dentro del test; una declaracion sin uso tambien falla, y declarar algo no silencia lo inesperado. Nada se propaga entre tests. Los warnings `act()` se corrigen, nunca se encubren. El check de codificacion detecta el mojibake con linea exacta, acepta el UTF-8 legitimo del espanol y corre como gate en la suite habitual y CI. Los textos corregidos afirman la forma correcta.

## Plan practico de Tasks (en que orden se hace)

Cinco grupos: primero la guardia y sus propias pruebas (con mecanismo documentado para observar fallos sin romper la corrida); despues el script de codificacion, fixtures y test-gate; luego la correccion de los 5 archivos con mojibake; en cuarto lugar la limpieza de las ~18 suites ruidosas, empezando por los `act()`; al final typecheck, lint, checks del harness, corrida completa limpia, revision adversarial, assessment de remediacion que resuelve los dos IDs de deuda y gate de archive. Cada tarea se marca solo con evidencia de comando.

## Resumen integral del change

Change de saneamiento del plan de harness que deja la suite de PlanearIA silenciosa salvo errores intencionales y protegida contra ruido futuro, corrige el mojibake verificado en 5 archivos y anade un check de codificacion determinista con fixtures. No cambia producto, no agrega dependencias y no genera deuda nueva: su assessment resuelve dos hallazgos del issue #129 y baja el presupuesto del plan pausado de 5/5 a 3/5 unidades, acercando la reanudacion del plan y desbloqueando a la larga #126.
