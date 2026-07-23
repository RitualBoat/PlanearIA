## ADDED Requirements

### Requirement: El upstream público es neutral y tiene licencia explícita

El sistema SHALL publicar `RitualBoat/project-engineering-os` como fuente canónica bajo licencia MIT. El
tree público SHALL limitarse mediante allowlist a runtime, blueprint, schemas, documentación, tests y
automatización propios del Engineering OS, y SHALL NOT contener código, secretos, datos, nombres, paths o
reglas de dominio de PlanearIA. La identidad de texto SHALL usar hashes canónicos LF y el repositorio
SHALL declarar una política de checkout LF para evitar drift falso entre sistemas operativos.

#### Scenario: Export inicial revisado

- **WHEN** se genera el tree de import desde el SHA de corte
- **THEN** cada ruta corresponde a la allowlist y tiene owner/licencia identificados
- **AND** el check de neutralidad y secretos termina en `PASS`

#### Scenario: Checkout multiplataforma con finales de línea distintos

- **WHEN** un checkout cambia únicamente LF por CRLF en archivos de texto
- **THEN** la identidad canónica del export permanece igual
- **AND** una alteración distinta de finales de línea continúa bloqueando el release

#### Scenario: Término específico detectado

- **WHEN** una fixture inserta un término o path prohibido de PlanearIA
- **THEN** la validación falla nombrando la ruta
- **AND** el repositorio o release SHALL NOT publicarse

#### Scenario: Licencia o notice incompatible

- **WHEN** el inventario detecta una dependencia sin licencia compatible o sin atribución requerida
- **THEN** el gate legal queda bloqueado
- **AND** exige excluirla, sustituirla o registrar una decisión humana antes de publicar

### Requirement: El paquete ofrece instalación reproducible por npm y npx

El paquete público SHALL llamarse `create-project-engineering-os`, exponer el mismo entrypoint como
`create-project-engineering-os` y `project-os`, y declarar versión SemVer, engines, repository, bugs,
homepage, allowlist `files` y acceso público. La ruta reproducible SHALL aceptar una versión exacta y
SHALL NOT depender de instalación global, `latest` persistido o paths internos de PlanearIA.

#### Scenario: Bootstrap por versión exacta

- **WHEN** se ejecuta `npx create-project-engineering-os@<version> bootstrap`
- **THEN** el CLI reporta esa identidad exacta en el estado generado
- **AND** no resuelve una instalación global distinta

#### Scenario: Onboarding con latest

- **WHEN** una persona usa `npx create-project-engineering-os@latest` por primera vez
- **THEN** el CLI muestra y persiste la versión concreta resuelta
- **AND** cualquier upgrade posterior requiere una versión destino explícita

#### Scenario: Tarball contiene una ruta no permitida

- **WHEN** `npm pack --dry-run` o la inspección del `.tgz` encuentra una ruta fuera de `files`
- **THEN** la validación falla antes de release
- **AND** enumera la ruta incidental sin publicar el paquete

### Requirement: Constructor y Debt Control Loop comparten paquete sin duplicar ownership

El paquete SHALL incluir bootstrap, sync/check, doctor, readiness, Product OS, upgrade/rollback y los
comandos `project-os debt ...`. SHALL existir una única versión y un único upstream para ambos runtimes,
pero sus schemas y stores SHALL permanecer separados. SHALL NOT publicarse un segundo paquete
`debt-control` ni instalarse una copia editable del motor en consumidores.

#### Scenario: Comandos del paquete empacado

- **WHEN** una fixture instala únicamente el tarball `create-project-engineering-os`
- **THEN** puede ejecutar comandos de constructor y `project-os debt check`
- **AND** ambos reportan la misma versión de paquete

#### Scenario: Segundo runtime encontrado

- **WHEN** la prueba de consumidor detecta source editable del constructor o debt-control además de la
  dependencia fijada
- **THEN** el smoke de ownership falla
- **AND** identifica la segunda fuente que debe retirarse

### Requirement: La licencia del Engineering OS no reemplaza la del consumidor

Los archivos administrados por Engineering OS SHALL conservar un notice MIT separado. El bootstrap y
upgrade SHALL NOT crear, reemplazar ni elegir el `LICENSE` principal del producto. El manifest SHALL
distinguir rutas `project-os`, overlays y archivos del proyecto.

