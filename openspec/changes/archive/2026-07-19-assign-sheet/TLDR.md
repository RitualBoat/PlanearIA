# TLDR: assign-sheet

## Proposal: por que hacemos este cambio

Asignar un material a una clase ya se puede hacer en cuatro lugares de la app. El problema es que en tres de ellos **la asignacion se pierde sola**: se guarda en el telefono pero nunca se pone en la fila para subir al servidor, asi que la siguiente sincronizacion la borra sin avisar. Y asignar un entregable es peor: el codigo escribe en una lista vieja que ya nadie usa, no cambia nada, y aun asi la pantalla dice "Asignacion completada". Ademas cada lugar tiene su propio selector, asi que el docente aprende tres veces lo mismo. Ninguno de estos fallos rompe una prueba hoy.

## Design: como lo resolvemos

Hacemos un solo selector, en forma de hoja, que cualquier pantalla puede abrir sin salir de donde esta. El destino se elige en cascada: clase, y si quieres, unidad y actividad dentro de ella. Elegir solo la clase sigue siendo valido. Lo importante es que la escritura deja de improvisar: pasa por el mismo camino que la app ya usa bien al crear materiales, ese que si pone la operacion en la fila y la sube al reconectar. Tambien arreglamos el servicio viejo que usan las otras dos pantallas, sin tocar su diseno, para que no queden dos productos conviviendo: uno que conserva tu trabajo y otro que lo pierde.

## Spec: que comportamiento queda garantizado

Queda escrito que hay un solo selector y que ninguna pantalla puede inventarse el suyo. Queda garantizado que **toda** asignacion se encola, que sobrevive a la siguiente sincronizacion y que sin conexion se puede asignar igual. Queda prohibido escribir sin que el docente confirme, y la confirmacion tiene que decir a donde va y cuantas cosas, no una frase generica. Queda prohibido afirmar que algo se asigno cuando no se modifico nada, y prohibido llamar sincronizado a lo que sigue en la fila. Y queda fijado que el selector se entiende leyendo, sin depender del color, con foco por teclado y sin animacion impuesta.

## Tasks: como lo construimos

Primero el ViewModel con sus pruebas: los destinos, la cascada y la garantia de que toda ejecucion encola. Despues la hoja, con sus estados de cargando, vacio, error y sin conexion ya disenados. Luego la correccion del servicio viejo, con pruebas escritas contra el sintoma real: que la asignacion sobreviva a una sincronizacion y que asignar un entregable de verdad lo cambie. La adopcion cambio de pantalla sobre la marcha: en vez de Asignar recurso, cuyo destino ya viene fijo, la hoja vive donde de verdad hacia falta, en la biblioteca de recursos, sobre un boton que solo decia "Proximamente". Cerraron la validacion tecnica, la QA visual en cinco anchos y la revision adversarial.

## Resumen integral del change

Este cambio no construye motor de sincronizacion: conecta el que ya existe y funciona. Agrega una hoja y un ViewModel, y modifica tres archivos. Su valor no es tener un selector bonito: es que hoy la app le dice al docente que asigno su material y despues se lo quita en silencio. Eso erosiona la confianza en una app cuya promesa central es funcionar sin conexion. Al terminar, asignar sera el mismo gesto en cualquier pantalla, con confirmacion clara, y lo que el docente asigne se quedara asignado, con o sin internet. Ademas abre el camino que Office, Clases y Conecta necesitan en las olas siguientes, sin que ninguno tenga que copiarlo.
