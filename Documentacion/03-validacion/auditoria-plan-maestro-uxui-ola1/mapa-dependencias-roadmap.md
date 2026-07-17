# Mapa de dependencias y roadmap recomendado

## Grafo de dependencias (issues creados por esta auditoria)

```text
#78 theming-runtime (Ola 0)  <- PRIMER EJECUTABLE
 |- #79 breakpoints-reactivos (Ola 0, comparte migracion getStyles; tocar cada archivo UNA vez)
 |- #80 tokens-completos (Ola 0; incluye decision expo-blur y primitiva reduce-motion H9)
      |- #82 componentes-base (Ola 1)
           |- #83 sync-status-ui (Ola 1)
           |- #84 assign-sheet (Ola 1)
#78 + #79
 |- #81 app-shell-navegacion (Ola 1; decide FloatingActionIcons/OQ2 y frontera con notificaciones-chrome)
      |- #85 golden journeys + QA visual reproducible (pre-R2; bloquea R2)
      |- #86 hito prototipos-figma-ola2 (manual+docs; alimenta #46 y #47)
           |- #87 indices ground truth office/asistente (tras frames aprobados)

Independientes (sin bloquear Ola 0/1):
 #88 mitigacion xlsx (antes de calcuplan-hoja, Ola 3; patron dependency-risk-decision)
 #89 decision epic UX/UI + milestones por ola (needs-input; OQ-A)

Deuda existente que NO se duplica:
 #74 GitNexus wrapper -> RESUELTO durante la auditoria (PR #77 mergeado 2026-07-17)
 #75 expo-compatibility (change align-expo-localization-sdk54 en vuelo)   #66 tracking doctor
 #46 aprobacion Figma (gate manual)   #47 reclutamiento IHC (gate manual)
```

## Roadmap recomendado

1. **Ahora (Ola 0, secuencial):** #78 -> #79 -> #80. Son fundaciones sin UI visible; cada una es un change OpenSpec propio con su enrich/propose. #79 y #80 pueden solaparse solo despues de que #78 fije la fabrica `getStyles`.
2. **En paralelo desde ya (decision humana, costo cero de codigo):** #89 (epic/milestones); #74 quedo resuelto durante la auditoria (PR #77) y #75 ya tiene change en vuelo, ambos sanean el doctor que la DoR consulta.
3. **Ola 1 (tras #78+#79):** #81 primero (decisiones de shell desbloquean #85/#86); #82 tras #80; luego #83/#84.
4. **Pre-R2 (paralelo a Ola 1):** #85 (golden journeys/QA) e #86 (prototipo Figma + concept boards); #46 y #47 avanzan como gates manuales con su propia evidencia.
5. **Antes de Ola 3:** #88 (xlsx) e #87 (indices ground truth) segun lleguen frames y decision de dependencia.
6. **Ola 2+:** crear sus issues al activarse la ola (regla Product OS de ola activa + siguiente).

## Camino critico

`#78 -> #79 -> #81 -> (#85, #86) -> R2 -> Ola 2`. Todo retraso en #78 retrasa la cadena completa; #80/#82 forman la rama de componentes que alimenta #83/#84 y las pantallas de Ola 2.
