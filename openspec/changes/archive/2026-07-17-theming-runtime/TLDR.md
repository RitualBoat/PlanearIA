# TLDR: propagar tema, fuente y daltonismo en runtime

## Proposal: por que hacemos este change

El docente cambia el tema, el tamano de letra o el modo daltonismo y espera que la app entera responda al instante. Hoy casi nada responde. No es que falte el interruptor: los cuatro contextos de preferencias existen y guardan bien. Lo que falta es que las pantallas los consuman. El plan decia que 18 pantallas ya eran reactivas, y es cierto, pero solo al tema: al revisar el codigo hoy, el daltonismo se aplica en **una** sola pantalla de 57, y la letra escala en tres archivos. O sea, dos de los tres criterios de aceptacion se cumplen practicamente en ningun lado. Este change construye la fundacion para arreglarlo de raiz.

## Design: como lo resolvemos

La causa es de contrato: el hook de tema entrega los colores sin el filtro de daltonismo, que vive aparte. Cada pantalla tiene que acordarse de combinar cuatro piezas en el orden correcto, y solo una lo hace. Creamos un hook unico que ya devuelve todo combinado: una llamada en vez de cuatro. No modificamos los contextos existentes, para no repintar 17 pantallas a ciegas sin evidencia visual. La fabrica de estilos recibe un objeto y no una lista de parametros, para que el proximo change pueda agregarle el ancho de pantalla sin volver a abrir cada archivo migrado. Regla del plan: tocar cada archivo una sola vez.

## Spec: que comportamiento queda garantizado

Una pantalla migrada refleja tema, letra y daltonismo al instante, sin reiniciar, y combinandolos entre si: daltonismo sobre tema oscuro, sin que uno anule al otro. Las preferencias guardadas se conservan y funcionan sin internet. Las pantallas todavia no migradas siguen exactamente igual: los colores estaticos siguen siendo un respaldo valido y nada se degrada. Migrar una pantalla cambia el mecanismo, no el aspecto: conserva sus estados de carga, vacio, error y sin conexion, sus etiquetas accesibles y su area de toque. Y el color estatico queda prohibido salvo en una lista explicita de archivos legacy, que la validacion del repositorio revisa en cada cambio.

## Tasks: plan de trabajo

Primero el hook compuesto y sus pruebas: que el daltonismo se aplique sobre el tema activo, que la letra escale y que los estilos no se recreen en cada render. Luego la regla de lint que prohibe el color estatico, con la lista de los 61 archivos legacy todavia autorizados; esa lista es tambien el rastreador del avance, porque solo puede encoger y CI la vigila. Despues el lote demostrativo: las tres pantallas de cuenta que faltan, mas ajustar la pantalla piloto a la firma nueva. Al final, typecheck, lint, tests, y QA visual real con capturas por breakpoint en claro, oscuro, con daltonismo y con letra grande.

## Resumen integral del change

Este change no redisena nada ni migra la app entera: establece la fundacion de theming que desbloquea los demas issues de la Ola 0. Deja tres cosas. Un punto de consumo unico que entrega las preferencias ya combinadas, para que migrar una pantalla sea trivial y sea dificil equivocarse. Un lote demostrativo que cierra el modulo de cuenta completo, con evidencia visual propia. Y un rastreador honesto del rollout pendiente: la lista del lint, que hoy son 61 archivos y solo puede bajar, verificada por CI en cada PR. Lo que no cambia importa igual: las pantallas legacy, los contextos, las preferencias guardadas y las claves de almacenamiento quedan intactas.
