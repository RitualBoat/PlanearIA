# Referencias Open Source Curadas - PlanearIA

> Proposito: esta carpeta guarda referencias externas seleccionadas para inspirar la arquitectura de PlanearIA sin mezclar stacks ni copiar codigo incompatible.
>
> Regla de oro: PlanearIA usa React Native + Expo + TypeScript + backend Node/monolito modular + MongoDB/almacenamiento local. Toda referencia externa debe traducirse a este stack. No copiar/pegar codigo sin revisar licencia, alcance y compatibilidad.

---

## Opinion Estrategica

La idea de usar repos open source como contexto es excelente si se hace con curaduria. Sirve para acelerar decisiones de producto y arquitectura, especialmente en Classroom, Canva/Genially e IA visual. Pero tambien puede destruir el proyecto si una IA futura intenta mezclar Vue, Svelte, Django, Tauri, Supabase, AGPL y stacks sin licencia dentro de PlanearIA.

Mi decision despues de auditar los repos:

- Usar codigo fuente extraido solo de repos con licencia permisiva clara y valor directo.
- Para repos AGPL/GPL/custom/no-license, guardar solo mapas, notas, README/licencia y rutas importantes.
- Tratar cada repo como inspiracion de dominio, no como dependencia ni plantilla copiable.
- Mantener esta carpeta pequena y legible para agentes futuros.

---

## Reglas Para Agentes IA

- No copiar codigo fuente de carpetas marcadas como `AGPL`, `GPL`, `custom license` o `sin LICENSE`.
- No cambiar el stack de PlanearIA para parecerse a un repo de referencia.
- No agregar dependencias nuevas solo porque aparecen en estas referencias.
- Si se usa una idea, documentar como se traduce a MVVM, offline-first y monolito modular.
- Antes de planear un modulo, leer primero el `FUENTE.md` de cada subcarpeta relevante.
- Para planes futuros, citar estas referencias como inspiracion conceptual, no como codigo base.

---

## Subcarpetas Creadas

| Carpeta | Repo | Licencia/Riesgo | Uso recomendado |
| --- | --- | --- | --- |
| `classroomio-classroom/` | `classroomio/classroomio` | AGPL-3.0 | Mapa de dominio LMS: cursos, grupos, ejercicios, entregas, asistencia, calificaciones, assets e IA. No copiar codigo. |
| `kalvi-classroom/` | `kalvilabs/kalvi` | AGPL-3.0 | Vision robusta tipo edtech: gamificacion, assessments, comunidad, admin y clases. No copiar codigo. |
| `yft-canva/` | `dromara/yft-design` | MIT | Referencia tecnica principal para modulo Canva/Genially: canvas, capas, export, shortcuts, snapshots, plantillas. Codigo curado permitido como referencia. |
| `loomic-ia/` | `fancyboi999/Loomic` | Sin LICENSE detectado | Inspiracion conceptual para agente IA visual/canvas, tools, streaming y persistencia. No copiar codigo. |
| `jaaz-ai-local/` | `11cafe/jaaz` | Custom dual/community restrictiva | Inspiracion para IA local-first, proveedores, confirmacion de herramientas y canvas multimodal. No copiar codigo. |
| `rishah-canvas/` | `devjaw/Rishah` | Apache-2.0 | UX minimalista/offline tipo whiteboard. Codigo curado permitido como referencia. |
| `edrys-classroom-extra/` | `edrys-org/edrys` | MPL-2.0 | Ideas futuras para clases remotas, roles docente/alumno y modulos. No usar en alcance inmediato. |
| `webdesk-legacy-classroom/` | `abhidevs/webdesk` | Sin LICENSE detectado | Referencia historica simple: materias, tareas, materiales, dudas, horarios y videollamada. No copiar codigo. |
| `openwordwriter-word/` | `openwordwriter/openwordwriter` | GPL-2.0 | Solo referencia conceptual de procesador de texto. Para PlanearIA seguir con Tentap/TipTap. No copiar codigo. |

---

## Ajuste a la Sugerencia de Gemini 3.1 Pro

La propuesta original de Gemini era util, pero habia que endurecerla por licencias y alcance:

- `kalvi` y `classroomio` si son muy valiosos para Classroom, pero ambos son AGPL. No conviene descargar controladores/modelos como codigo de trabajo. Se dejan mapas de rutas y documentacion para extraer ideas.
- `yft-design` es la referencia mas accionable para el futuro modulo Canva porque es MIT y sus piezas de canvas/export/estado son claras.
- `Loomic` es excelente para entender IA visual, pero al no tener LICENSE en la raiz se conserva solo como mapa conceptual.
- `Jaaz` es poderoso para IA local y privacidad, pero su licencia custom no es buena para copiar codigo.
- `Rishah` si puede aportar codigo de referencia por Apache-2.0, sobre todo para UX minimalista y configuracion offline.
- `openwordwriter` se mantiene descartado para codigo por GPL-2.0 y por stack C++/AbiWord.
- `edrys` y `webdesk` quedan como referencias de alcance futuro/legacy, no como base inmediata.

---

## Que Leer Segun Modulo

### Planeaciones / Word

Leer:

- `openwordwriter-word/FUENTE.md`
- `openwordwriter-word/ARCHITECTURE_PATHS.md`

Uso: solo recordar patrones de procesador de texto tradicional. No copiar codigo. PlanearIA debe seguir con editor propio basado en Tentap/TipTap.

### Classroom / Grupos / Alumnos / Tareas / Calificaciones

Leer:

- `classroomio-classroom/FUENTE.md`
- `classroomio-classroom/ARCHITECTURE_PATHS.md`
- `kalvi-classroom/FUENTE.md`
- `kalvi-classroom/ARCHITECTURE_PATHS.md`
- `webdesk-legacy-classroom/ARCHITECTURE_PATHS.md` solo si se necesita una version simple.

Uso: modelar entidades y flujos: curso, grupo, unidad, leccion, actividad, entrega, calificacion, asistencia, invitacion, assets, comunidad.

### Canva / Diseno Didactico

Leer:

- `yft-canva/FUENTE.md`
- `yft-canva/ARCHITECTURE_PATHS.md`
- `yft-canva/source/src/store/`
- `yft-canva/source/src/hooks/`
- `yft-canva/source/src/components/FileExport/`
- `rishah-canvas/FUENTE.md`
- `rishah-canvas/source/src/`

Uso: disenar un editor visual propio con paginas, capas, guias, zoom, snapshots, exportacion y comandos.

### IA Visual / Copiloto Creativo

Leer:

- `loomic-ia/ARCHITECTURE_PATHS.md`
- `jaaz-ai-local/ARCHITECTURE_PATHS.md`

Uso: inspirar herramientas IA con contexto visual, no copiar implementacion.

### Funciones Remotas / Extras Futuras

Leer solo si el producto ya tiene Classroom estable:

- `edrys-classroom-extra/ARCHITECTURE_PATHS.md`

Uso: ideas futuras para sesiones remotas, modulos vivos y roles docente/alumno.

---

## Politica de Actualizacion

Cuando se agregue un nuevo repo:

1. Revisar licencia antes de extraer codigo.
2. Crear subcarpeta con `FUENTE.md`.
3. Guardar `LICENSE` si existe.
4. Extraer codigo solo si la licencia es permisiva y el archivo aporta valor directo.
5. Para repos con licencia restrictiva o sin licencia, guardar solo `ARCHITECTURE_PATHS.md` y notas propias.
6. No guardar assets pesados, builds, lockfiles gigantes, node_modules, dist ni imagenes innecesarias.
7. Registrar en este README para que futuros agentes sepan como usarlo.
