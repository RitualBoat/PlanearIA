# Stitch Prompt — FeedScreen (Tarea 2.1.1)

Diseña un módulo completo de **feed social para docentes** en una app educativa. Necesito **múltiples pantallas/vistas** que cubran todos los flujos posibles. El diseño debe verse en **2 breakpoints**: teléfono (390px) y desktop/web (1280px).

---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 1 DE 5 — Feed Principal + Modal Crear
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Módulo de **feed social para docentes** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 1: Feed Principal (estado normal con datos)

### Layout por breakpoint

**Teléfono (390px):**

- Header fijo: título "Comunidad" a la izquierda, ícono de campana (notificaciones) con badge rojo a la derecha
- Barra de publicación compacta debajo del header: avatar circular del usuario (40px, iniciales como placeholder) + input con placeholder "¿Qué quieres compartir hoy?" + botón azul "Publicar"
- Feed vertical de cards con scroll infinito, cada card ocupa el ancho completo con padding 16px lateral
- Separación entre cards: 12px

**Desktop/Web (1280px):**

- Layout de 2 columnas: feed centrado (maxWidth 640px) + sidebar derecha (280px) con widgets
- Sidebar derecha con: "Temas populares" (3-4 tags clickeables), "Docentes sugeridos" (3 mini avatares con nombre y botón "Seguir"), "Tu actividad" (mini resumen: X publicaciones, X guardados)
- Barra de publicación integrada como card fija arriba del feed

### Componente PostCard (dentro del feed)

Cada card de publicación incluye:

**Header del post:**

- Avatar circular del autor (36px) a la izquierda
- Nombre del autor en bold + rol debajo en texto gris pequeño (ej: "Docente de Primaria")
- A la derecha: tiempo relativo ("hace 2h", "ayer") + ícono de 3 puntos (menú contextual)
- Badge de estado de ánimo como chip pequeño (emoji + texto, fondo pastel): 😊 Inspirado, 📚 Productivo, 💡 Creativo, 🎯 Enfocado, ☕ Relajado

**Cuerpo del post:**

- Título en bold (si existe)
- Texto del contenido, máximo 3 líneas visibles con botón "Ver más" en azul
- Si tiene archivo adjunto: card interna con borde gris claro, ícono de tipo de archivo (PDF rojo, DOC azul, XLS verde), nombre del archivo, tamaño, y botón de descarga
- Si tiene imagen: imagen con bordes redondeados (12px), aspect ratio preservado, máximo 300px de alto en mobile
- Si tiene enlace: preview tipo Open Graph card (thumbnail + título + dominio)

**Footer del post (barra de acciones):**

- Fila horizontal con 5 acciones, cada una con ícono + texto + contador:
  - ❤️ Me gusta (12)
  - 💬 Comentar (3)
  - 📥 Guardar en biblioteca
  - ⬇️ Descargar (solo visible si tiene adjunto)
  - 🔗 Compartir
- En desktop/web los íconos tienen más espacio, en móvil son compactos

### Datos de ejemplo (mínimo 4 posts)

1. **Post con recurso adjunto:**
   - "María García" · Docente de Primaria · 😊 Inspirada · hace 2h
   - "Les comparto mi planeación de matemáticas 3er grado. Incluye actividades lúdicas para fracciones y evaluación diagnóstica. ¡Espero les sirva!"
   - Adjunto: 📄 "Planeacion_Mate_3ro.pdf" (2.4 MB)
   - 12 ❤️ · 3 💬

2. **Post con imagen:**
   - "Carlos Rodríguez" · Prof. de Secundaria · 💡 Creativo · hace 5h
   - "Mis alumnos hicieron estas maquetas para el proyecto de ciencias. ¡Quedaron increíbles! La del sistema solar fue la favorita."
   - Imagen placeholder de maquetas escolares
   - 24 ❤️ · 8 💬

3. **Post solo texto (pregunta a la comunidad):**
   - "Laura Pérez" · Maestra de Preescolar · 📚 Productiva · ayer
   - "¿Alguien tiene sugerencias para actividades de motricidad fina con material reciclado? Mis niños de 4 años necesitan más práctica y quiero algo económico."
   - Sin adjunto
   - 5 ❤️ · 12 💬