#### Scenario: Producto con otra licencia

- **WHEN** el destino ya contiene un `LICENSE` no administrado
- **THEN** bootstrap y upgrade lo conservan byte por byte
- **AND** añaden únicamente el notice aplicable a rutas administradas

#### Scenario: Repositorio sin licencia de producto

- **WHEN** el destino no tiene `LICENSE`
- **THEN** el constructor no infiere MIT para el producto
- **AND** la guía registra la elección de licencia como decisión manual posterior

### Requirement: Release, tarball, checksum y registry comparten identidad

Cada release SHALL derivarse de un único commit/tag validado. El tarball probado SHALL ser exactamente el
adjuntado a GitHub Release y publicado en npm, con SHA-256 verificable. Tag, `package.json`, changelog,
nombre del asset, checksum y versión del registry SHALL coincidir.

#### Scenario: Release candidate consistente

- **WHEN** el pipeline promueve una versión
- **THEN** compara hashes del tarball probado, asset y artefacto destinado a npm
- **AND** solo continúa si son idénticos y pertenecen al commit/tag esperado

#### Scenario: Reconstrucción divergente

- **WHEN** un paso vuelve a empacar o cambia un byte después de la validación
- **THEN** el pipeline falla por identidad divergente
- **AND** no publica ninguna de las copias

#### Scenario: Recuperación tras GitHub Release parcial

- **WHEN** un run anterior creó la GitHub Release pero falló antes de publicar npm
- **THEN** la recuperación conserva tag y assets inmutables y compara tarball, manifest y checksum
- **AND** solo reutiliza la release si los bytes coinciden para el mismo tag

#### Scenario: Path de tarball ambiguo

- **WHEN** el comando de npm no recibe un path filesystem explícito con prefijo `./`
- **THEN** la validación falla antes del publish
- **AND** no permite que npm lo interprete como package spec o shorthand GitHub

#### Scenario: Versión ya existente

- **WHEN** npm o GitHub ya contienen la versión solicitada
- **THEN** el flujo SHALL NOT sobrescribirla, reutilizarla ni mover su tag
- **AND** exige una nueva versión SemVer

### Requirement: Trusted Publishing demuestra OIDC y provenance sin token persistente

Después del bootstrap inicial, la publicación SHALL usar npm Trusted Publishing desde runner hospedado,
con repositorio/workflow coincidentes, `contents: read`, `id-token: write`, environment protegido, Node
>=22.14 y npm >=11.5.1 o requisitos oficiales posteriores más estrictos. SHALL verificar provenance y
SHALL NOT guardar, imprimir o reutilizar un token npm de larga duración.

#### Scenario: Publicación OIDC sana

- **WHEN** el job aprobado publica desde el workflow y environment registrados
- **THEN** npm acepta la identidad OIDC y genera provenance verificable
- **AND** el job no recibe `NPM_TOKEN`

#### Scenario: Runtime de publicación incompatible

- **WHEN** Node o npm no satisfacen el mínimo requerido por Trusted Publishing
- **THEN** el preflight falla antes de solicitar OIDC o publicar
- **AND** no degrada a autenticación con token

#### Scenario: OIDC o provenance ausente

- **WHEN** publish termina sin identidad/provenance verificables
- **THEN** el release queda fallido y no se declara completo
- **AND** la recuperación conserva el tarball y exige corregir configuración

#### Scenario: Primera publicación

- **WHEN** reservar el paquete requiere autenticación interactiva previa al trusted publisher
- **THEN** se ejecuta únicamente con aprobación humana fuera de Git y logs
- **AND** cualquier credencial temporal se revoca después de demostrar OIDC

### Requirement: CI registra evidencia multiplataforma sin falsos verdes

El upstream SHALL validar tests, schemas, fixtures, neutralidad, secretos, licencias, pack y smoke en
Windows, macOS y Linux con Node 20/22. Los checks requeridos SHALL estar registrados y en `PASS`;
ausencia, skip inesperado, cancelación o timeout SHALL NOT contarse como éxito.

#### Scenario: Matriz completa

- **WHEN** un PR o release candidate termina
- **THEN** cada combinación obligatoria registra un resultado terminal
- **AND** el agregador solo pasa si todos los checks requeridos pasaron

