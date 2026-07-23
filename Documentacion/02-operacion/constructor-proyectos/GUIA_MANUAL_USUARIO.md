# Guía manual del usuario

> **Objetivo:** enumerar cada intervención humana de Etapa A, por qué existe y qué evidencia entregar.
> **No incluye:** entrevista de producto; Prompt 01 se instala inerte y solo se ejecuta en Ola 1.

## 1. Crear el repositorio

**Por qué es manual:** nombre, visibilidad, owner y licencia tienen consecuencias organizativas y legales.

**Acción:**

1. Crear un repositorio vacío.
2. Elegir visibilidad.
3. No añadir todavía framework o template de producto.
4. Clonar e inicializar Git si corresponde.

**Verificación:** `git rev-parse --show-toplevel` y `git status --short --branch`.

**Evidencia:** URL del repositorio, owner, visibilidad y salida Git sin secretos.

## 2. Aprobar paquete, versión y licencia

**Por qué es manual:** ejecutar código o conceder una licencia no debe inferirse.

**Acción:**

1. Abrir npm y GitHub Release del mismo tag.
2. Confirmar versión exacta `0.1.1`, provenance e integridad.
3. Comparar el SHA-256 publicado:
   `9a164870a923605b81c84d505a98e2f1d6eb85e34e40a3aa11e6b88d7cbcec22`.
4. Revisar MIT y notices.
5. Confirmar que npm y GitHub contienen el mismo tarball.

**Verificación:** hash coincide con release.

**Evidencia:** versión, SHA-256, URLs, provenance y decisión de licencia. No adjuntar credenciales.

## 3. Aprobar el plan de archivos

**Por qué es manual:** el constructor no puede apropiarse de contenido previo sin decisión.

**Acción:** revisar cada ruta, owner, operación, fuente y rollback mostrados por preflight.

**Verificación:** no hay colisiones sin resolver.

**Evidencia:** reporte de preflight redactado y decisión de adoptar, preservar o cambiar destino.

## 4. Resolver una ejecución parcial

**Por qué es manual:** una edición posterior puede pertenecer al usuario.

**Acción:** elegir `resume` o `rollback` para el journal exacto. No editar `state.json`.

**Verificación:** hashes y operaciones pendientes coinciden con el reporte.

**Evidencia:** ID de transacción, decisión, resultado y `sync --check`.

## 5. Autenticar GitHub CLI

**Por qué es manual:** OAuth y scopes implican identidad y autorización.

**Acción:**

1. Ejecutar el flujo oficial de `gh`.
2. Conceder solo scopes necesarios para repositorio/Project.
3. Revalidar la sesión.

**Verificación:** `gh auth status` y lectura del repositorio/Project. No copiar token.

**Evidencia:** cuenta, host y scopes resumidos sin secretos.

## 6. Aprobar Product OS remoto

**Por qué es manual:** crear labels, Project, estados e issues cambia estado compartido.

**Acción:**

1. Revisar `github-plan`.
2. Confirmar create/reuse/update/conflict.
3. Aprobar nombre del Project, labels, estados, campos, owner y estrategia de milestones.
4. Aplicar con la operación remota autorizada.

**Verificación:** volver a ejecutar dry-run; no deben quedar operaciones inesperadas.

**Evidencia:** URL del Project, IDs opacos devueltos por GitHub y diff final. No inventar IDs.

## 7. Definir estrategia y protección de ramas

**Por qué es manual:** una protección puede bloquear merges o afectar colaboradores.

**Acción:** decidir rama estable, rama de integración, PR requerido, checks, force push, deletion y
revisiones.

**Verificación:** consulta read-only de la API y PR de prueba si aplica.

**Evidencia:** JSON/captura de reglas sin token y decisión aprobada.

**Nota:** el upstream usa `main` protegida y tags `v*`; PlanearIA usa `development`. El constructor
parametriza la política y no copia ninguna de las dos.

## 8. Autorizar un smoke MCP autenticado

**Por qué es manual:** iniciar OAuth puede abrir navegador, reservar puertos y usar identidad.

**Acción:**

1. Ejecutarlo solo si una tarea lo necesita.
2. Usar un comando opt-in separado del doctor.
3. Elegir una operación read-only mínima.
4. Redactar la evidencia.

**Verificación:** servidor, config, startup, tools/list e identidad se reportan por separado.

**Evidencia:** timestamp/vigencia, hash de configuración, servidor y resultado redactado.

El doctor nunca autentica ni abre OAuth.

## 9. Aprobar costos, licencias y servicios

**Por qué es manual:** free tiers cambian y una herramienta puede enviar código/datos o generar cargos.

**Acción:** revisar costo máximo, licencia, datos enviados, retención, lock-in y salida.

**Verificación:** fuente oficial vigente y presupuesto.

**Evidencia:** owner, fecha, enlace oficial, decisión, límite de gasto y rollback.

Sin aprobación, la herramienta permanece inactiva o `SKIP`.

## 10. Promover CI advisory a blocking

**Por qué es manual:** un gate inestable paraliza el repositorio.

**Acción:** revisar historial, falsos positivos, duración y rollback; aprobar política.

**Verificación:** baseline verde estable y check con nombre fijo.

**Evidencia:** runs, decisión versionada y protección actualizada.

## 11. Revisar documentación y neutralidad

**Por qué es manual:** un test lexical no detecta todos los acoplamientos conceptuales.

**Acción:** revisar plan, Prompt 00, runbook, perfiles, costos y guía.

**Verificación:** no aparecen dominio docente, `userId`, MVVM, Expo, breakpoints, MongoDB, Vercel, offline,
sync o IA como defaults.

**Evidencia:** checklist firmado y hallazgos corregidos.

## 12. Autorizar el inicio de discovery

**Por qué es manual:** discovery cambia de etapa y comienza a definir el producto.

**Acción:** confirmar que Etapa A cumple DoD y aprobar una sesión separada para Prompt 01.

**Verificación:** doctor y sync sin `FAIL`, perfiles técnicos inactivos y Product OS listo.

**Evidencia:** comentario de aprobación en issue/Project.

No responder todavía preguntas de producto dentro del bootstrap.

## 13. Cuándo usar OpenSpec

| Acción | ¿Change OpenSpec? | Razón |
| --- | --- | --- |
| Clic OAuth/autenticación | No | Gate humano, no cambio versionado por sí mismo |
| Entrevista o aprobación verbal | No | Evidencia manual |
| Cambiar docs/código/config tras una decisión | Sí | Modifica el repositorio |
| Aplicar branch protection | No por el clic; sí para scripts/política versionada | Separar estado remoto de implementación |
| Activar un perfil técnico | Sí | Cambia dependencias/validaciones |

## 14. Checklist de entrega manual

- [ ] Repositorio y visibilidad aprobados.
- [ ] Paquete, hash y licencia verificados.
- [ ] Plan de archivos sin colisiones.
- [ ] GitHub auth/scopes comprobados sin tokens.
- [ ] Product OS aplicado o gate pendiente documentado.
- [ ] Protección de ramas verificada.
- [ ] Costos/licencias aprobados o herramientas inactivas.
- [ ] OAuth no ejecutado por doctor.
- [ ] Segundo run sin drift.
- [ ] Neutralidad revisada.
- [ ] Aprobación separada para comenzar discovery.
