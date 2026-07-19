# TLDR: sync-status-ui

## Proposal: por que hacemos este cambio

La app ya sabe si tu trabajo esta sincronizado; lo que no sabe es contarlo con una sola voz. Hoy conviven tres formas distintas de decir lo mismo. Cuando el servidor no responde, la lista de planeaciones dice "Error sync" en rojo mientras la barra de arriba dice "Trabajando con datos locales". El docente recibe el mismo hecho como fallo propio en una pantalla y como normalidad en otra. Peor todavia: con la sesion expirada, esa misma lista sigue mostrando "Sincronizado" en verde aunque nada este subiendo. Ese mensaje no es alarmante, es falso y tranquilizador, que hace mas dano.

## Design: como lo resolvemos

Creamos una sola traduccion de estado a lenguaje visible: un hook que convierte lo que ya expone el contexto de sincronizacion en titulo, icono, tono y etiqueta accesible. Los componentes pintan ese resultado; ninguno vuelve a decidir por su cuenta. Definimos siete estados con precedencia explicita. Dos decisiones importan: sin conexion gana sobre sesion expirada, porque pedir que vuelvas a iniciar sesion en modo avion es imposible de cumplir; y "sincronizacion desactivada" va primero, porque es el estado de todo docente invitado y hoy se le miente diciendole que esta sincronizado. Ningun estado de sincronizacion usa rojo.

## Spec: que comportamiento queda garantizado

Queda escrito que una sola fuente traduce el estado y que ninguna pantalla puede derivarlo por su cuenta, ni crear colas, clientes ni suscripciones para mostrarlo. Quedan fijados los siete estados y su orden. Queda prohibido presentar la falta de conexion o un servidor caido como error: el rojo se reserva para el unico caso donde tu trabajo corre riesgo real, que es un guardado local fallido. Queda garantizado que el estado se entiende leyendo, sin depender del color, y que la app no sostiene animaciones en bucle ni ignora tu preferencia de reducir movimiento.

## Tasks: como lo vamos a construir

Primero la fuente unica y su prueba de tabla, que congela los siete estados antes de que exista un solo componente. Despues los tres componentes: el indicador global, la etiqueta de guardado en editores y el contador de pendientes. Luego la adopcion: montar el indicador en la barra superior, borrar la derivacion vieja de la lista de planeaciones y migrar la barra existente al mismo vocabulario. Cierran la validacion tecnica completa, la QA visual en tres anchos con la transicion real de perder y recuperar conexion, y la revision adversarial antes de archivar.

## Resumen integral del change

Este cambio no toca el motor de sincronizacion: no crea colas, clientes ni estado paralelo. Es capa visual. Agrega un hook y tres componentes, y modifica tres archivos existentes, todos de presentacion. Su valor no es estetico: hoy la app le dice al docente que su trabajo esta sincronizado cuando no lo esta, y le dice "Error" cuando en realidad todo esta a salvo en su dispositivo. Las dos cosas erosionan la confianza en una app cuya promesa central es funcionar sin conexion. Al terminar, cualquier pantalla dira lo mismo, con el mismo tono, y ninguna presentara como fallo del docente algo que no lo es.
