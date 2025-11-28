# 🧪 Guía de Pruebas - PlanearIA

## 📋 Cómo Probar la Nueva Arquitectura

Esta guía te ayudará a verificar que toda la navegación y arquitectura funciona correctamente.

---

## 🚀 Iniciar la Aplicación

### Opción 1: Expo (Recomendado)

```bash
npm start
# o
expo start
```

Luego escanea el código QR con:

- **iOS**: Cámara del iPhone
- **Android**: App de Expo Go
- **Web**: Presiona 'w' en la terminal

### Opción 2: Plataforma Específica

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 🧭 Flujo de Pruebas Recomendado

### 1. Verificar Login y Home ✅

**Ruta**: `Login` → `Home`

**Qué probar**:

- [x] La pantalla de login se muestra correctamente
- [x] Al hacer login se navega a Home
- [x] Home muestra 5 opciones principales:
  - Planeaciones
  - Grupos ⭐
  - Recursos Didácticos ⭐
  - Tareas
  - Cuenta

**Resultado esperado**: Menú principal con 5 cards visuales

---

### 2. Probar Módulo de Grupos ⭐

#### 2.1. Menú de Grupos

**Ruta**: `Home` → `Grupos`

**Qué probar**:

- [x] Se muestra GruposScreen
- [x] 2 opciones visibles:
  - Crear Nuevo Grupo
  - Mis Grupos

#### 2.2. Lista de Grupos

**Ruta**: `Home` → `Grupos` → `Mis Grupos`

**Qué probar**:

- [x] Se muestra ListaGruposScreen
- [x] Barra de búsqueda funciona
- [x] Se muestran 3 grupos de ejemplo:
  - 7A - Matemáticas Avanzadas
  - 5B - Programación Web
  - 3A - Estructuras de Datos
- [x] Cada card muestra:
  - Nombre del grupo
  - Materia
  - Carrera y semestre
  - Cantidad de alumnos
  - Estado (activo)

#### 2.3. Detalle de Grupo (Pantalla Principal)

**Ruta**: `Home` → `Grupos` → `Mis Grupos` → Click en cualquier grupo

**Qué probar**:

- [x] Se muestra DetalleGrupoScreen
- [x] Header muestra nombre del grupo
- [x] 5 pestañas horizontales visibles:
  - Alumnos
  - Calificaciones
  - Asistencias
  - Comentarios
  - Gráficas

**Probar cada pestaña**:

**Pestaña ALUMNOS**:

- [x] Lista de 3 alumnos de ejemplo
- [x] Botón "Agregar Alumno"
- [x] Cada alumno tiene icono y nombre

**Pestaña CALIFICACIONES**:

- [x] Estadísticas visibles:
  - Promedio Grupal: 8.5
  - Aprobación: 85%
- [x] Botón "Registrar Calificaciones"

**Pestaña ASISTENCIAS**:

- [x] Estadísticas visibles:
  - Asistencia Promedio: 92%
  - Retardos Hoy: 3
- [x] Botón "Pasar Lista"

**Pestaña COMENTARIOS**:

- [x] Comentario de ejemplo visible
- [x] Botón "Nuevo Comentario"
- [x] Muestra alumno, texto y fecha

**Pestaña GRÁFICAS**:

- [x] Icono de gráfica placeholder
- [x] Lista de tipos de gráficas disponibles:
  - Promedio de calificaciones
  - Evolución del grupo
  - Porcentaje de asistencias
  - Comparativa por alumno

#### 2.4. Crear Grupo

**Ruta**: `Home` → `Grupos` → `Crear Nuevo Grupo`

**Qué probar**:

- [x] Formulario visible con campos:
  - Nombre del Grupo
  - Materia
  - Carrera (4 botones: ISC, IGE, ARQ, ITICS)
  - Semestre
  - Periodo
  - Horario (opcional)
- [x] Selección de carrera funciona (cambio de color)
- [x] Botón "Crear Grupo"
- [x] Botón "Cancelar"

---

### 3. Probar Módulo de Recursos Didácticos ⭐

#### 3.1. Menú de Recursos

**Ruta**: `Home` → `Recursos Didácticos`

**Qué probar**:

- [x] Se muestra RecursosDidacticosScreen
- [x] 4 tipos de recursos visibles:
  - 📝 Exámenes (naranja)
  - 📊 Presentaciones (azul)
  - 🧠 Mapas Mentales (morado)
  - 📅 Líneas de Tiempo (verde)
