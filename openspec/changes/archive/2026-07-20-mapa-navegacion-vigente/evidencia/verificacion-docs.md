# Verificacion documental - mapa-navegacion-vigente (#111)

Fecha: 2026-07-19. Rama: `docs/mapa-navegacion-vigente`. Base: `development@4755177`.

## 1. Coincidencia mapa <-> manifiesto de rutas

Comparacion bidireccional entre `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md` y
`src/navigation/routeManifest.ts`, ejecutada con un script de verificacion temporal
(`scratchpad/verificaMapa.mjs`, no versionado: es instrumento de verificacion, no artefacto del repo).

Cobertura declarada por el manifiesto y contrastada:

- 9 rutas raiz (`ROOT_ROUTES`).
- 54 rutas de hub (`HUB_ROUTES`, excluyendo las cinco claves de hub).
- 1 ruta solo-desarrollo (`DEV_ONLY_ROUTES`).
- 5 hubs (`InicioTab`, `OfficeTab`, `ClasesTab`, `AsistenteTab`, `MasTab`).

Resultado: **0 fallos**. Toda ruta del manifiesto aparece documentada en el mapa.

Direccion inversa: los unicos nombres con forma de ruta presentes en el mapa y ausentes del manifiesto son
`RootStackParamList` (nombre de tipo, no ruta) y `FloatingActionIcons` (componente retirado, citado
explicitamente como eliminado). Ninguno es una ruta inventada.

### Prueba de no vacuidad

El chequeo se valido con dos mutaciones de control, cada una revertida despues:

| Mutacion | Resultado esperado | Resultado obtenido |
| --- | --- | --- |
| Renombrar `HistorialAsistencia` en el mapa | FAIL: ruta del manifiesto ausente del mapa | `FAIL ruta del manifiesto ausente del mapa: HistorialAsistencia`, Fallos: 1 |
| Renombrar el hub `AsistenteTab` en el mapa | FAIL: hub ausente del mapa | Fallos: 1 |
| Restaurar el mapa original | 0 fallos | Fallos: 0 |

Sin estas mutaciones el resultado "0 fallos" no distinguiria un mapa correcto de un chequeo que no
comprueba nada.

## 2. Busqueda de tabs legacy como navegacion primaria

Comando:

```bash
grep -rn "FeedTab\|ContenidoTab\|GruposTab\|SocialTab\|ConfiguracionTab" Documentacion --include=*.md \
  | grep -v "99-archivo/\|03-validacion/"
```

Antes del change: `MAPA_NAVEGACION_ACTUAL.md` y `MAPA_MODULOS_ACTUALES.md` presentaban las cinco tabs como
navegacion primaria vigente en sendas tablas, y `PLAN_AUTH_SEGURIDAD_SESION_REAL.md:551-557` describia
cinco flujos autenticados a traves de `ConfiguracionTab`.

Despues del change quedan 15 ocurrencias, **ninguna** presentandolas como navegacion primaria vigente:

| Ubicacion | Naturaleza |
| --- | --- |
| `MAPA_MODULOS_ACTUALES.md:27` | Afirmacion negativa explicita: "ya no existen como navegacion primaria". |
| `MAPA_MODULOS_ACTUALES.md:87` | Deuda tachada y marcada como resuelta por D6. |
| `PLAN_AUTH_SEGURIDAD_SESION_REAL.md:552` | Nota de correccion que declara la sustitucion por `MasTab`. |
| `PLAN_UXUI_NAVEGACION_GLOBAL.md:45,50,124` | Registro de decisiones D1 y D6: describen las tabs como reemplazadas o disueltas. |
| `CAMBIOS_SYNC_OFFLINE_2026-06.md:108,122` | Registro de cambios fechado en junio 2026; historico por naturaleza. |
| `MAPA_NAVEGACION_ACTUAL.md:64,121,207-211` | Avisos de superficie legacy y tabla historica "Que paso con las tabs anteriores". |

## 3. Enlaces y rutas citadas

Verificacion de enlaces markdown relativos y rutas de repositorio citadas entre backticks en los cinco
archivos tocados (`scratchpad/verificaLinks.mjs`): **154 referencias comprobadas**.

Balance del change sobre referencias rotas:

- **Reparadas por este change (2):** `src/navigation/AppTabsNavigator.tsx` estaba citado como fuente de
  verdad en `MAPA_NAVEGACION_ACTUAL.md` y en `MAPA_MODULOS_ACTUALES.md`; el archivo no existe desde #81.
  Ambas citas se sustituyeron por `routeManifest.ts` y `AppShell.tsx`.
- **Introducidas deliberadamente (2):** `src/components/FloatingActionIcons.tsx` se cita en el mapa y en la
  resolucion de OQ2 dentro de frases que declaran su eliminacion (commit `2e5acfb`). Una referencia a un
  archivo borrado, en un texto que dice que fue borrado, es correcta.
- **Preexistentes y fuera de alcance (24 rutas unicas, todas en `PLAN_AUTH_SEGURIDAD_SESION_REAL.md`):**
  verificadas contra `git show HEAD` para confirmar que ya estaban rotas antes de este change. Incluyen
  `backend/api/*.js` (el backend usa `backend/routes/`), `src/hooks/useAuthGate.ts`,
  `src/services/auth/authTypes.ts`, `src/services/classroom/classroomRepositoryFactory.ts`,
  `backend/lib/roles.js`, `backend/lib/httpSecurity.js`, `backend/lib/databaseIndexes.js` y tres
  documentos de `context/infraestructura-ground-truth/`. Se derivan a issue propio: son deuda documental
  del plan de Auth, no de este change.

`PLAN_AUTH_SEGURIDAD_SESION_REAL.md` tambien citaba `src/navigation/AppTabsNavigator.tsx`; esa cita
pertenece a una seccion tecnica que este change no toca y queda incluida en la derivacion anterior.

## 4. Validaciones ejecutadas

| Validacion | Resultado |
| --- | --- |
| `npm run typecheck` (commit de referencia) | exit 0 |
| `openspec validate --all --strict --no-interactive` | 33 passed, 0 failed |
| `node scripts/checkOpenSpecTldr.mjs` | OK |
| `npm run agent:harness:check` | OK (36 mirrors in parity) |
| `git status` sobre `src/`, `backend/`, tests y configuracion | sin cambios |

## 5. Alcance final tocado

- `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md` (reescritura).
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md` (tabla de hubs, fuentes, deuda resuelta).
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (aviso de snapshot, 4 estados, OQ2, R4).
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` (milestone Ola 1 cerrado).
- `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` (seccion 7: nombres de ruta).

La quinta superficie no estaba en el alcance original ni en el propose. Se incorporo durante el apply
porque la verificacion 2 demostro que el criterio de aceptacion del issue era inalcanzable sin ella: el
documento presentaba `ConfiguracionTab` en cinco flujos autenticados vigentes. La correccion se limita a
nombres de ruta y anade una nota fechada; no altera flujos, decisiones ni alcance del plan de Auth.
