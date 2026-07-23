# Contribuir

Gracias por mejorar Project Engineering OS. El proyecto acepta documentación, correcciones, perfiles y
cambios al runtime mediante pull request.

## Flujo

1. Busca un issue equivalente.
2. Para cambios no triviales, acuerda alcance, criterios observables, riesgos y rollback.
3. Crea una rama desde `main`.
4. Ejecuta `npm ci` y `npm run check`.
5. Si cambia comportamiento, actualiza specs OpenSpec y añade casos negativos.
6. Abre un PR con evidencia, licencias afectadas y assessment de deuda.

No edites artefactos OPSX como si pertenecieran al renderer general. No añadas secretos, telemetría,
servicios pagados obligatorios ni defaults de producto. Dependencias nuevas requieren licencia, costo,
mantenimiento, alternativa y motivo.

Los commits deben declarar autoría mediante el certificado DCO: al contribuir confirmas que tienes
derecho a enviar el trabajo bajo MIT. Puedes firmar con `git commit -s`.

La revisión humana es obligatoria. Un contribuidor no puede autoaprobar ni publicar su propio PR.

