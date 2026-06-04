# Errores Actuales Objetivo

Este archivo esta dedicado para mostrar los errores actuales de la app mediante capturas de pantalla y descripciones para poder arreglarlos, una vez que el usuario identifique que se solucionaron, se debe hacer una limpieza en este documento y eliminar las imagenes relacionadas con dicho errror

## Errores

Aqui estan listados los errores encontrados

1. Pantalla de crear recurso esta mal tanto en web como movil, en movil la top bar esta desfasada o recortada el texto, y en web el scroll esta roto y ocupas hacer zoom out para ver todo el contenido, ademas, al dar click en un material ya creado, te manda directo a crear un recurso, esto no tiene sentido y deberia mandarte a una pantalla donde se ve tu recurso creado, ver si lo quieres eliminar o agregar mas cosas, no que te mande a crearlo otra vez, vease: C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\Classroomio\recurso (video en este ejemplo) dentro de contenido asignado en seccion introduccion.png
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\Classroomio\recurso documentos.png
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\Classroomio\recurso notas.png
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\Classroomio\recurso presentacion.png

2. En movil el tablon dentro de las clases esta desfasado o mal acomodado, esta achicado
3. La pantalla de bienvenida a el apartado classroom dentro de la app es legacy y no esta adaptado al nuevo diseño, me parece perfecto que muestre tus cursos/clases activas y que puedas agregar mas, tal vez solo alinear con el diseño que se ve dentro de las clases, de igual manera ver contexto ground truth de las referencias reales para ver como lo hace classroom y classroomio para que lo incorpores lo que mejor te parezca, vease:
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\classroom google\dashboard classroom.png
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\Classroomio\cursos.png
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\Classroomio\setting del curso.png (por si se quiere editar un curso)
   C:\Users\jarco\dev\PlanearIA\context\classroom-ground-truth\03-referencias-reales\classroom google\classroom calendario.png (como posible pestaña, podria tener 3 pestañas el home de classroom asi como las clases por dentro (tablon, trabajo en clase y personas), las cuales podrian ser cursos o clases, calendario y tal vez reportes (purgar legacy y ver forma de integrar de manera inteligente por pestañas (reportes generales de todos los cursos, reportes generales por clase/curso activo y reporte personal de alumnos)))
4. Si se puede abrir una actividad/crear seccion y asignarlo, eso esta perfecto pero manda a pantallas legacy que estan rotas como la pantalla legacy crear recurso, la manera de agregar trabajo debe ser lo mas parecido a classroomio y las capturas mencionadas en el punto 3 de este documento, centrarse en adaptar ese flujo y lo de crear recurso que sea un boton + y ahi si mandar a una pantalla de crear, pero que no te resiva directamente con la pantalla de crear cuando quieres agregar un recurso, intentar copiar/implementar las capturas mencionadas en el punto 3 lo mejor posible y asegurarse de que las rutas legacy tengan su propio rediseño acoplado al diseño actual de la app, se deben dejar las pantallas legacy basicamente olvidadas y reemplazadas por nuevas pantallas que lo hagan mejor para poder eliminarlas y quitarlas.
