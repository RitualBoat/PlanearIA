# theming-runtime-propagation

## ADDED Requirements

### Requirement: Las preferencias de presentacion se propagan a la pantalla migrada en runtime

Una pantalla migrada SHALL reflejar el tema, el tamano de fuente y el modo daltonismo activos sin reiniciar la app. El sistema SHALL exponer un unico punto de consumo que entregue los colores con el filtro de daltonismo ya aplicado, el indicador de tema oscuro, la funcion de escalado tipografico y la preferencia de alto contraste.

Este requisito define **como se consumen** las preferencias. El contrato de que preferencias existen, como se guardan y como se restauran pertenece a `settings-accessibility-preferences` y SHALL NOT cambiar.

#### Scenario: El docente cambia a tema oscuro

- **WHEN** el docente activa el modo oscuro estando en una pantalla migrada
- **THEN** la pantalla repinta fondos, tarjetas, bordes y texto con los tokens del tema oscuro, sin reiniciar

#### Scenario: El docente cambia el tamano de fuente

- **WHEN** el docente selecciona un tamano de fuente distinto
- **THEN** la tipografia de la pantalla migrada escala con el factor correspondiente, sin reiniciar

#### Scenario: El docente cambia el modo daltonismo

- **WHEN** el docente selecciona un modo de daltonismo
- **THEN** los colores de estado de la pantalla migrada se ajustan a ese modo, sin reiniciar

#### Scenario: El daltonismo se aplica sobre el tema activo

- **WHEN** el docente tiene tema oscuro y un modo de daltonismo activos a la vez
- **THEN** la pantalla migrada recibe los tokens del tema oscuro con el filtro de daltonismo aplicado encima, y ninguna preferencia anula a la otra

#### Scenario: Las preferencias guardadas se conservan

- **WHEN** el docente reinicia la app tras cambiar cualquiera de las tres preferencias
- **THEN** la pantalla migrada arranca con las preferencias guardadas, sin conexion de red

### Requirement: El punto de consumo no altera los contextos de preferencia existentes

El sistema SHALL preservar `ThemeContext`, `FontSizeContext` y `DaltonismoContext` con su contrato publico intacto. El punto de consumo compuesto SHALL construirse encima de ellos, sin reemplazarlos ni introducir dependencias entre ellos.

#### Scenario: Los hooks existentes siguen disponibles

- **WHEN** una pantalla no migrada consume el hook de tema, de fuente o de daltonismo por separado
- **THEN** recibe exactamente el mismo valor y comportamiento que antes del change

#### Scenario: Los proveedores no dependen entre si

- **WHEN** se monta el arbol de proveedores de preferencias
- **THEN** ningun contexto de preferencia requiere que otro este montado antes para funcionar

### Requirement: La pantalla legacy no migrada conserva su comportamiento

El sistema SHALL mantener el color estatico como fallback para las pantallas aun no migradas. El rollout SHALL NOT degradar ninguna pantalla que todavia no adopte el punto de consumo.

#### Scenario: Pantalla legacy tras el change

- **WHEN** el docente abre una pantalla que aun no fue migrada
- **THEN** la pantalla se ve y se comporta igual que antes del change, usando los colores estaticos

#### Scenario: Pantalla legacy con preferencias activas

- **WHEN** el docente tiene tema oscuro o daltonismo activos y abre una pantalla no migrada
- **THEN** la pantalla no se rompe: conserva su presentacion estatica sin errores ni contraste ilegible

### Requirement: La migracion de una pantalla preserva sus estados y su accesibilidad

Migrar una pantalla al punto de consumo SHALL ser un cambio de mecanismo, no de aspecto ni de comportamiento. La pantalla migrada SHALL conservar sus estados de carga, vacio, error y sin conexion, y SHALL cumplir los criterios de accesibilidad en cada preferencia activa.

#### Scenario: Estados preservados tras migrar

- **WHEN** una pantalla migrada entra en estado de carga, vacio, error o sin conexion
- **THEN** presenta el mismo estado que antes de la migracion, ahora pintado con los tokens de la preferencia activa

#### Scenario: Accesibilidad en cada preferencia

- **WHEN** la pantalla migrada se muestra bajo cualquier combinacion de tema, fuente y daltonismo
- **THEN** conserva sus etiquetas accesibles, obtiene su contraste desde tokens y mantiene un area de toque minima de 44pt

#### Scenario: Sin cambio visual en tema claro

- **WHEN** se compara la pantalla migrada con su version previa en tema claro y fuente media
- **THEN** la presentacion es equivalente: la migracion no redisena la pantalla

### Requirement: El color estatico queda prohibido salvo en la lista legacy rastreada

El repositorio SHALL fallar la validacion cuando un archivo importe los colores estaticos sin estar en una lista explicita de archivos legacy autorizados. Esa lista SHALL ser el registro rastreable del rollout pendiente.

#### Scenario: Archivo nuevo intenta usar color estatico

- **WHEN** un archivo fuera de la lista legacy importa los colores estaticos
- **THEN** la validacion del repositorio falla nombrando el archivo y el punto de consumo que debe usar

#### Scenario: Archivo legacy autorizado

- **WHEN** un archivo presente en la lista legacy importa los colores estaticos
- **THEN** la validacion pasa, porque el fallback legacy sigue siendo valido hasta su rollout

#### Scenario: Una pantalla migrada no puede reincidir

- **WHEN** una pantalla se migra y sale de la lista legacy
- **THEN** cualquier reintroduccion posterior del color estatico en ese archivo falla la validacion

#### Scenario: El pendiente del rollout es verificable

- **WHEN** alguien necesita saber cuanto falta del rollout de theming
- **THEN** la lista legacy lo responde y la validacion del repositorio la mantiene sincronizada con el codigo real
