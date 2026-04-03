# Stitch Prompt — Flujo "Publicar Examen como Reto" (Tarea 2.5.1)

Diseña el **flujo completo de creación, publicación y resolución de un "Examen como Reto"** dentro de una app educativa para docentes mexicanos. Este flujo permite que un docente cree un examen tipo quiz y lo publique en el feed social como un "Reto" que otros docentes pueden contestar. Necesito **múltiples pantallas/vistas** que cubran todos los pasos y estados. El diseño debe verse en **2 breakpoints**: teléfono (390px) y desktop/web (1280px).

---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 1 DE 4 — Formulario Reto + Editor Preguntas
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Flujo de **creación y resolución de "Examen como Reto"** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 1: Formulario de Creación del Reto (dentro del modal de publicación)

Esta sección aparece dentro del modal "Crear Publicación" cuando el docente toca el ícono de trofeo/reto (🏆) en la barra de herramientas inferior. Se expande un bloque especial debajo del contenido del post.

### Layout por breakpoint

**Teléfono (390px):**

- El formulario de reto aparece como una sección expandible debajo del textarea de contenido, con fondo azul muy tenue (primary 5% opacity) y borde izquierdo de 3px en azul primario
- Encabezado de sección: ícono 🏆 + "Publicar como Reto" en bold azul + toggle switch a la derecha para activar/desactivar
- Cuando está activo, se despliegan los campos de forma vertical apilada
- Los campos ocupan el ancho completo menos padding de 16px

**Desktop/Web (1280px):**

- Los campos de "Tiempo límite" y "Número de preguntas" van en fila horizontal (50/50), borderRadius 12px, padding 20px
- La preview del reto (cómo se verá en el feed) aparece como mini-card a la derecha dentro del modal

### Campos del formulario de reto

1. **Título del reto** (obligatorio):
   - Input con placeholder "Ej: Reto de Historia: Revolución Mexicana"
   - Icono de trofeo a la izquierda
   - Max 100 caracteres, contador visible
   - Borde redondeado (10px), padding 12px, fondo surfaceContainerLow

2. **Descripción del reto** (opcional):
   - Textarea con placeholder "Describe brevemente el reto. Si lo dejas vacío, se usará el contenido de tu publicación."
   - 2-3 líneas visibles, max 500 caracteres
   - Mismo estilo visual que el título

3. **Materia / Asignatura** (opcional):
   - Dropdown/selector con opciones predefinidas: Matemáticas, Español, Historia, Ciencias Naturales, Geografía, Formación Cívica, Educación Artística, Educación Física, Inglés, Otra
   - Chip selector horizontal scrollable en mobile, dropdown en desktop
   - Icono 📚 a la izquierda

4. **Nivel educativo** (opcional):
   - Chips seleccionables en fila: Preescolar, Primaria, Secundaria, Preparatoria, Todos
   - Solo uno seleccionable
   - Icono 🎓 a la izquierda

5. **Tiempo límite** (opcional):
   - Input numérico con placeholder "Min"
   - Sufijo "minutos" a la derecha
   - Icono ⏱️ a la izquierda
   - Rango sugerido: 5-60 minutos
   - Si no se pone, el reto no tiene límite de tiempo

6. **Número de preguntas** (informativo):
   - Input numérico con placeholder "Ej: 10"
   - Icono ❓ a la izquierda
   - Se actualiza automáticamente cuando se añaden preguntas
   - Solo lectura si ya se crearon preguntas

7. **Botón "Crear preguntas"**:
   - Botón prominente con gradiente azul, ícono ➕ + "Añadir preguntas"
   - Abre la Pantalla 2 (Editor de preguntas)
   - Si ya hay preguntas creadas, muestra "✏️ Editar preguntas (X)" con contador

8. **Preview del reto**:
   - Mini-card que muestra cómo se verá el reto en el feed
   - Badge "RETO" en azul, título, descripción resumida, "⏱️ 15 min · ❓ 10 preguntas"
   - Botones simulados: "🏆 Contestar ahora" y "Guardar examen"


---

## PANTALLA 2: Editor de Preguntas

Pantalla completa que permite crear y editar las preguntas del reto/examen.

### Layout por breakpoint

**Teléfono (390px):**

- Header fijo: "← Volver" a la izquierda, "Preguntas (3/10)" al centro, "✓ Listo" a la derecha en azul
- Scroll vertical con cada pregunta en una card separada
- Barra inferior fija con botón "+ Añadir pregunta" ancho completo
- Cada card de pregunta ocupa el ancho completo con padding 16px

