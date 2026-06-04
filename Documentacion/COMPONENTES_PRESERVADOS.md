# Componentes Preservados

Este documento contiene el codigo fuente completo y la documentacion de componentes que el desarrollador ha marcado explicitamente para preservar. Existe para proteger estos componentes de ser eliminados o perdidos durante futuras iteraciones de diseno UX/UI.

---

## Indice

1. [AnimatedTopPill (Hero Pills)](#animatedtoppill-hero-pills)

---

## AnimatedTopPill (Hero Pills)

### Descripcion

AnimatedTopPill es un componente que renderiza tarjetas con forma de pastilla (pill) en la parte superior de las pantallas principales. Cada pill muestra un icono, un titulo y un subtitulo.

Al navegar a una pantalla que contiene el componente, se dispara una animacion de borde RGB que cicla a traves de los siguientes colores:

rojo -> naranja -> amarillo -> teal -> azul -> morado -> rojo

La animacion dura 1400ms y el borde se desvanece a lo largo de 1500ms con un retraso de 250ms. El efecto se re-ejecuta cada vez que la pantalla recibe focus via React Navigation.

Las pills tambien se integran con el scroll de cada pantalla: se desvanecen al hacer scroll hacia abajo y reaparecen al hacer scroll hacia arriba (la logica de fade con scroll se implementa en cada pantalla consumidora, no dentro del componente).

### Archivo fuente

`src/components/AnimatedTopPill.tsx`

### Codigo fuente completo

```tsx
import React from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NavigationContext } from "@react-navigation/native";
import { COLORS } from "../../types";

interface AnimatedTopPillProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  size?: "default" | "large";
  titleNumberOfLines?: number;
  subtitleNumberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const AnimatedTopPill: React.FC<AnimatedTopPillProps> = ({
  title,
  subtitle = "",
  icon = "auto-awesome",
  size = "default",
  titleNumberOfLines = 1,
  subtitleNumberOfLines = 1,
  style,
  titleStyle,
  subtitleStyle,
  children,
}) => {
  const navigation = React.useContext(NavigationContext);
  const [ringShift] = React.useState(() => new Animated.Value(0));
  const [ringOpacity] = React.useState(() => new Animated.Value(0));

  const runGlow = React.useCallback(() => {
    ringShift.setValue(0);
    ringOpacity.setValue(0.95);

    Animated.parallel([
      Animated.timing(ringShift, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 1500,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [ringOpacity, ringShift]);

  React.useEffect(() => {
    runGlow();

    if (!navigation) {
      return;
    }

    const unsubscribeFocus = navigation.addListener("focus", runGlow);
    return unsubscribeFocus;
  }, [navigation, runGlow]);

  const borderColor = ringShift.interpolate({
    inputRange: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    outputRange: [COLORS.errorLight, "#FF9F1C", "#FFE66D", "#2EC4B6", "#3A86FF", "#8338EC", COLORS.errorLight],
  });

  return (
    <View style={styles.shell}>
      <Animated.View
        pointerEvents="none"
        style={[styles.rainbowRing, { borderColor, opacity: ringOpacity }]}
      />

      <View style={[styles.pill, size === "large" && styles.pillLarge, style]}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={18} color={COLORS.primaryMuted} />
        </View>
        <View style={styles.textWrap}>
          <Text
            style={[styles.title, size === "large" && styles.titleLarge, titleStyle]}
            numberOfLines={titleNumberOfLines}
          >
            {title}
          </Text>
          {children ? (
            children
          ) : (
            <Text
              style={[styles.subtitle, size === "large" && styles.subtitleLarge, subtitleStyle]}
              numberOfLines={subtitleNumberOfLines}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: "relative",
  },
  rainbowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
    margin: -2,
  },
  pill: {
    minHeight: 88,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2EAF4",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    boxShadow: "0px 10px 22px rgba(22, 53, 99, 0.1)",
  },
  pillLarge: {
    minHeight: 138,
    alignItems: "flex-start",
    paddingVertical: 18,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.45,
    lineHeight: 34,
  },
  titleLarge: {
    fontSize: 40,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 15,
    color: "#64758E",
    lineHeight: 20,
  },
  subtitleLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
});

export default AnimatedTopPill;
```

### Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `title` | `string` | (requerido) | Texto principal de la pill |
| `subtitle` | `string` | `""` | Texto secundario bajo el titulo |
| `icon` | `keyof MaterialIcons.glyphMap` | `"auto-awesome"` | Icono de MaterialIcons |
| `size` | `"default" \| "large"` | `"default"` | Variante de tamano |
| `titleNumberOfLines` | `number` | `1` | Lineas maximas del titulo |
| `subtitleNumberOfLines` | `number` | `1` | Lineas maximas del subtitulo |
| `style` | `StyleProp<ViewStyle>` | - | Estilos adicionales para la pill |
| `titleStyle` | `StyleProp<TextStyle>` | - | Estilos adicionales para el titulo |
| `subtitleStyle` | `StyleProp<TextStyle>` | - | Estilos adicionales para el subtitulo |
| `children` | `React.ReactNode` | - | Contenido personalizado que reemplaza el subtitulo |

### Ejemplos de uso

#### SocialScreen

```tsx
<AnimatedTopPill
  icon="people"
  title="Social"
  subtitle="Conecta y colabora con otros docentes"
/>
```

#### CuentaScreen

```tsx
<AnimatedTopPill
  icon="settings"
  title="Configuracion"
  subtitle="..."
/>
```

### Pantallas que usan AnimatedTopPill

| Pantalla | Archivo | Titulo de la pill |
|----------|---------|-------------------|
| SocialScreen | `src/screens/social/SocialScreen.tsx` | Social |
| CuentaScreen | `src/screens/cuenta/CuentaScreen.tsx` | Configuracion |
| RecursosDidacticosScreen | `src/screens/biblioteca/RecursosDidacticosScreen.tsx` | Recursos |
| GruposDashboardScreen | `src/screens/grupos/GruposDashboardScreen.tsx` | Grupos |
| GruposScreen | `src/screens/grupos/GruposScreen.tsx` | Grupos |
| NotificacionesScreen | `src/screens/notificaciones/NotificacionesScreen.tsx` | Notificaciones |
| AyudaScreen | `src/screens/ayuda/AyudaScreen.tsx` | Ayuda |

### Dependencias

| Dependencia | Origen | Uso |
|-------------|--------|-----|
| `COLORS` | `types/index.ts` (re-exportado desde `src/themes/colors.ts`) | Colores de la paleta del proyecto |
| `NavigationContext` | `@react-navigation/native` | Deteccion de focus para re-ejecutar la animacion |
| `MaterialIcons` | `@expo/vector-icons/MaterialIcons` | Icono dentro de la pill |
| `Animated` | `react-native` | Animacion del borde RGB y opacidad |
| `Easing` | `react-native` | Curvas de animacion (linear para color, cubic out para opacidad) |

### Detalles de la animacion

La animacion RGB se compone de dos animaciones paralelas:

1. **Ciclo de color** (`ringShift`): Interpola el borde a traves de 7 puntos de color en 1400ms con easing lineal.
2. **Desvanecimiento** (`ringOpacity`): Reduce la opacidad de 0.95 a 0 en 1500ms con un retraso de 250ms y easing cubic out.

Secuencia de colores del borde:

| Posicion | Color | Valor |
|----------|-------|-------|
| 0.00 | Rojo | `COLORS.errorLight` |
| 0.16 | Naranja | `#FF9F1C` |
| 0.33 | Amarillo | `#FFE66D` |
| 0.50 | Teal | `#2EC4B6` |
| 0.66 | Azul | `#3A86FF` |
| 0.83 | Morado | `#8338EC` |
| 1.00 | Rojo | `COLORS.errorLight` |

La animacion usa `useNativeDriver: false` porque `borderColor` no es soportado por el driver nativo.

---

## Nota de preservacion

Este documento fue creado por solicitud explicita del desarrollador para proteger el componente AnimatedTopPill de ser eliminado o modificado inadvertidamente durante futuros redisenos de UX/UI. El desarrollador valora la animacion de borde RGB y quiere asegurar que el codigo fuente completo permanezca documentado como referencia, incluso si el componente es temporalmente removido de alguna pantalla.

Cualquier agente de IA o colaborador que trabaje en redisenos de interfaz debe consultar este documento antes de eliminar o reemplazar hero pills en las pantallas listadas.

---

**Ultima actualizacion**: Junio 2026
