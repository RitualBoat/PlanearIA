# PlanearIA - Planeación Educativa Inteligente

<div align="center">

![Version](https://img.shields.io/badge/version-3.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.21-000020.svg)

**Aplicación móvil y web para la gestión completa de planeaciones educativas**

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Documentación](#-documentación) • [Estructura](#-estructura-del-proyecto)

</div>

---

## Acerca del Proyecto

**PlanearIA** es una aplicación cross-platform (iOS, Android, Web) diseñada para facilitar la vida de los docentes mediante la gestión integral de:

- **Planeaciones Académicas** - Crea y edita planeaciones por nivel educativo
- **Grupos** - Administra grupos con alumnos, calificaciones, asistencias y tareas
- **Biblioteca de Recursos** - Exámenes, presentaciones, mapas mentales y líneas de tiempo
- **Tareas y Evaluaciones** - Sistema completo de asignación, seguimiento y calificación
- **Perfil y Configuración** - Gestión de cuenta personal

---

## Características v3.0

### Novedades

- **Tareas integradas en Grupos** - Gestión completa dentro de cada grupo
- **6 Módulos por Grupo** - Alumnos, Calificaciones, Asistencias, Comentarios, Tareas, Gráficas
- **Asignación Directa** - Asigna recursos de tu biblioteca a grupos específicos
- **Scroll Optimizado Web** - Interfaz fluida en navegadores con scrollbar personalizada
- **Navegación Simplificada** - 4 módulos principales en home

### Interfaz

- **Responsive** - Adaptación automática a móvil, tablet y escritorio
- **Material Design** - Iconos y componentes modernos
- **Cross-Platform** - Una base de código para web, iOS y Android
- **Performance** - Optimizado para carga rápida y fluidez

---

## Instalación

### Prerequisitos

```bash
# Verifica que tengas instalado:
node --version # >= 16.x
npm --version # >= 8.x
```

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/RitualBoat/PlanearIA.git
cd PlanearIA

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run web # Para web (navegador)
npm run ios # Para iOS (requiere Mac + Xcode)
npm run android # Para Android (requiere Android Studio)
```

---

## Uso

### Desarrollo Local

```bash
# Iniciar en web (http://localhost:19006)
npm run web

# Iniciar con Expo Go (escanea QR en tu dispositivo)
npx expo start
```

### Build para Producción

```bash
# Web
npx expo export:web

# iOS
eas build --platform ios

# Android
eas build --platform android
```

---

## Estructura del Proyecto

```
PlanearIA/
├── App.tsx # Punto de entrada
├── package.json # Dependencias
├── Documentacion/ # Documentación técnica completa
├── src/
│ ├── components/ # Componentes reutilizables
│ ├── screens/ # Pantallas por módulo
│ │ ├── auth/ # Login
│ │ ├── home/ # Home principal
│ │ ├── grupos/ # Grupos (con tareas integradas)
│ │ ├── planeaciones/ # Planeaciones
│ │ ├── biblioteca/ # Recursos didácticos
│ │ └── cuenta/ # Perfil de usuario
│ ├── navigation/ # Rutas y navegación
│ ├── context/ # Contexts de React
│ └── utils/ # Utilidades
├── types/ # Tipos de TypeScript
└── assets/ # Imágenes e iconos
```

---

## Documentación

La documentación técnica completa se encuentra en la carpeta [`Documentacion/`](./Documentacion/):

| Documento | Descripción |
| --------------------------------------------------------------------- | ------------------------------------------------- |
| [ README](./Documentacion/README.md) | Índice completo de documentación |
| [ ARQUITECTURA](./Documentacion/ARQUITECTURA.md) | Estructura y decisiones técnicas |
| [ FLUJO DE SINCRONIZACIÓN](./Documentacion/FLUJO_SINCRONIZACION.md) | **Flujo de datos y sincronización offline-first** |
| [ NAVEGACION](./Documentacion/MAPA_NAVEGACION.md) | Mapa de rutas y pantallas |
| [ CAMBIOS v3.0](./Documentacion/RESUMEN_CAMBIOS_V3.md) | Changelog de la versión 3.0 |
| [ PRUEBAS](./Documentacion/GUIA_PRUEBAS.md) | Guía de testing |

---

## Tecnologías

| Tecnología | Versión | Uso |
| --------------------- | ------- | ---------------------------- |
| **React Native** | 0.81.5 | Framework principal |
| **Expo** | 54.0.21 | Herramientas de desarrollo |
| **TypeScript** | 5.9.2 | Tipado estático |
| **React Navigation** | 7.x | Navegación entre pantallas |
| **Expo Vector Icons** | - | Iconografía (Material Icons) |

---

## Plataformas

| Plataforma | Estado | Compatibilidad |
| -------------- | ------------ | ----------------------------- |
| **Web** | Probado | Chrome, Firefox, Safari, Edge |
| **iOS** | Funcional | iOS 13+ |
| **Android** | Funcional | Android 8.0+ |

---

## Roadmap

### v3.1 (Próximamente)

- [ ] Exportación de recursos (PDF, DOCX, PPTX)
- [ ] Gráficas interactivas de rendimiento
- [ ] Notificaciones push
- [ ] Modo oscuro

### v4.0 (Futuro)

- [ ] Integración con IA para sugerencias
- [ ] Colaboración multi-docente
- [ ] App nativa (sin Expo)
- [ ] Backend con API REST

---

## Contribución

Este es un proyecto en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## Licencia

Este proyecto es de código privado. Todos los derechos reservados.

---

## Contacto

**Repositorio:** [github.com/RitualBoat/PlanearIA](https://github.com/RitualBoat/PlanearIA)
**Branch Principal:** `development`

---

<div align="center">

**Desarrollado con para facilitar la labor docente**

 Si te gusta el proyecto, dale una estrella en GitHub

</div>