4. **Post tipo reto/examen (card especial):**
   - "Roberto Sánchez" · Prof. de Historia · 🎯 Enfocado · hace 1d
   - Card con borde dorado/naranja y badge "📝 Reto" en la esquina
   - "Reto de Historia: Revolución Mexicana — 10 preguntas, 15 minutos. ¿Quién se anima?"
   - Botón especial: "🏆 Contestar ahora" (naranja/dorado, prominente)
   - Botón secundario: "Guardar examen"
   - 18 ❤️ · 6 💬 · "32 docentes lo han contestado"


---

## PANTALLA 2: Modal de Crear Publicación

Vista que se abre al tocar "¿Qué quieres compartir hoy?" o el botón "Publicar".

**Teléfono:** Modal de pantalla completa con header fijo (botón "✕ Cerrar" a la izquierda, "Publicar" a la derecha en azul, deshabilitado si no hay contenido)

**Desktop/Web:** Modal centrado con overlay oscuro, ancho 640px, altura auto con max-height 85vh

### Contenido del modal

1. **Fila superior:** Avatar del usuario + nombre + selector de visibilidad ("Todos", "Solo mis contactos") como dropdown
2. **Campo de título:** Input con placeholder "Título (opcional)", texto grande (18px), sin borde, solo línea inferior sutil
3. **Campo de contenido:** Textarea multilínea con placeholder "Escribe algo para compartir con la comunidad docente...", altura mínima 120px, auto-expand
4. **Selector de estado de ánimo:** Fila horizontal scrollable con chips seleccionables:
   - 😊 Inspirado (fondo azul claro)
   - 📚 Productivo (fondo verde claro)
   - 💡 Creativo (fondo amarillo claro)
   - 🎯 Enfocado (fondo rojo claro)
   - ☕ Relajado (fondo morado claro)
   - Solo 1 seleccionable a la vez, toggle on/off
5. **Archivos adjuntos (si se han añadido):** Lista vertical de chips removibles mostrando nombre + tamaño + botón ✕
6. **Barra inferior de herramientas:** Fila fija abajo con íconos de acción:
   - 📷 Imagen/Foto
   - 📎 Documento
   - 🔗 Enlace
   - 📝 Crear Reto/Examen
   - Separador
   - Contador de caracteres "0/2000"
