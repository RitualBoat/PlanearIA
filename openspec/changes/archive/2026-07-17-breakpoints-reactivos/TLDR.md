# TLDR: fuente reactiva unica de breakpoints

## Proposal: por que hacemos este change

El docente quiere que la interfaz se reacomode al rotar la tablet o redimensionar el navegador. Casi todo ya lo hace, pero hay un helper viejo (`responsive.ts`) que toma una foto del ancho al arrancar y la deja clavada. Esa foto solo se congela de verdad en una pantalla: `LoginScreen`, donde el logo, el titulo y el ancho del formulario quedan fijos y no responden al resize. El resto de pantallas ya reacciona bien, pero lee el ancho de varias fuentes distintas. Este change instaura una sola fuente reactiva y jubila el helper congelado.

## Design: como lo resolvemos

Creamos `useBreakpoint()`, un hook unico sobre `useWindowDimensions()` (la API que si se actualiza al redimensionar). Da el ancho, el rango (movil `<768`, tablet `768-1279`, escritorio `>=1280`) y ayudantes puros para usar dentro de los estilos. `LoginScreen` deja de congelarse: sus estilos pasan a una fabrica que recibe el rango. Las 6 pantallas que ya reaccionaban solo cambian de donde leen el ancho, conservando sus umbrales. No tocamos el tema, ni la navegacion, ni el aspecto. Y borramos `responsive()` y `getScreenDimensions()`, con lo que no queda ningun `Dimensions.get()` en la app.

## Spec: que comportamiento queda garantizado

Una pantalla que depende del ancho se reacomoda al instante al rotar o redimensionar, sin recargar, y a igual ancho se ve igual que antes: es cambio de mecanismo, no de aspecto. Una ventana web angosta se ve como movil, no como escritorio. Existe un unico punto reactivo con los tres rangos, que ademas expone ancho, alto y escala de letra. No queda ninguna lectura congelada de dimensiones. Las pantallas ya reactivas conservan sus umbrales propios, sus estados de carga y error, sus etiquetas accesibles y su area de toque; el helper de plataforma sigue siendo de plataforma, no de ancho.

## Tasks: plan de trabajo

Primero la infra pura: el hook y sus ayudantes con pruebas unitarias, sin tocar consumidores. Luego preparar el contrato de la fabrica de estilos con un campo opcional de rango. Despues descongelar `LoginScreen` (el bug real) con una prueba de reflow que verifica que los tamanos cambian al cambiar de ancho. Enseguida unificar la fuente en las 6 pantallas mixtas, una por una, sin cambiar sus umbrales. Luego jubilar el helper viejo y comprobar que no queda ningun `Dimensions.get()`. Al final: typecheck, lint, tests y QA visual real por breakpoint en `LoginScreen`, con capturas del reflow.

## Resumen integral del change

Este change no redisena nada ni migra el tema: instaura la fundacion responsive que la Ola 0 necesita. Deja tres cosas. Una fuente reactiva unica (`useBreakpoint`) que reemplaza al helper que tomaba una foto congelada. Una correccion concreta y verificable: `LoginScreen` deja de quedarse clavado al redimensionar. Y una app sin ninguna lectura congelada de dimensiones, con las pantallas ya reactivas leyendo de un solo lugar. Lo que no cambia importa igual: los umbrales de las pantallas mixtas, el tema estatico donde ya existia, el helper de plataforma, la navegacion y el aspecto de cada pantalla quedan intactos. La migracion es incremental: si se detiene tras arreglar `LoginScreen`, el bug ya esta resuelto.
