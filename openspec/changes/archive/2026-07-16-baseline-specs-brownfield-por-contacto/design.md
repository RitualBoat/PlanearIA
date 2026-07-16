## Context

Issue #64 completa el hueco entre el enrich/DoR actual y la especificación de un change brownfield. El repositorio ya registra superficies, validaciones, evidencia, rollback y owners de dominio, pero no obliga a comparar el comportamiento actual con el objetivo de un change. Esto es especialmente riesgoso para las fundaciones UX: una navegación nueva no debe apropiarse de datos de Classroom u Office, y una migración de tema no debe retirar compatibilidad legacy sin declararlo.

La exploración confirmó que `openspec/config.yaml` guía los artefactos, `scripts/checkOpenSpecReadiness.mjs` aplica reglas deterministas al archive y el mapa DDD identifica Experiencia y Preferencias como contexto de tema, accesibilidad y navegación. GitNexus no pudo resolver este checkout; CodeGraph se utilizó como fallback para localizar el flujo de readiness. El change toca documentación y harness, no datos de producto.

## Goals / Non-Goals

**Goals:**

- Exigir un baseline Brownfield breve, revisable y localizado en la raíz de cada change nuevo.
- Conservar una comparación trazable entre fuentes actuales, comportamiento vigente, objetivo, compatibilidad legacy, owners y evidencia.
- Rechazar en el gate de archive un baseline faltante o incompleto sin ejecutar contenido procedente de Markdown o manifestos.
- Dejar una tabla inicial de owners para `theming-runtime`, `breakpoints-reactivos`, `tokens-completos` y `app-shell-navegacion`.

**Non-Goals:**

- Reescribir changes archivados ni inventariar todo el repositorio.
- Implementar UI, mover rutas, cambiar datos académicos, storage, sync, backend o IA.
- Crear un bounded context técnico nuevo, microservicios, CI bloqueante o dependencias externas.

## Bounded contexts and ownership

El contexto afectado es **Experiencia y Preferencias**, que posee tema, fuente, daltonismo y la composición de navegación. El harness OpenSpec es una capacidad operativa transversal y no posee entidades docentes. Este change no comparte ni mueve datos de dominio; por ello **no requiere contrato cruzado**.

La tabla de owners que se añadirá al plan UX/UI distingue explícitamente:

| Superficie futura | Contexto owner | Owner de spec / fuentes brownfield | Compatibilidad que debe declararse |
| --- | --- | --- | --- |
| `theming-runtime` | Experiencia y Preferencias | `ThemeContext`, `FontSizeContext`, `DaltonismoContext`, `src/themes/` | Uso legacy de `COLORS` mientras migra cada pantalla. |
| `breakpoints-reactivos` | Experiencia y Preferencias | `src/utils/responsive.ts`, consumidor de layout y futuro `useBreakpoint()` | Estilos congelados a nivel de módulo y rutas responsive actuales. |
| `tokens-completos` | Experiencia y Preferencias | `src/themes/` y primitives que consumen tokens | Tokens existentes y consumidores legacy que aún no migran. |
| `app-shell-navegacion` | Experiencia y Preferencias | `App.tsx`, `src/navigation/` y hubs de navegación | Rutas actuales siguen accesibles; Office, Classroom, Sync e IA son consumidores, no datos del shell. |

## Decisions

### 1. Un Markdown raíz fijo y no un inventario global

Cada change nuevo incluirá `brownfield-baseline.md` en su raíz. El archivo tendrá exactamente estas secciones no vacías: `Superficies tocadas`, `Fuentes de verdad actuales`, `Comportamiento vigente`, `Comportamiento objetivo`, `Compatibilidad legacy`, `Owner de spec y contexto`, `Evidencia actual` y `Fuera de alcance`.

El archivo enumera solamente rutas, símbolos, specs, pruebas, contratos y estados que el change va a tocar. No es una copia de `MAPA_MODULOS_ACTUALES.md` ni de los documentos de arquitectura.

Alternativas consideradas:

