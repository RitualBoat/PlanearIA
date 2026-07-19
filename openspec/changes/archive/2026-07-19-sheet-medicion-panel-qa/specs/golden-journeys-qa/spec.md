# Spec delta: golden-journeys-qa

## MODIFIED Requirements

### Requirement: El procedimiento de QA visual es reproducible y previene la evidencia enganosa

El sistema SHALL documentar un procedimiento que cualquier agente pueda repetir obteniendo evidencia
comparable. El procedimiento SHALL exigir la confirmacion de respuesta HTTP 200 del servidor web antes
de navegar. Cuando el cambio de ancho se realice por control remoto del navegador, el procedimiento
SHALL exigir que se dispare el evento de redimensionado del documento y que la medicion se tome en una
llamada posterior, porque de lo contrario la aplicacion conserva el layout del ancho anterior. El
procedimiento SHALL exigir medicion sobre el DOM o los estilos computados ademas de la captura, y
SHALL exigir que el ruido de consola preexistente se clasifique en vez de omitirse.

El procedimiento SHALL exigir que toda medicion se ancle en un identificador propio del elemento bajo
prueba. El procedimiento SHALL NOT admitir que un elemento se localice por atributos de accesibilidad
o de rol cuando la plataforma web pueda haberlos colocado en un contenedor envolvente generado por
ella, porque ese contenedor devuelve mediciones plausibles del viewport y no del elemento. Cuando el
elemento bajo prueba no exponga un ancla propia, el procedimiento SHALL exigir que se agregue antes de
medir, en lugar de aceptar la medicion del envoltorio.

El procedimiento SHALL registrar como trampas conocidas los modos de fallo ya verificados del entorno
web, entendiendo por trampa toda tecnica que **no falla, no queda vacia y devuelve un resultado
plausible pero equivocado**. La documentacion de cada trampa SHALL declarar sintoma, causa y remedio
prescrito.

#### Scenario: El agente cambia el ancho de la ventana por control remoto

- **WHEN** el ancho se modifica mediante el protocolo de control del navegador y no arrastrando el borde
- **THEN** el procedimiento dispara el evento de redimensionado del documento y mide en una llamada posterior, de modo que la evidencia corresponde al ancho nuevo y no al anterior

#### Scenario: La captura de pantalla no responde

- **WHEN** la pantalla bajo prueba mantiene el renderizador ocupado y la captura agota su tiempo
- **THEN** la medicion por DOM y estilos computados sostiene la evidencia, y la limitacion se declara en el reporte

#### Scenario: La consola muestra errores ajenos al change

- **WHEN** aparecen errores de consola preexistentes, como respuestas no autorizadas del backend por navegar sin sesion
- **THEN** el reporte los clasifica y declara cuantos son atribuibles al change, y no afirma que no hubo errores

#### Scenario: Se mide una capa modal en web

- **WHEN** se mide un panel que la plataforma web envuelve en un contenedor propio marcado con atributos de dialogo modal
- **THEN** la medicion se ancla en el identificador del panel, y la evidencia reporta las dimensiones del panel y no las del viewport

#### Scenario: El elemento bajo prueba no tiene ancla propia

- **WHEN** un componente que se quiere medir no expone un identificador propio del elemento relevante
- **THEN** el procedimiento exige agregarlo antes de medir, y no admite sustituirlo por el contenedor que lo envuelve

#### Scenario: Una medicion contradice el comportamiento del codigo

- **WHEN** la medicion en navegador afirma una forma que el codigo del componente no puede producir
- **THEN** el procedimiento exige verificar primero que se midio el elemento correcto, antes de declarar un defecto del componente
