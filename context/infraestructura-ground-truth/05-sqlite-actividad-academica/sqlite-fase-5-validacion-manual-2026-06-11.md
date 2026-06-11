# SQLite Fase 5 - Validacion manual final

> Fecha: 2026-06-11  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: aprobada manualmente por el usuario.

## Objetivo

Confirmar que las fases 1 a 4 no rompieron la experiencia actual antes de hacer limpieza controlada.

Importante: SQLite ya esta instalado y la infraestructura existe, pero el almacenamiento default de la app sigue protegido. No se deben borrar claves legacy todavia.

## Ruta de evidencia

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/02-capturas-despues/`

Ruta absoluta:

- `C:\Users\jarco\dev\PlanearIA\context\infraestructura-ground-truth\05-sqlite-actividad-academica\02-capturas-despues\`

## Validacion de app

Levanta la app:

```bash
npm run web
```

Luego captura:

| Archivo | Accion exacta |
| --- | --- |
| `19-app-classroom-home-fase5.png` | Entra a la app y ve a la pestana **Grupos**. Debe abrir Classroom Home. |
| `20-app-classroom-grupo-fase5.png` | Abre un grupo/curso desde Classroom Home. Debe abrir `ClassroomGroup`. |
| `21-app-classroom-trabajo-fase5.png` | En el grupo, entra a **Trabajo** o **Trabajo de clase**. Deben verse tareas/unidades o estado vacio. |
| `22-app-classroom-personas-fase5.png` | En el grupo, entra a **Personas**. Deben verse alumnos o estado vacio. |
| `23-app-detalle-grupo-fase5.png` | Abre **Detalle del Grupo** y confirma que carga alumnos/tareas/asistencia/calificaciones. |
| `24-app-reportes-grupo-fase5.png` | Abre **Reportes del Grupo**. Debe cargar metricas o estado vacio sin error. |
| `25-app-reportes-alumno-fase5.png` | Si hay alumnos, abre **Progreso del Alumno**. Si no hay alumnos, omite y anota "sin alumnos demo". |

## Validacion offline/sync

Si tienes forma rapida de simular offline:

1. Desactiva internet.
2. Crea o edita un dato academico pequeno si el flujo lo permite.
3. Reactiva internet.
4. Confirma que la app no crashea.

Capturas:

| Archivo | Accion exacta |
| --- | --- |
| `26-app-offline-operacion-fase5.png` | Pantalla despues de crear/editar algo offline, si aplica. |
| `27-app-online-recuperado-fase5.png` | Pantalla despues de reconectar, confirmando que la app sigue usable. |

Si no puedes simular esto rapido, deja nota: "No se simulo offline por alcance de demo; sync unitario paso en tests".

## Validacion de terminal

Ejecuta:

```bash
npm run typecheck
npm run test:classroom -- --runInBand
npm run test:sync -- --runInBand
npm run lint -- --quiet
```

Capturas:

| Archivo | Que debe verse |
| --- | --- |
| `28-terminal-typecheck-fase5.png` | `tsc --noEmit` sin errores. |
| `29-terminal-classroom-fase5.png` | `6 suites, 21 tests passed`. |
| `30-terminal-sync-fase5.png` | `4 suites, 22 tests passed`. |
| `31-terminal-lint-fase5.png` | ESLint sin errores. |

## Criterios para aprobar Fase 5

- Classroom Home abre.
- Classroom Group abre.
- Detalle del Grupo abre.
- Reportes de Grupo abre.
- Reporte de Alumno abre o se documenta que no hay alumnos demo.
- Las validaciones de terminal pasan.
- No se detectan duplicados visibles.
- No se perdieron datos visibles.
- No hay crashes al navegar entre pantallas academicas.

## Resultado

Validacion manual aprobada por el usuario el 2026-06-11.

Resultado reportado:

- Las pantallas siguen abriendo.
- Las validaciones manuales pasan.
- Se autoriza continuar a Fase 6.

## Siguiente fase

Se puede pasar a Fase 6:

- Mantener rollback una version.
- Decidir si se borra o no alguna clave legacy.
- Documentar cierre.

Recomendacion actual: no borrar claves legacy para la entrega academica; dejar SQLite como infraestructura demostrable y reversible.
