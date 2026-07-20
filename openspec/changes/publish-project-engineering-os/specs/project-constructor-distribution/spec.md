## ADDED Requirements

### Requirement: El upstream público es neutral y tiene licencia explícita

El sistema SHALL publicar el constructor desde `RitualBoat/project-engineering-os` como fuente canónica
bajo licencia MIT. El tree público SHALL contener únicamente runtime, blueprint, schemas, documentación,
tests y automatización propios del Engineering OS, y SHALL NOT contener código, secretos, datos, nombres
de módulos o reglas de dominio de PlanearIA.

#### Scenario: Import inicial revisado

- **WHEN** se prepara el tree del primer commit público
- **THEN** una allowlist identifica cada ruta publicable y una prueba de neutralidad termina en PASS
- **AND** el commit registra issue, PR y SHA de procedencia sin importar el historial completo de PlanearIA

#### Scenario: Término específico de PlanearIA

- **WHEN** un archivo publicable contiene un término o regla de dominio prohibida fuera de una fixture
  negativa permitida
- **THEN** la validación falla nombrando archivo y categoría
- **AND** el repo o release SHALL NOT publicarse

#### Scenario: Licencia y terceros

- **WHEN** se construye una release candidate
- **THEN** `LICENSE` declara MIT para el código propio y el manifest del paquete coincide
- **AND** un inventario identifica dependencias, versiones y licencias de terceros

### Requirement: El paquete ofrece instalación reproducible por npm y npx

El paquete público SHALL llamarse `create-project-engineering-os`, SHALL exponer el mismo entrypoint como
`create-project-engineering-os` y `project-os`, y SHALL declarar versión SemVer, engines, repository,
bugs, homepage, files y acceso público. La ruta reproducible SHALL aceptar una versión exacta y SHALL NOT
requerir instalación global.

#### Scenario: Bootstrap por versión exacta

- **WHEN** un repositorio Git vacío ejecuta `npx create-project-engineering-os@<version> bootstrap`
- **THEN** npm resuelve esa versión y el CLI completa Etapa A
- **AND** el estado registra nombre, versión, schema e identidad del paquete ejecutado

#### Scenario: Onboarding por latest

- **WHEN** una persona usa `npx create-project-engineering-os@latest` en el quickstart
- **THEN** el CLI muestra la versión resuelta antes de escribir
- **AND** la evidencia o el lock posterior fija esa versión para reproducciones y upgrades

#### Scenario: Tarball contiene una ruta no permitida

- **WHEN** `npm pack --dry-run` o la inspección del `.tgz` encuentra una ruta fuera de la allowlist
- **THEN** el gate de release falla
- **AND** npm publish no se ejecuta

### Requirement: La licencia del constructor no reemplaza la licencia del consumidor

Los archivos de código y templates administrados por Engineering OS SHALL conservar el aviso MIT en un
notice separado. El bootstrap SHALL NOT crear, reemplazar ni decidir el `LICENSE` principal del producto
nuevo. El manifest de ownership SHALL distinguir superficies `project-os`, overlays y archivos propios
del proyecto.

#### Scenario: Proyecto propietario o con otra licencia

- **WHEN** el destino tiene o elige una licencia distinta para su producto
- **THEN** bootstrap y upgrade preservan ese `LICENSE`
- **AND** mantienen el aviso MIT únicamente para las superficies derivadas del constructor

#### Scenario: Repositorio vacío sin licencia de producto

- **WHEN** Etapa A prepara un repositorio nuevo
- **THEN** instala el notice del Engineering OS y explica su alcance
- **AND** deja la decisión de licencia del producto como gate posterior sin asumir MIT

#### Scenario: Upgrade de archivos administrados

- **WHEN** una release modifica templates o scripts cubiertos por MIT
- **THEN** conserva ownership y notice verificables
- **AND** no inserta encabezados o cambios de licencia en contenido propio del usuario

### Requirement: Release, tarball, checksum y publicación comparten identidad

Cada release SHALL derivarse de un único commit/tag validado. El tarball probado SHALL ser el mismo
artefacto adjuntado a GitHub Release y publicado en npm, y SHALL incluir un SHA-256 verificable. La
versión del tag, `package.json`, changelog, asset y registry SHALL coincidir.

#### Scenario: Release candidate consistente

- **WHEN** CI prepara una release candidate desde un tag
- **THEN** empaca una vez, ejecuta el smoke desde ese `.tgz` y produce `SHA256SUMS`
- **AND** los artifacts conservan el SHA del commit y la versión esperada

#### Scenario: Reconstrucción distinta

- **WHEN** el tarball que se intenta publicar no coincide con el checksum del candidato aprobado
- **THEN** la publicación falla antes de contactar el registry
- **AND** exige crear y validar un candidato nuevo

#### Scenario: Versión ya publicada

- **WHEN** npm ya contiene la versión del candidato
- **THEN** el flujo SHALL NOT sobrescribirla ni reutilizarla
- **AND** solicita una versión SemVer nueva

### Requirement: La publicación demuestra provenance sin secretos persistentes

Después del bootstrap inicial del paquete, la publicación SHALL usar el mecanismo de trusted publishing
vigente soportado por npm con un runner hospedado, OIDC y permisos mínimos. El workflow SHALL demostrar
provenance verificable y SHALL NOT almacenar, imprimir o reutilizar un token npm de larga duración.

