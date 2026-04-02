# Stitch Prompt — PerfilScreen (Tarea 1.1.1)

Diseña un módulo completo de **perfil de usuario para docentes** en una app educativa. Necesito **múltiples pantallas/vistas** que cubran todos los flujos posibles. El diseño debe verse en **3 breakpoints**: teléfono (390px), tablet (768px) y desktop/web (1280px).

---

## PANTALLA 1: Perfil del Usuario (vista principal con datos)

Esta pantalla se abre desde un ícono flotante de avatar que está siempre visible en la app (no es un tab, es una pantalla push).

### Layout por breakpoint

**Teléfono (390px):**

- Header fijo con botón "← Atrás" a la izquierda, título "Mi Perfil" centrado, ícono de engranaje ⚙️ (ir a configuración) a la derecha
- Imagen de portada/banner: franja horizontal de ~160px de alto, color gradiente azul suave (placeholder con ícono de cámara para cambiar foto), bordes inferiores redondeados (20px)
- Avatar circular (88px) sobresaliendo de la portada (centrado, mitad dentro, mitad fuera), con borde blanco de 4px, placeholder con ícono de persona si no hay foto, badge de cámara pequeño en la esquina inferior derecha
- Debajo del avatar:
  - Nombre completo en bold grande (22px)
  - Rol como chip/badge azul claro: "Docente" / "Administrador" / "Invitado"
  - Email en texto gris pequeño (13px)
  - Biografía en texto regular (14px), máximo 2 líneas con "Ver más"
  - País con ícono de bandera: "🇲🇽 México"
  - Fecha de registro: "Miembro desde marzo 2024" en gris pequeño
- Card de estadísticas (fondo blanco, borde sutil, border-radius 16px):
  - 4 métricas en fila horizontal con divisores verticales:
    - 📝 **Planeaciones** — número grande bold + label pequeño
    - 👥 **Grupos** — número grande bold + label pequeño
    - 📚 **Recursos** — número grande bold + label pequeño
    - 📊 **Entregables** — número grande bold + label pequeño
  - Cada métrica es tappeable (navega a la sección correspondiente)
- Sección "Actividad reciente" con 3-4 items tipo timeline:
  - Ícono + texto + tiempo relativo
  - Ej: "📝 Creó planeación de Matemáticas 3er grado · hace 2h"
  - Ej: "👥 Añadió 5 alumnos al grupo 3°A · ayer"
  - Ej: "📚 Compartió recurso 'Fracciones divertidas' · hace 3 días"
  - Ej: "📊 Calificó entregables del grupo 2°B · hace 1 semana"
- Botones de acción:
  - "✏️ Editar perfil" — botón outline azul, ancho completo
  - "🔗 Compartir perfil" — botón ghost/texto, ancho completo
- Si es usuario invitado: en lugar de las acciones, mostrar un banner prominente:
  - Fondo gradiente azul→morado suave, border-radius 16px
  - Ícono de escudo/persona
  - Título: "Estás navegando como invitado"
  - Subtítulo: "Crea una cuenta para guardar tu progreso, sincronizar tus datos y acceder a todas las funciones."
  - Botón: "Crear cuenta gratis" (blanco, bold)
  - Texto link: "Ya tengo cuenta → Iniciar sesión"

**Tablet (768px):**

- Misma estructura pero con más espacio horizontal
- Card de estadísticas más ancha, números más grandes
- Sección de actividad y botones de acción centrados con maxWidth 560px
- Portada más alta (200px)
- Avatar más grande (100px)

**Desktop/Web (1280px):**

- Layout de 2 columnas:
  - **Columna izquierda (360px):** Portada + avatar + info personal + botones de acción (fijo/sticky)
  - **Columna derecha (flex):** Card de estadísticas (en fila horizontal completa) + Actividad reciente (lista completa, más items visibles) + Sección "Mis publicaciones recientes" (últimos 3 posts del feed si existen)
- Sidebar sticky al hacer scroll

### Datos de ejemplo

- Nombre: "Ana Sofía Martínez López"
- Rol: Docente
- Email: anasofia.mtz@gmail.com
- Biografía: "Maestra de primaria con 8 años de experiencia. Apasionada por las matemáticas lúdicas y la educación inclusiva."
- País: México
- Miembro desde: marzo 2024
- Estadísticas: 18 Planeaciones · 4 Grupos · 23 Recursos · 12 Entregables
- Actividad: los 4 items del ejemplo de arriba

---

## PANTALLA 2: Editar Perfil (modal/pantalla)

Vista que se abre al tocar "Editar perfil".

**Teléfono:** Pantalla completa (push navigation) con header fijo: "✕ Cancelar" a la izquierda, "Guardar" a la derecha (azul, deshabilitado si no hay cambios)

**Tablet:** Modal centrado, ancho 520px, overlay oscuro, border-radius 20px top

