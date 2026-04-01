# Prompt Figma - Task 3.1.2.1 Editar Alumno

## Contexto

Disenar el flujo de edicion de alumno en PlanearIA reutilizando la base visual de CrearAlumnoScreen.
Debe sentirse como una extension natural del modulo Alumnos ya implementado.

## Objetivo

Definir una experiencia clara para editar un alumno existente con datos precargados y guardado de cambios.

## Pantallas a disenar

1. DetalleAlumnoScreen con accion "Editar alumno"
2. CrearAlumnoScreen en modo "editar" (reutilizada)
3. Estado de exito/error tras guardar cambios

## Requisitos UX

- Los campos deben iniciar con valores existentes del alumno
- El titulo en modo edicion: "Editar alumno"
- CTA principal: "Guardar cambios"
- Boton secundario: "Cancelar"
- Al guardar exitosamente, regresar a DetalleAlumnoScreen
- Si hay error al guardar, mostrar mensaje claro

## Campos del formulario (mismo esquema de creacion)

- Nombre \*
- Apellidos \*
- Numero de control \*
- Carrera \* (ISC, IGE, ARQ, ITICS)
- Escuela
- Especialidad
- Email (validacion de formato)
- Telefono

## Estados visuales

- Carga inicial de datos
- Formulario editable con datos precargados
- Error por campo
- Guardando (loading en boton)
- Exito con confirmacion breve

## Lineamientos visuales

- Mantener paleta y tipografia actual del modulo
- Misma estructura de card de formulario
- Mantener jerarquia de labels y errores
- Contraste AA en textos y errores

## Entregables

- Frame mobile del flujo completo (detalle -> editar -> guardar)
- Variante tablet/desktop responsiva
- Componentes reutilizables (input, chips de carrera, footer de acciones)
- Prototipo clickable con transiciones de guardado/cancelacion

## Criterios de aceptacion mapeados

- Datos pre-cargados
- Boton "Guardar cambios"
