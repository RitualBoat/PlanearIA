# Baseline Brownfield Por Contacto

> **Uso:** preparar un change versionable nuevo sin documentar toda PlanearIA.
> **Fuente de verdad:** código, `openspec/specs/`, pruebas vigentes y documentación activa de la superficie tocada.
> **No usar para:** sustituir `proposal.md`, requisitos SHALL, tareas, revisión adversarial o evidencia de archive.

## Cuándo se crea

Durante `propose`, crea `openspec/changes/<change>/brownfield-baseline.md`. El archivo acompaña al
change hasta archive; el gate read-only comprueba que está en la raíz y que sus ocho secciones contienen
información. Los changes archivados no se reescriben.

## Plantilla mínima

```markdown
# Baseline brownfield: <change>

## Superficies tocadas
- Rutas, símbolos, specs, pruebas y contratos que este change modificará.

## Fuentes de verdad actuales
- Código, spec, prueba o documento que demuestra el estado vigente.

## Comportamiento vigente
- Hechos observables hoy, incluidos estados o contratos que el cambio no debe borrar por omisión.

## Comportamiento objetivo
- Delta esperado; los requisitos completos viven en `specs/`.

## Compatibilidad legacy
- Qué se conserva, qué se depreca con migración o `No aplica` con una razón concreta.

## Owner de spec y contexto
- Contexto DDD, owner de la superficie y consumidores; no transferir ownership de datos ajenos.

## Evidencia actual
- Pruebas, escenarios, consultas o rutas que un revisor puede comprobar.

## Fuera de alcance
- Superficies cercanas que se mantienen intactas.
```

No coloques comandos ejecutables ni secretos. El gate trata el contenido como documentación y ejecuta
solo los comandos estáticos de sus perfiles de validación.

## Flujo por contacto

1. Delimita las rutas/símbolos que el change toca y anota exclusiones explícitas.
2. Contrasta el comportamiento vigente con código, specs y pruebas actuales; usa GitNexus para estructura
   y CodeGraph solo como fallback de fuente cuando corresponda.
3. Declara el comportamiento objetivo y la compatibilidad que debe sobrevivir a la migración.
4. Consulta el mapa DDD: un shell o componente puede consumir una experiencia sin apropiarse de sus datos.
5. Escribe requisitos SHALL en la spec y pasos verificables en tasks; el baseline no reemplaza ninguno.
6. Antes de archive, actualiza las referencias de evidencia reales y ejecuta el gate DoD.

## Ejemplo: `theming-runtime`

```markdown
# Baseline brownfield: theming-runtime

## Superficies tocadas
- ThemeContext, FontSizeContext, DaltonismoContext, src/themes y el primer lote de pantallas migradas.

## Fuentes de verdad actuales
- PLAN_UXUI_NAVEGACION_GLOBAL.md, src/themes y CuentaScreen como piloto archivado.

## Comportamiento vigente
- Algunas pantallas reaccionan a tema/fuente/daltonismo; otras importan COLORS estático al cargar el módulo.

## Comportamiento objetivo
- Las pantallas rediseñadas usan tema runtime y fábrica de estilos memoizada; el cambio no migra los 60 consumidores de una vez.

## Compatibilidad legacy
- COLORS permanece como fallback para pantallas no migradas y se retira solo por contacto con evidencia.

## Owner de spec y contexto
- Experiencia y Preferencias posee tema/accesibilidad; Office y Classroom conservan sus datos de dominio.

## Evidencia actual
- Criterios del plan UX/UI, imports actuales y pruebas/QA del lote que el change seleccione.

## Fuera de alcance
- No cambia sync, entidades académicas, backend ni rutas de Classroom.
```
