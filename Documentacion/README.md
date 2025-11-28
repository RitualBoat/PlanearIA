# 📚 Documentación PlanearIA v3.0

Bienvenido a la documentación técnica del proyecto **PlanearIA**, una aplicación móvil y web diseñada para facilitar la planeación educativa de docentes.

---

## 📖 Índice de Documentación

### 🏗️ Arquitectura y Diseño

| Documento                                              | Descripción                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **[ARQUITECTURA.md](./ARQUITECTURA.md)**               | Arquitectura general del proyecto, estructura de carpetas y decisiones técnicas |
| **[DIAGRAMA_NAVEGACION.md](./DIAGRAMA_NAVEGACION.md)** | Diagrama visual del flujo de navegación entre pantallas                         |
| **[MAPA_NAVEGACION.md](./MAPA_NAVEGACION.md)**         | Mapa detallado de rutas y relaciones entre módulos                              |

### 🚀 Desarrollo y Cambios

| Documento                                                | Descripción                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| **[PLAN_REFACTORIZACION.md](./PLAN_REFACTORIZACION.md)** | Plan detallado de la refactorización v3.0 (Tareas → Grupos) |
| **[RESUMEN_CAMBIOS_V3.md](./RESUMEN_CAMBIOS_V3.md)**     | Lista completa de cambios implementados en v3.0             |
| **[RESUMEN_EJECUTIVO_V3.md](./RESUMEN_EJECUTIVO_V3.md)** | Resumen ejecutivo de la versión 3.0                         |
| **[SCROLL_FIX_APPLIED.md](./SCROLL_FIX_APPLIED.md)**     | Solución de problemas de scroll en web (WebScrollView)      |
| **[SCROLL_FIX_SOLUTION.md](./SCROLL_FIX_SOLUTION.md)**   | Documentación técnica de la solución de scroll              |

### 🧪 Testing y Calidad

| Documento                                | Descripción                                             |
| ---------------------------------------- | ------------------------------------------------------- |
| **[GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md)** | Guía para realizar pruebas funcionales y de integración |

### 📝 Resúmenes

| Documento                      | Descripción                  |
| ------------------------------ | ---------------------------- |
| **[RESUMEN.md](./RESUMEN.md)** | Resumen general del proyecto |

---

## 🎯 Versión Actual: 3.0

### Características Principales v3.0:

✅ **Tareas integradas en Grupos** - Gestión completa de tareas, exámenes y proyectos dentro de cada grupo  
✅ **6 Tabs en Grupos** - Alumnos, Calificaciones, Asistencias, Comentarios, Tareas, Gráficas  
✅ **4 Nuevas Pantallas** - CrearTareaGrupo, AsignarRecurso, DetalleTarea, CalificarEntregas  
✅ **Scroll Optimizado Web** - WebScrollView con scrollbar visible y altura calculada  
✅ **Navegación Simplificada** - HomeScreen con 4 módulos principales

---

## 🗂️ Estructura del Proyecto

```
PlanearIA/
├── 📱 App.tsx                    # Punto de entrada principal
├── 📦 package.json               # Dependencias y scripts
├── ⚙️ tsconfig.json              # Configuración de TypeScript
├── 📁 Documentacion/             # 📚 Documentación técnica (esta carpeta)
├── 📁 src/
│   ├── 🧩 components/            # Componentes reutilizables
│   │   ├── BottomNavBar.tsx     # Barra de navegación inferior
│   │   └── WebScrollView.tsx    # Scroll optimizado web/móvil
│   ├── 🎨 screens/               # Pantallas de la app
│   │   ├── auth/                # Autenticación (LoginScreen)
│   │   ├── home/                # Pantalla principal
│   │   ├── grupos/              # ⭐ Módulo de Grupos (v3.0)
│   │   │   ├── tareas/          # 4 pantallas de gestión de tareas
│   │   │   └── ...              # Otras pantallas de grupos
│   │   ├── planeaciones/        # Planeaciones académicas
│   │   ├── biblioteca/          # 📚 Recursos didácticos (antes recursosDidacticos)
│   │   ├── cuenta/              # Perfil y configuración
│   │   ├── alumnos/             # (deprecated)
│   │   ├── calificaciones/      # (deprecated)
│   │   └── tareas/              # (deprecated - legacy)
│   ├── 🧭 navigation/            # Navegación y rutas
│   │   └── StackNavigator.tsx   # 25 rutas definidas
│   ├── 🔧 context/               # Contexts de React
│   │   └── PlaneacionesContext.tsx
│   └── 🛠️ utils/                 # Utilidades y helpers
│       └── responsive.ts        # Responsividad cross-platform
├── 📁 types/                     # Definiciones de tipos TypeScript
│   ├── index.ts                 # Tipos generales
│   ├── planeacion.ts            # Tipos de planeaciones
│   └── images.d.ts              # Tipos de imágenes
└── 📁 assets/                    # Recursos estáticos (imágenes, iconos)
```

---

## 🚀 Comenzar a Desarrollar

### Prerequisitos:

- Node.js >= 16
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)

### Instalación:

```bash
npm install
```

### Ejecutar en desarrollo:

```bash
# Web
npm run web

# iOS (requiere Mac)
npm run ios

# Android
npm run android
```

---

## 📱 Plataformas Soportadas

| Plataforma  | Estado       | Notas                         |
| ----------- | ------------ | ----------------------------- |
| **Web**     | ✅ Funcional | Chrome, Firefox, Safari, Edge |
| **iOS**     | ✅ Funcional | Requiere Xcode                |
| **Android** | ✅ Funcional | Expo Go o APK                 |

---

## 🏆 Tecnologías Principales

- **React Native** 0.81.5
- **Expo** 54.0.21
- **TypeScript** 5.9.2
- **React Navigation** 7.x
- **Material Icons** (@expo/vector-icons)

---

## 📞 Soporte

Para preguntas o issues, consulta la documentación específica en esta carpeta o revisa el historial de commits en el repositorio.

---

**Última actualización:** 28 de Noviembre de 2025  
**Versión:** 3.0  
**Repositorio:** RitualBoat/PlanearIA (branch: development)
