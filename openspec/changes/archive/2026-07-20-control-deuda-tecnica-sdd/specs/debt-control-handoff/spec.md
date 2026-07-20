# debt-control-handoff Delta

## ADDED Requirements

### Requirement: El prompt de relevo se renderiza desde datos canonicos

El motor SHALL renderizar un prompt de relevo determinista construido exclusivamente desde el
registro, la configuracion y los assessments versionados. El prompt SHALL incluir issue, plan,
hallazgos con evidencia, alcance, lectura dirigida, gates y comandos de validacion, rollback, no
objetivos y criterio de retorno. El generador SHALL NOT copiar conversaciones, logs extensos ni
memoria de chat, SHALL NOT inventar contexto ausente de las fuentes canonicas y SHALL redactar
credenciales o tokens antes de emitir cualquier texto.

#### Scenario: Render reproducible

- **WHEN** el generador se ejecuta dos veces sobre el mismo registro y configuracion
- **THEN** produce exactamente el mismo prompt

#### Scenario: Secreto en evidencia

- **WHEN** una referencia de evidencia contiene un token o credencial
- **THEN** el prompt emite la referencia con el secreto redactado

#### Scenario: Datos incompletos

- **WHEN** falta el issue de remediacion u otro dato canonico requerido
- **THEN** el generador declara el hueco explicitamente en lugar de inventarlo

### Requirement: La recomendacion de continuidad es determinista y explicada

El motor SHALL recomendar continuar en la misma tarea solo para correcciones pequenas, locales y
previas al archive: sin Blockers ni Majors, con pocos items Minor del mismo plan y contexto declarado
sano. Para remediaciones amplias, deuda transversal, decisiones nuevas, revision independiente o
contexto degradado o desconocido, SHALL recomendar una tarea nueva con handoff estructurado. La
recomendacion SHALL exponer sus razones y SHALL NOT depender de porcentajes de tokens del harness.

#### Scenario: Correccion pequena pre-archive

- **WHEN** el flujo esta antes de archive con dos Minors del mismo plan y contexto declarado sano
- **THEN** la recomendacion es misma tarea con las razones listadas

#### Scenario: Saneamiento de lote

- **WHEN** existe un issue de remediacion con multiples items o un Blocker/Major
- **THEN** la recomendacion es tarea nueva e incluye el prompt de relevo listo para pegar
