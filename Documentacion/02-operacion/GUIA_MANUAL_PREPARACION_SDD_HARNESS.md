# Guia Manual: Preparacion SDD y Harness Solo-Dev

> **Version:** 1.0
> **Fecha:** 2026-07-14
> **Plan:** `../01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`
> **Uso:** pasos que requieren al propietario de PlanearIA. El resto puede delegarse a Codex mediante issues y OpenSpec.

## 1. Que requiere al usuario y que puede hacer Codex

| Accion | Usuario | Codex |
| --- | --- | --- |
| Reconocer si cambios locales actuales deben conservarse | Decide | Inspecciona, separa, crea branch/commit o descarta solo con autorizacion |
| Autorizar scopes GitHub Projects | Completa login/device flow | Verifica scopes, crea y actualiza issues/Project |
| Configurar branch protection | Revisa/aprueba; puede hacerlo en UI | Puede configurarla por API despues de autorizacion explicita |
| Reparar OpenSpec/GitNexus/Graphify/doctor | No | Si, mediante changes OpenSpec |
| Elegir/aprobar frames Figma | Decide visualmente | Puede crear, ordenar, inspeccionar y registrar enlaces |
| Reclutar y entrevistar docentes | Si | Prepara guion, tareas y sintetiza notas anonimizadas |
| Decidir gasto o aceptar riesgo de dependencia | Aprueba opcion | Investiga opciones, implementa y valida |
| Implementar y revisar codigo | No obligatorio | Si, con agente implementador y revision independiente |

No compartas tokens, contrasenas, cookies, codigos de recuperacion ni datos reales de estudiantes en un issue, documento, captura o chat.

## 2. Paso manual inmediato: clasificar el working tree

> **Estado:** completado el 2026-07-14 en issues `#43` y `#48`. Esta seccion se conserva como procedimiento de recuperacion.

Durante la creacion del plan se detectaron cambios en archivos de producto. Mientras se redactaba, otro proceso creo commits locales sobre `development`, revirtio/reaplico trabajo previo y absorbio el archivo del plan dentro de un commit `react-doctor`. Codex no puede asumir si esos commits pertenecen al usuario, a otro agente o a trabajo desechable.

No hagas push de una cadena rota antes de completar esta clasificacion.

### Estado final verificado

La primera corrida sobre los commits locales rotos fallo con 29 suites/259 tests. Despues de preservar una branch de seguridad y realinear `development` con el revert verde `6dc6b98`, se repitieron las validaciones:

- TypeScript: pasa.
- ESLint: pasa.
- Backend smoke/aislamiento: pasa.
- Jest: 93 suites y 608 tests pasan.

Branches conservadas:

- `codex/safety-react-doctor-broken-20260714`: referencia local recuperable del historial roto; no empujar como producto.
- `codex/readiness-operativa-sdd`: branch limpia del plan, basada en `origin/development@6dc6b98`.

### 2.1 Inspeccion segura

Abre PowerShell y ejecuta:

```powershell
cd C:\Users\RitualBoatLaptop\Documents\Projects\PlanearIA
git status --short
git diff --stat
git diff --name-only
git log --oneline --decorate origin/development..development
git diff --stat origin/development..development
```

Estos comandos solo leen; no descartan nada.

### 2.2 Elige una respuesta

Responde a Codex con una de estas frases:

1. `Los cambios y commits son intencionales; inspeccionalos y ayudame a separarlos en branches/PRs por alcance.`
2. `No se de donde vienen; audita commits y diffs y explicame que hacen antes de tocar el historial.`
3. `No los quiero; primero crea evidencia/backup y proponme una estrategia segura antes de retirarlos.`

La opcion 2 es la mas segura cuando no estas seguro.

No ejecutes `git reset --hard`, `git clean`, rebase interactivo ni checkout destructivo. No reviertas el revert por intuicion. Si se necesita guardar WIP, pide a Codex crear referencias/branches de respaldo y presentar el mapa de commits antes de modificar el historial.

### 2.3 Resultado esperado

- Cada archivo modificado tiene un origen conocido.
- Cada commit local por delante de `origin/development` tiene un alcance conocido.
- El trabajo se conserva en una branch/commit o queda una autorizacion explicita para retirarlo.
- Los documentos de este plan quedan en un commit/PR documental separado de `react-doctor` y cambios de producto.
- El primer change de readiness no incluye diffs de producto ajenos.

## 3. Autorizar GitHub CLI para Projects

