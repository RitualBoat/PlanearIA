# Releases

La versión sigue SemVer. Patch corrige comportamiento compatible; minor añade capacidad compatible;
major permite cambios incompatibles con migración y rollback documentados.

Una release:

1. valida tag, versión y changelog;
2. ejecuta CI sin secretos sobre el source;
3. empaca una sola vez;
4. prueba ese tarball fuera del repositorio;
5. genera `SHA256SUMS` y manifest con commit;
6. adjunta exactamente esos artefactos a GitHub Release;
7. publica el mismo `.tgz` en npm con provenance OIDC.

No se reutiliza una versión ni se mueve un tag publicado. Una release defectuosa se depreca y se corrige
con patch. `unpublish` no es el rollback normal.