**Desktop/Web (1280px):**

- Panel izquierdo (70%): editor de preguntas scrollable
- Panel derecho (30%): lista miniatura de todas las preguntas como sidebar navegable (click para ir a esa pregunta, drag para reordenar)
- Botón "+ Añadir pregunta" en el panel izquierdo

### Componente QuestionCard (dentro del editor)

Cada pregunta se muestra como una card con:

1. **Header de la pregunta:**
   - Número de pregunta: "Pregunta 1" con badge circular azul
   - A la derecha: ícono de drag (⠿ para reordenar), ícono de duplicar (📋), ícono de eliminar (🗑️ rojo)
   - Selector de tipo: dropdown compacto con opciones:
     - Opción múltiple (default)
     - Verdadero/Falso
     - Respuesta corta
     - Selección múltiple (varias correctas)

2. **Campo de pregunta:**
   - Textarea: placeholder "Escribe la pregunta..."
   - Fondo blanco, borde sutil, borderRadius 10px
   - Max 500 caracteres

3. **Opciones de respuesta (para opción múltiple):**
   - 4 campos de input en fila vertical, cada uno con:
     - Radio button / checkbox a la izquierda (para marcar la correcta)
     - Input con placeholder "Opción A", "Opción B", etc.
     - Botón ✕ a la derecha para eliminar la opción
   - La opción marcada como correcta tiene fondo verde muy tenue y borde verde
   - Botón "+ Añadir opción" debajo (max 6 opciones)

4. **Para Verdadero/Falso:**
   - Solo 2 opciones fijas: "Verdadero" y "Falso"
   - Una de las dos marcada como correcta con highlight verde

5. **Para Respuesta corta:**
   - Input con placeholder "Respuesta correcta esperada"
   - Nota en gris: "Se evaluará coincidencia exacta"

6. **Explicación de la respuesta** (opcional, collapsable):
   - Toggle "Añadir explicación"
   - Textarea: "Explica por qué esta es la respuesta correcta..."
   - Se muestra al participante después de contestar

7. **Puntos por pregunta** (opcional):
   - Input numérico pequeño: default "1 punto"
   - A la derecha de la pregunta

### Datos de ejemplo (3 preguntas)

**Pregunta 1 — Opción múltiple:**

- "¿En qué año inició la Revolución Mexicana?"
- A) 1910 ✅ (marcada como correcta, fondo verde)
- B) 1917
- C) 1920
- D) 1905
- Explicación: "La Revolución Mexicana comenzó el 20 de noviembre de 1910 con el Plan de San Luis."

**Pregunta 2 — Verdadero/Falso:**

- "Venustiano Carranza promulgó la Constitución de 1917."
- Verdadero ✅
- Falso

**Pregunta 3 — Opción múltiple:**

- "¿Cuál de los siguientes personajes fue líder del Ejército Libertador del Sur?"
- A) Francisco Villa
- B) Emiliano Zapata ✅
- C) Álvaro Obregón
- D) Plutarco Elías Calles


### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## ESPECIFICACIONES DE DISEÑO

### Paleta de colores

| Token                  | Hex     | Uso                                      |
| ---------------------- | ------- | ---------------------------------------- |
| primary                | #005da8 | Headers, botones, links, badge RETO      |
| primaryContainer       | #0576d2 | Gradientes, hover states                 |
| surfaceContainerLowest | #FFFFFF | Fondo de cards                           |
| surfaceContainerLow    | #f1f4f8 | Fondo de inputs, chips no seleccionados  |
| surfaceContainer       | #ebeef2 | Separadores, fondos secundarios          |
| surfaceContainerHigh   | #e3e8ef | Skeleton shimmer, fondos terciarios      |
| onSurface              | #181c1f | Texto principal, títulos                 |
| onSurfaceVariant       | #43474e | Texto secundario, labels, placeholders   |
| outlineVariant         | #c0c7d4 | Bordes de inputs, separadores            |
| error                  | #BA1A1A | Badge rojo timer, respuestas incorrectas |
| success                | #2E7D32 | Respuestas correctas, badge completado   |
| warning                | #F57C00 | Timer últimos 5 min, badge expirado      |
| background             | #EEF3FA | Fondo general de la pantalla             |

### Tipografía

