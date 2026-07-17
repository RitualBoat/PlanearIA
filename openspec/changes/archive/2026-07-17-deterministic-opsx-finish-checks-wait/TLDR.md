# TLDR: espera determinista de checks en opsx:finish

## Proposal: por que hacemos este change

`npm run opsx:finish` es el ultimo paso del flujo SDD: publica la rama, abre el PR y espera a que CI apruebe antes de mergear. El problema es que pregunta por los checks apenas termina de subir la rama, cuando GitHub todavia no los registro. En esa ventana el comando falla y muestra un stack trace, como si algo estuviera roto. Reintentar funciona, porque para entonces los checks ya existen. Ese es justo el sintoma: el mismo comando, con todo correcto, a veces pasa y a veces truena segun cuanto tarde GitHub. Para un agente que automatiza el cierre, eso no es confiable.

## Design: como lo resolvemos

`gh` no ayuda a distinguir los casos: usa el mismo codigo de error para "los checks todavia no aparecen" y para "los checks fallaron". Lo unico que los separa es el texto del mensaje de error. Asi que el script lee ese texto y clasifica en cuatro estados: aprobados, pendientes, aun no registrados y fallidos. Solo el estado "aun no registrados" reintenta, durante un tiempo limitado. En cuanto los checks aparecen, el control pasa a la espera de siempre, sin tocarla. Si el texto no se reconoce, se asume fallo y se aborta: preferimos equivocarnos hacia detenernos, nunca hacia mergear.

## Spec: que comportamiento queda garantizado

El cierre sigue siendo solo por PR: nunca hay push directo a `development`. La espera distingue por evidencia los cuatro estados. Los checks que tardan se esperan solos, sin que nadie intervenga. Los checks fallidos abortan de inmediato, sin reintentos y sin merge. Si se agota el tiempo y siguen sin aparecer checks, el comando aborta explicando cual PR, cual commit, cuanto espero y que revisar; jamas interpreta "sin checks" como "todo en verde". Ningun fallo se presenta ya como un stack trace pelado. El merge ocurre unicamente despues de una aprobacion real.

## Tasks: plan de trabajo

Primero se crea un modulo aparte con la clasificacion y el bucle de espera, sin procesos ni reloj real, siguiendo el mismo patron que ya usa el doctor del harness. Luego se escriben sus pruebas: checks que llegan tarde, tiempo agotado con diagnostico y checks realmente fallidos, mas los casos de frontera. Despues se conecta al script de cierre, con banderas para ajustar el tiempo de espera y una opcion que reproduce el comportamiento anterior. Al final se documenta la espera en operacion, se corren lint, validacion, paridad y doctor, y se hace la revision adversarial antes de archivar.

## Resumen integral del change

Hoy el cierre automatizado de un change puede fallar por una carrera con GitHub: se piden los checks antes de que existan y el error resultante es indistinguible de una CI en rojo. Este change hace ese paso determinista. Clasifica los estados por evidencia real, espera de forma acotada solo cuando los checks aun no aparecen, y entrega mensajes que dicen que pasa y que hacer. Lo que no cambia es tan importante como lo que cambia: no se toca la proteccion de rama, no se debilita la espera de los checks requeridos, no se mergea nunca sin aprobacion y no hay push directo al target. Solo se toca el harness; producto, backend y datos quedan intactos.
