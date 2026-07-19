# TLDR: sheet-medicion-panel-qa

## Que problema resuelve

El cierre de #84 archivo un defecto que no existe: reporto que la hoja `Sheet` se veia como hoja
movil a 768 px. La hoja siempre estuvo bien. Lo que fallo fue la medicion: en web, React Native
envuelve la hoja en un contenedor invisible del tamano de toda la ventana, y la QA visual midio ese
contenedor creyendo que era la hoja. Devolvio numeros creibles de un elemento equivocado. Nada impide
hoy que vuelva a pasar: la hoja no tiene prueba de forma y el manual de QA no dice que elemento medir.

## Que enfoque toma

Se le pone a la hoja una etiqueta propia para que QA pueda apuntarle directo, en vez de adivinar por
el contenedor. La etiqueta se deriva del identificador que cada pantalla ya entrega, asi que no se
agrega ninguna opcion nueva al componente y quien ya lo usaba la obtiene gratis. Se suma una prueba
automatica que fija la forma en los cinco anchos de frontera, y el manual de QA gana la trampa
explicada, que es lo unico que evita que el proximo change la vuelva a pisar.

## Que cambia para quien usa la app

Nada. La hoja se ve y se comporta igual en telefono, tablet y escritorio: hoja que nace del borde
inferior en pantallas chicas, dialogo centrado de 520 px en pantallas grandes. No cambian colores,
animaciones, textos ni la forma de cerrarla. Lo que cambia es invisible para el docente y visible
solo para las herramientas de prueba: una etiqueta interna que no afecta como se dibuja nada. En la
app compilada para telefono esa etiqueta ni siquiera existe.

## Como se trabaja

Los tres archivos que ya estaban corregidos en el equipo se adoptan tal cual, sin reescribirlos. Se
verifica que la hoja no cambio de apariencia, se comprueba que la prueba nueva realmente falla si
alguien rompe la hoja, y se mide en navegador a 375, 767, 768, 1279 y 1280, publicando lado a lado el
numero correcto y el que devolvia la medicion vieja. La evidencia archivada de #84 no se toca: se
corrige hacia adelante, citando el archivo y la linea equivocada.

## Resumen integral

Un falso positivo cerro #84 diciendo que la biblioteca base tenia un defecto de forma. No lo tenia:
el instrumento apuntaba al contenedor equivocado. Este change no arregla la hoja, porque la hoja
funciona; arregla la capacidad de medirla y la memoria del equipo. Deja tres cosas: un ancla estable
sobre el panel real, cinco pruebas de frontera que se rompen si alguien mueve un breakpoint, y la
trampa escrita en el manual de QA. Sin cambios de apariencia, datos, sincronizacion ni navegacion, y
sin tocar el historico archivado.
