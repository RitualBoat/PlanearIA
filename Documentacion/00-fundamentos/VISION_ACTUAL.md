# Vision de Producto: PlanearIA

## Filosofia Principal: Un Solo Lugar Para Todo El Trabajo Docente

PlanearIA debe convertirse en una plataforma donde el profesor pueda hacer, conectar y asignar su trabajo diario sin brincar entre pestanas, aplicaciones, programas, carpetas, chats y archivos sueltos.

La meta no es tener muchos modulos separados. La meta es que todas las cargas de trabajo del docente vivan en un mismo flujo:

- Escribir planeaciones.
- Editar documentos.
- Manejar listas, asistencia y calificaciones.
- Crear materiales visuales.
- Organizar clases.
- Asignar trabajos.
- Revisar entregas.
- Hablar con otros docentes.
- Ver pendientes, reportes y calendario.

Todo debe sentirse familiar, como herramientas que el profesor ya conoce, pero conectado de forma nativa dentro de PlanearIA.

La regla central es **cero friccion**: si un docente crea algo, PlanearIA debe ayudarle a llevarlo al siguiente paso sin obligarlo a descargar, copiar, pegar, cambiar de app o buscar manualmente donde corresponde.

Ejemplo de la vision:

1. El docente crea o sube una planeacion.
2. La IA lee titulo, contenido, temas, fechas y actividades.
3. PlanearIA muestra una sugerencia sutil: "Parece que esta planeacion corresponde a Matematicas 2A, Unidad 3. Deseas asignarla?"
4. Si el docente acepta, se conecta con la clase.
5. La app detecta actividades, materiales y fechas dentro del documento.
6. PlanearIA sugiere crear las tareas, recursos y recordatorios correspondientes.
7. El docente confirma, ajusta o cancela. La IA nunca toma control sin permiso.

El resultado ideal es un flujo rapidisimo: crear, detectar, sugerir, asignar y dar seguimiento desde una sola app.

---

## Principios De Producto

### 1. Familiaridad Antes Que Novedad

PlanearIA no debe parecer una app educativa rara que obliga al docente a aprender otra forma de trabajar. Debe sentirse como:

- Office para documentos y hojas.
- Classroom para clases, alumnos, materiales y tareas.
- Canva/Genially para recursos visuales.
- WhatsApp para comunicacion docente.
- Un dashboard personal para calendario, pendientes y seguimiento.

La innovacion real esta en la conexion entre herramientas, no en inventar controles extranos.

### 2. Automatizacion Silenciosa, No Invasiva

La IA debe trabajar en segundo plano y aparecer solo cuando tenga una sugerencia util.

Debe poder:

- Leer documentos y detectar temas, grupos, fechas, actividades y materiales.
- Sugerir a que clase pertenece un recurso.
- Convertir una actividad redactada en una tarea asignable.
- Detectar alumnos, listas o calificaciones dentro de tablas.
- Proponer recordatorios y eventos.
- Sugerir rubricas, instrucciones, materiales o retroalimentacion.

Pero siempre debe pedir confirmacion. El docente sigue siendo quien decide.

### 3. Todo Se Puede Asignar

Cada objeto importante debe poder conectarse a una clase, unidad, alumno, actividad o fecha:

- Planeacion -> clase/unidad/sesion.
- Documento -> tarea/material.
- Hoja/lista -> alumnos/asistencia/calificaciones.
- Diseno visual -> material/actividad.
- Mensaje -> recurso compartido o colaboracion.
- Reporte -> grupo/alumno/ciclo.

Si algo se crea dentro de PlanearIA, debe tener un camino claro para usarse en el aula.

### 4. Offline-First Real

La app debe seguir funcionando aunque el internet falle. El docente debe poder trabajar en clase, carretera, casa o plantel sin red estable.

La sincronizacion debe ser visible pero tranquila:

- Guardado local inmediato.
- Cola de cambios pendiente.
- Sync automatico cuando vuelva la red.
- Avisos claros si el servidor no esta disponible.
- Sin perdida de trabajo.

### 5. Una App, Muchas Experiencias Conectadas

Las experiencias madre no deben sentirse como apps separadas pegadas a la fuerza. Deben compartir identidad visual, navegacion, busqueda, IA, sync, permisos y acciones.

La pregunta clave para cada pantalla es:

> Que quiere hacer el docente despues de esto y como PlanearIA puede acercarlo a ese paso?

---

## Experiencia 1: Inicio / Sistema Operativo Docente

El inicio debe ser el centro de trabajo diario del profesor.

Debe responder rapido:

