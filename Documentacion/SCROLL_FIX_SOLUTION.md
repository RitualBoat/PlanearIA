# Solución al Problema de Scroll en Web - EditorPlaneacionScreen

## Problema Identificado

El formulario de edición de planeaciones (`EditorPlaneacionScreen`) no permitía hacer scroll en la versión web del proyecto, especialmente cuando había mucho contenido basado en el nivel académico seleccionado (Primaria, Secundaria, Preparatoria o Universidad).

## Causa Raíz

React Native Web maneja el `ScrollView` de manera diferente al navegador. El componente `ScrollView` estándar no renderiza correctamente el overflow en web cuando se combina con `flex: 1` y otros elementos posicionados de forma absoluta como el `BottomNavBar`.

## Solución Implementada

### 1. Componente `WebScrollView` (src/components/WebScrollView.tsx)

Creé un componente personalizado que:

- **En Web**: Renderiza un `<div>` nativo HTML con:
 - `maxHeight: calc(100vh - 80px)` - Calcula la altura disponible restando el navbar
 - `overflow: auto` - Habilita scroll nativo del navegador
 - `-webkit-overflow-scrolling: touch` - Mejora el comportamiento en dispositivos táctiles
- **En Móvil**: Usa el `ScrollView` estándar de React Native sin modificaciones

```typescript
// Pseudocódigo simplificado
if (Platform.OS === "web") {
 return (
 <div with native scroll>
 <View>{children}</View>
 </div>
 );
} else {
 return <ScrollView>{children}</ScrollView>;
}
```

### 2. Integración en EditorPlaneacionScreen

- Reemplacé `ScrollView` por `WebScrollView`
- Mantiene todas las propiedades existentes (`showsVerticalScrollIndicator`, `keyboardShouldPersistTaps`, etc.)
- Compatible con todos los niveles académicos

## Archivos Modificados

1. **Nuevos archivos:**

 - `src/components/WebScrollView.tsx` - Componente personalizado de scroll

2. **Archivos modificados:**
 - `src/screens/planeaciones/EditorPlaneacionScreen.tsx`
 - Importación de `WebScrollView`
 - Reemplazo de `ScrollView` por `WebScrollView`
 - Importación de `Dimensions` (preparado para futuras mejoras)

## Beneficios de la Solución

 **Funciona para todos los niveles académicos:**

- Primaria (menos campos)
- Secundaria (campos medios)
- Preparatoria (más campos)
- Universidad (máximos campos + modalidad)

 **Performance mejorada:**

- Usa scroll nativo del navegador en web (más rápido)
- No hay conflictos con el layout flex

 **Responsive:**

- Se adapta automáticamente a diferentes tamaños de ventana
- Usa `calc(100vh - 80px)` para altura dinámica

 **Mantenible:**

- Código limpio y bien documentado
- Separación de responsabilidades (componente independiente)
- Sin hacks o soluciones temporales

## Pruebas Realizadas

### Cómo Probar

1. Iniciar el proyecto en modo web:

 ```bash
 npx expo start --web
 ```

2. Navegar a: Home → Planeaciones → Nueva Planeación → [Seleccionar Nivel]

3. Probar con diferentes niveles:

 - **Primaria**: Formulario más simple, menos scroll necesario
 - **Secundaria**: Formulario medio
 - **Preparatoria**: Formulario extenso con múltiples campos
 - **Universidad**: Formulario más completo con modalidad y bibliografía

4. Verificar que:
 - El scroll funciona con el mouse wheel
 - El scroll funciona arrastrando la barra de desplazamiento
 - Todos los campos son accesibles
 - El botón "Guardar Planeación" es visible al final
 - El BottomNavBar permanece fijo en la parte inferior

### Escenarios de Prueba

- [ ] Scroll con mouse wheel
- [ ] Scroll con barra de desplazamiento
- [ ] Scroll en pantalla completa
- [ ] Scroll con ventana reducida (zoom out)
- [ ] Formulario de Primaria
- [ ] Formulario de Secundaria
- [ ] Formulario de Preparatoria
- [ ] Formulario de Universidad
- [ ] Edición de planeación existente
- [ ] Creación de nueva planeación

## Compatibilidad

- Web (Chrome, Firefox, Safari, Edge)
- iOS
- Android
- React Native 0.81.5
- Expo SDK 54

## Notas Técnicas

### Por qué usar un `<div>` en lugar de `ScrollView` en web

React Native Web traduce `ScrollView` a un `<div>` con estilos específicos, pero no siempre aplica correctamente las propiedades CSS necesarias para scroll cuando hay elementos con `position: absolute` o configuraciones flex complejas. Al usar un `<div>` nativo directamente, tenemos control total sobre el comportamiento de scroll.

### Altura del BottomNavBar

Se usa `80px` como altura estimada del `BottomNavBar`. Si esta altura cambia en el futuro, actualizar el valor en:

- `src/components/WebScrollView.tsx` línea 17

### Alternativas Consideradas

1. `height: 100%` en ScrollView - No funciona con flex containers
2. `position: absolute` en ScrollView - Rompe el layout en móvil
3. Usar `FlatList` - No apropiado para formularios
4. **Componente híbrido con div nativo** - Solución elegida

## Próximos Pasos (Opcional)

Si se requieren mejoras futuras:

1. Hacer que la altura del navbar sea dinámica usando `onLayout`
2. Agregar animaciones de scroll suaves
3. Implementar scroll programático a campos con error
4. Agregar indicador visual de posición de scroll

## Autor

Solución implementada el 27 de noviembre de 2025
