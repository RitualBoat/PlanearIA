## Intención de la propuesta

El change evita que una spec nueva borre compatibilidad existente por no registrar el estado brownfield de la superficie que cambia. Cada change futuro tendrá un baseline corto y trazable antes de implementarse.

## Enfoque de diseño

Se crea un Markdown raíz con ocho secciones fijas y se comprueba dentro del gate read-only de archive. La guía identifica los owners de las primeras fundaciones UX sin mover datos de otros contextos.

## Comportamiento esperado de las specs

Las specs exigen baseline solo para superficies tocadas, comparación vigente/objetivo, compatibilidad legacy y ownership explícito. El gate falla si falta el archivo o una sección, sin ejecutar contenido del Markdown.

## Plan práctico de las tareas

Se actualizarán reglas e instrucciones, el checker y sus fixtures, la tabla de owners UX y un ejemplo validable. Después se ejecutarán pruebas focalizadas, validaciones de OpenSpec y paridad del harness antes de revisión adversarial.

## Resumen integral del change

El resultado será una capa ligera de memoria brownfield por change: suficiente para preservar contratos y compatibilidad, sin convertir PlanearIA en un inventario documental ni aplicar una sola pantalla UX.
