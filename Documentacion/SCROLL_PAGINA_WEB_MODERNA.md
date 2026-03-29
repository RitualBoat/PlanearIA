# Scroll de Pagina Web Moderna

## Objetivo

Estandarizar transiciones inmersivas tipo landing moderna para pantallas con header en forma de pildora, contenido colapsable y navegacion con tabs persistentes.

## Regla de activacion en chat

Cuando el usuario pida exactamente o de forma equivalente:

- "scroll de pagina web moderna"

Aplicar este documento como plantilla base de implementacion.

## Patron recomendado (PlanearIA)

1. Header principal con `AnimatedTopPill`.
2. `Animated.ScrollView` como contenedor unico de la pantalla.
3. Fade y desplazamiento de la pildora ligados al scroll vertical.
4. Arcoiris de enfoque en la pildora por cambio de tab/focus.
5. Componentes inferiores con acordeones o tarjetas; si todo esta colapsado y cabe en pantalla, centrar verticalmente.
6. Evitar overlays complejos si no son necesarios; priorizar estabilidad visual.

## Implementacion de referencia

Archivo de referencia vigente:

- `src/screens/cuenta/CuentaScreen.tsx`

### 1) Scroll + fade condicional

Usar un `Animated.Value` para `scrollY` y activar fade solo si existe scroll real.

Pseudocodigo:

```tsx
const scrollY = useRef(new Animated.Value(0)).current;
const enablePillFade = contentHeight > viewportHeight + 6;

const mobilePillOpacity = scrollY.interpolate({
  inputRange: [0, 16, 42],
  outputRange: [1, 0.5, 0],
  extrapolate: "clamp",
});
```

Aplicar en estilo:

```tsx
opacity: enablePillFade ? mobilePillOpacity : 1,
transform: [{ translateY: enablePillFade ? mobilePillTranslateY : 0 }],
```

### 2) Centrado cuando contenido cabe

Si los bloques estan colapsados, centrar contenido para evitar que todo se vea cargado arriba.

```tsx
const isCollapsedView = !openA && !openB && !openC;
contentContainerStyle={[styles.scrollContent, isCollapsedView && styles.scrollContentCentered]}
```

### 3) Arcoiris al enfocar tab

`AnimatedTopPill` ya incluye glow/ring por focus. Reutilizar el componente para consistencia.

### 4) Tamaño y copy de pildora

Para estilo consistente con otras tabs:

- Titulo corto y directo.
- Subtitulo de una linea corta (o dos lineas maximo).
- Sin hero gigante salvo solicitud explicita.

Ejemplo usado en Configuracion:

- Titulo: `Configuracion`
- Subtitulo: `Ajusta accesibilidad, preferencias y cuenta`

## Checklist rapido

- [ ] La pildora no se corta con notch ni barra inferior.
- [ ] No hay superposiciones visuales al hacer scroll.
- [ ] Si no hay scroll real, no aplicar fade.
- [ ] Si se abren secciones y aparece scroll, el fade funciona.
- [ ] Arcoiris visible al entrar/focus de la tab.

## Errores comunes a evitar

- Mezclar scroll interno y externo sin control.
- Forzar transiciones discretas complejas cuando un solo scroll resuelve.
- Aplicar fade aunque la pantalla no tenga overflow.
- Usar alturas fijas de hero que rompan en iPhone con Dynamic Island.
