# Prompt Figma - Task 3.2.3.1 Notas personales de alumno

## Objetivo

Disenar la seccion de notas personales dentro del detalle de alumno en PlanearIA (mobile-first), para que docentes registren observaciones privadas, consulten historial y editen facilmente.

## Contexto funcional

- Modulo: Alumnos
- Story: 3.2.3 Agregar notas a alumno
- Usuarios: Docentes mexicanos
- Entrada al flujo: desde DetalleAlumnoScreen
- Fuente de datos prevista: interfaz ComentarioAlumno + persistencia local/sync
- Regla: las notas son privadas del docente y no visibles para alumnos

## Requisitos de UI (obligatorios)

- Encabezado con:
  - Titulo: "Notas personales"
  - Nombre del alumno y grupo
  - Accion de regreso
- Editor principal:
  - TextInput multilinea (minimo 4 lineas visibles)
  - Placeholder orientativo (ej. fortalezas, areas de mejora, acuerdos)
  - Contador de caracteres opcional
  - Boton "Guardar nota"
- Historial de notas:
  - Lista cronologica (mas reciente arriba)
  - Cada item muestra fecha/hora y contenido
  - Acciones por item: editar y eliminar (con confirmacion)
- Filtros/organizacion:
  - Tabs o chips: "Todas", "Recientes", "Importantes" (si aplica)
- Estados obligatorios:
  - Loading
  - Empty (sin notas)
  - Error (con CTA de reintento)
  - Success

## Lineamientos visuales

- Mantener lenguaje actual de PlanearIA:
  - Fondo claro
  - Cards blancas con borde suave
  - Azul institucional para acciones primarias
- Jerarquia tipografica:
  - Titulo y metadata claros
  - Fecha con menor contraste
- UX mobile-first:
  - Teclado no debe tapar acciones criticas
  - Tap targets >= 44px
  - Scroll fluido con teclado abierto
- Accesibilidad:
  - Contraste AA
  - Labels y estados legibles

## Componentes sugeridos

- NoteEditorCard
- SaveNoteButton
- NotesFilterChips
- NoteHistoryItem
- EmptyState / LoadingState / ErrorState
- ConfirmDeleteModal

## Entregables esperados en Figma

- Frame mobile principal (success)
- Variante desktop/web
- Variantes de estado:
  - Loading
  - Empty
  - Error
  - Success con historial
- Flujo prototipado:
  - Escribir nota -> guardar -> ver en historial
  - Editar nota existente
  - Eliminar nota con confirmacion

## Criterios de aceptacion del diseno (mapeo con roadmap)

- Incluye TextInput multilinea para notas
- Incluye boton guardar visible y claro
- Incluye historial de notas con fecha

## Nota para implementacion posterior

Cuando compartas capturas del diseno final, implementare pantalla y flujo respetando 1:1 layout, estados y componentes definidos.
