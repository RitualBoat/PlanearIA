# Spec delta: base-component-library

## ADDED Requirements

### Requirement: Las capas modales exponen un ancla de medicion propia del panel

Todo componente de la biblioteca base que se apoye en la capa modal de la plataforma SHALL exponer un
identificador de prueba estable sobre **el panel visible que el docente ve**, distinto del identificador
del fondo oscurecido y distinto de cualquier contenedor que la plataforma web inserte por su cuenta.

El identificador SHALL derivarse del identificador que el consumidor ya entrega al componente, de modo
que el contrato publico del componente no crezca y todo consumidor que ya lo entrega obtenga el ancla
sin modificar su codigo.

La verificacion visual de estos componentes SHALL medir ese ancla propia. La verificacion SHALL NOT
apoyarse en atributos de accesibilidad para localizar el panel cuando la plataforma web pueda haberlos
colocado en un contenedor envolvente: el envoltorio ocupa el viewport completo y devuelve mediciones
plausibles que describen un elemento distinto del que se quiere medir.

#### Scenario: Se mide la forma de una capa modal en navegador

- **WHEN** se mide en navegador el panel de un componente de la biblioteca que usa la capa modal
- **THEN** la medicion se ancla en el identificador propio del panel y devuelve las dimensiones del panel, no las de la ventana

#### Scenario: Un consumidor ya entrega identificador al componente

- **WHEN** una superficie monta el componente entregandole un identificador de prueba
- **THEN** el panel queda anclado automaticamente, sin que esa superficie declare nada adicional

#### Scenario: El fondo y el panel se distinguen

- **WHEN** se inspeccionan los identificadores que emite el componente
- **THEN** el fondo oscurecido y el panel exponen anclas distintas, de modo que medir una nunca devuelve la otra

### Requirement: La forma por breakpoint de las capas modales esta cubierta por regresion en los limites

El sistema SHALL cubrir con prueba automatica la forma que cada capa modal de la biblioteca adopta en
cada rango de breakpoint, verificando los anchos de frontera de los rangos y no solo un ancho
representativo por rango.

La prueba SHALL obtener la clasificacion del ancho desde la fuente reactiva de breakpoints vigente y
SHALL NOT declarar los limites como constantes propias, de modo que mover un rango en la fuente haga
fallar tambien esta cobertura en vez de dejarla verde afirmando sobre un limite inexistente.

La prueba SHALL afirmar la forma observable completa (dimension del panel, alineacion del contenedor
que lo coloca y tratamiento de las esquinas que lo anclan a un borde) y SHALL NOT limitarse a la
dimension, porque una dimension correcta con alineacion incorrecta sigue siendo un layout incorrecto.

#### Scenario: Se mueve un limite de breakpoint

- **WHEN** alguien modifica el limite de un rango en la fuente reactiva de breakpoints
- **THEN** la cobertura de forma de las capas modales falla, porque deriva su clasificacion de esa misma fuente

#### Scenario: Un ancho de frontera cambia de forma

- **WHEN** una capa modal adopta en el ancho limite de un rango la forma del rango contiguo
- **THEN** la prueba de ese ancho falla y nombra la propiedad que difiere

#### Scenario: El panel mide bien pero se coloca mal

- **WHEN** el panel conserva su dimension correcta pero el contenedor que lo coloca cambia su alineacion
- **THEN** la prueba falla, porque afirma la forma observable y no solo la dimension