- [x] Cada card muestra 3 badges:
  - IA
  - Plantillas
  - Manual
- [x] Botón "Ver Todos Mis Recursos" al final

#### 3.2. Crear Examen

**Ruta**: `Home` → `Recursos Didácticos` → `Exámenes`

**Qué probar**:

- [x] Se muestra ExamenesScreen
- [x] 3 opciones de creación visibles:
  - 🤖 Generar con IA (morado)
  - 📋 Usar Plantilla (azul)
  - ✏️ Crear Manualmente (verde)
- [x] Cada opción tiene descripción

#### 3.3. Crear Presentación

**Ruta**: `Home` → `Recursos Didácticos` → `Presentaciones`

**Qué probar**:

- [x] Similar a Exámenes
- [x] 3 opciones de creación
- [x] Descripciones específicas para presentaciones

#### 3.4. Crear Mapa Mental

**Ruta**: `Home` → `Recursos Didácticos` → `Mapas Mentales`

**Qué probar**:

- [x] Similar a anteriores
- [x] 3 opciones de creación
- [x] Descripciones específicas para mapas mentales

#### 3.5. Crear Línea de Tiempo

**Ruta**: `Home` → `Recursos Didácticos` → `Líneas de Tiempo`

**Qué probar**:

- [x] Similar a anteriores
- [x] 3 opciones de creación
- [x] Descripciones específicas para líneas de tiempo

#### 3.6. Ver Todos los Recursos

**Ruta**: `Home` → `Recursos Didácticos` → `Ver Todos Mis Recursos`

**Qué probar**:

- [x] Se muestra ListaRecursosScreen
- [x] Barra de búsqueda funcional
- [x] 3 recursos de ejemplo:
  - Examen de Álgebra (naranja)
  - Presentación: Revolución Mexicana (azul)
  - Mapa Mental: Sistema Nervioso (morado)
- [x] Cada card muestra:
  - Icono según tipo
  - Título
  - Descripción
  - Badge de tipo
  - Badge de origen (IA/Plantilla/Manual)

---

### 4. Probar Módulos Existentes

#### 4.1. Planeaciones

**Ruta**: `Home` → `Planeaciones`

**Qué probar**:

- [x] Menú de planeaciones funciona
- [x] Opciones "Crear Nueva" y "Mis Planeaciones"
- [x] Navegación a subpantallas funciona

#### 4.2. Tareas

**Ruta**: `Home` → `Tareas`

**Qué probar**:

- [x] Pantalla de tareas se muestra
- [x] Opciones "Crear Tarea" y "Mis Tareas"

#### 4.3. Cuenta

**Ruta**: `Home` → `Cuenta`

**Qué probar**:

- [x] Pantalla de cuenta se muestra
- [x] Opciones de configuración visibles

---

## 🎯 Verificación de Navegación

### BottomNavBar

**En TODAS las pantallas excepto Login**:

- [x] Barra inferior visible con:
  - Botón "Atrás" (izquierda)
  - Título de la pantalla (centro)
  - Botón "Home" (derecha)
- [x] Botón "Atrás" navega a pantalla anterior
- [x] Botón "Home" navega al menú principal

### Navegación Backward

**Desde cualquier pantalla profunda**:

- [x] Botón "Atrás" funciona
- [x] Se preserva el historial de navegación
- [x] Se puede regresar hasta Home

### Navegación Forward

**Desde Home**:

- [x] Todos los 5 módulos son accesibles
- [x] No hay pantallas rotas o inaccesibles

---

## 🐛 Verificación de Errores Comunes

### TypeScript

```bash
# Verificar errores de TypeScript
npx tsc --noEmit
```

**Resultado esperado**: Sin errores de compilación

### ESLint (opcional)

```bash
# Verificar errores de linting
npm run lint
```

### React Native

**Verificar en consola**:

- [x] Sin errores rojos en consola
- [x] Sin warnings críticos
- [x] Solo warnings de desarrollo normales

---

## 📱 Pruebas por Plataforma

### iOS

- [ ] Todos los botones responden al toque
- [ ] ScrollView funciona correctamente
- [ ] SafeAreaView se respeta (notch)
- [ ] Navegación fluida sin lag

### Android

- [ ] Botón "Atrás" del dispositivo funciona
- [ ] Todos los botones responden al toque
- [ ] ScrollView funciona correctamente
- [ ] Navegación fluida

### Web