- Que tengo hoy?
- Que clase sigue?
- Que tareas debo revisar?
- Que documentos deje a medias?
- Que no se ha sincronizado?
- Que estudiantes o grupos necesitan atencion?
- Que sugerencias inteligentes tengo pendientes?

No debe ser una landing page ni una pantalla decorativa. Debe ser un tablero util, vivo y accionable.

### Flujo deseado

- El docente abre PlanearIA.
- Ve pendientes, clases del dia, ultimos documentos y alertas.
- Puede continuar una planeacion, abrir una clase, revisar entregas o crear un recurso.
- La IA muestra sugerencias discretas, no invasivas.

---

## Experiencia 2: Office Docente (Word + Excel)

La experiencia Office unifica el trabajo documental y tabular del docente.

Incluye:

- Documentos tipo Word/Google Docs.
- Hojas y listas tipo Excel/Google Sheets.
- Plantillas.
- Importacion/exportacion.
- Tablas.
- Rubricas.
- Calificaciones.
- Asistencia.
- Listas libres.

La idea no es crear dos mundos separados, "Word" por un lado y "Excel" por otro. Para el docente, ambos forman parte del mismo trabajo de oficina escolar: redactar, organizar, tabular, calcular, imprimir, compartir y asignar.

### Ground truth conceptual

Para esta experiencia se pueden usar como referencia conceptual:

- Microsoft Word y Excel.
- Google Docs y Google Sheets.
- LibreOffice Writer y Calc.
- OnlyOffice.

Repos open source como LibreOffice pueden servir como ground truth conceptual de interfaz, flujos y comportamiento de suites Office. No se debe copiar codigo sin revisar licencia, stack y compatibilidad. La referencia sirve para entender patrones: documento, toolbar, ribbon, hojas, celdas, formulas, filtros, import/export y atajos.

### Flujo documental ideal

- El docente sube una plantilla o crea una planeacion.
- La abre en un editor que se siente como Word/Docs.
- Escribe, edita tablas, inserta secciones y usa IA cuando quiere.
- Al guardar, la IA detecta grupo, materia, unidad, fechas y actividades.
- PlanearIA sugiere asignarla a la clase correcta.

### Flujo tabular ideal

- El docente sube una lista de alumnos, asistencia o calificaciones.
- La app la abre como una hoja editable.
- La IA detecta columnas, nombres, grupos y posibles errores.
- PlanearIA pregunta si desea convertir esa hoja en alumnos, asistencia o calificaciones de una clase.
- Si el docente acepta, se sincroniza con Classroom.

### Automatizacion clave

El docente no deberia tener que pasar datos a mano entre documentos, listas y clases. La app debe reconocer estructura y sugerir conexiones.

---

## Experiencia 3: Classroom / Clases

Classroom es el espacio donde el docente organiza la vida de cada grupo.

Debe incluir:

- Cursos o grupos.
- Unidades.
- Sesiones.
- Materiales.
- Actividades.
- Entregas.
- Alumnos.
- Asistencia.
- Calificaciones.
- Comentarios y avisos.

La experiencia debe sentirse familiar para usuarios de Google Classroom o Classroomio, pero conectada con Office, Canva, WhatsApp, calendario y reportes.

### Flujo ideal

- El docente entra a una clase.
- Ve tablero, trabajo de clase, personas y seguimiento.
- Puede asignar un documento de Office, un recurso visual, un enlace o una actividad.
- Puede crear tareas desde cero o aceptar sugerencias detectadas por IA.
- Puede revisar entregas y calificar con ayuda de notas inteligentes.

### Classroom no debe crear todo

La clase organiza y asigna. La creacion profunda vive en herramientas especializadas:

- Office Docente crea documentos y hojas.
- Canva/Genially crea materiales visuales.
- WhatsApp comparte y comunica.
- Reportes analiza.

Pero Classroom debe poder recibir y usar todo eso sin friccion.

---

## Experiencia 4: Canva / Genially Docente

Esta experiencia permite crear recursos visuales sin salir de PlanearIA.

Debe servir para:

- Presentaciones.
- Examenes visuales.
- Mapas mentales.
- Lineas de tiempo.
- Infografias.
- Actividades.
- Materiales imprimibles.

No debe ser obligatoria para todos los docentes. Debe aparecer como una herramienta disponible cuando el profesor necesita crear algo visual.

### Flujo ideal

- El docente crea un recurso visual.
- Usa plantillas, bloques, paginas, capas y exportacion.
- La IA puede sugerir estructura, imagenes, actividades o conversion desde una planeacion.
- Al terminar, PlanearIA pregunta si quiere asignarlo a una clase, unidad o actividad.

