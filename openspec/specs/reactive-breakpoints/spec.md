# reactive-breakpoints Specification

## Purpose
TBD - created by archiving change breakpoints-reactivos. Update Purpose after archive.
## Requirements
### Requirement: La interfaz se reacomoda al redimensionar o rotar sin recargar

Una pantalla cuyo layout depende del ancho SHALL reacomodarse al instante cuando cambia el ancho disponible (rotacion de tablet o redimension de la ventana web), sin recargar ni reiniciar la app. El sistema SHALL derivar el ancho de una fuente reactiva, no de una lectura instantanea congelada al importar.

Este requisito define **como se reacciona al ancho**. No cambia el aspecto de ninguna pantalla a un ancho dado: a igual ancho, la presentacion es equivalente a la previa al change.

#### Scenario: El docente rota la tablet

- **WHEN** el docente rota el dispositivo estando en una pantalla dependiente de ancho
- **THEN** la pantalla recalcula su layout para el nuevo ancho de inmediato, sin recargar

#### Scenario: El docente redimensiona la ventana del navegador

- **WHEN** el docente arrastra el borde de la ventana web y cruza un limite de rango (768 o 1280)
- **THEN** la pantalla adopta el layout del nuevo rango sin recargar

#### Scenario: Ventana web angosta se ve como movil

- **WHEN** el docente reduce la ventana web por debajo de 768px de ancho
- **THEN** la pantalla adopta el layout movil, no el de escritorio, aunque la plataforma sea web

### Requirement: Existe una fuente reactiva unica de breakpoints con tres rangos

El sistema SHALL exponer un unico punto de consumo reactivo que clasifique el ancho actual en tres rangos: movil (`<768`), tablet (`768-1279`) y escritorio (`>=1280`). Ese punto SHALL exponer tambien el ancho, el alto y el factor de escala tipografica actuales, y SHALL actualizarse ante cambios de dimension. El sistema SHALL ofrecer un resolutor por rango para valores de estilo, utilizable donde no se puede invocar el hook (fabricas de estilos).

#### Scenario: Clasificacion por rango

- **WHEN** el ancho actual es 767, 768, 1279 o 1280
- **THEN** el punto de consumo lo clasifica como movil, tablet, tablet y escritorio respectivamente

#### Scenario: El rango se actualiza al cambiar de ancho

- **WHEN** el ancho cambia de un rango a otro
- **THEN** el consumidor del punto de consumo recibe el rango nuevo sin intervencion manual

#### Scenario: Resolutor por rango para estilos

- **WHEN** una fabrica de estilos pide un valor con variantes movil, tablet y escritorio para el rango activo
- **THEN** recibe la variante del rango activo, y la variante de escritorio omitida cae a la de tablet

### Requirement: No quedan lecturas de dimensiones congeladas

El sistema SHALL NOT depender de una lectura instantanea de dimensiones (`Dimensions.get()`) para calcular estilos o layout. Ningun estilo dependiente de ancho SHALL quedar fijado al valor presente en el momento de importar el modulo.

#### Scenario: Estilo dependiente de ancho tras la migracion

- **WHEN** una pantalla migrada calcula un tamano que depende del ancho
- **THEN** ese tamano se evalua con el ancho reactivo vigente, no con una foto tomada al importar

#### Scenario: El repositorio no reintroduce la lectura congelada

- **WHEN** se audita el codigo de la app en busca de `Dimensions.get()`
- **THEN** no aparece ninguna ocurrencia en `src/`

### Requirement: La migracion preserva estados, accesibilidad y las pantallas ya reactivas

Migrar una pantalla a la fuente reactiva unica SHALL ser un cambio de mecanismo, no de aspecto ni de comportamiento. La pantalla migrada SHALL conservar sus estados de carga, error y contenido, sus etiquetas accesibles y su area de toque minima. Las pantallas que ya reaccionaban al ancho por su cuenta SHALL conservar sus umbrales propios. El helper de plataforma existente SHALL permanecer con su semantica intacta.

#### Scenario: Estados preservados tras migrar

- **WHEN** una pantalla migrada entra en estado de carga o error, o muestra su contenido
- **THEN** presenta el mismo estado que antes de la migracion, ahora reaccionando al ancho reactivo

#### Scenario: Accesibilidad en cada rango

- **WHEN** la pantalla migrada se muestra en movil, tablet o escritorio
- **THEN** conserva sus etiquetas accesibles y un area de toque minima de 44pt en cada rango

#### Scenario: Los umbrales propios no cambian

- **WHEN** una pantalla que ya reaccionaba al ancho con un umbral a medida se migra a la fuente unica
- **THEN** conserva ese umbral y su comportamiento; solo cambia de donde lee el ancho

#### Scenario: El helper de plataforma sigue siendo de plataforma

- **WHEN** una pantalla usa el helper de plataforma para diferenciar web de nativo
- **THEN** ese helper sigue respondiendo por plataforma y no por ancho, sin cambio de comportamiento

