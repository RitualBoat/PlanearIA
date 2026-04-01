# Prompt Figma - Task 3.1.3.1 Lista de alumnos

## Objetivo
Disenar la pantalla de lista de alumnos para PlanearIA (mobile-first), priorizando rapidez de consulta y acciones contextuales.

## Contexto funcional
- Modulo: Alumnos
- Story: 3.1.3 Ver alumnos
- Usuarios: Docentes mexicanos
- Flujo principal:
  1. Entrar a "Mis alumnos"
  2. Buscar por nombre o numero de control
  3. Aplicar filtros por carrera, grupo y escuela
  4. Ejecutar accion por tarjeta: ver, editar, eliminar, copiar

## Requisitos de UI
- Encabezado con titulo "Lista de alumnos" y CTA "Nuevo"
- Campo de busqueda visible en la parte superior
- Contenedor de filtros (chips o selectores):
  - Carrera
  - Grupo
  - Escuela
- Lista tipo tarjetas (scroll vertical) con:
  - Nombre completo
  - Numero de control
  - Carrera
  - Grupo (si existe)
  - Escuela (si existe)
  - Estado del alumno
- Bloque de acciones por tarjeta:
  - Ver
  - Editar
  - Eliminar
  - Copiar
- Estado vacio con mensaje y CTA para crear alumno
- Estado de carga

## Lineamientos visuales
- Consistente con el lenguaje actual de PlanearIA:
  - Fondo claro
  - Tarjetas blancas con borde suave
  - Azul institucional para acciones primarias
- Jerarquia tipografica clara:
  - Titulo fuerte
  - Datos secundarios con menor contraste
- Mantener contraste AA y tap targets >= 44px

## Componentes sugeridos
- SearchBar con icono
- Chips de filtro con estado activo/inactivo
- Card de alumno reutilizable
- Menu de acciones rapido por tarjeta
- EmptyState reutilizable

## Entregables esperados
- Frame mobile principal (lista)
- Variantes:
  - Con datos
  - Sin resultados de busqueda
  - Estado vacio
  - Estado cargando
- Prototipo navegable (tap en tarjeta y acciones)

## Criterios de aceptacion del diseno
- Contiene busqueda, filtros y acciones por alumno
- Se distingue claramente informacion prioritaria de secundaria
- Es coherente con la navegacion y estilo de la app
