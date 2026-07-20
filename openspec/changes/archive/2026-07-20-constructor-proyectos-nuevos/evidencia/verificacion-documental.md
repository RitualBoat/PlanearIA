# Verificación documental y cualitativa

**Fecha:** 2026-07-19

**Alcance:** issue #103, change `constructor-proyectos-nuevos`, Ola 0 / Etapa A.

## Resultado

**PASS CON HUECOS EXTERNOS.** Los documentos, contratos y enlaces internos requeridos están presentes,
son neutrales y se encuentran desde los índices principales en dos saltos o menos. Las únicas evidencias
pendientes dependen de publicar el PR: matriz CI multi-SO y merge autorizado.

## Evidencia mecánica

- `npm run test:constructor-docs`: 12 artefactos obligatorios y 50 filas de la matriz de
  transferibilidad aprobados.
- `npm run constructor:check`: schemas, manifiesto, neutralidad, paridad, OPSX y enlaces aprobados.
- `npm run openspec:validate`: 34/34 elementos válidos y `TLDR.md` válido.
- Fixture desde repositorio Git vacío: Prompt 00, Prompt 01, guía manual, runbook, readiness y matriz de
  capacidades instalados; segundo run sin drift.

## Revisión cualitativa

| Superficie | Comprobación | Resultado |
| --- | --- | --- |
| `TLDR.md` | Intención, enfoque, comportamiento, trabajo y resultado reflejan solo la Ola 0. | PASS |
| Prompt 00 | Prepara un repositorio vacío y se detiene sin preguntar por producto ni instalar stack. | PASS |
| Prompt 01 | Es independiente e inerte durante bootstrap; pregunta primero por producto y solo después recomienda stack/perfiles. | PASS |
| Guía manual | Enumera autenticación, Project, decisiones, evidencia, licencias y hashes sin delegar secretos a la IA. | PASS |
| Costos/licencias | Separa núcleo sin coste, dependencias fijadas, licencias transitivas, servicios opcionales y decisión de publicación. | PASS |
| Rollback | Reversión de PlanearIA y rollback transaccional hash-aware del target están documentados y probados. | PASS |
| Encontrabilidad | `Documentacion/README.md` y context engineering enlazan al plan y al runbook; los prompts quedan a un salto adicional. | PASS |
| Neutralidad | No aparecen dominio docente, Expo, React, MVVM, `userId`, breakpoints ni proveedores activados en el núcleo instalado. | PASS |
| Ownership | `constructor`, `human-overlay`, `external-openspec` y `project` tienen políticas y conflictos explícitos. | PASS |

## Drift y decisiones registradas

- OpenSpec es el único owner de sus workflows. El adaptador solo parchea bloques delimitados de Product
  OS y comandos locales; el renderer general no genera esos workflows.
- La fixture local de la CLI oficial fijada produce 25 superficies OPSX en los cinco harnesses. La
  validación multi-SO no fija ese número: exige las familias/targets del contrato, ownership externo,
  consistencia del plan y `opsx-check` sin `FAIL`.
- Graphify permanece retirado/manual y aparece como `SKIP`, nunca como requisito de doctor, bootstrap o
  CI.
- La publicación del paquete permanece fuera de alcance: `private: true` y `UNLICENSED`.

## Degradaciones revisadas

- Un harness sin skills o MCP nativos conserva el núcleo mediante `AGENTS.md` y documenta la
  degradación como `documented` o `unsupported`.
- OAuth, smoke autenticado y Project remoto no se simulan como verdes; requieren evidencia humana o
  remota.
- React Doctor, Playwright, Figma, backend, datos, IA e infraestructura quedan inactivos hasta una
  decisión posterior al discovery.

## Recuperación ensayada

Las pruebas de integración inyectan fallo parcial, reanudan la transacción y ejecutan rollback. El
rollback restaura backups, elimina únicamente archivos nuevos cuyo hash coincide y conserva como
conflicto cualquier edición humana posterior.

## Señal pendiente

La CI del constructor está declarada como advisory con matriz Ubuntu, Windows y macOS. Su ejecución
real se verificará en el PR; hasta entonces no se declara paridad multi-SO observada.
