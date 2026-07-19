# Evidencia: assign-sheet (#84)

Corrida del 2026-07-19. QA visual nivel **N3** (el change toca la ruta `AsignarRecurso`, que GJ2 lista entre las suyas).

## Entorno

- `expo start --web` en el puerto 8083. **HTTP 200 confirmado antes de navegar**: `status=200`, `0.008 s`. Se uso 8083 porque 8081 y 8082 podian tener servidores previos y hacer QA contra un build ajeno invalidaria la evidencia.
- Navegacion con Playwright MCP. Clics reales sobre el DOM; ningun evento sintetico.
- Sesion de invitado (sin backend). Datos locales sembrados a proposito para poder ejercitar la cascada completa: 2 clases, 2 unidades de la clase 1, 1 actividad de la clase 1 y 2 recursos. Sembrar datos no simula la funcion: la asignacion, el encolado y el resultado son los reales del producto.

## Medicion por breakpoint

Medicion DOM real (`getBoundingClientRect`), no lectura de captura.

| Ancho | Desborde horizontal | Alto minimo de opcion | Forma del panel | Opciones visibles |
| --- | --- | --- | --- | --- |
| 375 | no (`scrollWidth == 375`) | 44 px | hoja inferior | 2 clases |
| 767 | no | 44 px | hoja inferior | 2 clases |
| 768 | no | 44 px | hoja inferior | 2 clases |
| 1279 | no | 44 px | hoja inferior | 2 clases |
| 1280 | no | 44 px | hoja inferior | 2 clases |

En los cinco anchos: cero desborde horizontal, area tactil de 44 px por opcion cumplida por altura propia (no por `hitSlop`), y la hoja completa dentro del viewport.

## Journeys cubiertos

- **GJ0 `arranque-y-alcance-del-shell`** (obligatorio en todo nivel): recorrido y capturado en los cinco anchos. Sin regresion: una sola superficie de navegacion primaria, shell alcanzable.
- **GJ2 `crear-planeacion-y-asignarla`** (estado `parcial`): se cubre **el paso de asignacion**, que es lo que este change toca. Capturado en los cinco anchos.
  - **No se reclama GJ2 completo.** Su delta declara dos changes duenos, `crear-tipo-primero` + `assign-sheet`; este entrega el segundo. El criterio "Crear parte del tipo de documento, no del modulo" sigue pendiente y GJ2 permanece `parcial`.

## Recorrido funcional verificado en navegador

Cadena completa sobre el boton que antes estaba muerto:

1. Office -> Recursos didacticos -> Ver todos mis recursos -> menu del recurso "Guia de fracciones".
2. El menu ya dice **"Asignar a clase"**; antes decia "Asignar a entregable" y abria un `Alert` "Proximamente".
3. La hoja abre con la cascada real: CLASE (2do A, 3ro B) -> UNIDAD (Unidad 1, Unidad 2) -> ACTIVIDAD (Ejercicios de fracciones), las dos ultimas marcadas como opcionales.
4. Con destino elegido, el pie muestra "Destino: 2do A - Unidad 1: Fracciones" y el boton de confirmar se habilita.
5. Al confirmar, el resultado dice **"1 elemento asignado a 2do A - Unidad 1: Fracciones."** y, por ser sesion sin sincronizacion, **"Guardado en este dispositivo. Se asignara en el servidor cuando vuelva la conexion."**

**Verificacion del nucleo del change, leida del almacenamiento real del navegador:**

- El recurso quedo con `grupoId: 1` y `unidadId: "u1"`.
- Se creo la operacion en cola: `@planearia:pending_ops_v2_recursos` con `{"entity":"recursos","type":"update","endpoint":"/api/recursos","payload":{"id":101,...}}`.

Esa operacion en cola es exactamente lo que faltaba antes y lo que hacia desaparecer la asignacion en el pull siguiente.

Capturas: `capturas/assign-sheet-cascada-1280.png` y `capturas/assign-sheet-resultado-encolado-1280.png`.

## Accesibilidad verificada en el arbol real

