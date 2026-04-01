# Prompt Figma - Task 3.2.2.1 Estadisticas de alumno

## Objetivo

Disenar la pantalla de estadisticas de alumno para PlanearIA (mobile-first), enfocada en lectura rapida de rendimiento academico y comparativa contra su grupo.

## Contexto funcional

- Modulo: Alumnos
- Story: 3.2.2 Ver estadisticas de alumno
- Usuarios: Docentes mexicanos
- Entrada al flujo: desde DetalleAlumnoScreen o ReportesAlumnoScreen
- Fuente de datos prevista: servicio de estadisticas de alumno + datos del grupo

## Requisitos de UI (obligatorios)

- Encabezado con:
  - Titulo: "Estadisticas del alumno"
  - Nombre del alumno y grupo
  - Accion de regreso
- Bloque KPI principal (cards):
  - Promedio general del alumno
  - Asistencia
  - Entregas a tiempo
  - No entregadas
- Grafica de promedio por periodo (linea o barras)
- Grafica o bloque de distribucion de entregas
- Comparativa con promedio del grupo:
  - Diferencia (alumno vs grupo)
  - Indicador visual (arriba, igual, abajo)
- Selector de periodo:
  - Semana
  - Mes
  - Bimestre
  - Personalizado
- Estado vacio (sin datos)
- Estado de carga
- Estado de error con CTA de reintento

## Lineamientos visuales

- Mantener lenguaje actual de PlanearIA:
  - Fondo claro
  - Cards blancas con borde suave
  - Azul institucional para acciones
- Jerarquia tipografica clara:
  - Valor principal muy visible
  - Metadatos y notas con menor contraste
- Accesibilidad:
  - Contraste AA
  - Tap targets >= 44px
  - Textos legibles en mobile y web

## Componentes sugeridos

- PeriodChipGroup (selector de periodo)
- StatCard (reutilizable)
- TrendChartCard (promedio por periodo)
- DeliveryDistributionCard
- GroupComparisonCard
- EmptyState / LoadingState / ErrorState

## Entregables esperados en Figma

- Frame mobile principal (con datos)
- Variante desktop/web
- Variantes de estado:
  - Loading
  - Empty
  - Error
  - Success con comparativa
- Prototipo navegable:
  - Cambio de periodo
  - Ir y volver desde detalle de alumno

## Criterios de aceptacion del diseno (mapeo con roadmap)

- Incluye grafica de promedio por periodo
- Muestra indices de asistencia y entregas
- Incluye comparativa visual con promedio del grupo

## Nota para implementacion posterior

Una vez que compartas capturas del diseno final, se implementara la pantalla + flujo completo respetando 1:1 los estados, layout y componentes definidos.
