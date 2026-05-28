# Documentacion PlanearIA v4.0

Documentacion tecnica del proyecto PlanearIA.

---

## Documentos Vigentes

### Arquitectura y Diseno

| Documento | Descripcion |
|-----------|-------------|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Arquitectura del sistema, stack tecnologico, capas MVVM |
| [FLUJO_SINCRONIZACION.md](./FLUJO_SINCRONIZACION.md) | Flujo de datos offline-first y sincronizacion con MongoDB Atlas |
| [DIAGRAMA_NAVEGACION.md](./DIAGRAMA_NAVEGACION.md) | Diagrama visual del flujo de navegacion |
| [MAPA_NAVEGACION.md](./MAPA_NAVEGACION.md) | Mapa de rutas y relaciones entre modulos |

### Testing

| Documento | Descripcion |
|-----------|-------------|
| [GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md) | Guia de testing funcional e integracion |

### Resumen

| Documento | Descripcion |
|-----------|-------------|
| [RESUMEN.md](./RESUMEN.md) | Resumen general del proyecto |

---

## Plan de Refactorizacion Activo

El plan de refactorizacion del modulo de Planeaciones esta en la raiz del proyecto:

**[plan_planeaciones.md](../plan_planeaciones.md)**

Cada modulo recibira su propio plan siguiendo el mismo patron de fases. El orden previsto:

1. Planeaciones (en progreso, Fase 2 completada)
2. Recursos didacticos
3. Grupos y alumnos
4. Login y autenticacion
5. Seguridad

Avance actual del modulo de Planeaciones:
- Fase 0 completada (limpieza legacy)
- Fase 1 completada (tipos V2 + migracion base)
- Fase 2 completada (capa de datos/sync con PlaneacionesContext)

---

## Stack Tecnologico

- React Native 0.81.5 + Expo 54 (Expo Go)
- TypeScript 5.9.2
- MongoDB Atlas M0 (cloud)
- AsyncStorage (local, offline-first)
- Vercel serverless (backend)
- React Navigation 7.x
- JWT auth con userId isolation

---

**Ultima actualizacion:** Mayo 2026
**Version:** 4.0
**Branch:** development
