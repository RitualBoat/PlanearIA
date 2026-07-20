## ADDED Requirements

### Requirement: El mapa de navegacion describe la navegacion implementada y declara su derivacion

`Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md` SHALL describir la navegacion realmente
implementada, coincidiendo con `src/navigation/AppShell.tsx`, `src/navigation/routeManifest.ts` y
`RootStackParamList`. SHALL declarar en su encabezado que es un documento derivado de
`src/navigation/routeManifest.ts`, que se actualiza cuando ese archivo cambia, y que no define la
navegacion objetivo. Todo archivo citado **como fuente de verdad** SHALL existir en el repositorio; un
archivo eliminado solo puede citarse dentro de una afirmacion que declare su eliminacion. SHALL NOT
presentar como vigente ninguna estructura de navegacion que el codigo ya no contenga. El mapa SHALL
registrar ademas las diferencias conocidas entre lo implementado y la navegacion objetivo del plan
maestro, para que un prototipo no tome una por la otra.

#### Scenario: Un agente prepara frames de Figma a partir del mapa

- **WHEN** un disenador o agente abre el mapa para construir la arquitectura de informacion
- **THEN** encuentra los cinco hubs implementados (`InicioTab`, `OfficeTab`, `ClasesTab`, `AsistenteTab`, `MasTab`) con su titulo, su ruta y su pantalla de aterrizaje
- **AND** cada archivo citado como fuente existe en el repositorio
- **AND** el encabezado le indica que el documento describe lo implementado y no lo planeado
- **AND** encuentra registradas las diferencias conocidas entre lo implementado y el objetivo del plan, con el change que cierra cada una

#### Scenario: El contrato de rutas cambia despues de este change

- **WHEN** alguien modifica la particion de rutas en `src/navigation/routeManifest.ts`
- **THEN** el encabezado del mapa nombra ese archivo como disparador de actualizacion
- **AND** la verificacion de vigencia consiste en comparar el mapa contra ese manifiesto

#### Scenario: Alguien busca la ruta del Asistente

- **WHEN** se consulta el mapa por la superficie del Asistente
- **THEN** encuentra `AsistenteTab` -> `AsistenteHome` como ruta implementada
- **AND** el alcance vigente se declara de forma honesta, indicando a que destinos ya funcionales enruta y que superficie conversacional aun no existe
- **AND** el mapa no invita a decidir la ubicacion del Asistente como si siguiera abierta

### Requirement: Las superficies legacy se documentan por hub duenio y nunca como navegacion primaria

La documentacion vigente SHALL registrar `Feed`, `Social` y `Contenido` como superficies legacy indicando
el hub que las contiene y la decision que las movio. SHALL NOT presentar `FeedTab`, `ContenidoTab`,
`GruposTab`, `SocialTab` ni `ConfiguracionTab` como navegacion primaria vigente en ningun documento
activo, incluidos `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md` y
`Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`. Los registros fechados e historicos y las
carpetas de archivo o auditoria SHALL conservarse sin modificar.

#### Scenario: Se busca una tab legacy en la documentacion activa

- **WHEN** se buscan `FeedTab`, `ContenidoTab`, `GruposTab`, `SocialTab` o `ConfiguracionTab` en `Documentacion/`, excluyendo `99-archivo/` y `03-validacion/`
- **THEN** ninguna ocurrencia las presenta como navegacion primaria vigente
- **AND** las ocurrencias que permanezcan son registros fechados o referencias historicas identificables como tales

#### Scenario: Un disenador pregunta donde quedo Feed

- **WHEN** se consulta la documentacion por la ubicacion actual de Feed o Social
- **THEN** encuentra que son rutas dentro de `MasTab`, vivas y alcanzables desde ese hub
- **AND** encuentra que `Contenido` es una ruta dentro de `OfficeTab`
- **AND** cada una indica la decision que la reubico y que su destino final lo define un change posterior

#### Scenario: La tabla de hubs se consulta como inventario de navegacion primaria

- **WHEN** se lee la tabla de hubs del mapa
- **THEN** contiene exactamente los cinco hubs del shell y ninguna pantalla legacy
- **AND** las pantallas legacy aparecen unicamente dentro de la seccion del hub que las contiene