El token actual tiene `repo`, `workflow`, `read:org` y `gist`, pero no puede consultar Projects. GitHub documenta `gh auth refresh --scopes` para agregar permisos sin reemplazar los scopes existentes: [manual oficial de gh auth refresh](https://cli.github.com/manual/gh_auth_refresh).

### 3.1 Iniciar autorizacion

En PowerShell:

```powershell
cd C:\Users\RitualBoatLaptop\Documents\Projects\PlanearIA
gh auth refresh -h github.com -s read:project,project --clipboard
```

Que ocurrira:

1. GitHub CLI mostrara un codigo de un solo uso y, con `--clipboard`, intentara copiarlo.
2. Se abrira el navegador. Si no abre, entra manualmente a [GitHub Device Activation](https://github.com/login/device).
3. Pega el codigo de un solo uso.
4. Confirma que la cuenta mostrada sea `RitualBoat`.
5. Autoriza GitHub CLI.
6. Regresa a PowerShell y espera la confirmacion.

No pegues el token almacenado por `gh` en el chat. El codigo de dispositivo solo se usa en la pagina oficial durante esa sesion.

GitHub indica que `read:project` permite consultas y `project` permite consultas y mutaciones: [Projects API](https://docs.github.com/en/enterprise-cloud@latest/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects).

### 3.2 Verificar scopes

```powershell
gh auth status
```

Busca una linea de scopes que incluya:

```text
'project'
'read:project'
```

No es problema que conserve también `repo`, `workflow`, `read:org` y `gist`.

### 3.3 Verificar el Project

```powershell
gh project list --owner RitualBoat --limit 20
```

Debe aparecer `PlanearIA Product OS`.

Tambien puedes abrir [Projects de RitualBoat](https://github.com/users/RitualBoat/projects) en el navegador. No crees un Project duplicado si ya existe uno con ese nombre.

### 3.4 Si falla

- `missing required scopes`: repite el paso 3.1 y confirma ambos scopes.
- Cuenta incorrecta: ejecuta `gh auth status`, luego `gh auth switch` si tienes varias cuentas.
- El Project no aparece: abre la pagina de Projects y confirma que pertenece al usuario `RitualBoat`, no a otra organizacion.
- Error de red o browser: cierra la operacion y repite; no crees manualmente un token salvo que el flujo oficial sea imposible.

### 3.5 Que delegar despues

Cuando el comando funcione, escribe a Codex:

```text
GitHub Projects ya funciona. Crea el epic y la primera tanda de issues del
PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md, agregalos a PlanearIA Product OS,
pero no inicies propose/apply todavia.
```

Codex podra crear y enlazar issues sin que copies cuerpos manualmente.

## 4. Proteger la branch development

GitHub permite exigir pull requests, checks verdes, historial lineal y bloquear force push/borrado: [gestionar branches protegidas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches).

### 4.1 Antes de configurar

Abre [Actions de PlanearIA](https://github.com/RitualBoat/PlanearIA/actions) y confirma que existe una ejecucion reciente del workflow `CI`. GitHub solo permite seleccionar comodamente checks que se hayan reportado recientemente.

Los cuatro checks base actuales son:

- `TypeScript`
- `ESLint`
- `Jest`
- `Backend smoke`

No marques todavía `Harness parity (soft)` como requerido; primero debe retirarse su `continue-on-error`. React Doctor tambien permanece advisory durante esta fase.

### 4.2 Configuracion recomendada mediante la interfaz

1. Abre [Settings > Rules](https://github.com/RitualBoat/PlanearIA/settings/rules).
2. Selecciona crear un `Branch ruleset`. Si tu interfaz solo muestra la proteccion clasica, abre [Settings > Branches](https://github.com/RitualBoat/PlanearIA/settings/branches) y crea una branch protection rule.
3. Nombre: `development-protection`.
4. Enforcement status: `Active`.
5. Target branches: incluye por nombre exacto `development`.
6. Activa `Require a pull request before merging`.
7. No actives un numero obligatorio de aprobaciones. Eres el unico desarrollador.
8. Activa `Require status checks to pass before merging`.
9. Selecciona `TypeScript`, `ESLint`, `Jest` y `Backend smoke`.
10. Activa `Require branches to be up to date before merging`.
11. Activa `Require conversation resolution before merging`.
12. Activa `Require linear history` si el repositorio permite squash merge.
13. No permitas force pushes.
14. No permitas borrar la branch.
15. Guarda el ruleset.

Los required checks deben terminar en `success`, `skipped` o `neutral` antes del merge: [GitHub required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging).

### 4.3 Prueba controlada

Pide a Codex:

```text
Crea una branch codex/readiness-protection-smoke con un cambio documental minimo,
abre un PR hacia development y verifica que los cuatro checks requeridos aparecen.
No hagas merge hasta mostrarme el resultado.
```

Cuando el PR pase:

1. Comprueba que GitHub no permita merge mientras un check esté pendiente.
2. Comprueba que permita squash merge cuando los cuatro esten verdes.
3. Si existe la opcion `Do not allow bypassing`, activala despues de la prueba para que la regla tambien se aplique al propietario. Como propietario puedes editar el ruleset si un check se rompe, pero no debes usar bypass como flujo normal.

### 4.4 Verificacion por terminal

```powershell
gh api repos/RitualBoat/PlanearIA/branches/development/protection
```

Resultado esperado: JSON y codigo HTTP 200. Un 404 significa que la regla no existe, no aplica a esa branch o el token no puede verla.

### 4.5 Si el PR queda bloqueado en Pending

Revisa [Troubleshooting required status checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks). La causa habitual es exigir un workflow que se omite por filtros de paths. Los cuatro jobs base de `ci.yml` se ejecutan en todos los PR hacia `development`, por eso son la primera proteccion recomendada.

## 5. Aprobar y registrar ground truth Figma

La autenticacion MCP de Figma ya fue configurada anteriormente. Lo que falta no es login: falta seleccionar el archivo y declarar frames aprobados.

### 5.1 Preparar el archivo

1. Abre Figma.
2. Crea o elige un archivo Figma Design dedicado a PlanearIA.
3. Usa paginas separadas, por ejemplo:
   - `00 Foundations`
   - `01 Shell`
   - `02 Escritorio-Crear`
   - `03 Office`
   - `Archive`
4. Usa datos ficticios. No pegues nombres, calificaciones, mensajes ni escuelas reales.
5. Para cada pantalla crea frames top-level con nombres consistentes:

```text
GT/Ola2/Escritorio/Web-1440/v1
GT/Ola2/Escritorio/Tablet-1024/v1
GT/Ola2/Escritorio/Mobile-390/v1
GT/Ola2/Crear/Mobile-390/v1
```

### 5.2 Copiar un enlace exacto a frame

1. Selecciona el frame top-level en el canvas o Layers.
2. Haz clic derecho.
3. Selecciona `Copy/Paste as > Copy link`; alternativamente, con el frame seleccionado abre `Share` y usa `Copy link`.
4. Comprueba que la URL contiene `node-id=`.

Figma confirma que, cuando hay un frame seleccionado, el enlace copiado abre ese frame: [compartir archivos y prototipos](https://help.figma.com/hc/es-419/articles/360040531773-Compartir-archivos-y-prototipos). Tambien documenta el formato de file key y node ID: [guia de URLs de Figma](https://help.figma.com/hc/en-us/articles/1500005554982.html).

### 5.3 Permisos

- Si solo Codex y tu cuenta necesitan acceso, conserva el archivo privado y confirma que el MCP usa esa cuenta.
- Para entrevistas remotas, crea un prototype link que los participantes puedan abrir.
- Si eliges `Anyone with the link`, usa exclusivamente datos sinteticos.
- Da `can view`, no `can edit`, a participantes.

### 5.4 Crear enlace del prototipo

1. Conecta los frames en Prototype mode.
2. Define un starting point.
3. Haz clic en `Present`.
4. Recorre Escritorio -> Crear sin usar el editor.
5. En presentation view, elige `Share prototype`.
6. Ajusta audiencia y permisos.
7. Pulsa `Copy link`.

### 5.5 Entregar enlaces a Codex

Envia un mensaje como:

```text
Estos son los frames Figma aprobados para ground truth:
- Escritorio web: <link>
- Escritorio tablet: <link>
- Escritorio movil: <link>
- Crear movil: <link>
- Prototipo navegable: <link>

Registra file key, node IDs, breakpoint, version y estado aprobado en context/, sin copiar datos sensibles.
```

Codex puede inspeccionar los frames, crear el indice versionado y señalar enlaces inaccesibles.

### 5.6 Estado de aprobacion

Usa solo tres estados:

- `draft`: exploracion; no implementar paridad alta.
- `approved`: ground truth consumible por un change.
- `obsolete`: conservar historial, no usar para nuevas implementaciones.

## 6. Reclutar y entrevistar docentes

No necesitas hacerlo ahora. Debe quedar calendarizado antes de implementar/cerrar UX/UI Ola 2.

### 6.1 Seleccion

Busca 3-5 docentes y procura incluir:

- al menos una persona con conectividad deficiente;
- una persona que ya use IA;
- una persona con baja confianza digital;
- variedad entre telefono, tablet y computadora cuando sea posible.

Evita reclutar solo amistades expertas en tecnologia.

### 6.2 Invitacion sugerida

```text
Estoy evaluando un prototipo de una herramienta para docentes. La sesion dura aproximadamente
30-40 minutos. No evaluamos tus habilidades; evaluamos si el diseño se entiende. No necesitamos
datos de estudiantes ni de tu escuela. Puedes detenerte en cualquier momento. ¿Te interesa participar?
```

### 6.3 Antes de cada sesion

1. Confirma consentimiento para tomar notas.
2. Si grabaras pantalla/voz, pide permiso separado.
3. Abre el prototype link en el dispositivo real.
4. Cierra Figma editor, notificaciones, chats y cualquier contenido privado.
5. Prepara cronometro y una copia de la plantilla de notas.
6. Usa el guion de `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`.

### 6.4 Durante la sesion

- No expliques la interfaz antes de la primera tarea.
- Pide que piense en voz alta.
- Registra éxito, dudas, retrocesos, clics equivocados y lenguaje usado.
- Pregunta qué esperaba que ocurriera, no qué color prefiere.
- No conviertas una sugerencia individual en requisito inmediatamente.

### 6.5 Datos minimos por tarea

```text
Participante anonimo: P1
Perfil: conectividad baja / usa IA / tradicional
Dispositivo:
Tarea:
Exito: si / parcial / no
Tiempo aproximado:
Retrocesos o errores:
Frase textual no sensible:
Severidad observada: 0-4
Decision propuesta:
```

### 6.6 Entregar resultados a Codex

Elimina nombres, escuelas, correos, teléfonos y cualquier dato de estudiantes. Luego pide:

```text
Sintetiza estas entrevistas anonimizadas contra IHC_DISCOVERY_DOCENTE.md.
Separa patrones repetidos, observaciones individuales y decisiones aun no justificadas.
Propone ajustes al backlog de Ola 2/3, pero no los implementes.
```

## 7. Decisiones manuales que se pediran mas adelante

### 7.1 Graphify

Codex investigara si repararlo es barato y estable. Solo deberas aprobar una de dos opciones:

- mantenerlo como auditoria periodica opcional;
- retirarlo del MCP activo y conservar GitNexus + CodeGraph.

No necesitas instalarlo manualmente antes del issue correspondiente.

### 7.2 Riesgo xlsx

Codex presentara como minimo:

- mantener con limites y sandboxing posible;
- migrar a otra libreria compatible;
- mover el procesamiento a otra frontera;
- aceptar riesgo temporal con owner y fecha.

Tu intervencion sera elegir la opcion si cambia costo, compatibilidad o experiencia de importacion. No aceptes una sustitucion solo porque `npm audit` lo sugiere; debe validarse con archivos docentes reales anonimizados/sinteticos.

### 7.3 Actualizacion Expo

No ejecutes `npm update` general ni migres directamente al SDK mas reciente. Expo recomienda actualizar un SDK a la vez y alinear dependencias con `npx expo install --fix`: [guia oficial de upgrade Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

## 8. Como pedir a Codex que ejecute el plan

### 8.1 Crear issues, sin implementar

```text
Lee PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md.
Crea el epic, los Gates M y los issues de Ola 0 en PlanearIA Product OS.
Conserva los titulos, criterios, labels y dependencias. No ejecutes enrich/propose/apply todavia.
Devuelveme la tabla issue -> URL -> milestone -> estado.
```

### 8.2 Ejecutar un issue completo

```text
Ejecuta el issue #NUMERO siguiendo el flujo PlanearIA:
enrich-us -> revisar conmigo solo si surge una decision material -> OpenSpec propose ->
revisar artifacts -> apply -> validacion -> adversarial review -> PR.
No archives ni hagas merge si falta evidencia o intervencion manual.
```

### 8.3 Revisar con otro agente

```text
Revisa adversarialmente el PR/change <nombre> como agente independiente.
Prioriza regresiones, seguridad, drift del harness, instrucciones contradictorias,
falsos verdes y evidencia faltante. No implementes cambios hasta reportar hallazgos.
```

### 8.4 Continuar automaticamente

No pidas `resuelve todo el plan` en una sola ejecucion. Usa:

```text
Resuelve el siguiente issue desbloqueado del plan. Detente al abrir el PR o si necesitas
autorizacion externa/decision de producto. No abras otro change OpenSpec en paralelo.
```

Esto permite continuar durante sesiones largas sin mezclar alcance ni ocultar puntos de decision.

## 9. Checklist del usuario

- [x] Declaro el origen DeepSeek/Claude de los cambios locales.
- [x] Autorizo scope `project` para GitHub CLI.
- [x] Se verifico `PlanearIA Product OS` con `gh project list`.
- [ ] Configure o autorice branch protection de `development`.
- [ ] Apruebe el archivo/frames Figma antes de UX/UI Ola 2 (diferido por ahora).
- [ ] Reclute 3-5 docentes antes del gate IHC (futuro, tras prototipo).
- [ ] Apruebe decisiones futuras de costo/riesgo cuando Codex presente alternativas.

Todo lo demas puede ejecutarlo Codex mediante los issues y changes definidos en el plan maestro.