- Cada opcion de destino expone `role="radio"`, `aria-label` con su nombre y **`aria-checked` explicito** (`false` -> `true` al elegir). RN Web no deriva `aria-checked` de `accessibilityState`; sin el prop la eleccion solo se comunicaria por color.
- Confirmar expone `aria-disabled="true"` mientras no hay clase elegida.
- Foco por **tabulacion real**: tras `Tab` el foco entra en la hoja (`Cerrar`) y sigue a las opciones (`2do A`), siempre dentro de `[aria-modal="true"]`, con anillo visible `rgb(22,118,210) 0 0 0 3px`.

## Checklist Nielsen

| Heuristica | Estado | Severidad |
| --- | --- | --- |
| Visibilidad del estado del sistema | El resultado distingue sincronizado de encolado | 0 |
| Correspondencia con el mundo real | "Clase", "Unidad", "Actividad"; sin jerga tecnica | 0 |
| Control y libertad | Cancelar y cerrar sin escribir; deseleccion por segundo toque | 0 |
| Consistencia | Vocabulario de sync heredado de #83, componentes de #82 | 0 |
| Prevencion de errores | Confirmar bloqueado sin destino; nada se escribe sin confirmar | 0 |
| Reconocer antes que recordar | El destino elegido se nombra completo antes de confirmar | 0 |
| Flexibilidad | Unidad y actividad opcionales: la ruta corta sigue siendo un toque | 0 |
| Diseno minimalista | Solo tres secciones; sin adornos | 0 |
| Recuperacion de errores | Error de carga con reintento sin cerrar la hoja | 0 |
| Ayuda y documentacion | Estado vacio explica y ofrece crear clase | 0 |
| **Forma del panel en tablet/escritorio** | Ver limitacion 1 | **1** |

Severidad Nielsen maxima: 1. Umbral de bloqueo 3. Sin heuristicas bloqueantes.

## Checklist anti-slop (1.9.3)

| Punto | Estado |
| --- | --- |
| Sin `COLORS` legacy ni hex fijos | OK, con guardarrail de prueba |
| Tipografia intencional desde tokens | OK (`typography.body`, `caption`, `subtitle`) |
| Micro-interaccion con proposito | OK: la seleccion cambia borde, fondo e icono, y el destino se recompone en texto |
| Estados de carga, vacio, error y offline disenados | OK, los cuatro |
| Sin animacion impuesta | OK: la entrada la sirve `Sheet`, con variante estatica bajo reduce-motion |
| Area tactil >= 44pt | OK, medido en los cinco anchos |
| Contraste y foco visibles | OK, anillo verificado en navegador |

## Consola

**132 errores, todos del mismo origen y ninguno de este change:** CORS del backend desplegado rechazando el origen `localhost` (`Access-Control-Allow-Origin` responde `https://planearai.com`) al pedir `/api/mensajes?tipo=conversaciones`. Es el polling de mensajes, ajeno a la capa de asignacion. Cero errores originados por la hoja, el ViewModel o el servicio.

## Limitaciones

