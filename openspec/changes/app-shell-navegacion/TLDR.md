# TLDR: app-shell-navegacion

## Que problema resolvemos (Proposal)

La app abre en un feed social en vez del escritorio del docente, y su navegacion es un stack plano de 60 rutas hermanas donde todo es vecino de todo. Encima hay dos navegaciones compitiendo: las tabs y un menu flotante que se superpone al contenido con botones demasiado pequenos. Y la navegacion es identica en telefono, tablet y escritorio, cuando el plan pide tabs, rail y barra lateral. Mientras siga asi, cada pantalla nueva nace colgada de esa estructura y hereda el acoplamiento. Este es el cambio que desbloquea la Ola 1 y, con ella, el Escritorio real.

## Como lo resolvemos (Design)

Un solo navegador de pestanas que cambia de sitio segun el ancho: barra abajo en telefono, rail lateral en tablet, barra lateral con textos en escritorio. Al haber una sola barra, es imposible que aparezcan dos a la vez, que es justo lo que exige Material Design. Las pantallas se agrupan en cinco hubs con memoria propia, y la raiz baja de 60 rutas a 9. El reparto no es a ojo: sale de analizar quien navega a que, porque React Navigation deja subir al padre pero nunca bajar a un hermano. El menu flotante desaparece y sus botones suben a la barra superior.

## Que cambia para el docente (Spec)

Al abrir la app aterriza en su Escritorio, no en un feed. En el telefono ve cinco pestanas abajo; en la tablet, un rail; en la computadora, una barra lateral con nombres, y al cambiar el tamano de la ventana la barra se transforma sin perder donde estaba. Cada experiencia recuerda su propio recorrido. Al guardar un grupo, tarea o recurso vuelve exactamente de donde salio. Las notificaciones, la ayuda y su cuenta viven arriba, sin taparle el trabajo, con botones comodos. Todo respeta tema oscuro, tamano de letra, daltonismo y reducir movimiento, y sigue funcionando sin conexion.

## Como lo hicimos (Tasks)

Siete bloques en orden. Primero se quito una colision de nombres y se congelo el inventario de rutas como evidencia. Luego se definio el contrato de navegacion tipado. Despues se construyo el shell adaptativo con su barra superior, y sobre el los cinco hubs con sus pantallas anidadas. Enseguida se migraron las llamadas: los nueve sitios que apuntaban a las pestanas viejas, las cuatro que cruzan de una experiencia a otra, y la eliminacion del parametro que recordaba el origen y del menu flotante. Cerraron las pruebas y la validacion visual por breakpoint con checklist de usabilidad.

## Resumen integral

Este cambio reemplaza la navegacion plana de PlanearIA por un shell adaptativo con cinco hubs por experiencia, y hace que la app abra en el Escritorio del docente. Resuelve dos decisiones que llevaban abiertas: el menu flotante se retira y sus funciones suben a la barra superior con tamanos accesibles, y la pantalla de notificaciones queda explicitamente fuera, en su propio cambio. Tambien elimina el parametro que cada formulario usaba para recordar de donde venia, porque con hubs anidados ya no hace falta. No redisena ninguna pantalla ni borra rutas: reagrupa lo que existe y deja el terreno listo para el Escritorio real de la Ola 2.
