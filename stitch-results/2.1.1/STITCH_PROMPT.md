# Stitch Prompt — FeedScreen (Tarea 2.1.1)

Diseña un módulo completo de **feed social para docentes** en una app educativa. Necesito **múltiples pantallas/vistas** que cubran todos los flujos posibles. El diseño debe verse en **3 breakpoints**: teléfono (390px), tablet (768px) y desktop/web (1280px).

---

## PANTALLA 1: Feed Principal (estado normal con datos)

### Layout por breakpoint

**Teléfono (390px):**

- Header fijo: título "Comunidad" a la izquierda, ícono de campana (notificaciones) con badge rojo a la derecha
- Barra de publicación compacta debajo del header: avatar circular del usuario (40px, iniciales como placeholder) + input con placeholder "¿Qué quieres compartir hoy?" + botón azul "Publicar"
- Feed vertical de cards con scroll infinito, cada card ocupa el ancho completo con padding 16px lateral
- Separación entre cards: 12px

**Tablet (768px):**

- Mismo layout pero cards centradas con maxWidth 600px
- Barra de publicación más amplia, el campo de texto ocupa más espacio
- Mayor padding lateral (24px)
- Cards con sombra ligeramente más pronunciada

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
- En tablet/desktop los íconos tienen más espacio, en móvil son compactos

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

**Tablet:** Modal centrado con overlay oscuro, ancho 560px, altura auto con max-height 80vh

**Desktop:** Mismo que tablet pero ancho 640px

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
7. **Botón "Publicar":** Ancho completo en mobile, alineado a la derecha en tablet/desktop. Azul primario (#1676D2), redondeado, bold. Deshabilitado (gris) si el contenido está vacío.

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

### 4D. Post eliminado

- Modal de confirmación primero: "¿Eliminar esta publicación?" con "Cancelar" (gris) y "Eliminar" (rojo)
- Después: snackbar gris: "Publicación eliminada" con botón "Deshacer" (3 segundos)

### 4E. Archivo descargado

- Snackbar azul: "⬇️ Archivo descargado correctamente" con botón "Abrir"

### 4F. Post reportado

- Modal: "¿Por qué quieres reportar esta publicación?" con opciones radio (Spam, Contenido inapropiado, Información falsa, Otro) + botón "Enviar reporte"
- Después: snackbar: "Gracias por tu reporte. Lo revisaremos pronto."

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

En mobile: bottom sheet con opciones. En tablet/desktop: dropdown menu posicionado junto al ícono.

---

## PANTALLA 6: Vista expandida de post (detalle)

Cuando el usuario toca "Ver más" o "Comentar", se abre la vista completa:

**Teléfono:** Pantalla completa nueva (push navigation)
**Tablet/Desktop:** Panel lateral derecho (slide-in) o modal ancho que conserva el feed detrás

### Contenido

- Post completo con todo el texto visible (sin truncar)
- Imagen a ancho completo
- Barra de acciones completa
- **Sección de comentarios debajo:**
  - Lista de comentarios con: avatar (28px) + nombre bold + texto + tiempo relativo
  - Comentarios anidados (1 nivel de respuesta) con indentación
  - Campo de input abajo fijo: "Escribe un comentario..." + botón enviar (ícono flecha azul)
  - Cada comentario tiene: botón ❤️ Me gusta mini + "Responder"

---

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
- Modales: border-radius 20px en top en mobile, 16px all sides en tablet/desktop

### Espaciado

- Padding interno de cards: 16px
- Separación entre cards: 12px
- Margen lateral: 16px mobile, 24px tablet, auto-centrado desktop
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
