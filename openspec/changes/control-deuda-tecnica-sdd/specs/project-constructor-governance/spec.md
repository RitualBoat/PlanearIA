# project-constructor-governance Delta

## ADDED Requirements

### Requirement: Los repositorios generados reciben una politica de deuda neutral

El blueprint del constructor SHALL incluir una politica de control de deuda tecnica neutral destinada
a `.project-os/debt/config.json` en los repositorios generados, con owner seed-once para que el
proyecto pueda ajustarla. La politica SHALL declarar las siete categorias canonicas, el presupuesto
hibrido con umbral 5, los triggers de saneamiento y el modo GitHub por defecto: `required` cuando el
perfil GitHub del proyecto esta activo y `off` en caso contrario, siempre modificable a `advisory` u
`off` mediante edicion normal. El blueprint SHALL NOT incluir codigo del motor de deuda ni duplicar
workflows generados por la CLI oficial de OpenSpec: el motor llega a los repositorios generados como
paquete del futuro upstream.

#### Scenario: Bootstrap con perfil GitHub

- **WHEN** un repositorio se genera con el perfil GitHub activo
- **THEN** su politica de deuda queda sembrada con modo `required` y umbral 5

#### Scenario: Bootstrap sin GitHub

- **WHEN** un repositorio se genera sin perfil GitHub
- **THEN** su politica de deuda queda sembrada con modo `off` conservando el registro local como contrato

#### Scenario: El proyecto ajusta su politica

- **WHEN** el proyecto edita su `.project-os/debt/config.json` sembrado
- **THEN** una sincronizacion posterior del constructor no lo sobreescribe