**1. La forma responsiva del `Sheet` base es poco fiable en web (defecto heredado de #82, no introducido aqui).**

`Sheet` decide entre hoja inferior (movil) y dialogo centrado de 520 px (tablet/escritorio) leyendo `useBreakpoint()`. Medido: **al mismo ancho de 768 px, el shell renderiza su forma tablet (rail lateral) mientras la hoja renderiza su forma movil**. En una corrida temprana, con la pagina recien cargada a 1280, la hoja si aparecio como dialogo centrado; en las corridas posteriores a 768, 1279 y 1280 aparecio como hoja inferior. El mecanismo exacto no quedo determinado y no se investiga mas aqui porque el componente pertenece a `base-component-library` (#82) y abrirlo excede este change.

Impacto acotado: es forma visual, no funcion. En los cinco anchos no hay desborde, las areas tactiles cumplen 44 px, la cascada opera y el flujo se completa. Queda como seguimiento para el owner de `Sheet`.

**2. Los estados de sincronizacion autenticados no se verificaron en navegador.** La sesion de invitado deja la presentacion en "Guardado en este dispositivo" haga lo que haga la red, y el backend rechaza el origen `localhost` por CORS; no se crearon cuentas ni se usaron credenciales. El camino "sincronizado" (`syncOk === true`) queda cubierto de forma determinista por prueba unitaria, igual que la limitacion declarada en #83.

**3. La reconexion real no se ejercito en navegador.** Lo que si se verifico, que es lo que este change promete, es que **la operacion queda encolada** en `@planearia:pending_ops_v2_recursos`. Que la cola suba al reconectar es comportamiento del motor, sin cambios en este change (`src/sync` con diff vacio) y con su propia suite (`npm run test:sync`, 4 suites / 23 tests en verde).

**4. El estado vacio no tiene captura de navegador.** Esta cubierto por prueba de componente que verifica que se presenta y que su salida "Crear clase" dispara la navegacion. No se capturo porque exigia vaciar las clases y rehacer el recorrido; se declara en vez de omitirse.

## Revision adversarial previa a archive

Veredicto: **PASS CON HUECOS**. Sin blockers. **Dos majors encontrados y corregidos**, ambos invisibles para la suite en verde y para la QA visual, porque los dos requieren un estado que el recorrido feliz no produce.

**Major 1 (corregido): la hoja ofrecia actividad como destino de un entregable y la escritura la descartaba en silencio.** El nivel de actividad se apoya en `Recurso.tareaId`; `Tarea` no declara ese campo, asi que al asignar un entregable el `tareaId` elegido nunca se aplicaba. El docente podia elegir "Ejercicios de fracciones", leer "Destino: 2do A - Unidad 1 - Ejercicios de fracciones" en la confirmacion, y obtener una escritura sin esa actividad. Contradecia dos requisitos propios a la vez: que la confirmacion nombre el destino elegido y que elegir actividad deje el elemento referenciado a ella. Corregido con `admiteActividad`: el nivel solo se ofrece cuando **todos** los elementos son recursos, y desaparece con un entregable o una seleccion mixta. Dos pruebas nuevas.

**Major 2 (corregido): estado vacio falso durante el arranque.** `sinClases` se derivaba solo de `clases.length === 0`, pero `GruposContext` nace con `isLoading: true` y lista vacia. Un docente **con** clases veia "Aun no tienes clases" con su boton de crear mientras el contexto cargaba. Es la misma familia de defecto que cerro #83: afirmar algo falso con tono tranquilizador. Corregido consumiendo `isLoading` del contexto y sirviendo `Skeleton` mientras carga. Una prueba nueva.

**Minors declarados, no corregidos:**

1. La hoja se **desmonta** al cerrar (`recursoParaAsignar ? <AssignSheet/> : null`), asi que `Sheet` nunca anima su salida: `visible` no llega a pasar a `false`. Mantenerla montada exigiria conservar el ultimo elemento en estado solo para animar la salida; se prefiere la simplicidad, y bajo reduce-motion el comportamiento es identico.
2. `encolarActualizaciones` encola en serie y `queueEntityOperation` intenta un flush por elemento, asi que asignar N elementos dispara N flushes. Es el mismo patron que ya siguen los contextos de datos; optimizarlo aqui seria divergir de ellos.
3. Si `RecursosContext` estuviera aun cargando, la guardia de existencia haria reportar "no se asigno nada" en vez de escribir. Alcance real bajo: la hoja se abre desde una lista alimentada por ese mismo contexto, asi que en el flujo entregado ya esta cargado.

**Verificado ademas:** las pruebas de regresion **no son vacuas** (4 de 5 fallan contra la implementacion anterior); `src/sync/`, `backend/` y `package.json` tienen diff vacio; la firma publica de `grupoAsignacionesService` no cambio, asi que sus dos consumidores no tocados siguen compilando y ahora encolan.

## Validacion tecnica

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | verde |
| `npm run lint -- --quiet` | verde |
| `npm test -- --runInBand` | **115 suites / 810 tests** en verde (linea base 111/776) |
| `npm run test:sync -- --runInBand` | 4 suites / 23 tests en verde |
| `npm run test:classroom -- --runInBand` | 6 suites / 21 tests en verde |

Diff contra `development`: `src/sync/`, `backend/` y `package.json` **sin cambios**.

Las pruebas de regresion se verificaron **no vacuas**: contra la implementacion anterior del servicio, 4 de los 5 casos de `asignacionEncolada.test.ts` fallan.
