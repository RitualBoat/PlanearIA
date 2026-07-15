# Evidencia - reparar GitNexus FTS

Fecha: 2026-07-14

## Alcance

- Issue: [#50 Reparar indexado y consultas estructurales de GitNexus](https://github.com/RitualBoat/PlanearIA/issues/50).
- Change OpenSpec: `reparar-gitnexus-fts`.
- Rama: `codex/reparar-gitnexus-fts`.
- Efecto permitido: indice local ignorado `.gitnexus/` y cache local de extensiones de LadybugDB. No se modificaron datos de producto, backend, sync, IA ni configuracion de agentes.

## Baseline observado

- Runtime: Node `v26.4.0` sobre Windows x64.
- GitNexus estable: `1.6.9`.
- El indice reporta el commit `dfcd32d` como actual, pero la query estructural de `useCrearPlaneacionViewModel` devuelve cero definiciones con `FTS indexes missing`.
- El impact por UID funciona y devuelve `CrearPlaneacionScreen` como dependiente directo, riesgo `LOW`:

```text
Function:src/hooks/useCrearPlaneacionViewModel.ts:useCrearPlaneacionViewModel
```

Esto confirma que `status` no es una señal suficiente de salud para consultas estructurales.

## Intentos de reparacion

1. `gitnexus@1.6.9 analyze --repair-fts --index-only` fallo porque la extension FTS no estaba instalada/cargable.
2. La misma reparacion con `GITNEXUS_LBUG_EXTENSION_INSTALL=auto` intento instalar FTS, pero no pudo cargarla.
3. El release candidate `gitnexus@1.6.10-rc.23` dio el diagnostico preciso de Windows: la extension `libfts.lbug_extension` existe, pero falla con error 126 porque falta una biblioteca runtime requerida.

GitNexus indica como remediacion externa instalar Microsoft Visual C++ 2015-2022 Redistributable x64 desde:

```text
https://aka.ms/vs/17/release/vc_redist.x64.exe
```

Si el error persiste, el proceso de GitNexus requiere OpenSSL 3 (`libcrypto-3-x64.dll` y `libssl-3-x64.dll`) en la ruta de busqueda de DLL.

## Reintento tras autorizacion de Visual C++

Se ejecutó el instalador oficial de Visual C++ en modo silencioso. Devolvió el código `1638`, que confirma que ya existe una versión igual o más reciente; el registro local confirma `v14.51.36247.00` instalado. El reintento de `gitnexus@1.6.10-rc.23 analyze --repair-fts --index-only` conserva el error 126.

Por tanto, no es necesario reinstalar Visual C++. El prerrequisito externo pendiente es OpenSSL 3 para exponer `libcrypto-3-x64.dll` y `libssl-3-x64.dll` al proceso de GitNexus.

## Intento de instalacion de OpenSSL

Con autorizacion del usuario se intentó instalar `ShiningLight.OpenSSL.Light` 4.0.1 mediante winget en modo silencioso. Winget quedó esperando detrás de una sesión de Windows Installer existente, sin registrar el paquete ni crear un proceso hijo de OpenSSL. Se canceló solamente el proceso `winget.exe` identificado por esa instalación; no se interrumpió el `msiexec.exe` ajeno.

Ese intento no instaló OpenSSL 3. La sesión de Windows Installer se liberó posteriormente y se reintentó con el instalador oficial vigente.

## Reintento exitoso de OpenSSL y FTS

- OpenSSL Light 4.0.1 y OpenSSL Light 3.5.7 x64 están instalados en paralelo; el segundo expone
  `libcrypto-3-x64.dll` y `libssl-3-x64.dll` en `C:\Program Files\OpenSSL-Win64\bin`.
- El MSI oficial de OpenSSL 3.5.7 se verificó con SHA-256
  `2faad0a2a644443077b1c03fb36199b48ec0248a8a87f1f29bc9f5be5805dc4f` antes de la instalación silenciosa.
- Con GitNexus `1.6.10-rc.23`, `analyze --repair-fts --index-only` terminó correctamente con `FTS indexes repaired successfully`.
- La query MVVM devuelve definiciones relevantes y el impact por UID devuelve el target esperado con
  `epistemic: exact`, un dependiente directo (`CrearPlaneacionScreen`) y riesgo `LOW`.
- Los comandos versionados `npm run gitnexus:diagnose`, `npm run gitnexus:repair` y
  `npm run gitnexus:verify` reproducen el diagnóstico, reparación y contrato sin ejecutar `gitnexus setup`.

## Decision y rollback

La versión aceptada es GitNexus `1.6.10-rc.23`, porque es la primera que demostró el contrato completo en el runtime activo. El wrapper usa OpenSSL solo en el proceso de GitNexus; no persiste variables de entorno ni modifica configuración global.

El cierre del change usa `opsx:finish` por PR de GitHub: `development` está protegida y exige los checks
`TypeScript`, `ESLint`, `Jest` y `Backend smoke`. El script no puede hacer merge ni push directo a esa rama;
publica la rama del change, espera CI, solicita el merge del PR y sólo después limpia la rama local.

Mientras se resuelve el runtime, CodeGraph permanece como fallback puntual conforme a la politica vigente. Para recuperar el indice local despues de disponer del runtime, usar un reindexado GitNexus `--index-only`; si se requiere limpiar el indice, usar el comando oficial de limpieza de GitNexus. Ninguno de estos pasos afecta datos de PlanearIA.

## Evidencia requerida para desbloquear

1. `analyze --repair-fts --index-only` exitoso sin advertencias FTS.
2. Query MVVM con definiciones relevantes e impact por UID exacto.
3. Arbol Git sin inyecciones fuera de los espejos intencionales del harness.
