## ADDED Requirements

### Requirement: Upstream y consumidores tienen ownership no ambiguo

El repositorio público SHALL ser owner del runtime, blueprint, schemas, CLI, documentación pública y
releases del constructor. Cada proyecto generado SHALL ser owner de sus decisiones de producto y
personalizaciones no administradas. Los consumidores SHALL referenciar una release y SHALL NOT mantener
un fork canónico silencioso.

#### Scenario: Cambio en el núcleo después del corte

- **WHEN** una corrección afecta una ruta administrada universal
- **THEN** se propone y valida primero en el upstream
- **AND** los consumidores la reciben mediante una release y upgrade explícitos

#### Scenario: Personalización del proyecto

- **WHEN** un proyecto modifica una ruta que su manifest declara no administrada o preservada
- **THEN** el upstream no reclama ownership sobre esa personalización
- **AND** sync/upgrade conserva o reporta el contrato aplicable

#### Scenario: Copia divergente

- **WHEN** PlanearIA u otro consumidor contiene runtime canónico modificable fuera de la release fijada
- **THEN** parity o la auditoría de ownership falla
- **AND** enlaza el upstream y la ruta de migración

#### Scenario: Specs locales del consumidor

- **WHEN** PlanearIA conserva requisitos `project-constructor-*`
- **THEN** los identifica como contrato de aceptación de la release fijada, con owner y versión upstream
- **AND** cualquier cambio de runtime nace primero en las specs y PR del upstream

### Requirement: Publicación y autenticación permanecen como gates humanos

La creación pública del repositorio, aprobación de licencia/NOTICE, autenticación GitHub/npm, primera
publicación y releases mayores SHALL requerir intervención humana trazable. Doctor, bootstrap y upgrade
SHALL NOT aceptar términos, autenticar, crear credenciales, publicar ni cambiar visibilidad por sí solos.

#### Scenario: Primera publicación pendiente

- **WHEN** código, CI y tarball están listos pero el owner no ha aprobado el gate
- **THEN** el flujo termina en estado de release candidate
- **AND** conserva comandos, checksum y evidencia sin contactar npm para publicar

#### Scenario: Credenciales ausentes

- **WHEN** un gate remoto requiere sesión o scope adicional
- **THEN** reporta la identidad/scopes faltantes sin mostrar valores
- **AND** no inicia OAuth ni escribe tokens

#### Scenario: Release mayor

- **WHEN** la versión propuesta cambia el major
- **THEN** exige aprobación registrada y guía de migración/rollback
- **AND** la automatización no puede omitir el gate por usar un tag directo

### Requirement: La gobernanza pública conserva el flujo SDD

El upstream SHALL instalar issue/PR templates, Project OS declarativo y OpenSpec/SDD para cambios no
triviales. Entrevistas, autorizaciones y operaciones remotas sin cambio versionado SHALL permanecer como
gates manuales; cambios de código o documentación SHALL usar issue, readiness, change, evidencia y PR.

#### Scenario: Contribución no trivial

- **WHEN** una persona propone cambiar CLI, blueprint, schema, seguridad o release
- **THEN** el repositorio exige issue enriquecido y artifacts SDD proporcionales
- **AND** la PR enlaza criterios, evidencia y rollback

#### Scenario: Autorización sin cambio de repositorio

- **WHEN** el owner completa 2FA, trusted publisher o aprobación de un environment
- **THEN** la acción se registra como evidencia manual
- **AND** no se crea un change OpenSpec ficticio solo para representar el clic

#### Scenario: Hotfix trivial

- **WHEN** una corrección pretende saltarse SDD como hotfix
- **THEN** requiere clasificación y autorización explícitas según la política del upstream
- **AND** no puede omitir tests, secreto scanning o PR protegido
