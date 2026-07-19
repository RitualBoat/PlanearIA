# TLDR: componentes-base

## Que problema resuelve la propuesta

PlanearIA tiene tokens desde #80, pero nada entre ellos y las pantallas. Hoy 99 de 196 archivos `.tsx` arman su propio control tactil, 93 usan radios literales y solo 6 importan los tokens. Solo 25 declaran rol de accesibilidad. Sin biblioteca base, cada pantalla nueva vuelve a decidir estilos y la accesibilidad depende de que alguien la recuerde. Este change crea la capa que faltaba: diez componentes presentacionales que convierten los tokens en UI ensamblable, con los estados de carga, vacio, error y sin conexion ya resueltos.

## Como se construye

Se crea `src/components/base/` con un archivo por componente y un barrel. Cada uno toma color, espaciado, tipografia y sombra de los tokens en runtime, mediante la fabrica de estilos que ya existe; ninguno importa la paleta estatica legacy. El shell queda fuera porque #81 ya lo entrego. Los componentes legacy que se solapan se conservan intactos: la migracion es un change posterior. No se instala ninguna dependencia nueva; las superficies translucidas usan el token de superposicion solido. El catalogo se alcanza desde una entrada en el hub Mas, tambien bajo modo desarrollo.

## Que comportamiento queda garantizado

Los controles presentan y anuncian sus estados normal, presionado, deshabilitado y cargando. Un control deshabilitado no actua; uno cargando no repite su accion. Los cuatro estados de pantalla tienen componente, y la salida accionable es obligatoria por tipo, no opcional. Todo control declara rol y etiqueta, ofrece area tactil de 44 puntos y muestra foco visible en web, medido en 4.61 a 1. Toda animacion sirve una variante estatica bajo reduccion de movimiento. Ninguna pantalla existente cambia de aspecto.

## Como se organiza el trabajo

Seis grupos de tareas. Primero la fundacion: carpeta, regla de lint que prohibe el color estatico y helper de pruebas. Luego tres tandas de componentes, de las primitivas de superficie a los controles y de ahi a las capas y estados, cada tanda con sus pruebas y su validacion. Despues el catalogo bajo modo desarrollo, que sirve de superficie para la validacion visual por breakpoint. Al final, cierre: barrel completo, verificacion de que el change es aditivo, validacion completa, revision adversarial y gate de archive.

## Resumen integral del change

`componentes-base` construye la biblioteca base accesible de PlanearIA: diez componentes presentacionales que traducen los tokens de #80 en piezas ensamblables, con estados de carga, vacio, error y sin conexion resueltos por diseno y no improvisados. Es un change puramente aditivo: crea la biblioteca, no la adopta. Ninguna pantalla existente cambia, el shell de #81 no se toca, los componentes legacy que se solapan se conservan con su migracion declarada, y no entra ninguna dependencia nueva. La evidencia sale de un catalogo montado solo en desarrollo, medido por breakpoint con Playwright. Revertir el PR elimina la carpeta sin dejar superficie de usuario afectada.