- [ ] Responsive design funciona
- [ ] Cursor pointer en botones
- [ ] Navegación con teclado (Tab)
- [ ] No hay errores en consola del navegador

---

## ✅ Checklist Final

### Módulo de Grupos

- [ ] GruposScreen accesible
- [ ] ListaGruposScreen muestra grupos
- [ ] CrearGrupoScreen formulario funcional
- [ ] DetalleGrupoScreen con 5 pestañas
- [ ] Todas las pestañas cambian correctamente
- [ ] Navegación entre pantallas fluida

### Módulo de Recursos Didácticos

- [ ] RecursosDidacticosScreen accesible
- [ ] 4 tipos de recursos accesibles
- [ ] Cada tipo muestra 3 opciones
- [ ] ListaRecursosScreen muestra recursos
- [ ] Búsqueda funciona

### Navegación General

- [ ] Login → Home funciona
- [ ] Home → Todos los módulos
- [ ] BottomNavBar en todas las pantallas
- [ ] Botón "Atrás" funciona correctamente
- [ ] Botón "Home" funciona correctamente
- [ ] Sin errores de TypeScript
- [ ] Sin crashes de la app

### UI/UX

- [ ] Colores consistentes en toda la app
- [ ] Iconos visibles y claros
- [ ] Texto legible (tamaños apropiados)
- [ ] Cards con elevación visible
- [ ] Feedback visual en botones
- [ ] Animaciones suaves

---

## 🎬 Video de Prueba Recomendado

Graba un video probando este flujo:

1. **Inicio (0:00-0:30)**

   - Abrir app
   - Login
   - Ver Home con 5 opciones

2. **Grupos (0:30-2:00)**

   - Entrar a Grupos
   - Ver Lista de Grupos
   - Entrar a un grupo
   - Cambiar entre las 5 pestañas
   - Volver a Home

3. **Recursos Didácticos (2:00-3:30)**

   - Entrar a Recursos Didácticos
   - Ver los 4 tipos
   - Entrar a Exámenes
   - Ver las 3 opciones
   - Ver Lista de Recursos
   - Volver a Home

4. **Navegación (3:30-4:00)**
   - Probar botón "Atrás" varias veces
   - Probar botón "Home" desde pantalla profunda
   - Verificar que todo funciona

---

## 📊 Resultados Esperados

### Sin Errores

```
✅ TypeScript: 0 errores
✅ React Native: 0 crashes
✅ Navegación: 100% funcional
✅ UI: Consistente y profesional
```

### Performance

```
✅ Tiempo de carga: < 2s
✅ Transiciones: Fluidas
✅ Scroll: Suave
✅ Memoria: Uso normal
```

---

## 🆘 Solución de Problemas

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Metro bundler failed"

```bash
# Limpiar cache
npm start -- --reset-cache
```

### Error: "Navigation prop is undefined"

```bash
# Verificar que la pantalla está registrada en StackNavigator.tsx
# Verificar que el nombre de la ruta coincide exactamente
```

### Error: Pantalla en blanco

```bash
# Verificar errores en consola
# Verificar que SafeAreaView y ScrollView están correctos
# Verificar imports de componentes
```

---

## 📝 Notas para el Desarrollador

1. **Datos de ejemplo**: Todas las pantallas usan datos mockeados. En producción vendrán de API/Context.

2. **Pestañas**: El sistema de pestañas en DetalleGrupoScreen es la característica clave de la nueva arquitectura.

3. **Recursos**: Los 3 métodos (IA/Plantilla/Manual) son placeholders. La lógica real se implementará en Fase 2.

4. **Gráficas**: El componente de gráficas necesitará una librería como `react-native-chart-kit` en Fase 2.

5. **Búsqueda**: La búsqueda funciona en memoria con los datos de ejemplo. En producción será con filtros de API.

---

## 🎉 Criterio de Éxito

La arquitectura está **completamente funcional** si:

✅ **Navegación**: Puedes llegar a todas las 23 pantallas desde Home  
✅ **Pestañas**: Las 5 pestañas de DetalleGrupoScreen cambian correctamente  
✅ **BottomNavBar**: Presente y funcional en todas las pantallas  
✅ **Sin errores**: 0 errores de TypeScript, 0 crashes  
✅ **UI Consistente**: Colores, iconos y estilos uniformes  
✅ **Responsive**: Funciona en móvil, tablet y web

---

**Fecha**: Noviembre 28, 2025  
**Versión**: 2.0  
**Estado**: Lista para pruebas ✅