7. **Botón "Publicar":** Ancho completo en mobile, alineado a la derecha en desktop/web. Azul primario (#1676D2), redondeado, bold. Deshabilitado (gris) si el contenido está vacío.

### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## Especificaciones de Diseño Global

### Paleta de colores

| Token         | Valor                 | Uso                                |
| ------------- | --------------------- | ---------------------------------- |
| primary       | `#1676D2`             | Botones, enlaces, acento principal |
| primaryDark   | `#0C63B8`             | Hover, estados pressed             |
| background    | `#EEF3FA`             | Fondo general de la pantalla       |
| surface       | `#FFFFFF`             | Cards, modales                     |
| textPrimary   | `#1A1A2E`             | Títulos, texto principal           |
| textSecondary | `#6B7280`             | Subtítulos, metadata, tiempos      |
| success       | `#10B981`             | Toasts de éxito, confirmaciones    |
| error         | `#EF4444`             | Toasts de error, botones eliminar  |
| warning       | `#F59E0B`             | Banner offline, alertas            |
| challengeGold | `#F59E0B`             | Borde y badge de retos/exámenes    |
| border        | `#E5E7EB`             | Bordes de cards y separadores      |
| skeleton      | `#E2E8F0` → `#F1F5F9` | Shimmer de carga                   |

### Tipografía

- Títulos de post: 16px bold
- Cuerpo de texto: 14px regular
- Metadata (tiempo, rol): 12px regular, color textSecondary
- Nombre del autor: 14px semibold
- Botones de acción: 12px medium
- Header de pantalla: 20px bold

### Bordes y sombras

- Cards: border-radius 16px, shadow `0 1px 3px rgba(0,0,0,0.08)`
- Botones: border-radius 12px
- Avatares: completamente circulares
- Chips/tags: border-radius 20px (pill shape)
- Modales: border-radius 20px en top en mobile, 16px all sides en desktop/web

### Espaciado

- Padding interno de cards: 16px
- Separación entre cards: 12px
- Margen lateral: 16px mobile, auto-centrado desktop
- Separación entre secciones dentro de un card: 12px

### Animaciones esperadas

- Shimmer de carga: gradiente animado izquierda→derecha
- Like: escala 1.0→1.3→1.0 con cambio de color gris→rojo
- Toast/snackbar: slide-up desde abajo + fade
- Card nueva: fade-in + slide-down suave
- Bottom sheet: slide-up con overlay fade

---

## Restricciones

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Los íconos deben ser de la familia Material Icons (la app usa `@expo/vector-icons/MaterialIcons`)
- El diseño debe funcionar tanto en fondo claro como oscuro (mostrar ambas versiones si es posible)
- Priorizar legibilidad y accesibilidad para docentes de todas las edades (contraste mínimo 4.5:1)
- Las imágenes/fotos en posts son placeholders rectangulares grises con ícono de imagen centrado


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 2 DE 5 — Estados Vacíos y Especiales
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Módulo de **feed social para docentes** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 3: Estados vacíos y especiales

### 3A. Feed vacío (sin publicaciones)

- Ícono grande central: ilustración tipo "comunidad" o grupo de personas (línea simple, monocromático azul)
- Título: "¡Bienvenido a la comunidad docente!"
- Subtítulo: "Sé el primero en compartir un recurso, una idea o una experiencia con otros docentes."
- Botón: "✏️ Crear mi primera publicación" (azul primario, centrado)
- En desktop: el sidebar derecho sigue visible con sugerencias

### 3B. Estado de carga (skeleton/shimmer)

- 3 cards placeholder con efecto shimmer animado
- Cada card: rectángulo gris claro para avatar, 2 líneas grises para nombre/rol, bloque gris grande para contenido, fila de círculos grises para acciones
- Barra de publicación también en skeleton

### 3C. Error de red / no se pudieron cargar los posts

- Ícono: nube con X roja o señal de WiFi tachada
- Título: "No pudimos cargar las publicaciones"
- Subtítulo: "Revisa tu conexión a internet e intenta de nuevo."
- Botón: "🔄 Reintentar" (azul outline)
- Debajo (texto gris pequeño): "Si el problema persiste, tus publicaciones guardadas siguen disponibles offline."

### 3D. Sin conexión (modo offline)

- Banner amarillo/ámbar sutil en la parte superior del feed: "⚠️ Sin conexión — Mostrando publicaciones guardadas"
- El feed muestra los posts cacheados localmente (ligeramente más opacos)
- La barra de publicación se mantiene activa con indicador: "Se publicará cuando vuelvas a conectarte"

### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## Especificaciones de Diseño Global

### Paleta de colores

| Token         | Valor                 | Uso                                |
| ------------- | --------------------- | ---------------------------------- |
| primary       | `#1676D2`             | Botones, enlaces, acento principal |
| primaryDark   | `#0C63B8`             | Hover, estados pressed             |
| background    | `#EEF3FA`             | Fondo general de la pantalla       |
| surface       | `#FFFFFF`             | Cards, modales                     |
| textPrimary   | `#1A1A2E`             | Títulos, texto principal           |
| textSecondary | `#6B7280`             | Subtítulos, metadata, tiempos      |
| success       | `#10B981`             | Toasts de éxito, confirmaciones    |
| error         | `#EF4444`             | Toasts de error, botones eliminar  |
| warning       | `#F59E0B`             | Banner offline, alertas            |
| challengeGold | `#F59E0B`             | Borde y badge de retos/exámenes    |
| border        | `#E5E7EB`             | Bordes de cards y separadores      |
| skeleton      | `#E2E8F0` → `#F1F5F9` | Shimmer de carga                   |

### Tipografía

- Títulos de post: 16px bold
- Cuerpo de texto: 14px regular
- Metadata (tiempo, rol): 12px regular, color textSecondary
- Nombre del autor: 14px semibold
- Botones de acción: 12px medium
- Header de pantalla: 20px bold

### Bordes y sombras

- Cards: border-radius 16px, shadow `0 1px 3px rgba(0,0,0,0.08)`
- Botones: border-radius 12px
- Avatares: completamente circulares
- Chips/tags: border-radius 20px (pill shape)
- Modales: border-radius 20px en top en mobile, 16px all sides en desktop/web

### Espaciado

- Padding interno de cards: 16px
- Separación entre cards: 12px
- Margen lateral: 16px mobile, auto-centrado desktop
- Separación entre secciones dentro de un card: 12px

### Animaciones esperadas

- Shimmer de carga: gradiente animado izquierda→derecha
- Like: escala 1.0→1.3→1.0 con cambio de color gris→rojo
- Toast/snackbar: slide-up desde abajo + fade
- Card nueva: fade-in + slide-down suave
- Bottom sheet: slide-up con overlay fade

---

## Restricciones

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Los íconos deben ser de la familia Material Icons (la app usa `@expo/vector-icons/MaterialIcons`)
- El diseño debe funcionar tanto en fondo claro como oscuro (mostrar ambas versiones si es posible)
- Priorizar legibilidad y accesibilidad para docentes de todas las edades (contraste mínimo 4.5:1)
- Las imágenes/fotos en posts son placeholders rectangulares grises con ícono de imagen centrado


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 3 DE 5 — Feedback: Publicar, Error y Guardar (4A–4C)
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Módulo de **feed social para docentes** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 4: Estados de feedback al usuario (toasts/snackbars/modals)

### 4A. Publicación exitosa

- Snackbar/toast verde desde abajo: "✅ ¡Publicación compartida!" con botón "Ver" a la derecha
- Duración: 3 segundos, descartable con swipe
- El nuevo post aparece animado al inicio del feed con highlight sutil por 2 segundos

### 4B. Error al publicar

- Snackbar/toast rojo desde abajo: "❌ No se pudo publicar. Toca para reintentar."
- Persistente hasta que el usuario lo cierre o toque "Reintentar"

### 4C. Post guardado en biblioteca

- Snackbar verde: "📥 Guardado en tu biblioteca" con botón "Ir a biblioteca"

### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## Especificaciones de Diseño Global

### Paleta de colores

| Token         | Valor                 | Uso                                |
| ------------- | --------------------- | ---------------------------------- |
| primary       | `#1676D2`             | Botones, enlaces, acento principal |
| primaryDark   | `#0C63B8`             | Hover, estados pressed             |
| background    | `#EEF3FA`             | Fondo general de la pantalla       |
| surface       | `#FFFFFF`             | Cards, modales                     |
| textPrimary   | `#1A1A2E`             | Títulos, texto principal           |
| textSecondary | `#6B7280`             | Subtítulos, metadata, tiempos      |
| success       | `#10B981`             | Toasts de éxito, confirmaciones    |
| error         | `#EF4444`             | Toasts de error, botones eliminar  |
| warning       | `#F59E0B`             | Banner offline, alertas            |
| challengeGold | `#F59E0B`             | Borde y badge de retos/exámenes    |
| border        | `#E5E7EB`             | Bordes de cards y separadores      |
| skeleton      | `#E2E8F0` → `#F1F5F9` | Shimmer de carga                   |

### Tipografía

- Títulos de post: 16px bold
- Cuerpo de texto: 14px regular
- Metadata (tiempo, rol): 12px regular, color textSecondary
- Nombre del autor: 14px semibold
- Botones de acción: 12px medium
- Header de pantalla: 20px bold

### Bordes y sombras

- Cards: border-radius 16px, shadow `0 1px 3px rgba(0,0,0,0.08)`
- Botones: border-radius 12px
- Avatares: completamente circulares
- Chips/tags: border-radius 20px (pill shape)
- Modales: border-radius 20px en top en mobile, 16px all sides en desktop/web

### Espaciado

- Padding interno de cards: 16px
- Separación entre cards: 12px
- Margen lateral: 16px mobile, auto-centrado desktop
- Separación entre secciones dentro de un card: 12px

### Animaciones esperadas

- Shimmer de carga: gradiente animado izquierda→derecha
- Like: escala 1.0→1.3→1.0 con cambio de color gris→rojo
- Toast/snackbar: slide-up desde abajo + fade
- Card nueva: fade-in + slide-down suave
- Bottom sheet: slide-up con overlay fade

---

## Restricciones

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Los íconos deben ser de la familia Material Icons (la app usa `@expo/vector-icons/MaterialIcons`)
- El diseño debe funcionar tanto en fondo claro como oscuro (mostrar ambas versiones si es posible)
- Priorizar legibilidad y accesibilidad para docentes de todas las edades (contraste mínimo 4.5:1)
- Las imágenes/fotos en posts son placeholders rectangulares grises con ícono de imagen centrado


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 4 DE 5 — Feedback: Eliminar, Descargar y Reportar (4D–4F)
>
> **Copia desde aquí hasta el próximo ✂️**
> ═══════════════════════════════════════════════════════════════ ✂️

Módulo de **feed social para docentes** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 4 (continuación): Feedback — Eliminar, Descargar y Reportar

### 4D. Post eliminado

- Modal de confirmación primero: "¿Eliminar esta publicación?" con "Cancelar" (gris) y "Eliminar" (rojo)
- Después: snackbar gris: "Publicación eliminada" con botón "Deshacer" (3 segundos)

### 4E. Archivo descargado

- Snackbar azul: "⬇️ Archivo descargado correctamente" con botón "Abrir"

### 4F. Post reportado

- Modal: "¿Por qué quieres reportar esta publicación?" con opciones radio (Spam, Contenido inapropiado, Información falsa, Otro) + botón "Enviar reporte"
- Después: snackbar: "Gracias por tu reporte. Lo revisaremos pronto."

### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## Especificaciones de Diseño Global

### Paleta de colores

| Token         | Valor                 | Uso                                |
| ------------- | --------------------- | ---------------------------------- |
| primary       | `#1676D2`             | Botones, enlaces, acento principal |
| primaryDark   | `#0C63B8`             | Hover, estados pressed             |
| background    | `#EEF3FA`             | Fondo general de la pantalla       |
| surface       | `#FFFFFF`             | Cards, modales                     |
| textPrimary   | `#1A1A2E`             | Títulos, texto principal           |
| textSecondary | `#6B7280`             | Subtítulos, metadata, tiempos      |
| success       | `#10B981`             | Toasts de éxito, confirmaciones    |
| error         | `#EF4444`             | Toasts de error, botones eliminar  |
| warning       | `#F59E0B`             | Banner offline, alertas            |
| challengeGold | `#F59E0B`             | Borde y badge de retos/exámenes    |
| border        | `#E5E7EB`             | Bordes de cards y separadores      |
| skeleton      | `#E2E8F0` → `#F1F5F9` | Shimmer de carga                   |

### Tipografía

- Títulos de post: 16px bold
- Cuerpo de texto: 14px regular
- Metadata (tiempo, rol): 12px regular, color textSecondary
- Nombre del autor: 14px semibold
- Botones de acción: 12px medium
- Header de pantalla: 20px bold

### Bordes y sombras

- Cards: border-radius 16px, shadow `0 1px 3px rgba(0,0,0,0.08)`
- Botones: border-radius 12px
- Avatares: completamente circulares
- Chips/tags: border-radius 20px (pill shape)
- Modales: border-radius 20px en top en mobile, 16px all sides en desktop/web

### Espaciado

- Padding interno de cards: 16px
- Separación entre cards: 12px
- Margen lateral: 16px mobile, auto-centrado desktop
- Separación entre secciones dentro de un card: 12px

### Animaciones esperadas

- Shimmer de carga: gradiente animado izquierda→derecha
- Like: escala 1.0→1.3→1.0 con cambio de color gris→rojo
- Toast/snackbar: slide-up desde abajo + fade
- Card nueva: fade-in + slide-down suave
- Bottom sheet: slide-up con overlay fade

---

## Restricciones

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Los íconos deben ser de la familia Material Icons (la app usa `@expo/vector-icons/MaterialIcons`)
- El diseño debe funcionar tanto en fondo claro como oscuro (mostrar ambas versiones si es posible)
- Priorizar legibilidad y accesibilidad para docentes de todas las edades (contraste mínimo 4.5:1)
- Las imágenes/fotos en posts son placeholders rectangulares grises con ícono de imagen centrado


---

> ✂️ ═══════════════════════════════════════════════════════════════
>
> ## PARTE 5 DE 5 — Menú Contextual + Vista Expandida
>
> **Copia desde aquí hasta el final del documento**
> ═══════════════════════════════════════════════════════════════ ✂️

Módulo de **feed social para docentes** en **PlanearIA** (app educativa). Breakpoints: 390px (móvil), 1280px (desktop/web).

---

## PANTALLA 5: Menú contextual del post (3 puntos)

Al tocar los 3 puntos en un post, mostrar:

**Si es tu propio post:**

- ✏️ Editar publicación
- 📌 Fijar en tu perfil
- 🗑️ Eliminar publicación

**Si es post de otro usuario:**

- 📥 Guardar en biblioteca
- 🔗 Copiar enlace
- 🔕 Silenciar a este autor
- 🚩 Reportar publicación

En mobile: bottom sheet con opciones. En desktop/web: dropdown menu posicionado junto al ícono.


---

## PANTALLA 6: Vista expandida de post (detalle)

Cuando el usuario toca "Ver más" o "Comentar", se abre la vista completa:

**Teléfono:** Pantalla completa nueva (push navigation)
**Desktop/Web:** Panel lateral derecho (slide-in) o modal ancho que conserva el feed detrás

### Contenido

- Post completo con todo el texto visible (sin truncar)
- Imagen a ancho completo
- Barra de acciones completa
- **Sección de comentarios debajo:**
  - Lista de comentarios con: avatar (28px) + nombre bold + texto + tiempo relativo
  - Comentarios anidados (1 nivel de respuesta) con indentación
  - Campo de input abajo fijo: "Escribe un comentario..." + botón enviar (ícono flecha azul)
  - Cada comentario tiene: botón ❤️ Me gusta mini + "Responder"

### Especificaciones de diseño (Academic Atelier — Compacto)

**Paleta:** primary `#004580` · primary-container `#005da8` · primary-fixed `#d2e4ff` · on-primary `#ffffff` · surface `#f6f9ff` · surface-container-low `#eff4fb` · surface-container-lowest `#ffffff` · surface-container-high `#e4e9f0` · on-surface `#171c21` · on-surface-variant `#40484f` · outline-variant `#c1c7d3` · secondary `#1b6d24` · secondary-container `#a0f399` · error `#ba1a1a` · error-container `#ffdad6`

**Tipografía:** Manrope · Display 2.75rem/800 · Headline 1.5rem/700 · Title 1.25rem/700 · Body 1rem/400 · Body-sm 0.875rem/400 · Label 0.75rem/600 CAPS

**Reglas:** Cards 16px radius · Modales 24px · Bottom sheet 24px top · Sombra cards `0px 2px 8px rgba(0,69,128,0.06)` · Sombra modales `0px 24px 48px rgba(0,72,132,0.08)` · No-Line Rule (cambios tonales, NO bordes) · Overlay `rgba(19,30,49,0.42)` · Gradiente `linear-gradient(135deg, #004580, #005da8)` · Íconos: Material Icons

**Restricciones:** NO navbar inferior · NO splash/onboarding · Íconos Material Icons · Contraste ≥4.5:1 · Imágenes placeholder grises · Datos realistas docentes mexicanos

## Especificaciones de Diseño Global

### Paleta de colores

| Token         | Valor                 | Uso                                |
| ------------- | --------------------- | ---------------------------------- |
| primary       | `#1676D2`             | Botones, enlaces, acento principal |
| primaryDark   | `#0C63B8`             | Hover, estados pressed             |
| background    | `#EEF3FA`             | Fondo general de la pantalla       |
| surface       | `#FFFFFF`             | Cards, modales                     |
| textPrimary   | `#1A1A2E`             | Títulos, texto principal           |
| textSecondary | `#6B7280`             | Subtítulos, metadata, tiempos      |
| success       | `#10B981`             | Toasts de éxito, confirmaciones    |
| error         | `#EF4444`             | Toasts de error, botones eliminar  |
| warning       | `#F59E0B`             | Banner offline, alertas            |
| challengeGold | `#F59E0B`             | Borde y badge de retos/exámenes    |
| border        | `#E5E7EB`             | Bordes de cards y separadores      |
| skeleton      | `#E2E8F0` → `#F1F5F9` | Shimmer de carga                   |

### Tipografía

- Títulos de post: 16px bold
- Cuerpo de texto: 14px regular
- Metadata (tiempo, rol): 12px regular, color textSecondary
- Nombre del autor: 14px semibold
- Botones de acción: 12px medium
- Header de pantalla: 20px bold

### Bordes y sombras

- Cards: border-radius 16px, shadow `0 1px 3px rgba(0,0,0,0.08)`
- Botones: border-radius 12px
- Avatares: completamente circulares
- Chips/tags: border-radius 20px (pill shape)
- Modales: border-radius 20px en top en mobile, 16px all sides en desktop/web

### Espaciado

- Padding interno de cards: 16px
- Separación entre cards: 12px
- Margen lateral: 16px mobile, auto-centrado desktop
- Separación entre secciones dentro de un card: 12px

### Animaciones esperadas

- Shimmer de carga: gradiente animado izquierda→derecha
- Like: escala 1.0→1.3→1.0 con cambio de color gris→rojo
- Toast/snackbar: slide-up desde abajo + fade
- Card nueva: fade-in + slide-down suave
- Bottom sheet: slide-up con overlay fade

---

## Restricciones

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Los íconos deben ser de la familia Material Icons (la app usa `@expo/vector-icons/MaterialIcons`)
- El diseño debe funcionar tanto en fondo claro como oscuro (mostrar ambas versiones si es posible)
- Priorizar legibilidad y accesibilidad para docentes de todas las edades (contraste mínimo 4.5:1)
- Las imágenes/fotos en posts son placeholders rectangulares grises con ícono de imagen centrado