#### Scenario: No existe un check esperado

- **WHEN** la API de checks no devuelve un nombre requerido
- **THEN** el gate falla con recuperación
- **AND** no interpreta la lista vacía como CI verde

#### Scenario: Fixture falla en un sistema

- **WHEN** bootstrap o deuda falla únicamente en Windows, macOS o Linux
- **THEN** la matriz completa falla
- **AND** el release no se promociona

### Requirement: Los workflows públicos usan permisos mínimos y referencias inmutables

Los workflows SHALL declarar permisos mínimos por job, SHALL fijar acciones de terceros a SHA completo y
SHALL separar código no confiable de cualquier contexto con OIDC o secretos. SHALL NOT publicar desde
`pull_request_target` ni ejecutar artefactos de PR no confiables en un job privilegiado.

#### Scenario: Acción fijada solo por tag

- **WHEN** el checker encuentra `uses: owner/action@vN` sin SHA completo
- **THEN** la validación de supply chain falla
- **AND** exige fijar un commit verificado y documentar la versión humana

#### Scenario: PR externo

- **WHEN** una contribución desde fork ejecuta CI
- **THEN** obtiene solo permisos read-only y ninguna identidad de publicación
- **AND** no puede disparar el job de release

### Requirement: La documentación pública es una interfaz probada

El upstream SHALL ofrecer README con quickstart greenfield/brownfield, conceptos, comandos, Debt Control
Loop, actualización, rollback, troubleshooting, seguridad y contribución. Desde README y AGENTS SHALL
encontrarse documentos críticos en un máximo de dos enlaces, y los comandos esenciales SHALL probarse
contra el tarball.

#### Scenario: Persona prepara su primer repositorio

- **WHEN** sigue únicamente el quickstart documentado
- **THEN** completa Etapa A y obtiene doctor/debt check sin `FAIL` no justificado
- **AND** un segundo run produce cero drift

#### Scenario: Ejemplo obsoleto

- **WHEN** un comando del README no coincide con bins u opciones actuales
- **THEN** el test documental falla
- **AND** identifica el bloque que debe actualizarse

#### Scenario: Recuperación encontrable

- **WHEN** bootstrap o upgrade falla parcialmente
- **THEN** README permite llegar a resume/rollback en no más de dos enlaces
- **AND** la guía no propone borrar trabajo ni usar `git reset --hard`

### Requirement: El repositorio acepta contribuciones sin debilitar seguridad

El upstream SHALL incluir CONTRIBUTING, código de conducta, SECURITY, SUPPORT, changelog, templates y
ownership de revisión. Vulnerabilidades SHALL reportarse por un canal privado documentado; los issues
públicos SHALL NOT solicitar secretos ni detalles explotables no coordinados.

#### Scenario: Pull request externo

- **WHEN** un contribuidor propone un cambio no trivial
- **THEN** encuentra SDD, tests, licencias, DCO/terms vigentes y review requeridos
- **AND** el PR no puede autoaprobarse ni publicar

#### Scenario: Reporte de vulnerabilidad

- **WHEN** una persona consulta SECURITY
- **THEN** encuentra versiones soportadas, canal privado y tiempos de respuesta esperados
- **AND** no necesita abrir un issue público con el exploit

### Requirement: Ramas y tags protegidos gobiernan releases

La rama por defecto SHALL exigir PR, checks, conversaciones resueltas y prohibir force-push/borrado. Los
tags SHALL restringirse al flujo autorizado. El único push directo permitido SHALL ser el seed mínimo
necesario para crear la rama; la protección se activará inmediatamente y el export completo/primera
release entrarán por PR protegido.

#### Scenario: Seed inicial

- **WHEN** todavía no existe la rama por defecto
- **THEN** se publica solo gobernanza/CI mínima revisada y se registra su SHA
- **AND** se activa protección antes de aceptar el export

#### Scenario: Primer import completo

- **WHEN** el tree allowlisted está listo
- **THEN** se sube por una rama y PR con CI completa
- **AND** no se empuja directamente a `main`

#### Scenario: Tag no autorizado

- **WHEN** un actor o workflow no aprobado intenta crear/mover un tag de release
- **THEN** la protección o gate falla
- **AND** no produce una publicación válida
