## Context

#74 resuelve una deuda de harness registrada por #66. El comando directo de GitNexus identifica el checkout cuando se ejecuta desde su raíz, pero el wrapper Windows de `scripts/gitNexusFts.mjs` puede devolver `Not a git repository` con código cero. `scripts/harnessDoctor.mjs` ya consume ese resultado y lo clasifica como FAIL; el defecto está antes, al preparar y evaluar la invocación de GitNexus.

El change se limita a automatización local read-only. No cambia una pantalla, un flujo docente, datos académicos, sync, backend, IA, autenticación ni dependencias.

### Bounded contexts y contrato cruzado

La superficie pertenece al contexto operativo **Agent Harness y Code Intelligence**. No transfiere ownership ni consume datos de los bounded contexts docentes; por ello no requiere contrato cruzado. Sus consumidores son comandos locales y el doctor, que conservan sus contratos de salida y recuperación.

## Goals / Non-Goals

**Goals:**

- Hacer determinista la raíz de trabajo de la invocación Windows de GitNexus.
- Tratar una firma semántica de repositorio ausente como fallo aunque el proceso hijo devuelva cero.
- Preservar la detección FTS, los argumentos aprobados, la configuración OpenSSL y el rol del doctor como consumidor read-only.
- Dejar pruebas aisladas que cubran la ruta Windows y la clasificación semántica.

**Non-Goals:**

- Reindexar, reparar FTS, actualizar GitNexus o cambiar la prioridad GitNexus/CodeGraph.
- Cambiar las comprobaciones Expo, incluidos los hallazgos de #75.
- Crear contratos de datos, rutas HTTP, migraciones, UI o validación visual.

## Decisions

### 1. La raíz verificada se conserva al invocar npx sin una shell intermedia

El wrapper resolverá la raíz del checkout con Git y ejecutará el CLI de npx mediante el binario Node instalado, con ese `cwd` explícito. Esto evita la capa PowerShell/`.ps1` que no conservaba de forma fiable el directorio, sin introducir una shell implícita ni interpolación de argumentos.

**Alternativas consideradas:** conservar PowerShell con `Set-Location` sigue reproduciendo el falso negativo desde Node; usar una shell implícita amplía el riesgo de quoting; reindexar oculta el problema y no corrige la raíz.

### 2. El diagnóstico diferencia éxito de proceso y éxito semántico

`diagnose` conservará la detección actual de degradación FTS y agregará una firma explícita para `Not a git repository`. Una de esas firmas hará fallar el diagnóstico con una recuperación accionable, incluso cuando el proceso tenga código cero.

**Alternativas consideradas:** dejar la interpretación solo al doctor permite que otros consumidores de `gitnexus:diagnose` reciban un falso verde; tratar cualquier texto de advertencia como fallo haría frágil la integración y ocultaría un índice stale informativo.

### 3. El doctor conserva su contrato; las pruebas demuestran la integración

No se cambia `harnessDoctor.mjs` salvo que el apply demuestre que su contrato requiere ajuste. Su prueba ya afirma que una firma semántica inyectada produce FAIL; el change añadirá o ajustará cobertura del wrapper para demostrar que un checkout válido no emite la firma por error.

**Alternativas consideradas:** convertir el resultado en PASS dentro del doctor sería incorrecto: eliminaría la evidencia de un diagnóstico inválido sin resolver su causa.

### 4. La reparación de índice permanece separada

La corrección no invoca `gitnexus:repair`, `analyze` ni reindexados. `Status: stale` sigue siendo una señal de frescura real y no se confunde con `Not a git repository`.

## Risks / Trade-offs

- [Quoting de rutas de Windows] → La tarea de implementación cubre explícitamente una raíz con espacios y conserva el escape PowerShell de argumentos fijos.
- [Firma de error incompleta] → Se limita inicialmente a la evidencia reproducida y a las firmas FTS ya aprobadas; nuevas firmas requieren evidencia y tests.
- [Regresión en Linux/macOS] → La rama no-Windows queda intacta y las pruebas existentes de comportamiento semántico continúan ejecutándose.
- [Índice stale interpretado como éxito completo] → El proposal no redefine la política de frescura; solo elimina el falso repositorio ausente.

## Migration Plan

1. Implementar la resolución explícita de raíz y la clasificación semántica en el wrapper.
2. Ejecutar las pruebas focalizadas del wrapper y del doctor.
3. Ejecutar el diagnóstico y el doctor desde la raíz para registrar la evidencia posterior, distinguiendo cualquier deuda ajena.
4. Si aparece una regresión, revertir el commit del change; no hay datos, índice ni dependencias que migrar.

## Open Questions

No hay decisiones de producto, datos o permisos pendientes. Durante apply se confirmará la forma mínima que permite probar la raíz Windows sin cambiar los contratos públicos del script.