- Añadir campos de texto libre a `readiness.json`: descartado porque dificulta la revisión humana y mezcla estado de cierre con el análisis brownfield.
- Mantener una página de baseline única: descartado porque se desactualiza y fuerza inventario global.
- Inferir el baseline del diff al archive: descartado porque llega tarde para revisar las decisiones de spec.

### 2. Validación estructural segura dentro del gate existente

`checkOpenSpecReadiness.mjs` validará el nombre confinado del archivo, los encabezados requeridos y contenido significativo. No interpretará enlaces, bloques de código ni campos del baseline como comandos. Sus tests cubrirán baseline válido, archivo ausente y sección vacía/incompleta.

Se extiende el gate existente en vez de crear otro comando: el archive ya es el punto de control que conoce el directorio del change, sus tareas, la matriz de superficies y la evidencia. El contrato se propagará a las instrucciones fuente y al parche de workflows OpenSpec para que se pida en propose y sobreviva a actualizaciones de la CLI.

### 3. Aplicación prospectiva y ejemplo verificable

La obligación aplica a changes creados después de integrar este change; los archivados no se reescriben. El propio change contendrá un baseline documental de `docs`/`harness` y una plantilla con ejemplo de `theming-runtime`. La forma y los escenarios se validarán con OpenSpec estricto y fixtures del checker, sin abrir ni aplicar el change UX representado.

### 4. Ownership UX sin transferir datos de producto

El proceso hará que una spec UX declare el contexto y owner de su superficie, sus consumidores y la compatibilidad que conserva. La tabla inicial no cambia el owner de Planeación, Classroom, Sync, Auth o IA: AppShell solo orquesta entradas y referencias. Si un cambio futuro consume datos de otro contexto, su `design.md` seguirá declarando el contrato cruzado proporcional definido por el mapa DDD.

## Baseline template

```markdown
# Baseline brownfield: <change>

## Superficies tocadas
## Fuentes de verdad actuales
## Comportamiento vigente
## Comportamiento objetivo
## Compatibilidad legacy
## Owner de spec y contexto
## Evidencia actual
## Fuera de alcance
```

Cada sección contiene hechos verificables y referencias; `Compatibilidad legacy` permite declarar `No aplica` solo con una razón concreta. El template no contiene comandos ejecutables.

## Risks / Trade-offs

- [Baseline se vuelve burocracia] → El gate exige solo ocho secciones enfocadas y una exclusión explícita; no pide inventario ni diagramas globales.
- [Markdown con texto vacío o ambiguo] → El checker exige encabezados y contenido, mientras la revisión de spec conserva la evaluación cualitativa.
- [Una tabla UX se interpreta como ownership de datos] → La tabla separa owner de superficie de consumidores y remite al mapa DDD para cualquier dato compartido.
- [Regresión al actualizar OpenSpec] → El cambio se incorpora al parche idempotente y se comprueba con el check de paridad/workflows.
- [Falso sentido de seguridad] → El baseline prepara la revisión; no sustituye tests, QA visual, revisión adversarial ni evidencia de archive.

## Migration Plan

1. Añadir el contrato y template a las instrucciones fuente, configuración y documentación de planificación; regenerar los espejos autorizados.
2. Implementar la validación confinada del baseline en el checker y sus fixtures positivos/negativos.
3. Registrar la tabla de owners UX y el ejemplo `theming-runtime` sin modificar sus archivos de producto.
4. Ejecutar validaciones proporcionales y dejar referencias reales en `readiness.json` antes de archive.
5. Tras integrar, los changes nuevos crean el baseline durante propose; los changes archivados permanecen intactos.

El rollback revierte en un commit aislado el template, las reglas, el checker, las fixtures y la tabla de owners; se regeneran los espejos si aplica. No hay datos, despliegues ni migraciones que restaurar.

## Open Questions

Ninguna bloqueante. La revisión durante apply confirmará la ubicación documental de la tabla/plantilla para evitar duplicar una guía existente, manteniendo este contrato como única fuente operativa.
