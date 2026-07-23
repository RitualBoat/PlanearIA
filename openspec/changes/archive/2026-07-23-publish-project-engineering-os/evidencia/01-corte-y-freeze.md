# Corte, allowlist y freeze

- Fecha: 2026-07-23.
- Commit de corte: se registra de forma machine-readable en `01-source-cut.json`.
- Sources congelados: `tools/project-constructor` y `tools/debt-control`.
- Release candidate temporal: `tools/project-engineering-os`.
- Dirección de cambios: del source congelado al candidate; nunca al revés.

Cada archivo fuente queda inventariado con SHA-256 y owner. El candidate usa
`config/export-allowlist.json` y `scripts/check-neutrality.mjs` para rechazar rutas no públicas,
términos específicos del consumidor, paths de máquina, symlinks y patrones de secretos.

Si aparece una corrección crítica antes del cutover:

1. se documenta el defecto y su reproducción;
2. se corrige primero donde mantenga operativo al consumidor;
3. se porta al candidate en el mismo PR;
4. se regeneran inventario y checks;
5. se cancela el cutover si los hashes o comportamientos divergen.

No se aceptan features paralelas en los dos runtimes durante el corte.
