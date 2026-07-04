# IHC Discovery Docente - PlanearIA

> **Proposito:** paquete de Interaccion Humano-Computadora para el `Plan Maestro: UX/UI y Navegacion Global`.
> Contiene las proto-personas, mapas de empatia, recorridos de usuario, el guion de entrevistas listo para
> aplicar con docentes reales y el checklist heuristico que se usa como gate en el flujo SDD.
> **Origen:** auditoria UX/UI de 2026-07 (sesion de discovery con Claude). Las decisiones de vision citadas
> aqui estan reflejadas en `VISION_ACTUAL.md` y en `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
> **Estado de los datos:** las proto-personas y los recorridos son SUPUESTOS razonables, no datos de campo.
> Su funcion es forzar decisiones consistentes hasta que las entrevistas reales los confirmen o corrijan.

---

## 1. Metodologia

El pipeline IHC de PlanearIA reutiliza el proceso del ejemplo academico del desarrollador
(`Documentacion/Ejemplo materia IHC/`, app de comida en cine) pero descarta todo su contenido de dominio:

- **Se reutiliza como plantilla/proceso:** borrador de entrevista -> transcripcion -> sintesis;
  formato de mapa de empatia; formato de personas; formato de historias de usuario; formato de mapa
  de recorrido; cierre de discovery con un prototipo navegable barato (alla HTML, aqui frames de Figma).
- **Se descarta como evidencia:** personas, motivaciones y journeys del dominio cine/comida.
  Nada de eso transfiere al dominio docente.

Calendario de entregables IHC dentro del plan UX/UI (por olas del backlog):

| Entregable | Cuando | Alimenta a |
| --- | --- | --- |
| Proto-personas + mapas de empatia (este doc) | Ya (antes de Ola 0) | Todos los changes de UI |
| Recorridos de usuario (este doc) | Durante Ola 1 | Prototipos Figma de Ola 2 |
| Entrevistas con docentes reales (guion en seccion 5) | Con prototipo en mano, antes de cerrar Ola 2 | Correccion de rumbo del backlog de Ola 3+ |
| Historias de usuario | Continuo, una por change, via `/enrich-us` | Cada change OpenSpec |
| Checklist Nielsen + severidad (seccion 6) | Por change de UI, en validacion visual y `/adversarial-review` | Gate pre-archive |

Regla de oro: las entrevistas se hacen **con prototipo enfrente** (frames de Figma de Escritorio + flujo Crear).
Entrevistar sin nada que mostrar produce respuestas abstractas de poco valor; construir todo sin validar es caro.
3-5 docentes bastan para detectar la mayoria de los problemas de usabilidad (regla de ~5 usuarios de Nielsen).

---

## 2. Proto-Personas

> SUPUESTOS marcados. Cada persona se valida o corrige con las entrevistas de la seccion 5.

### Persona 1: Maria — Docente de secundaria publica, multigrupo

- **Edad/contexto:** 38 anos. Secundaria publica en zona semiurbana. 5 grupos, ~40 alumnos por grupo.
- **Tecnologia:** Android gama media (4 anos de uso), laptop compartida en casa, datos moviles limitados,
  internet inestable en el plantel.
- **Herramientas actuales:** Word en la laptop, WhatsApp para todo (colegas, padres, envio de documentos
  a si misma), listas de asistencia en papel que pasa a Excel el fin de semana.
- **Frustracion central:** captura duplicada. Escribe la planeacion en Word, la asistencia en papel,
  las calificaciones en Excel y los avisos en WhatsApp. Nada se conecta.
- **Meta:** recuperar horas del fin de semana.
- **Relacion con IA:** curiosidad con desconfianza; ha oido de ChatGPT pero no lo usa por no saber empezar.
- **Riesgo de diseno:** si PlanearIA le pide aprender conceptos nuevos ("entidades", "recursos", "hubs"),
  la pierde. Todo debe hablar su idioma: clase, lista, examen, planeacion.

### Persona 2: Luis — Docente de primaria, early adopter de IA

- **Edad/contexto:** 29 anos. Primaria privada pequena. 1 grupo propio + talleres.
- **Tecnologia:** Android reciente, laptop propia, internet razonable en casa y escuela.
- **Herramientas actuales:** ChatGPT gratuito para redactar actividades y examenes, Canva para material
  visual, Google Docs, Classroom de Google a medias porque la escuela no lo exige.
- **Frustracion central:** el pegamento manual. Genera algo en ChatGPT, lo copia a Docs, lo formatea,
  lo descarga, lo sube a otro lado, lo imprime. Cada herramienta es buena; el flujo entre ellas es el dolor.
- **Meta:** que el resultado de la IA caiga directo donde lo necesita (su clase, su documento, su material).
- **Relacion con IA:** alta confianza, poca verificacion — a veces entrega material con errores de la IA.
- **Riesgo de diseno:** es el usuario que mas rapido adoptara AsistePLAN, pero tambien el que mas
  necesita los flujos de revision/confirmacion para no publicar contenido IA sin leerlo.

### Persona 3: Carmen — Docente proxima a jubilarse, flujo Office clasico

- **Edad/contexto:** 57 anos. Preparatoria publica. 30 anos de servicio. 3 grupos.
- **Tecnologia:** laptop vieja con Word/Excel de escritorio, telefono Android que usa principalmente
  para WhatsApp. Imprime casi todo.
- **Herramientas actuales:** Word y Excel con plantillas propias que ha perfeccionado por anos.
  Carpetas del explorador organizadas a su manera (y aun asi pierde archivos).
- **Frustracion central:** que la obliguen a cambiar de metodo. Las plataformas educativas que la
  escuela ha impuesto le parecen complicadas y "para jovenes".
- **Meta:** cumplir con lo administrativo sin pelearse con la tecnologia.
- **Relacion con IA:** escepticismo alto; no quiere que "una maquina" escriba por ella.
- **Riesgo de diseno:** es la prueba acida de "familiaridad antes que novedad". Si NotasPLAN no se
  siente como Word en los primeros 30 segundos, Carmen no vuelve. La IA debe ser 100% opcional
  e invisible si ella la ignora.

---

## 3. Mapas de Empatia (light)

### Maria

| Dimension | Contenido |
| --- | --- |
| Piensa | "No me alcanza el tiempo; el papeleo me come los domingos." |
| Siente | Culpa por restarle tiempo a la familia; miedo a perder una lista o calificacion. |
| Hace | Copia datos entre papel, Word, Excel y WhatsApp; se manda archivos a si misma. |
| Teme | Perder trabajo por un fallo de telefono/internet; que la direccion le pida algo que no encuentra. |
| Ganancia esperada | Un solo lugar, que funcione sin internet, que no la haga sentir torpe. |

### Luis

| Dimension | Contenido |
| --- | --- |
| Piensa | "La IA me ahorra horas, pero armar el rompecabezas entre apps me las quita de vuelta." |
| Siente | Entusiasmo por herramientas nuevas; frustracion por la friccion entre ellas. |
| Hace | Prompt en ChatGPT -> copiar -> formatear -> descargar -> subir -> imprimir/compartir. |
| Teme | Que un material con error de IA llegue a alumnos o padres; perder su historial de prompts. |
| Ganancia esperada | IA nativa con contexto de SUS clases y salida directa a documento/tarea/material. |

### Carmen

| Dimension | Contenido |
| --- | --- |
| Piensa | "Mis plantillas de Word funcionan; no necesito otra plataforma rara." |
| Siente | Fatiga por cada nueva imposicion tecnologica; orgullo por su metodo propio. |
| Hace | Todo en Word/Excel de escritorio, imprime, archiva en carpetas fisicas y digitales. |
| Teme | Verse lenta o incompetente frente a colegas jovenes; que la plataforma le pierda archivos. |
| Ganancia esperada | Que todo se parezca a lo que ya domina y que pueda importar SUS plantillas tal cual. |

---

## 4. Recorridos de Usuario (estado actual, con dolores)

> Describen el flujo HOY (sin PlanearIA o con la version actual), para que los prototipos de la Ola 2
> ataquen dolores concretos y no imaginarios. Formato: etapas -> acciones -> dolor -> oportunidad.

### Recorrido 1: "Lunes 7am — preparar el dia" (Maria)

| Etapa | Accion actual | Dolor | Oportunidad PlanearIA |
| --- | --- | --- | --- |
| Despertar/traslado | Repasa mentalmente que grupos tiene y que toca | Carga cognitiva pura memoria | Escritorio: "que sigue hoy" al abrir |
| Llegada al plantel | Busca la planeacion en carpetas/WhatsApp enviado a si misma | Archivo perdido, version equivocada | Documentos recientes + busqueda |
| Antes de clase | Imprime o improvisa lista de asistencia | Papel + recaptura posterior | Asistencia contextual en la clase |
| Entre clases | Anota pendientes en libreta/celular | Se pierden o duplican | Pendientes accionables en Escritorio |
| Salida | Se lleva papeleo a casa | El domingo se dedica a recapturar | Sync: todo quedo capturado en el momento |

### Recorrido 2: "Crear una planeacion y asignarla a 2A" (Luis)

| Etapa | Accion actual | Dolor | Oportunidad PlanearIA |
| --- | --- | --- | --- |
| Idea | Pide borrador a ChatGPT | Sin contexto de su clase real | AsistePLAN con contexto de clase/unidad |
| Redaccion | Copia a Docs y formatea | Formato se rompe, tiempo perdido | NotasPLAN: borrador IA cae como documento editable |
| Material | Crea apoyo visual en Canva | Otra app, otra cuenta, otra descarga | DiseñaPLAN conectado |
| Entrega a alumnos | Descarga PDF, sube a Classroom o manda por WhatsApp | 3-4 pasos manuales por material | "Asignar a clase" en un toque desde el documento |
| Seguimiento | Revisa entregas en otra plataforma | Contexto partido | Clases: entregas junto al material |

### Recorrido 3: "Pasar calificaciones de papel a la app" (Carmen)

| Etapa | Accion actual | Dolor | Oportunidad PlanearIA |
| --- | --- | --- | --- |
| Captura en aula | Anota calificaciones en su lista impresa | Ninguno: el papel le funciona | No pelear contra el papel: aceptar foto/import |
| Recaptura | Teclea todo en su Excel de plantilla propia | Doble trabajo, errores de dedo | CalcuPLAN: importar SU Excel tal cual |
| Calculo | Sus formulas de siempre | Miedo a que otra app no calcule igual | Hoja editable con formulas visibles, no magia |
| Entrega administrativa | Imprime o envia el Excel | Formatos que la escuela cambia cada ciclo | Export a los formatos pedidos |
| Resguardo | Carpetas propias | Perdida ocasional | Todo queda en su cuenta, buscable |

---

## 5. Guion de Entrevistas con Docentes Reales

> **Listo para aplicar.** Objetivo: validar la vision "cero friccion", el Escritorio Docente,
> el flujo Crear tipo-primero y los limites de la IA silenciosa. Aplicar cuando exista el prototipo
> de Escritorio + Crear (Figma), idealmente antes de cerrar la Ola 2 del plan UX/UI.

### 5.1 Logistica

- **Muestra objetivo:** 3-5 docentes. Buscar variedad: al menos 1 de escuela publica con mala
  conectividad, 1 que ya use IA, 1 de perfil tradicional (tipo Carmen). Evitar entrevistar solo
  a conocidos jovenes y tecnologicos: sesga todo.
- **Duracion:** 20-30 minutos. Presencial o videollamada.
- **Material:** prototipo navegable (Figma) del Escritorio y del flujo Crear en un telefono o tablet.
- **Registro:** notas escritas siempre; audio SOLO con permiso explicito. Sin nombres reales en las
  notas compartidas con IA (usar P1, P2, P3...). No fotografiar listas o documentos con datos de alumnos.
- **Encuadre al iniciar (leer tal cual):** "Estoy construyendo una app para docentes y necesito
  entender como trabajas HOY. No hay respuestas correctas; si algo de lo que te muestre te parece
  confuso o inutil, decirlo me ayuda mas que ser amable."

### 5.2 Bloque A — Flujo real de trabajo (sin mostrar nada, ~8 min)

1. Cuentame como preparaste tu ultima semana de clases. Que herramientas abriste y en que orden?
   - *Repregunta:* en que momento del dia/semana lo haces? En que dispositivo?
2. Donde guardas tus planeaciones, examenes y listas? Te ha pasado que no encuentras uno? Que hiciste?
   - *Repregunta:* cuantas versiones del mismo documento sueles tener?
3. Usas ChatGPT, Gemini u otra IA para tu trabajo? Para que exactamente y que haces con el resultado?
   - *Si no usa IA:* hay algo que hayas oido de la IA que te gustaria o que te de desconfianza?
4. Que tan seguido te falla el internet donde trabajas? Que haces cuando falla?
5. Que es lo que mas tiempo te roba a la semana que NO sea ensenar?

### 5.3 Bloque B — Prueba de reconocimiento con prototipo (~12 min)

> Mostrar el prototipo SIN explicar nada. Observar y anotar donde duda.

6. *(Mostrando el Escritorio)* Sin que yo explique nada: que crees que puedes hacer aqui?
   Que tocarias primero?
   - *Exito esperado:* identifica el dock de herramientas y "que sigue hoy" sin ayuda.
7. *(Tarea concreta)* Quieres hacer un examen para tu grupo de 3B. Que tocarias?
   - *Exito esperado:* llega a "Crear" -> elige "Documento" sin frustracion. Anotar si busca
     un boton que diga literalmente "examen".
8. *(Mostrando el chip de IA silenciosa "Estas creando una planeacion?")* La app detecto que tu
   documento parece una planeacion y te ofrece ayuda. Que te parece? La aceptarias o la cerrarias?
9. Si la app detectara que esta planeacion corresponde a Matematicas 2A y te ofreciera asignarla
   a esa clase, que te pareceria? Y si lo hiciera SOLA, sin preguntarte?
   - *Objetivo:* validar el limite confirmacion-siempre de la IA.
10. *(Mostrando el chip de sync/offline)* Que crees que significa esto? Te da confianza o te da igual?

### 5.4 Bloque C — Cierre (~5 min)

11. De todo lo que viste, que usarias manana mismo? Que no usarias nunca?
12. Si esta app existiera hoy, que tendria que tener SI o SI para que dejaras tu metodo actual?
13. Hay algo que te preocuparia de meter datos de tus alumnos en una app asi?

### 5.5 Plantilla de sintesis (llenar despues de cada entrevista)

```markdown
## Entrevista P<N> — <fecha>
- Perfil: [publica/privada, nivel, anos de servicio, dispositivo, conectividad]
- Persona mas cercana: [Maria | Luis | Carmen | ninguna -> describir]
- Flujo actual resumido: ...
- Dolores confirmados: ...
- Dolores NO confirmados (supuestos nuestros que no aparecieron): ...
- Reaccion al Escritorio: [reconocio / dudo en ...]
- Reaccion a Crear tipo-primero: [busco boton de tarea escolar? si/no]
- Reaccion a IA silenciosa: [acepta / rechaza / condiciones]
- Limite de confianza IA: [que NO quiere que haga sola]
- Frase textual mas valiosa: "..."
- Impacto en backlog: [que change se refuerza/cambia/cae de prioridad]
```

Al terminar las 3-5 entrevistas: actualizar las proto-personas de este documento (marcar que se
confirmo y que se corrigio) y registrar los impactos en el backlog del plan UX/UI.

---

## 6. Checklist Heuristico Nielsen + Severidad (gate del flujo SDD)

Se aplica en dos momentos de cada change de UI: en la tarea final de validacion visual
(capturas por breakpoint) y dentro de `/adversarial-review` antes de `/opsx:archive`.

### 6.1 Checklist (una pregunta por heuristica, adaptada a PlanearIA)

| # | Heuristica | Pregunta PlanearIA |
| --- | --- | --- |
| 1 | Visibilidad del estado | Se ve el estado de sync/guardado/IA sin buscarlo? |
| 2 | Sistema y mundo real | Los nombres hablan docente (clase, examen, planeacion) y no jerga tecnica? |
| 3 | Control y libertad | Toda accion IA/destructiva se puede cancelar, deshacer o descartar? |
| 4 | Consistencia | Usa los componentes base y tokens, o invento estilos propios? |
| 5 | Prevencion de errores | Hay confirmacion antes de sobrescribir/borrar/asignar? Offline no rompe nada? |
| 6 | Reconocer antes que recordar | El docente reconoce el patron (Word/Classroom/ChatGPT) sin tutorial? |
| 7 | Flexibilidad y eficiencia | Lo frecuente esta a 1 toque y lo raro no estorba? |
| 8 | Diseno minimalista | Hay algo en pantalla que no ayude a la tarea actual? |
| 9 | Recuperacion de errores | Los errores dicen que paso y que hacer, en espanol docente? |
| 10 | Ayuda y documentacion | El empty state ensena el siguiente paso? |

### 6.2 Severidad y efecto en el veredicto del adversarial-review

| Sev. | Significado | Efecto |
| --- | --- | --- |
| 0 | No es problema | Se ignora |
| 1 | Cosmetico | Nota; no bloquea |
| 2 | Menor | Minor; PASS CON HUECOS permitido |
| 3 | Mayor (frustra la tarea) | Major; corregir antes de archivar salvo justificacion escrita |
| 4 | Catastrofico (perdida de trabajo/datos, bloqueo total) | Blocker; FAIL, no se archiva |

---

## 7. Version

- Creado: 2026-07-04, a partir de la auditoria UX/UI (Bloque 4).
- Pendiente: sintesis de entrevistas reales (seccion 5.5) cuando se apliquen.