| Nivel               | Tamaño | Peso           | Color            |
| ------------------- | ------ | -------------- | ---------------- |
| Título pantalla     | 22px   | Bold (700)     | onSurface        |
| Título card/sección | 17px   | Bold (700)     | onSurface        |
| Pregunta            | 16px   | SemiBold (600) | onSurface        |
| Opción de respuesta | 15px   | Regular (400)  | onSurface        |
| Texto cuerpo        | 15px   | Regular (400)  | onSurface        |
| Labels/subtextos    | 13px   | Regular (400)  | onSurfaceVariant |
| Badges/chips        | 11px   | Bold (700)     | varies           |
| Timer               | 18px   | Bold (700)     | white on dark bg |
| Puntuación grande   | 48px   | Bold (700)     | primary          |

### Bordes, sombras y border-radius

| Componente            | Border-radius | Sombra                          | Borde                                               |
| --------------------- | ------------- | ------------------------------- | --------------------------------------------------- |
| Cards                 | 12px          | 0 12px 32px rgba(0,93,168,0.06) | none                                                |
| Inputs                | 10px          | none                            | 1px outlineVariant                                  |
| Botones primarios     | 24px          | none                            | none                                                |
| Chips/badges          | 16px          | none                            | 1px border cuando seleccionado                      |
| Opciones de respuesta | 10px          | none                            | 1px outlineVariant, 2px primary cuando seleccionada |
| Modal                 | 16px (top)    | overlay rgba(0,0,0,0.5)         | none                                                |
| Progress bar          | 6px           | none                            | none                                                |

### Espaciado por breakpoint

| Elemento                 | Mobile (390px) | Desktop (1280px) |
| ------------------------ | -------------- | ---------------- |
| Padding lateral pantalla | 16px           | 32px             |
| Gap entre cards          | 12px           | 20px             |
| Padding interno card     | 16px           | 24px             |
| Gap entre opciones       | 10px           | 12px             |
| Padding inputs           | 12px           | 14px             |

### Animaciones

- **Toggle reto on/off:** expand/collapse con spring animation (300ms)
- **Seleccionar opción:** scale(0.97) → scale(1) con ease-out (150ms) + cambio de color instantáneo
- **Timer pulsante:** fade in/out 1s loop cuando quedan <5 min
- **Resultado:** puntuación se anima de 0 hasta el valor final (counter animation, 1.5s, ease-out)
- **Barra de progreso:** fill animation de izquierda a derecha (800ms, ease-in-out)
- **Cards de preguntas:** fade-in escalonado al cargar (staggered, 100ms entre cada una)
- **Transición entre preguntas:** slide horizontal (250ms) al tocar Siguiente/Anterior
- **Skeleton shimmer:** gradiente linear de izquierda a derecha, loop 1.5s

### Íconos

Familia: Material Icons (`@expo/vector-icons/MaterialIcons`)

- military-tech → badge reto
- timer → temporizador
- quiz → preguntas
- check-circle → respuesta correcta
- cancel → respuesta incorrecta
- emoji-events → trofeo/resultado
- add-circle → añadir pregunta
- drag-indicator → reordenar
- content-copy → duplicar
- delete-outline → eliminar
- expand-more / expand-less → collapsable
- arrow-back / arrow-forward → navegación preguntas
- leaderboard → ranking
- share → compartir resultado

### Accesibilidad

- Contraste mínimo 4.5:1 en todo el texto
- Opciones de respuesta con área táctil mínima 48x48px
- Radio buttons/checkboxes visualmente distinguibles por forma Y color (no solo color)
- Timer con texto legible (mínimo 18px) y anunciado por screen readers
- Preguntas numeradas y con aria-label descriptivo
- Feedback de respuesta correcta/incorrecta con ícono (✅/❌) además del color

---

## RESTRICCIONES TÉCNICAS

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Íconos de la familia Material Icons
- El diseño debe funcionar en fondo claro y oscuro
- Imágenes/fotos son placeholders rectangulares grises con ícono centrado
- Datos de ejemplo deben ser realistas para docentes mexicanos
- El editor de preguntas debe funcionar completamente offline
- Las respuestas del reto se guardan localmente y se sincronizan cuando hay conexión


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 2 DE 4 — Resolución + Resultado
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Flujo de **creación y resolución de "Examen como Reto"** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 3: Resolución del Reto (vista del participante)

Pantalla que ve el docente que toca "🏆 Contestar ahora" en un reto del feed.

### Layout por breakpoint

**Teléfono (390px):**

- Header fijo con:
  - Título del reto truncado a 1 línea
  - Timer countdown a la derecha (si tiene tiempo límite): "⏱️ 12:34" en badge rojo/naranja
  - Barra de progreso debajo del header: "Pregunta 3 de 10" con barra de progreso verde