### Requirement: La navegacion cruzada y los destinos de raiz se documentan con su criterio

El mapa SHALL documentar que las acciones de navegacion suben al navegador padre pero nunca bajan a un
navegador hermano, que un cruce entre hubs usa la forma anidada de `navigateToHub`, y que el retorno usa
`goBackOrHubLanding` con aterrizaje en la landing del hub cuando no existe historial. SHALL documentar las
rutas de raiz con el criterio que las mantiene ahi, y SHALL distinguir las rutas alcanzables por el
docente de las que solo existen en compilaciones de desarrollo.

#### Scenario: Se disena un flujo que cruza dos hubs

- **WHEN** un disenador o agente planea una accion que lleva de un hub a una pantalla de otro
- **THEN** el mapa le indica que ese cruce requiere la forma anidada de `navigateToHub` y por que la navegacion plana no funciona
- **AND** le indica como se resuelve el regreso cuando el usuario entro sin historial

#### Scenario: Se decide si una pantalla nueva pertenece a la raiz o a un hub

- **WHEN** se consulta el mapa por el criterio de pertenencia a la raiz
- **THEN** encuentra que la raiz aloja autenticacion, onboarding, el shell y los destinos que nunca navegan de vuelta hacia un hub
- **AND** las rutas de solo desarrollo aparecen marcadas como no alcanzables por el docente

### Requirement: Los documentos de plan distinguen plan y snapshot de estado operativo

`Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` SHALL declarar en su encabezado que es
un plan y un snapshot de su fecha, que el estado operativo se rastrea en el epic #101 y sus milestones, y
que los estados por change del documento no son autoridad de estado. Los estados de change ya
contradichos por evidencia verificable SHALL corregirse. Las estimaciones, paridades y dependencias
historicas SHALL NOT reescribirse. `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` SHALL NOT declarar
abierto un milestone cerrado, y SHALL conservar sus registros fechados de estado inicial.

#### Scenario: Alguien consulta el plan buscando el estado del trabajo

- **WHEN** se abre el Plan Maestro para saber que esta hecho
- **THEN** el encabezado indica que el estado operativo vive en el epic #101 y sus milestones
- **AND** indica que los estados por change del propio documento no son autoridad de estado

#### Scenario: Se revisan los changes de Ola 1 en el plan

- **WHEN** se consultan `app-shell-navegacion`, `componentes-base`, `sync-status-ui` y `assign-sheet`
- **THEN** figuran como archivados con su fecha, no como pendientes
- **AND** sus estimaciones, paridades y dependencias historicas permanecen sin cambios

#### Scenario: Se consulta el estado del milestone de Ola 1 en Product OS

- **WHEN** se lee `GITHUB_PRODUCT_OS.md` buscando el estado de `UX/UI Ola 1 - Shell y componentes`
- **THEN** el documento no lo declara abierto ni lo lista entre milestones activos
- **AND** el registro fechado del estado inicial tras `product-os-epic-uxui` se conserva

### Requirement: Las decisiones ya tomadas no permanecen registradas como abiertas

Las open questions y los riesgos del Plan Maestro que ya fueron resueltos por un change archivado SHALL
marcarse como resueltos, con fecha, enlace a la decision y su resultado verificable. SHALL NOT eliminarse
la pregunta o el riesgo original, para conservar la trazabilidad. SHALL NOT alterarse las decisiones del
change que los resolvio ni sus specs archivadas.

#### Scenario: Se consulta OQ2 sobre el destino de FloatingActionIcons

- **WHEN** se lee el registro de open questions del Plan Maestro
- **THEN** OQ2 figura como resuelta con fecha y enlace a la decision de `app-shell-navegacion`
- **AND** el resultado registrado es verificable: el componente flotante fue retirado y sus afordancias de notificaciones, ayuda y cuenta viven en el chrome superior del shell
- **AND** el texto original de la pregunta se conserva

#### Scenario: Se revisa el riesgo R4 de segunda navegacion paralela

- **WHEN** se consulta la tabla de riesgos del Plan Maestro
- **THEN** R4 figura como resuelto, indicando que su mitigacion propuesta ya se ejecuto
- **AND** la spec del shell y las specs archivadas del change que lo resolvio no resultan modificadas
