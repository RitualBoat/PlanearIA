# PlanearIA - Planeacion Educativa Inteligente

<div align="center">

![Version](https://img.shields.io/badge/version-4.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.21-000020.svg)

Aplicacion movil para la gestion de planeaciones educativas con asistencia de IA.

[Arquitectura](#arquitectura) | [Instalacion](#instalacion) | [Estructura](#estructura-del-proyecto) | [Roadmap](#roadmap)

</div>

---

## Acerca del Proyecto

**PlanearIA** es una aplicacion cross-platform (iOS, Android) para docentes mexicanos. Gestiona:

- **Planeaciones** - Editor de planeaciones con estructura NEM (en refactorizacion activa)
- **Grupos** - Administracion de grupos, alumnos, calificaciones y asistencias
- **Recursos** - Examenes, presentaciones, mapas mentales y lineas de tiempo
- **Cuenta** - Perfil, configuracion y seguridad

La app funciona offline-first: todos los datos se guardan localmente y se sincronizan con el servidor cuando hay conexion.

---

## Arquitectura

| Capa | Tecnologia | Descripcion |
|------|-----------|-------------|
| **Frontend** | React Native + Expo Go | UI cross-platform |
| **Lenguaje** | TypeScript 5.9.2 | Tipado estatico |
| **Navegacion** | React Navigation 7.x | Stack navigator nativo |
| **Estado** | React Context + Hooks | MVVM con hooks como ViewModels |
| **Storage local** | AsyncStorage | Persistencia offline-first |
| **Backend** | Vercel Serverless | Funciones Node.js sin servidor |
| **Base de datos** | MongoDB Atlas M0 | Cloud database (free tier) |
| **Autenticacion** | JWT | Tokens con userId isolation |
| **Sync** | Custom sync engine | syncEngine.ts + PlaneacionesContext V2 (syncService legacy en deprecacion) |
| **Icons** | @expo/vector-icons | Direct imports (no barrel) |
| **Testing** | Jest | Unit tests |

---

## Instalacion

### Prerequisitos

```bash
node --version   # >= 18.x
npm --version    # >= 9.x
```

### Setup

```bash
git clone https://github.com/RitualBoat/PlanearIA.git
cd PlanearIA

# Frontend
npm install

# Backend
cd backend && npm install && cd ..

# Ejecutar
npx expo start          # Expo Go (modo basico)
npm run start:dev       # Dev Client (recomendado para editor avanzado de planeaciones)
npm run android         # Android
npm run ios             # iOS (requiere Mac + Xcode)
```

### Variables de entorno

```bash
cp .env.example .env
# Editar .env con las credenciales de MongoDB Atlas
```

---

## Estructura del Proyecto

```
PlanearIA/
â”œâ”€â”€ App.tsx                      # Entry point
â”œâ”€â”€ plan_planeaciones.md         # Plan activo de refactorizacion
â”œâ”€â”€ .agents/skills/              # Skills de agentes IA
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ api/                     # Vercel serverless endpoints
â”‚   â”‚   â”œâ”€â”€ auth.js
â”‚   â”‚   â”œâ”€â”€ health.js
â”‚   â”‚   â”œâ”€â”€ planeaciones.js      # CRUD con userId isolation
â”‚   â”‚   â””â”€â”€ sync.js
â”‚   â””â”€â”€ lib/
â”‚       â”œâ”€â”€ auth.js              # JWT verification, getUserFromToken
â”‚       â”œâ”€â”€ mongodb.js           # Atlas connection
â”‚       â””â”€â”€ databaseIndexes.js
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/              # Componentes reutilizables
â”‚   â”œâ”€â”€ context/                 # AuthContext, PlaneacionesContext, NotificacionesContext
â”‚   â”œâ”€â”€ hooks/                   # Custom hooks (ViewModels)
â”‚   â”œâ”€â”€ navigation/              # StackNavigator.tsx
â”‚   â”œâ”€â”€ screens/
â”‚   â”‚   â”œâ”€â”€ auth/                # Login
â”‚   â”‚   â”œâ”€â”€ planeaciones/        # Planeaciones (refactorizacion activa)
â”‚   â”‚   â”œâ”€â”€ grupos/              # Grupos
â”‚   â”‚   â”œâ”€â”€ biblioteca/          # Recursos didacticos
â”‚   â”‚   â”œâ”€â”€ cuenta/              # Perfil
â”‚   â”‚   â”œâ”€â”€ notificaciones/
â”‚   â”‚   â””â”€â”€ ayuda/
â”‚   â”œâ”€â”€ services/                # Push notifications, etc.
â”‚   â”œâ”€â”€ sync/                    # Sync engine y services
â”‚   â”œâ”€â”€ themes/                  # colors.ts
â”‚   â””â”€â”€ utils/                   # apiClient.ts, migrateV1toV2.ts
â”œâ”€â”€ types/
â”‚   â”œâ”€â”€ index.ts                 # Tipos generales
â”‚   â”œâ”€â”€ planeacion.ts            # V1 types (legacy)
â”‚   â”œâ”€â”€ planeacionV2.ts          # V2 types (NEM-aligned)
â”‚   â””â”€â”€ plantillaDocumento.ts    # Template types
â”œâ”€â”€ context/
â”‚   â””â”€â”€ planeaciones-reales/     # Ejemplos reales de planeaciones
â””â”€â”€ Documentacion/               # Documentacion tecnica
```

---

## Estrategia de Refactorizacion

El proyecto sigue un enfoque modular: cada modulo de la app recibe su propio plan de refactorizacion con fases estandarizadas.

### Patron por modulo

Cada plan sigue estas fases:
1. Limpieza de codigo legacy
2. Nuevo sistema de tipos y modelo de datos
3. Capa de datos y sincronizacion
4. Instalacion de dependencias y editor base
5. Rediseno de pantallas
6. Integracion de IA
7. Exportacion y navegacion
8. Limpieza y verificacion

### Planes de refactorizacion

| Modulo | Archivo | Estado |
|--------|---------|--------|
| **Planeaciones** | `plan_planeaciones.md` | En progreso (Fases 0-4 completadas) |
| Recursos | `plan_recursos.md` | Pendiente |
| Grupos | `plan_grupos.md` | Pendiente |
| Alumnos | `plan_alumnos.md` | Pendiente |
| Login/Auth | `plan_login.md` | Pendiente |
| Seguridad | `plan_seguridad.md` | Pendiente |

---

## Roadmap

### v4.0 - Refactorizacion de Planeaciones (actual)

- [x] Fase 0: Limpieza de codigo legacy
- [x] Fase 1: Sistema de tipos V2 + modelo de datos NEM
- [x] Fase 2: Capa de datos y sincronizacion
- [x] Fase 3: Editor de texto enriquecido (tentap-editor)
- [x] Fase 4: Rediseno completo de pantallas del editor
- [ ] Fase 5: Escaner de plantillas
- [ ] Fase 6: Copiloto IA integrado
- [ ] Fase 7: Exportacion y navegacion
- [ ] Fase 8: Limpieza y verificacion

### v4.1+ - Refactorizacion por modulos

- [ ] Recursos didacticos
- [ ] Grupos y alumnos
- [ ] Login y autenticacion
- [ ] Seguridad (expo-secure-store, etc.)

### v5.0 - Futuro

- [ ] Docker self-hosting
- [ ] Colaboracion multi-docente
- [ ] Analiticas avanzadas

---

## Documentacion

La documentacion tecnica esta en [`Documentacion/`](./Documentacion/):

| Documento | Descripcion |
|-----------|-------------|
| [ARQUITECTURA.md](./Documentacion/ARQUITECTURA.md) | Arquitectura del sistema y decisiones tecnicas |
| [FLUJO_SINCRONIZACION.md](./Documentacion/FLUJO_SINCRONIZACION.md) | Flujo de datos y sincronizacion offline-first |
| [DIAGRAMA_NAVEGACION.md](./Documentacion/DIAGRAMA_NAVEGACION.md) | Diagrama de navegacion entre pantallas |
| [MAPA_NAVEGACION.md](./Documentacion/MAPA_NAVEGACION.md) | Mapa de rutas y relaciones entre modulos |
| [GUIA_PRUEBAS.md](./Documentacion/GUIA_PRUEBAS.md) | Guia de testing |

---

## Plataformas

| Plataforma | Estado | Compatibilidad |
|------------|--------|----------------|
| **Android** | Funcional | Android 8.0+ (Expo Go) |
| **iOS** | Funcional | iOS 13+ (Expo Go) |

---

## Licencia

Proyecto privado. Todos los derechos reservados.

---

**Repositorio:** [github.com/RitualBoat/PlanearIA](https://github.com/RitualBoat/PlanearIA)
**Branch:** `development`