- Cada pregunta en scroll vertical, una a la vez (modo tarjeta)
- Footer fijo: botón "← Anterior" a la izquierda, "Siguiente →" a la derecha
- En la última pregunta: "Enviar respuestas" en verde prominente

**Desktop/Web (1280px):**

- Layout split: pregunta en el centro (60%), panel lateral derecho (30%) con:
  - Mapa de preguntas: grid de números (1-10) coloreados por estado (contestada=verde, actual=azul, pendiente=gris)
  - Timer grande
  - Botón "Enviar respuestas" siempre visible
- Click en número del mapa salta directamente a esa pregunta

### Estados de las opciones de respuesta

- **Sin seleccionar:** fondo blanco, borde gris claro
- **Hover (web):** fondo azul 5%, borde azul claro
- **Seleccionada:** fondo azul 10%, borde azul, radio button relleno azul
- Las opciones se tocan para seleccionar, se vuelven a tocar para deseleccionar

### Timer con alertas

- Timer normal: texto blanco sobre fondo gris oscuro
- Últimos 5 minutos: badge naranja pulsante
- Último minuto: badge rojo pulsante + vibración sutil
- Tiempo agotado: modal con "⏰ Tiempo agotado — Se enviarán tus respuestas automáticamente"


---

## PANTALLA 4: Resultado del Reto

Se muestra inmediatamente después de enviar las respuestas.

### Layout por breakpoint

**Teléfono (390px):**

- Header: "Resultado" + botón "✕ Cerrar" que vuelve al feed
- Card principal centrada con:
  - Icono grande (🏆 si aprobó, 📘 si no)
  - Puntuación grande: "8/10" en bold 48px
  - Porcentaje: "80% correcto"
  - Barra de progreso circular o semicircular con el porcentaje
  - Mensaje motivacional: "¡Excelente trabajo!" si ≥80%, "¡Buen intento!" si ≥60%, "¡Sigue practicando!" si <60%
  - Tiempo empleado: "⏱️ Completado en 8:23"
- Lista expandible de preguntas con respuestas:
  - ✅ Correctas: fondo verde tenue, muestra tu respuesta en verde
  - ❌ Incorrectas: fondo rojo tenue, muestra tu respuesta en rojo + la correcta en verde
  - Cada pregunta expandible para ver la explicación del autor

**Desktop/Web (1280px):**

- Layout de 2 columnas:
  - Izquierda (40%): card de resultado con puntuación, gráfica y mensaje
  - Derecha (60%): desglose pregunta por pregunta scrollable
- Sidebar con comparación: "Tu posición: #5 de 32 docentes que lo contestaron"

### Botones de acción post-resultado

- "Volver al feed" — botón principal azul
- "Guardar examen en mi biblioteca" — botón secundario outline
- "Compartir resultado" — botón terciario con ícono share
- "Reintentar" (si el autor lo permite) — botón outline naranja


### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## ESPECIFICACIONES DE DISEÑO

### Paleta de colores

| Token                  | Hex     | Uso                                      |
| ---------------------- | ------- | ---------------------------------------- |
| primary                | #005da8 | Headers, botones, links, badge RETO      |
| primaryContainer       | #0576d2 | Gradientes, hover states                 |
| surfaceContainerLowest | #FFFFFF | Fondo de cards                           |
| surfaceContainerLow    | #f1f4f8 | Fondo de inputs, chips no seleccionados  |
| surfaceContainer       | #ebeef2 | Separadores, fondos secundarios          |
| surfaceContainerHigh   | #e3e8ef | Skeleton shimmer, fondos terciarios      |
| onSurface              | #181c1f | Texto principal, títulos                 |
| onSurfaceVariant       | #43474e | Texto secundario, labels, placeholders   |
| outlineVariant         | #c0c7d4 | Bordes de inputs, separadores            |
| error                  | #BA1A1A | Badge rojo timer, respuestas incorrectas |
| success                | #2E7D32 | Respuestas correctas, badge completado   |
| warning                | #F57C00 | Timer últimos 5 min, badge expirado      |
| background             | #EEF3FA | Fondo general de la pantalla             |

### Tipografía

