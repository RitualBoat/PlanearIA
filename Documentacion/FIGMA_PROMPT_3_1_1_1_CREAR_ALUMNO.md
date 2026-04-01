# Prompt Figma - Task 3.1.1.1 Crear Alumno

## Contexto

Diseñar la pantalla de creacion de alumno para PlanearIA (React Native + Expo), manteniendo el lenguaje visual actual de la app:

- Header limpio con titulo y subtitulo
- Tarjetas con bordes suaves
- Jerarquia tipografica clara
- Botones primario/secundario consistentes
- Enfoque mobile-first con adaptacion a web

## Objetivo del diseño

Crear una pantalla `CrearAlumnoScreen` enfocada en captura rapida y validada de datos academicos del alumno.

## Campos requeridos del formulario

- Nombre (texto, requerido)
- Apellidos (texto, requerido)
- Numero de control (texto, requerido)
- Carrera (selector, requerido) opciones: ISC, IGE, ARQ, ITICS
- Escuela (texto, opcional)
- Especialidad (texto, opcional)
- Email (texto, opcional, validacion de formato)
- Telefono (texto, opcional)

## Estructura visual solicitada

1. Header superior:

- Titulo: "Crear alumno"
- Subtitulo: "Registra un nuevo estudiante en tu grupo"
- Boton de regreso

2. Card principal de formulario:

- Inputs en una sola columna en mobile
- En web/tablet permitir 2 columnas para campos cortos
- Labels visibles y placeholders claros
- Ayuda contextual corta bajo campos opcionales

3. Validacion visual:

- Estado normal, foco y error por campo
- Mensaje de error debajo del campo requerido no valido
- Banner de error general si falla guardado

4. Acciones al pie:

- Boton secundario "Cancelar"
- Boton primario "Guardar alumno"
- Estado loading del boton primario: "Guardando..."

## Estados de pantalla a disenar

- Estado inicial vacio
- Estado con datos capturados
- Estado con errores de validacion
- Estado loading de guardado
- Estado de exito (toast o confirmacion inline)

## Reglas UX

- Los campos requeridos deben indicarse con asterisco
- Mostrar teclado adecuado por tipo (email, telefono)
- Mantener scroll estable con teclado abierto
- Distancia tactil minima recomendada en botones e inputs
- Contraste AA en textos y mensajes de error

## Entregables Figma esperados

- Frame mobile principal (iPhone 13/14 base)
- Variante tablet/desktop
- Componentes reutilizables (Input, Select, ErrorText, ActionButtons)
- Tokens basicos de color, radio, spacing y tipografia
- Prototipo con flujo Cancelar/Guardar y estados de error

## Notas para implementacion

- El diseño debe mapear 1:1 con `AlumnoFormData` y con los criterios de aceptacion de la tarea 3.1.1.1
- Evitar patrones visuales fuera de la identidad actual del modulo Grupos/Alumnos
