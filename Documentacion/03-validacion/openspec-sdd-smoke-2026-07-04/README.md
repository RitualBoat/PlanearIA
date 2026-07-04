# Smoke Test OpenSpec SDD - Settings Accessibility

> Fecha: 2026-07-04
> Rama: `test/openspec-sdd-settings-smoke`
> Change: `verify-settings-accessibility-controls`
> Objetivo: demostrar el flujo SDD completo de OpenSpec en PlanearIA con un cambio pequeno, reversible y con evidencia.

## Resultado Esperado

Validar que el flujo descrito en `Documentacion/01-planes-maestros/meta_guia_planes.md` funciona de inicio a fin:

1. Elegir un change aislado.
2. Enriquecer o acotar la historia.
3. Explorar el codigo real con CodeGraph.
4. Proponer artefactos OpenSpec.
5. Aplicar tareas con evidencia.
6. Evaluar revision/gates.
7. Archivar y sincronizar specs.
8. Documentar el proceso para repetirlo.

## Historia Usada

Como prueba de bajo riesgo, se eligio asegurar mediante tests que las preferencias locales de configuracion/accesibilidad propagan cambios en runtime:

- modo claro/oscuro;
- tamano de letra;
- modo de daltonismo.

La historia ya era especifica, por lo que no se creo issue de GitHub ni se uso `/enrich-us`. Se documento como equivalente enriquecido:

> Como docente, quiero que mis preferencias locales de tema, tamano de letra y daltonismo se apliquen y persistan sin depender de red, para que PlanearIA no tenga controles decorativos en cuenta/accesibilidad.

## Exploracion

Se uso CodeGraph antes de leer archivos sueltos:

```bash
codegraph_explore "settings configuration accessibility font size dark mode daltonismo theme context controls tests"
```

Hallazgos:

- `ThemeProvider`, `FontSizeProvider` y `DaltonismoProvider` existen y se montan desde `App`.
- Los providers usan AsyncStorage local.
- CodeGraph marco que no habia tests focalizados para esos contexts.

## Propose

Comandos ejecutados:

```bash
openspec new change "verify-settings-accessibility-controls"
openspec status --change "verify-settings-accessibility-controls" --json
openspec instructions proposal --change "verify-settings-accessibility-controls" --json
openspec instructions design --change "verify-settings-accessibility-controls" --json
openspec instructions specs --change "verify-settings-accessibility-controls" --json
openspec instructions tasks --change "verify-settings-accessibility-controls" --json
```

Artefactos generados:

- `openspec/changes/verify-settings-accessibility-controls/proposal.md`
- `openspec/changes/verify-settings-accessibility-controls/design.md`
- `openspec/changes/verify-settings-accessibility-controls/specs/settings-accessibility-preferences/spec.md`
- `openspec/changes/verify-settings-accessibility-controls/tasks.md`

Estado antes de aplicar:

```text
Progress: 4/4 artifacts complete
[x] proposal
[x] design
[x] specs
[x] tasks
```

## Apply

Se pidieron instrucciones de apply:

```bash
openspec instructions apply --change "verify-settings-accessibility-controls" --json
```

OpenSpec detecto 7 tareas pendientes. La implementacion agrego:

- `src/__tests__/settings/accessibilityPreferencesContexts.test.tsx`

El test usa consumidores minimos de los hooks publicos para verificar:

- cambio runtime y persistencia de tema;
- restauracion de tema almacenado;
- cambio runtime y persistencia de tamano de letra;
- restauracion de tamano de letra almacenado;
- cambio runtime y persistencia de daltonismo;
- restauracion de daltonismo almacenado;
- modo de daltonismo `none` sin alterar tokens;
- defaults seguros con valores persistidos invalidos.

## Evidencia

Prueba focalizada:

```bash
npm test -- src/__tests__/settings/accessibilityPreferencesContexts.test.tsx --runInBand
```

Resultado:

```text
PASS src/__tests__/settings/accessibilityPreferencesContexts.test.tsx
Test Suites: 1 passed, 1 total
Tests: 8 passed, 8 total
```

Checks base:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
```

Resultado:

```text
typecheck: pass
lint: pass
jest completo: 88 suites passed, 587 tests passed
```

## Gate Visual

Figma y Playwright se evaluaron como no aplicables para este smoke:

- no se modifico una pantalla visible;
- no se agregaron controles renderizados;
- no hubo cambio de layout, tokens, navegacion ni copy;
- el objetivo fue validar los providers con tests unitarios/integracion ligera.

La regla sigue vigente para changes UI reales: si una pantalla visible cambia, debe haber ground truth Figma o declaracion de bloqueo y validacion visual con Playwright por breakpoint.

## Revision

Veredicto: PASS.

Checklist revisado:

- La spec pide runtime + persistencia + defaults seguros.
- El test nuevo cubre los tres providers y los defaults invalidos.
- `typecheck`, `lint` y validacion OpenSpec pasaron.
- No se tocaron backend, sync, IA, SQLite default ni UI renderizada.
- Gate visual evaluado y justificado como no aplicable.

## Archive

Comando ejecutado:

```bash
openspec archive "verify-settings-accessibility-controls" --yes --json
```

Resultado:

```json
{
  "archivedAs": "2026-07-04-verify-settings-accessibility-controls",
  "specsUpdated": true,
  "totals": {
    "added": 4,
    "modified": 0,
    "removed": 0,
    "renamed": 0
  }
}
```

Rutas finales:

- Change archivado: `openspec/changes/archive/2026-07-04-verify-settings-accessibility-controls/`
- Spec principal creada: `openspec/specs/settings-accessibility-preferences/spec.md`

Validacion post-archive:

```bash
openspec list --json
openspec validate --all --strict
```

Resultado:

```text
No active changes.
spec/settings-accessibility-preferences: pass
```

Nota: el archive genero un `Purpose` inicial con placeholder y se ajusto a una descripcion concreta de la spec. Despues se revalido OpenSpec.

## Como Repetir Este Flujo

1. Partir de una rama limpia.
2. Elegir un change pequeno y nombrarlo en kebab-case.
3. Consultar CodeGraph si hay investigacion de codigo.
4. Crear el change con `openspec new change`.
5. Usar `openspec instructions <artifact>` antes de escribir cada artefacto.
6. No implementar hasta que `openspec status --change <name>` muestre 4/4 artefactos completos.
7. Usar `openspec instructions apply --change <name>` y completar tareas una por una.
8. Marcar `[x]` solo despues de evidencia concreta.
9. Validar OpenSpec y archivar.
10. Documentar comandos, decisiones y evidencia.