**Desktop:** Modal centrado, ancho 560px, altura auto max-height 85vh

### Contenido del formulario

1. **Portada:** Rectángulo placeholder con botón "Cambiar portada" (ícono cámara + texto), overlay oscuro al hover
2. **Avatar:** Circular con botón "Cambiar foto" superpuesto, opciones al tocar:
   - 📷 Tomar foto
   - 🖼️ Elegir de galería
   - 🗑️ Eliminar foto actual (si tiene una)
3. **Campo Nombre:** Input con label "Nombre(s)", placeholder "Ej: Ana Sofía", validación requerido (borde rojo + "Este campo es obligatorio" si vacío)
4. **Campo Apellidos:** Input con label "Apellidos", placeholder "Ej: Martínez López"
5. **Campo Biografía:** Textarea con label "Biografía", placeholder "Cuéntanos sobre ti y tu experiencia docente...", contador de caracteres "0/300", altura mínima 80px
6. **Campo Email:** Input con label "Correo electrónico", con ícono de candado 🔒, DESHABILITADO (gris, no editable), tooltip/nota: "Para cambiar tu email, ve a Configuración > Cuenta"
7. **País:** Selector/dropdown con bandera, valor actual "🇲🇽 México"
8. **Botón Guardar:** Ancho completo en mobile, alineado a la derecha en tablet/desktop. Azul primario, bold, border-radius 12px. Estados: normal → loading (spinner) → éxito

---

## PANTALLA 3: Estados vacíos y especiales

### 3A. Perfil de usuario invitado

- Portada genérica gris
- Avatar placeholder con ícono de persona en gris
- Nombre: "Invitado"
- Rol: chip gris "Invitado"
- Sin email visible
- Estadísticas: todas en 0
- Sin actividad reciente → mini estado vacío: "Aún no tienes actividad"
- Banner prominente de crear cuenta (descrito arriba en Pantalla 1)

### 3B. Perfil nuevo (usuario recién registrado)

- Portada placeholder con ícono de cámara + texto "Toca para añadir portada"
- Avatar placeholder con ícono + texto "Añadir foto"
- Nombre mostrado, email mostrado
- Sin biografía → texto sutil: "Añade una biografía para que otros docentes te conozcan"
- Estadísticas: todas en 0
- Actividad vacía → ilustración simple + "¡Empieza creando tu primera planeación!"
- Botón "Completar mi perfil" en lugar de "Editar perfil" (más prominente, azul sólido)

### 3C. Estado de carga del perfil (skeleton/shimmer)

- Rectángulo shimmer para portada
- Círculo shimmer para avatar
- 2 líneas shimmer para nombre y rol
- 1 línea shimmer para email
- Card shimmer para estadísticas (4 bloques)
- 3 líneas shimmer para actividad

### 3D. Error al cargar el perfil

- Ícono: persona con signo de exclamación
- Título: "No pudimos cargar tu perfil"
- Subtítulo: "Revisa tu conexión e intenta de nuevo."
- Botón: "🔄 Reintentar" (azul outline)

---

## PANTALLA 4: Feedback al usuario (toasts/snackbars/modals)

### 4A. Perfil actualizado exitosamente

- Snackbar verde desde abajo: "✅ Perfil actualizado correctamente"
- Duración: 3 segundos, descartable con swipe
- La pantalla de editar se cierra automáticamente y vuelve al perfil actualizado

### 4B. Error al guardar cambios

- Snackbar rojo: "❌ No se pudieron guardar los cambios. Intenta de nuevo."
- Persistente hasta cerrar o tocar "Reintentar"

### 4C. Foto de perfil actualizada

- Snackbar azul: "📷 Foto de perfil actualizada"

### 4D. Foto de perfil eliminada

- Modal de confirmación: "¿Eliminar tu foto de perfil?" con "Cancelar" (gris) y "Eliminar" (rojo)
- Después: snackbar gris: "Foto de perfil eliminada"

### 4E. Cambios sin guardar (al intentar salir de editar)

- Modal: "¿Descartar cambios?"
- Subtítulo: "Tienes cambios sin guardar en tu perfil."
- Botones: "Seguir editando" (azul outline) y "Descartar" (rojo texto)

### 4F. Perfil compartido

- Snackbar azul: "🔗 Enlace de perfil copiado al portapapeles"

### 4G. Imagen demasiado grande

- Snackbar naranja/warning: "⚠️ La imagen debe ser menor a 5 MB. Elige otra."

---

## PANTALLA 5: Menú contextual del avatar y opciones

### 5A. Al tocar "Cambiar foto" en editar perfil

**Mobile:** Bottom sheet con 3 opciones:

- 📷 Tomar foto
- 🖼️ Elegir de galería
- 🗑️ Eliminar foto actual (texto rojo, solo si ya tiene foto)
- Cancelar (texto gris)