#### Scenario: Trusted Publishing sano

- **WHEN** un release aprobado ejecuta el job de publicación
- **THEN** npm valida la identidad OIDC del repositorio y workflow autorizados
- **AND** la versión publicada expone provenance asociado al upstream público

#### Scenario: OIDC o provenance ausente

- **WHEN** trusted publishing no autentica o la publicación no produce la evidencia requerida
- **THEN** el job falla de forma segura
- **AND** no degrada silenciosamente a un token persistente

#### Scenario: Primera publicación

- **WHEN** el nombre aún no existe y trusted publishing no puede configurarse
- **THEN** el owner realiza el bootstrap mediante un gate manual con credencial temporal fuera de Git
- **AND** la credencial se revoca después de configurar y verificar el publisher OIDC

### Requirement: CI registra evidencia multiplataforma antes de liberar

El upstream SHALL validar unit tests, schemas, fixtures, neutralidad, secretos, pack y smoke en Linux,
Windows y macOS con Node 20/22 según la matriz soportada. Un release SHALL requerir checks registrados y
en PASS; ausencia, cancelación o timeout SHALL NOT contarse como éxito.

#### Scenario: Matriz completa

- **WHEN** un PR o release candidate modifica runtime, blueprint, package o workflows
- **THEN** se ejecuta la matriz soportada y cada job tiene nombre único
- **AND** el veredicto enlaza los resultados al commit evaluado

#### Scenario: No existen checks

- **WHEN** el commit de un PR o tag no reporta checks aplicables
- **THEN** el gate queda en FAIL
- **AND** ninguna release o publicación continúa

#### Scenario: Fixture falla en un sistema operativo

- **WHEN** el bootstrap, segundo run o rollback falla en una combinación soportada
- **THEN** la release candidate se rechaza
- **AND** la combinación no se elimina de la matriz para obtener un verde artificial

### Requirement: La documentación pública es una interfaz probada

El upstream SHALL ofrecer un README amigable con quickstart, adopción brownfield, conceptos, comandos,
actualización, rollback, troubleshooting, seguridad y contribución. Desde README y AGENTS SHALL poder
encontrarse los documentos críticos en un máximo de dos enlaces, y los comandos esenciales SHALL
validarse contra el CLI empaquetado.

#### Scenario: Persona crea su primer proyecto

- **WHEN** una persona con Node/npm y Git sigue únicamente el quickstart
- **THEN** prepara un repositorio nuevo, ejecuta doctor y verifica un segundo run sin drift
- **AND** no necesita conocer PlanearIA ni elegir stack antes del discovery

#### Scenario: Ejemplo obsoleto

- **WHEN** un comando documentado no existe o sus flags no coinciden con `--help`
- **THEN** la prueba documental falla
- **AND** identifica el documento y comando desactualizados

#### Scenario: Recuperación desde README

- **WHEN** un bootstrap o upgrade se interrumpe
- **THEN** la persona encuentra resume, rollback y límites de seguridad en máximo dos saltos
- **AND** ninguna instrucción recomienda `git reset --hard`

### Requirement: El repositorio acepta contribuciones sin debilitar seguridad

El upstream SHALL incluir CONTRIBUTING, código de conducta, política de seguridad, changelog, templates
y ownership de revisión. Vulnerabilidades SHALL reportarse por un canal privado documentado; issues
públicos SHALL NOT solicitar secretos ni detalles explotables no coordinados.

#### Scenario: Pull request externo

- **WHEN** un colaborador abre un PR
- **THEN** encuentra setup, tests, SDD, estilo, términos de contribución/licencia y evidencia esperada
- **AND** el PR pasa checks y revisión antes de merge

#### Scenario: Reporte de vulnerabilidad

- **WHEN** una persona necesita informar una posible vulnerabilidad
- **THEN** SECURITY indica un canal privado, alcance y tiempos de respuesta esperados
- **AND** las plantillas públicas advierten no incluir secretos o exploit operativo

### Requirement: Las ramas y tags protegidos gobiernan los releases

La rama por defecto del upstream SHALL exigir PR, checks, resolución de conversaciones y bloqueo de
force-push/borrado. Los tags de release SHALL restringirse al flujo autorizado. El único push directo
permitido SHALL ser un seed mínimo necesario para crear la rama, seguido inmediatamente por la
protección. El export completo y la primera release SHALL entrar por un PR protegido.

#### Scenario: Cambio posterior al bootstrap

- **WHEN** existe la rama protegida y alguien intenta empujar directamente
- **THEN** GitHub rechaza el push o el proceso se detiene antes de intentarlo
- **AND** el cambio debe ingresar mediante PR

#### Scenario: Seed inicial

- **WHEN** el repositorio aún no tiene rama por defecto
- **THEN** el owner publica solo README, LICENSE, SECURITY y CI mínimos revisados y registra el SHA
- **AND** activa la protección antes de abrir el PR del export completo

#### Scenario: Primer import completo

- **WHEN** el release candidate está listo después del seed protegido
- **THEN** se publica en una rama y pasa CI/PR antes de llegar a la rama por defecto
- **AND** el tag de release solo puede apuntar al commit mergeado

#### Scenario: Tag no autorizado

- **WHEN** un actor o workflow sin permiso intenta crear o mover un tag de release
- **THEN** la regla lo rechaza
- **AND** ningún job de publicación obtiene autorización
