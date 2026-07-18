# design-tokens Specification

## Purpose
TBD - created by archiving change tokens-completos. Update Purpose after archive.
## Requirements
### Requirement: El sistema expone un set unico de tokens de presentacion en `src/themes/`

El sistema SHALL definir en `src/themes/` seis grupos de tokens consumibles: espaciado (escala 4pt), radios (8/12/16/pill), tipografia base, elevacion (3 niveles), movimiento (duraciones y springs) y z-index nombrado. Los tokens SHALL ser consumibles desde la fabrica `getStyles` establecida por `theming-runtime`, sin cambiar su contrato. Los grupos sin dependencia de runtime SHALL ser importables como constantes sin requerir ningun contexto.

Este requisito define **que tokens existen y como se consumen**. El contrato de la fabrica (`ThemedStylesInput`) pertenece a `theming-runtime-propagation` y SHALL NOT cambiar.

#### Scenario: Un autor consume espaciado y radios sin decidir literales

- **WHEN** un autor construye estilos de una pantalla nueva y necesita separacion o esquinas redondeadas
- **THEN** toma los valores de los tokens de espaciado (multiplos de la escala 4pt) y de radios (8/12/16/pill), sin introducir numeros magicos

#### Scenario: Los tokens estaticos no requieren contexto

- **WHEN** un modulo importa el token de espaciado, radios, movimiento o z-index
- **THEN** obtiene la constante directamente, sin montar `ThemeContext`, `FontSizeContext` ni ningun proveedor

#### Scenario: Los tokens dependientes de runtime se consumen desde la fabrica

- **WHEN** una fabrica `getStyles` necesita tipografia o elevacion
- **THEN** las obtiene de `scaled` y `colors` que la fabrica ya recibe, sin ampliar la firma de `ThemedStylesInput`

### Requirement: La tipografia escala con `FontSizeContext`

Los tokens tipograficos SHALL definir tamanos base (nunca pre-escalados). Al consumirse a traves del helper de tipografia con la funcion `scaled` de `FontSizeContext`, el sistema SHALL multiplicar `fontSize` y `lineHeight` por el factor del modo de fuente activo, conservando `fontWeight` y `letterSpacing`.

#### Scenario: El docente elige una fuente mas grande

- **WHEN** el docente selecciona el modo de fuente `xlarge` y una pantalla consume un token de texto a traves del helper
- **THEN** el texto se renderiza con `fontSize` y `lineHeight` base multiplicados por el factor de `xlarge`, sin reiniciar

#### Scenario: El modo de fuente por defecto no altera los tamanos base

- **WHEN** el modo de fuente es `medium` (factor 1) y una pantalla consume un token de texto a traves del helper
- **THEN** el texto se renderiza con los tamanos base del token, sin cambio

#### Scenario: El grosor y el interletrado no dependen del factor de fuente

- **WHEN** un token de texto define `fontWeight` y `letterSpacing`
- **THEN** el helper los conserva sin escalarlos por el factor de fuente

### Requirement: La elevacion se ajusta al tema activo

La elevacion SHALL exponerse en tres niveles construidos con los tokens de color de sombra del tema (`shadowBlue` y `shadowBlueLift`), de modo que la sombra cambie entre tema claro y oscuro. Los tres niveles SHALL ser visualmente distintos entre si.

#### Scenario: Elevacion en tema claro y en tema oscuro

- **WHEN** una superficie aplica un nivel de elevacion con los colores del tema claro y luego con los del tema oscuro
- **THEN** la sombra resultante difiere entre ambos temas, porque toma su color de los tokens de sombra del tema activo

#### Scenario: Tres niveles distinguibles

- **WHEN** se comparan los tres niveles de elevacion
- **THEN** cada nivel presenta una profundidad distinta (offset y difuminado crecientes), sin dos niveles identicos

### Requirement: El movimiento respeta la reduccion de movimiento del sistema y del usuario

El sistema SHALL exponer una primitiva unica de reduce-motion basada en las APIs vigentes de `react-native-reanimated`. La primitiva SHALL reportar activo cuando el ajuste de reducir movimiento del sistema operativo este activo (leido de forma sincrona con `useReducedMotion`) O cuando la preferencia in-app de reducir movimiento este activa. Los tokens de movimiento SHALL configurar sus animaciones para honrar el ajuste del sistema en la capa de reanimated (`ReduceMotion.System`).

#### Scenario: Reducir movimiento activo en el sistema operativo

- **WHEN** el ajuste de reducir movimiento del sistema operativo esta activo al iniciar la app
- **THEN** la primitiva reporta activo y una animacion que la consulta presenta su variante estatica equivalente

#### Scenario: El docente activa reducir movimiento en la app

- **WHEN** el docente activa la preferencia in-app de reducir movimiento
- **THEN** la primitiva reporta activo sin reiniciar la app, porque la preferencia in-app es reactiva

#### Scenario: Ninguna senal de reduccion activa

- **WHEN** ni el ajuste del sistema ni la preferencia in-app estan activos
- **THEN** la primitiva reporta inactivo y las animaciones corren normalmente

#### Scenario: El ajuste del sistema cambia con la app abierta

- **WHEN** el ajuste de reducir movimiento del sistema cambia mientras la app esta abierta
- **THEN** las animaciones de reanimated siguen honrando el ajuste en la capa worklet por su politica `ReduceMotion.System`, aunque el valor sincrono del hook se haya capturado al iniciar (salvedad documentada)

### Requirement: El z-index es una escala nombrada y ascendente

El sistema SHALL exponer el z-index como tokens nombrados por rol de capa (por ejemplo base, dropdown, sticky, banner, overlay, modal, toast, tooltip), con valores estrictamente ascendentes segun el orden de apilamiento previsto.

#### Scenario: El orden de apilamiento es verificable

- **WHEN** se comparan los valores de dos capas nombradas
- **THEN** la capa que debe quedar por encima tiene un valor de z-index mayor que la que queda por debajo

### Requirement: Definir tokens no altera pantallas ni contratos existentes

Definir los tokens SHALL ser una adicion de fundacion, no un cambio de comportamiento de la app. El change SHALL NOT modificar pantallas existentes, SHALL NOT cambiar el contrato publico de `ThemeContext`, `FontSizeContext` ni `DaltonismoContext`, y SHALL NOT agregar dependencias nuevas de runtime (blur o fuente de marca quedan diferidas por escrito).

#### Scenario: Las pantallas legacy no cambian

- **WHEN** el docente abre cualquier pantalla existente tras el change
- **THEN** la pantalla se ve y se comporta igual que antes, porque ninguna consume aun los tokens nuevos

#### Scenario: Los contextos protegidos conservan su contrato

- **WHEN** una pantalla consume `useTheme`, `useFontSize` o `useDaltonismo`
- **THEN** recibe exactamente el mismo valor y comportamiento que antes del change

#### Scenario: No se adopta blur ni fuente de marca sin medir

- **WHEN** se revisa la superficie de dependencias tras el change
- **THEN** no se agrego `expo-blur` ni una fuente de marca; la decision de diferirlas queda documentada con su costura y su fallback solido