**Tablet/Desktop:** Dropdown menu posicionado debajo del avatar con las mismas opciones

### 5B. Al tocar ícono ⚙️ en el header del perfil

Navega directo a la pantalla de Configuración (sin menú, solo navegación)

---

## PANTALLA 6: Vista de estadística expandida

Cuando el usuario toca una de las 4 métricas (ej: "18 Planeaciones"), se muestra un mini detalle:

**Teléfono:** Bottom sheet con lista resumida
**Tablet/Desktop:** Popover/tooltip expandido junto a la métrica

### Contenido (ejemplo para "Planeaciones")

- Header: "📝 Mis Planeaciones (18)"
- Lista de las últimas 5 planeaciones con:
  - Nombre de la planeación
  - Fecha de última modificación
  - Estado (Borrador / Completa) como chip de color
- Botón al fondo: "Ver todas →" (navega a la sección de planeaciones)

---

## Especificaciones de Diseño Global

### Paleta de colores

| Token            | Valor     | Uso                                             |
| ---------------- | --------- | ----------------------------------------------- |
| primary          | `#1676D2` | Botones, enlaces, chip de rol, acento principal |
| primaryDark      | `#0C63B8` | Hover, estados pressed                          |
| primaryTint      | `#EBF5FF` | Fondo de portada, fondo de chips                |
| background       | `#EEF3FA` | Fondo general de la pantalla                    |
| surface          | `#FFFFFF` | Cards, modales, formularios                     |
| textPrimary      | `#1A1A2E` | Nombre, títulos                                 |
| textSecondary    | `#6B7280` | Rol, email, metadata, timestamps                |
| textMuted        | `#9CA3AF` | Placeholders, hints                             |
| success          | `#10B981` | Toasts de éxito, badge "Completa"               |
| error            | `#EF4444` | Toasts de error, botones eliminar, validación   |
| warning          | `#F59E0B` | Alertas, imagen grande                          |
| border           | `#E2EAF4` | Bordes de cards, dividers de estadísticas       |
| guestBannerStart | `#1676D2` | Gradiente inicio del banner invitado            |
| guestBannerEnd   | `#7C3AED` | Gradiente fin del banner invitado               |

### Tipografía

- Nombre del usuario: 22px extrabold (800)
- Títulos de sección: 16px bold
- Texto de biografía: 14px regular
- Rol (chip): 13px semibold
- Email: 13px regular, color textSecondary
- Estadísticas (número): 22px extrabold
- Estadísticas (label): 12px semibold, color textMuted
- Actividad (texto): 13px regular
- Actividad (tiempo): 12px regular, color textMuted
- Botones: 15px bold
- Labels de formulario: 13px semibold
- Inputs: 15px regular

### Bordes y sombras

- Card de estadísticas: border-radius 16px, border 1px `#E2EAF4`, shadow `0 1px 3px rgba(0,0,0,0.06)`
- Avatar: completamente circular, border 4px blanco, shadow `0 2px 8px rgba(0,0,0,0.12)`
- Portada: border-bottom-left-radius 20px, border-bottom-right-radius 20px
- Botones: border-radius 12px
- Inputs: border-radius 10px, border 1px `#E2EAF4`, focus: border `#1676D2`
- Modales: border-radius 20px en mobile (top), 16px all sides en tablet/desktop
- Bottom sheets: border-radius 20px top

### Espaciado

- Padding lateral: 16px mobile, 24px tablet, auto-centrado desktop
- Padding interno cards: 16px
- Gap entre secciones: 20px
- Gap entre items de actividad: 12px
- Portada altura: 160px mobile, 200px tablet, 220px desktop
- Avatar sobresale: 40px debajo de la portada

### Animaciones esperadas

- Skeleton/shimmer: gradiente animado izquierda→derecha
- Transición al abrir/cerrar editar perfil: slide-up en mobile, fade-in en modal
- Toast/snackbar: slide-up desde abajo + fade (3s auto-dismiss)
- Tap en estadística: pulse scale 1.0→0.95→1.0 + popover fade-in
- Avatar hover (web): overlay oscuro sutil con ícono de cámara
- Banner de invitado: gradiente sutil animado (shimmer de izquierda a derecha)
- Botón guardar loading: texto reemplazado por spinner circular

---

## Restricciones

- NO incluir barra de navegación inferior (la app ya tiene la suya)
- NO incluir splash screen ni onboarding
- Los íconos deben ser de la familia Material Icons (`@expo/vector-icons/MaterialIcons`)
- El diseño debe funcionar tanto en fondo claro como oscuro (mostrar ambas versiones si es posible)
- Priorizar legibilidad y accesibilidad para docentes de todas las edades (contraste mínimo 4.5:1)
- Las imágenes/fotos son placeholders rectangulares grises con ícono de imagen/persona centrado
- Datos de ejemplo deben ser realistas para docentes mexicanos
