## Proposal.md — La intención

Proposal explica por qué hace falta este cambio: los documentos OpenSpec ya guardan el detalle técnico, pero falta una puerta de entrada corta para entenderlos sin cansarse. Propone un solo TLDR por change, aclara que no reemplaza proposal, design, spec ni tasks, y delimita lo que no se automatizará: nadie va a calificar la redacción con una máquina.

## Design.md — El enfoque

Design aterriza la idea sin tocar la CLI instalada: el TLDR será un archivo extra en la raíz del change, creado y cuidado por instrucciones regenerables. Define qué fuentes se editan primero, cómo el parche posterior a `openspec update` conserva la regla y por qué el validador sólo revisa ruta y presencia. También deja listo el rollback documental, sin datos ni migraciones.

## Spec.md — El comportamiento esperado

Spec convierte el acuerdo en reglas comprobables: todo change nuevo tendrá su TLDR, con bloques para intención, enfoque, comportamiento, tareas y un resumen integral. Si apply cambia algo importante, el resumen se actualiza; archive lo mueve con el directorio. La comprobación automática sólo falla si el archivo no está exactamente donde toca y deja tono, orden y extensión a revisión humana.

## Tasks.md — El plan de trabajo

Tasks ordena el trabajo real: primero se actualizan las instrucciones y el parche canónico; después se crea el checker pequeño con fixtures; luego se regeneran los espejos desde sus fuentes. Al final se corren pruebas, validaciones y una revisión humana del TLDR. Así se puede comprobar el resultado sin mezclar este cambio de gobernanza con la app docente.

## Resumen integral del change

Este change añade una brújula breve a cada propuesta OpenSpec: explica qué se busca, cómo se logrará, qué reglas deben cumplirse y qué tareas siguen. La guía hará que propose lo cree, apply lo mantenga y archive lo conserve. Un checker simple garantiza que esté en la carpeta correcta, mientras una persona sigue siendo responsable de que el resumen se entienda de verdad.