| Nivel               | Tamaño | Peso           | Color            |
| ------------------- | ------ | -------------- | ---------------- |
| Título pantalla     | 22px   | Bold (700)     | onSurface        |
| Título card/sección | 17px   | Bold (700)     | onSurface        |
| Pregunta            | 16px   | SemiBold (600) | onSurface        |
| Opción de respuesta | 15px   | Regular (400)  | onSurface        |
| Texto cuerpo        | 15px   | Regular (400)  | onSurface        |
| Labels/subtextos    | 13px   | Regular (400)  | onSurfaceVariant |
| Badges/chips        | 11px   | Bold (700)     | varies           |
| Timer               | 18px   | Bold (700)     | white on dark bg |
| Puntuación grande   | 48px   | Bold (700)     | primary          |

### Bordes, sombras y border-radius

| Componente            | Border-radius | Sombra                          | Borde                                               |
| --------------------- | ------------- | ------------------------------- | --------------------------------------------------- |
| Cards                 | 12px          | 0 12px 32px rgba(0,93,168,0.06) | none                                                |
| Inputs                | 10px          | none                            | 1px outlineVariant                                  |
| Botones primarios     | 24px          | none                            | none                                                |
| Chips/badges          | 16px          | none                            | 1px border cuando seleccionado                      |
| Opciones de respuesta | 10px          | none                            | 1px outlineVariant, 2px primary cuando seleccionada |
| Modal                 | 16px (top)    | overlay rgba(0,0,0,0.5)         | none                                                |
| Progress bar          | 6px           | none                            | none                                                |

### Espaciado por breakpoint

| Elemento                 | Mobile (390px) | Desktop (1280px) |
| ------------------------ | -------------- | ---------------- |
| Padding lateral pantalla | 16px           | 32px             |
| Gap entre cards          | 12px           | 20px             |
| Padding interno card     | 16px           | 24px             |
| Gap entre opciones       | 10px           | 12px             |
| Padding inputs           | 12px           | 14px             |

### Animaciones

- **Toggle reto on/off:** expand/collapse con spring animation (300ms)
- **Seleccionar opción:** scale(0.97) → scale(1) con ease-out (150ms) + cambio de color instantáneo
- **Timer pulsante:** fade in/out 1s loop cuando quedan <5 min
- **Resultado:** puntuación se anima de 0 hasta el valor final (counter animation, 1.5s, ease-out)
- **Barra de progreso:** fill animation de izquierda a derecha (800ms, ease-in-out)
- **Cards de preguntas:** fade-in escalonado al cargar (staggered, 100ms entre cada una)
- **Transición entre preguntas:** slide horizontal (250ms) al tocar Siguiente/Anterior
- **Skeleton shimmer:** gradiente linear de izquierda a derecha, loop 1.5s

### Íconos

Familia: Material Icons (`@expo/vector-icons/MaterialIcons`)

- military-tech → badge reto
- timer → temporizador
- quiz → preguntas
- check-circle → respuesta correcta
- cancel → respuesta incorrecta
- emoji-events → trofeo/resultado
- add-circle → añadir pregunta
- drag-indicator → reordenar
- content-copy → duplicar
- delete-outline → eliminar
- expand-more / expand-less → collapsable
- arrow-back / arrow-forward → navegación preguntas
- leaderboard → ranking
- share → compartir resultado

### Accesibilidad

- Contraste mínimo 4.5:1 en todo el texto
- Opciones de respuesta con área táctil mínima 48x48px
- Radio buttons/checkboxes visualmente distinguibles por forma Y color (no solo color)
- Timer con texto legible (mínimo 18px) y anunciado por screen readers
- Preguntas numeradas y con aria-label descriptivo
- Feedback de respuesta correcta/incorrecta con ícono (✅/❌) además del color

---

## RESTRICCIONES TÉCNICAS

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Íconos de la familia Material Icons
- El diseño debe funcionar en fondo claro y oscuro
- Imágenes/fotos son placeholders rectangulares grises con ícono centrado
- Datos de ejemplo deben ser realistas para docentes mexicanos
- El editor de preguntas debe funcionar completamente offline
- Las respuestas del reto se guardan localmente y se sincronizan cuando hay conexión


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 3 DE 4 — Card del Reto en el Feed (Variantes)
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Flujo de **creación y resolución de "Examen como Reto"** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 5: Card del Reto en el Feed (variantes)

### Variante A: Reto sin contestar

- Badge azul "RETO" en esquina superior derecha
- Título del reto en bold
- Descripción en 2 líneas max
- Info: "⏱️ 15 min · ❓ 10 preguntas · 📊 32 participantes"
- Botón prominente: "🏆 Contestar ahora" (gradiente azul)
- Botón secundario: "Guardar examen"

### Variante B: Reto ya contestado