La ventaja no es solo crear disenos. La ventaja es evitar el flujo externo de crear en Canva, descargar, buscar archivo y subirlo manualmente a Classroom.

---

## Experiencia 5: WhatsApp Docente / Comunidad Profesional

La comunicacion debe sentirse como WhatsApp profesional, no como red social pesada.

Debe permitir:

- Contactos docentes.
- Conversaciones.
- Envio de recursos.
- Envio de planeaciones.
- Solicitudes.
- Estados de envio.
- Busqueda.
- Notificaciones.

El feed publico o social puede existir mas adelante, pero no debe distraer del objetivo principal: colaboracion practica entre docentes.

### Flujo ideal

- Un docente encuentra o agrega a otro docente.
- Comparte una planeacion, recurso o idea.
- El receptor puede guardar ese recurso en su biblioteca o asignarlo a una clase.
- La conversacion queda conectada con los objetos reales de la app.

---

## Experiencia 6: Calendario Y Seguimiento Personal

El calendario debe ayudar al docente a saber que hacer y cuando hacerlo.

Debe conectar:

- Planeaciones.
- Sesiones.
- Actividades.
- Fechas de entrega.
- Recordatorios.
- Revision de tareas.
- Eventos escolares.

### Flujo ideal

- El docente consulta su semana.
- Ve clases, temas, tareas y pendientes.
- Puede abrir la clase, documento o actividad desde el calendario.
- La IA puede sugerir recordatorios derivados de planeaciones o actividades.

El calendario no debe ser una agenda aislada. Debe ser la vista temporal de todo lo que ya existe en PlanearIA.

---

## Experiencia 7: Reportes, Analitica Y Gamificacion

Los reportes deben ayudar al docente a entender como van sus grupos y alumnos sin saturar la experiencia diaria.

Debe mostrar:

- Rendimiento por grupo.
- Avance por unidad.
- Asistencia.
- Calificaciones.
- Entregas pendientes.
- Alumnos en riesgo.
- Recomendaciones de mejora.
- Resumen del ciclo.

La gamificacion debe usarse con cuidado. Debe motivar y orientar, no infantilizar al docente ni convertir la app en un juego sin sentido.

### Flujo ideal

- El docente revisa reportes al cierre de unidad, semana o ciclo.
- La app resume aciertos, riesgos y posibles acciones.
- La IA puede redactar observaciones, alertas o sugerencias, siempre revisables.

---

## Experiencia 8: Cuenta, Perfil, Configuracion Y Accesibilidad

Esta experiencia sostiene la confianza del usuario.

Debe cubrir:

- Perfil docente.
- Rol y permisos.
- Sesiones activas.
- Privacidad.
- Terminos.
- Preferencias.
- Tema.
- Tamano de fuente.
- Daltonismo.
- Accesibilidad.
- Modo dev/admin cuando aplique.

No debe ser una pantalla decorativa. Debe ser el lugar donde el docente entiende y controla su cuenta, seguridad, preferencias y comodidad visual.

---

## La IA Como Hilo Conductor

La IA de PlanearIA no debe ser un modulo aislado llamado "Asistente". Debe aparecer en el flujo correcto.

Ejemplos:

- En Office, detecta contenido y sugiere asignaciones.
- En Classroom, propone actividades, rubricas y recordatorios.
- En Canva, sugiere estructura visual.
- En WhatsApp, ayuda a redactar mensajes o resumir recursos.
- En Calendario, detecta pendientes.
- En Reportes, identifica patrones y riesgos.

La IA debe tener estas reglas:

- No reemplaza el criterio docente.
- No guarda cambios importantes sin confirmacion.
- No debe ser costosa por defecto.
- Debe tener fallback si no hay API key.
- Debe explicar que hizo y permitir deshacer o ajustar.

---

## Vision Final

PlanearIA debe sentirse como una suite docente completa:

- Office para crear y organizar.
- Classroom para asignar y dar seguimiento.
- Canva para disenar.
- WhatsApp para colaborar.
- Calendario para ubicarse.
- Reportes para mejorar.
- IA para conectar todo silenciosamente.

La experiencia ideal es que el profesor trabaje en un flujo continuo:

> Creo algo, PlanearIA entiende que es, me sugiere donde va, lo asigno, le doy seguimiento y obtengo reportes sin salir de la app.

Esa es la promesa: menos pestanas, menos archivos perdidos, menos captura duplicada y mas tiempo para ensenar.
