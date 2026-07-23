# Actualización y rollback

## 1. Contrato

El paquete y el schema usan SemVer. `state.json` registra versión, schema, owners, hashes y transacciones.
Un runtime antiguo rechaza schema futuro; una migración desconocida falla antes de escribir.

El upstream es la única fuente del runtime. Un proyecto consumidor fija una versión exacta en
`package.json` y `package-lock.json`; nunca usa `@latest`.

## 2. Comprobar una actualización

```bash
npx --yes create-project-engineering-os@<VERSION_EXACTA> upgrade --target . --check
```

Antes de aplicar:

1. verificar GitHub Release, npm provenance, checksum, licencia y changelog;
2. confirmar working tree limpio o aislar cambios;
3. revisar diff, owners, migraciones, perfiles y rollback;
4. resolver colisiones;
5. crear una rama/PR normal; no usar `git reset --hard`.

## 3. Aplicar por PR

```bash
npx --yes create-project-engineering-os@<VERSION_EXACTA> upgrade --target . --apply
npm ci
npm run project-os:opsx:check
npm run project-os:sync:check
npm run project-os:doctor:json
npm run debt:check
```

También puede usarse `--open-pr`; crea o reutiliza una rama y PR, pero nunca mergea ni empuja a la rama
protegida. La aplicación calcula el plan antes de escribir, usa temporal + rename y actualiza el state al
final.

## 4. Fallo parcial y rollback de transacción

Si existe journal incompleto, no editar `state.json` ni ejecutar otro generador. Elegir una sola ruta:
reanudar con la misma versión o revertir la transacción.

```bash
npx --yes create-project-engineering-os@<VERSION_INSTALADA> rollback \
  --target . --transaction "<ID>"
npm run project-os:sync:check
```

Rollback restaura backups y elimina archivos nuevos solo si conservan el hash escrito. No toca `.git`,
no borra archivos no owned y se detiene ante edición posterior.

## 5. Rollback de versión consumidora

La reversión normal fija la última release sana conocida mediante PR:

```bash
npm install --save-dev --save-exact create-project-engineering-os@<ULTIMA_SANA>
npm ci
npm run project-os:sync:check
npm run project-os:doctor:json
```

Si aún no existe una release sana anterior —`0.1.1` es la primera consumible— el rollback de PlanearIA es
revertir por PR el commit de adopción y restaurar temporalmente el snapshot embebido preservado en Git.
No se usa `0.1.0`: tuvo GitHub Release, pero no publicación npm consumible.

Una versión pública defectuosa:

- se depreca con un mensaje de recuperación;
- recibe un patch nuevo;
- no se despublica salvo incidente legal/seguridad que lo exija;
- nunca se reetiqueta ni sobrescribe.

## 6. OpenSpec, perfiles y estado

- OpenSpec conserva ownership de OPSX; su CLI regenera y `opsx-check` valida.
- Desactivar perfiles requiere decisión, dependencias/archivos owner y evidencia de no consumo.
- `.project-os/debt/` y sus assessments nunca se borran al cambiar runtime.
- Specs locales describen el contrato de la versión fijada; las specs upstream gobiernan evolución.

## 7. Gate posterior

- segundo sync/check sin drift;
- doctor humano/JSON coherente y cero `FAIL`;
- fixture y casos negativos verdes;
- ninguna pérdida de overlay;
- OPSX bajo su owner;
- package/lock/state con la misma versión;
- PR/checks/issue actualizados.