- Badge verde "COMPLETADO ✓"
- Tu resultado: "8/10 (80%)"
- Info: "Contestado hace 2 días · Posición #5 de 32"
- Botón: "Ver mis respuestas" (outline azul)
- Botón: "Reintentar" (si permitido)

### Variante C: Reto propio (del autor)

- Badge azul "TU RETO"
- Stats: "32 participantes · Promedio: 7.2/10 · Mejor: 10/10"
- Botón: "Ver estadísticas" abre mini Dashboard
- Botón: "Editar reto"

### Variante D: Reto expirado (con fecha límite)

- Badge gris "CERRADO"
- "Este reto cerró el 15 de marzo"
- Botón deshabilitado "Contestar ahora" en gris
- Botón: "Ver resultados de la comunidad"


### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## ESPECIFICACIONES DE DISEÑO

### Paleta de colores

| Token                  | Hex     | Uso                                      |
| ---------------------- | ------- | ---------------------------------------- |
| primary                | #005da8 | Headers, botones, links, badge RETO      |
| primaryContainer       | #0576d2 | Gradientes, hover states                 |
| surfaceContainerLowest | #FFFFFF | Fondo de cards                           |
| surfaceContainerLow    | #f1f4f8 | Fondo de inputs, chips no seleccionados  |
| surfaceContainer       | #ebeef2 | Separadores, fondos secundarios          |
| surfaceContainerHigh   | #e3e8ef | Skeleton shimmer, fondos terciarios      |
| onSurface              | #181c1f | Texto principal, títulos                 |
| onSurfaceVariant       | #43474e | Texto secundario, labels, placeholders   |
| outlineVariant         | #c0c7d4 | Bordes de inputs, separadores            |
| error                  | #BA1A1A | Badge rojo timer, respuestas incorrectas |
| success                | #2E7D32 | Respuestas correctas, badge completado   |
| warning                | #F57C00 | Timer últimos 5 min, badge expirado      |
| background             | #EEF3FA | Fondo general de la pantalla             |

### Tipografía

| Nivel               | Tamaño | Peso           | Color            |
| ------------------- | ------ | -------------- | ---------------- |
| Título pantalla     | 22px   | Bold (700)     | onSurface        |
| Título card/sección | 17px   | Bold (700)     | onSurface        |
| Pregunta            | 16px   | SemiBold (600) | onSurface        |
| Opción de respuesta | 15px   | Regular (400)  | onSurface        |
| Texto cuerpo        | 15px   | Regular (400)  | onSurface        |
| Labels/subtextos    | 13px   | Regular (400)  | onSurfaceVariant |
| Badges/chips        | 11px   | Bold (700)     | varies           |
| Timer               | 18px   | Bold (700)     | white on dark bg |
| Puntuación grande   | 48px   | Bold (700)     | primary          |

### Bordes, sombras y border-radius

| Componente            | Border-radius | Sombra                          | Borde                                               |
| --------------------- | ------------- | ------------------------------- | --------------------------------------------------- |
| Cards                 | 12px          | 0 12px 32px rgba(0,93,168,0.06) | none                                                |
| Inputs                | 10px          | none                            | 1px outlineVariant                                  |
| Botones primarios     | 24px          | none                            | none                                                |
| Chips/badges          | 16px          | none                            | 1px border cuando seleccionado                      |
| Opciones de respuesta | 10px          | none                            | 1px outlineVariant, 2px primary cuando seleccionada |
| Modal                 | 16px (top)    | overlay rgba(0,0,0,0.5)         | none                                                |
| Progress bar          | 6px           | none                            | none                                                |

### Espaciado por breakpoint

| Elemento                 | Mobile (390px) | Desktop (1280px) |
| ------------------------ | -------------- | ---------------- |
| Padding lateral pantalla | 16px           | 32px             |
| Gap entre cards          | 12px           | 20px             |
| Padding interno card     | 16px           | 24px             |
| Gap entre opciones       | 10px           | 12px             |
| Padding inputs           | 12px           | 14px             |

### Animaciones

- **Toggle reto on/off:** expand/collapse con spring animation (300ms)
- **Seleccionar opción:** scale(0.97) → scale(1) con ease-out (150ms) + cambio de color instantáneo
- **Timer pulsante:** fade in/out 1s loop cuando quedan <5 min
- **Resultado:** puntuación se anima de 0 hasta el valor final (counter animation, 1.5s, ease-out)
- **Barra de progreso:** fill animation de izquierda a derecha (800ms, ease-in-out)
- **Cards de preguntas:** fade-in escalonado al cargar (staggered, 100ms entre cada una)
- **Transición entre preguntas:** slide horizontal (250ms) al tocar Siguiente/Anterior
- **Skeleton shimmer:** gradiente linear de izquierda a derecha, loop 1.5s

