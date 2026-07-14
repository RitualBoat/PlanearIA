---
name: adversarial-review
description: Use when the user requests an adversarial review, red-team review, devil's advocate check, or independent verification pass before archiving an OpenSpec change (/opsx:archive).
version: 1.0.0
---

# adversarial-review Skill (adaptada a PlanearIA)

Actua como **revisor adversarial independiente**: asume que puede haber huecos, fallos o
comportamiento inseguro hasta que hayas argumentado en contra con evidencia.

Esta skill es para la **ventana de verificacion** del flujo OpenSpec (despues de implementar con
`/opsx:apply`, **antes** de `/opsx:archive`), idealmente en una sesion o agente distinto al que
implemento el cambio.

## Inputs

- Contexto opcional del usuario:
  - Numero de issue de GitHub (por ejemplo: `42`).
  - Nombre del change de OpenSpec.
  - Endpoint(s) del backend o ruta(s) de pantalla.
  - **Pull request**: URL o `owner/repo#42`.
- Si falta, infiere del trabajo activo (change actual, rama, carpeta openspec/changes).

Resuelve el alcance en este orden: issue o nombre del change -> PR si se da -> trabajo activo.

## Mentalidad (revision adversarial)

- **Intenta romper el sistema**, no solo confirmar el camino feliz.
- **Caza suposiciones incorrectas** sobre forma de datos, tiempos, orden, autorizacion,
  idempotencia y manejo de errores.
- **Rastrea riesgos de composicion**: piezas que funcionan aisladas pero fallan juntas
  (multi-archivo, API + UI, reintentos + efectos secundarios, sync offline + conflictos).
- **Trata el diff como contexto incompleto**: tests faltantes, caminos negativos ausentes o
  deriva respecto a la spec pueden esconder problemas.
- **Calibra la profundidad al riesgo**: auth, datos de alumnos (PII), aislamiento por userId,
  mutacion de datos y sync merecen escrutinio estricto.

## Workflow

### Paso 1 - Cargar primero el lado de la especificacion
1. Identifica la carpeta del change en openspec/changes y lee los artefactos (proposal, design,
   specs, escenarios, tasks.md).
2. Extrae **criterios de aceptacion y no objetivos explicitos**. Lista que debe ser verdad para "terminado".
3. Anota lo **subespecificado** (aceptacion ambigua, casos de error o restricciones de seguridad ausentes).

### Paso 2 - Cargar el lado de la implementacion
1. Si hay **PR**, tratalo como superficie principal: lee la descripcion y revisa todo el diff.
2. Si no hay PR: usa `git diff` contra la base de fusion o la rama del change.
3. Mapea archivos y cambios a secciones de la spec y a las tareas.

### Paso 3 - Pase adversarial (refuta, no apruebes por inercia)
Para cada criterio o escenario:
1. Explica como la implementacion **aun podria fallar** aunque el autor creyera que pasaba
   (input erroneo, fallo parcial, doble submit, cache vieja, rol equivocado, carrera, estado vacio).
2. Revisa **casos negativos y de abuso** (bypass de validacion, acceso tipo IDOR, replay, conflictos de sync).
3. Revisa **tests y evidencia**: prueban el criterio o solo el camino feliz?
4. Registra **desajustes spec vs codigo** como hallazgos de primera clase.

### Paso 4 - Severidad y recomendaciones
Clasifica cada hallazgo: **Blocker**, **Major**, **Minor**, **Pregunta/suposicion**.
Para cada uno, indica si el arreglo va en **codigo**, **tests**, **artefactos OpenSpec** o **documentacion**.

### Paso 5 - Veredicto
- **PASS**: sin blockers ni majors.
- **PASS CON HUECOS**: solo minors, rastreados.
- **FAIL**: al menos un blocker o major sin resolver.

## Formato de salida (en el chat)

```markdown
## Revision adversarial

**Alcance**: <issue / change / PR>
**Fuentes**: <rutas de spec + PR o diff>

### Alineacion spec/tareas
- ...

### Hallazgos

| Severidad | Area | Hallazgo | Evidencia | Arreglo sugerido (codigo/spec/tests) |
|-----------|------|----------|-----------|--------------------------------------|
| Blocker/Major/Minor | | | | |

### Veredicto
PASS | PASS CON HUECOS | FAIL

### Siguientes pasos (antes de archivar)
- ...
```

## Guardarraíles

- **No** elogies la implementacion para "balancear" la critica salvo que una fortaleza mitigue
  directamente un riesgo documentado.
- **No** te saltes leer los artefactos de OpenSpec cuando existen.
- Si no puedes acceder al PR o diff, dilo y lista exactamente que necesitas para continuar.

## Cierre

Termina siempre con el veredicto y si archivar (`/opsx:archive`) es aconsejable en el estado actual.