### Íconos

Familia: Material Icons (`@expo/vector-icons/MaterialIcons`)

- military-tech → badge reto
- timer → temporizador
- quiz → preguntas
- check-circle → respuesta correcta
- cancel → respuesta incorrecta
- emoji-events → trofeo/resultado
- add-circle → añadir pregunta
- drag-indicator → reordenar
- content-copy → duplicar
- delete-outline → eliminar
- expand-more / expand-less → collapsable
- arrow-back / arrow-forward → navegación preguntas
- leaderboard → ranking
- share → compartir resultado

### Accesibilidad

- Contraste mínimo 4.5:1 en todo el texto
- Opciones de respuesta con área táctil mínima 48x48px
- Radio buttons/checkboxes visualmente distinguibles por forma Y color (no solo color)
- Timer con texto legible (mínimo 18px) y anunciado por screen readers
- Preguntas numeradas y con aria-label descriptivo
- Feedback de respuesta correcta/incorrecta con ícono (✅/❌) además del color

---

## RESTRICCIONES TÉCNICAS

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Íconos de la familia Material Icons
- El diseño debe funcionar en fondo claro y oscuro
- Imágenes/fotos son placeholders rectangulares grises con ícono centrado
- Datos de ejemplo deben ser realistas para docentes mexicanos
- El editor de preguntas debe funcionar completamente offline
- Las respuestas del reto se guardan localmente y se sincronizan cuando hay conexión


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 4 DE 4 — Estados: Carga/Vacío + Error/Feedback
>
> **Copia desde aquí hasta el final del documento**
> ═══════════════════════════════════════════════════════════════ ✂️

Flujo de **creación y resolución de "Examen como Reto"** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## ESTADOS OBLIGATORIOS

### ⏳ Estado de carga (Resolución del reto)

- Skeleton shimmer con la forma de una card de pregunta: bloque para pregunta (3 líneas), 4 bloques rectangulares para las opciones
- Timer placeholder como shimmer block
- Barra de progreso en shimmer

### 📭 Estado vacío (Editor de preguntas)

- Ilustración placeholder centrada (cuaderno vacío)
- Texto: "Aún no has añadido preguntas"
- Subtexto: "Toca el botón de abajo para crear tu primera pregunta"
- Botón "➕ Crear primera pregunta" prominente en azul


---

## ESTADOS OBLIGATORIOS (continuación): Error, Feedback y Confirmación

### ❌ Error de envío de respuestas

- Modal centrado con ícono de error (❌)
- "No se pudieron enviar tus respuestas"
- "Tus respuestas se guardaron localmente. Se enviarán cuando tengas conexión."
- Botón "Reintentar" + botón "Volver al feed"

### ✅ Feedback de éxito

- Toast/snackbar verde: "Reto publicado con éxito. ¡Compártelo con tus colegas!"
- Toast: "Respuestas enviadas correctamente"

### 🗑️ Confirmación destructiva

- Modal: "¿Eliminar esta pregunta? Esta acción no se puede deshacer."
- Botones: "Cancelar" (outline) + "Eliminar" (rojo)
- Modal: "¿Descartar los cambios del reto? Se perderán las preguntas creadas."
- Botones: "Seguir editando" + "Descartar" (rojo)


### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## ESPECIFICACIONES DE DISEÑO

### Paleta de colores

| Token                  | Hex     | Uso                                      |
| ---------------------- | ------- | ---------------------------------------- |
| primary                | #005da8 | Headers, botones, links, badge RETO      |
| primaryContainer       | #0576d2 | Gradientes, hover states                 |
| surfaceContainerLowest | #FFFFFF | Fondo de cards                           |
| surfaceContainerLow    | #f1f4f8 | Fondo de inputs, chips no seleccionados  |
| surfaceContainer       | #ebeef2 | Separadores, fondos secundarios          |
| surfaceContainerHigh   | #e3e8ef | Skeleton shimmer, fondos terciarios      |
| onSurface              | #181c1f | Texto principal, títulos                 |
| onSurfaceVariant       | #43474e | Texto secundario, labels, placeholders   |
| outlineVariant         | #c0c7d4 | Bordes de inputs, separadores            |
| error                  | #BA1A1A | Badge rojo timer, respuestas incorrectas |
| success                | #2E7D32 | Respuestas correctas, badge completado   |
| warning                | #F57C00 | Timer últimos 5 min, badge expirado      |
| background             | #EEF3FA | Fondo general de la pantalla             |

### Tipografía

| Nivel               | Tamaño | Peso           | Color            |
| ------------------- | ------ | -------------- | ---------------- |
| Título pantalla     | 22px   | Bold (700)     | onSurface        |
| Título card/sección | 17px   | Bold (700)     | onSurface        |
| Pregunta            | 16px   | SemiBold (600) | onSurface        |
| Opción de respuesta | 15px   | Regular (400)  | onSurface        |
| Texto cuerpo        | 15px   | Regular (400)  | onSurface        |
| Labels/subtextos    | 13px   | Regular (400)  | onSurfaceVariant |
| Badges/chips        | 11px   | Bold (700)     | varies           |
| Timer               | 18px   | Bold (700)     | white on dark bg |
| Puntuación grande   | 48px   | Bold (700)     | primary          |

### Bordes, sombras y border-radius

| Componente            | Border-radius | Sombra                          | Borde                                               |
| --------------------- | ------------- | ------------------------------- | --------------------------------------------------- |
| Cards                 | 12px          | 0 12px 32px rgba(0,93,168,0.06) | none                                                |
| Inputs                | 10px          | none                            | 1px outlineVariant                                  |
| Botones primarios     | 24px          | none                            | none                                                |
| Chips/badges          | 16px          | none                            | 1px border cuando seleccionado                      |
| Opciones de respuesta | 10px          | none                            | 1px outlineVariant, 2px primary cuando seleccionada |
| Modal                 | 16px (top)    | overlay rgba(0,0,0,0.5)         | none                                                |
| Progress bar          | 6px           | none                            | none                                                |

### Espaciado por breakpoint

| Elemento                 | Mobile (390px) | Desktop (1280px) |
| ------------------------ | -------------- | ---------------- |
| Padding lateral pantalla | 16px           | 32px             |
| Gap entre cards          | 12px           | 20px             |
| Padding interno card     | 16px           | 24px             |
| Gap entre opciones       | 10px           | 12px             |
| Padding inputs           | 12px           | 14px             |

### Animaciones

- **Toggle reto on/off:** expand/collapse con spring animation (300ms)
- **Seleccionar opción:** scale(0.97) → scale(1) con ease-out (150ms) + cambio de color instantáneo
- **Timer pulsante:** fade in/out 1s loop cuando quedan <5 min
- **Resultado:** puntuación se anima de 0 hasta el valor final (counter animation, 1.5s, ease-out)
- **Barra de progreso:** fill animation de izquierda a derecha (800ms, ease-in-out)
- **Cards de preguntas:** fade-in escalonado al cargar (staggered, 100ms entre cada una)
- **Transición entre preguntas:** slide horizontal (250ms) al tocar Siguiente/Anterior
- **Skeleton shimmer:** gradiente linear de izquierda a derecha, loop 1.5s

### Íconos

Familia: Material Icons (`@expo/vector-icons/MaterialIcons`)

- military-tech → badge reto
- timer → temporizador
- quiz → preguntas
- check-circle → respuesta correcta
- cancel → respuesta incorrecta
- emoji-events → trofeo/resultado
- add-circle → añadir pregunta
- drag-indicator → reordenar
- content-copy → duplicar
- delete-outline → eliminar
- expand-more / expand-less → collapsable
- arrow-back / arrow-forward → navegación preguntas
- leaderboard → ranking
- share → compartir resultado

### Accesibilidad

- Contraste mínimo 4.5:1 en todo el texto
- Opciones de respuesta con área táctil mínima 48x48px
- Radio buttons/checkboxes visualmente distinguibles por forma Y color (no solo color)
- Timer con texto legible (mínimo 18px) y anunciado por screen readers
- Preguntas numeradas y con aria-label descriptivo
- Feedback de respuesta correcta/incorrecta con ícono (✅/❌) además del color

---

## RESTRICCIONES TÉCNICAS

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Íconos de la familia Material Icons
- El diseño debe funcionar en fondo claro y oscuro
- Imágenes/fotos son placeholders rectangulares grises con ícono centrado
- Datos de ejemplo deben ser realistas para docentes mexicanos
- El editor de preguntas debe funcionar completamente offline
- Las respuestas del reto se guardan localmente y se sincronizan cuando hay conexión

