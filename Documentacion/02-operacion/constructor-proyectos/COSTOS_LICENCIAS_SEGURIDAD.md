# Costos, licencias, secretos y herramientas de análisis

> **Snapshot:** 2026-07-19. Precios, planes y licencias se vuelven a verificar al activar o distribuir.

## 1. Decisión económica de Ola 0

El núcleo debe funcionar localmente sin comprar servicios. Un servicio externo puede mejorar colaboración,
pero no puede ser requisito para generar o validar archivos locales. Ningún gasto, licencia contractual o
publicación se activa sin aprobación humana.

## 2. Matriz de costos y licencias

| Componente | Uso en Ola 0 | Costo esperado | Licencia/condición | Lock-in | Decisión |
| --- | --- | --- | --- | --- | --- |
| Constructor | Tarball local privado | Sin cargo de registry | `private: true`, `UNLICENSED` | Bajo mientras use formatos abiertos | No publicar |
| Node | Runtime local | Sin compra por ejecución local | Ver licencia upstream antes de redistribuir binarios | Bajo | No empaquetar Node |
| OpenSpec `1.6.0` | SDD local fijado | Sin API key | [MIT](https://github.com/Fission-AI/OpenSpec) | Medio por formato/workflows | Adaptador y rollback |
| Ajv `8.20.0` | Validación de schemas en desarrollo/CI | Sin API key | [MIT](https://www.npmjs.com/package/ajv/v/8.20.0) | Bajo; JSON Schema 2020-12 es formato abierto | `devDependency` exacta; no runtime del proyecto |
| Transitivas de Ajv | Solo desarrollo/CI | Sin API key | `fast-deep-equal`, `json-schema-traverse` y `require-from-string`: MIT; `fast-uri`: BSD-3-Clause, según lockfile | Bajo | Mantener lockfile y revisar licencias en cada actualización deliberada |
| Git | Repositorio | Sin costo local | Licencia upstream | Bajo | Core |
| GitHub Issues/Project | Tracking remoto | Depende del plan | Términos GitHub | Medio | Dry-run; apply manual |
| GitHub Actions | CI advisory | Público/self-hosted estándar sin cargo; privado usa cuota y cobra exceso | [Billing oficial](https://docs.github.com/en/actions/concepts/billing-and-usage) | Medio | Presupuesto y path filters |
| Harnesses de agentes | Interfaces opcionales | Suscripciones/licencias variables | Términos de cada proveedor | Alto si se requiere uno | AGENTS fallback universal |
| GitNexus | Inteligencia estructural | Verificar al distribuir | Licencia del paquete/servicio vigente | Medio | Condicional por código |
| CodeGraph | Fallback lineado | Verificar al distribuir | Licencia/servicio vigente | Medio | Fallback, no requisito único |
| Graphify | Ninguno | No evaluado | No aprobado | Alto/indeterminado | `SKIP retirado/manual` |
| React Doctor | Ninguno en core | Verificar al activar | Acción/herramienta vigente | Medio | Solo perfil React |
| Playwright/Figma | Ninguno sin UI | Plan/licencia variable | Verificar al activar | Medio | Solo perfil UI |
| Cloud/DB/IA | Ninguno | Variable | Contratos de proveedor | Alto | Solo después de ADR |

La documentación actual de GitHub indica que Actions usa cuotas por plan en repositorios privados y cobra
el exceso; los repositorios públicos con runners estándar y los self-hosted tienen tratamiento distinto.
No codificar cifras como garantía: revisar la
[página de billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) al activar.

npm documenta que `private: true` impide publicación accidental y que `UNLICENSED` no concede derechos de
uso: [package.json](https://docs.npmjs.com/files/package.json/).

## 3. Política de secretos

- templates contienen nombres de variables, nunca valores;
- doctor informa presencia/ausencia, no longitud, hash ni fragmentos;
- `.env*`, tokens, cookies y credenciales no se incluyen en prompts, issues o JSON;
- outputs de subprocessos se redactan antes de persistirse;
- una variable requerida ausente es `FAIL` del perfil activo;
- OAuth y rotación se realizan manualmente;
- no se leen datos sensibles para “probar” el doctor;
- fixtures usan valores sintéticos detectables y verifican redacción.

## 4. Scanners y `npm audit`

Un hallazgo es candidato a investigar, no autorización para mutar:

1. guardar versión del scanner y alcance;
2. reproducir;
3. comprobar exploitabilidad y superficie;
4. revisar fix, licencia y breaking changes;
5. decidir aceptar, mitigar, actualizar o reemplazar;
6. ejecutar mediante change con rollback.

Prohibido ejecutar automáticamente `npm audit fix`, upgrades mayores o supresiones globales desde doctor,
bootstrap o CI.

## 5. Knip y código muerto

Knip se usa en modo reporte después de configurar entrypoints. Antes de borrar:

- buscar imports dinámicos y referencias por string;
- revisar handlers, scripts CLI y serverless;
- revisar reexports de API pública;
- revisar uso solo desde tests/config/framework;
- confirmar con tests y owner.

No usar `--fix` ni borrar automáticamente. La deuda no relacionada se registra y se atiende por contacto o
change separado.

## 6. Graphify

Graphify no pertenece al runtime activo. Su estado esperado es `SKIP retirado/manual`:

- ausencia no bloquea;
- `graphify-out/` no prueba salud;
- doctor no busca, instala ni inicia la herramienta;
- paridad falla si reaparece como MCP activo;
- una auditoría voluntaria exige decisión, licencia, costo, instalación y rebuild explícitos.

## 7. Gates de aprobación

Requieren decisión humana:

- asignar licencia al constructor;
- publicar en npm/GitHub Releases;
- activar un plan pagado o marketplace;
- exceder cuota de Actions;
- habilitar scanner con costo/licencia especial;
- enviar código o datos a un servicio externo;
- usar un proveedor de IA;
- incorporar una dependencia con licencia incompatible.

La evidencia debe incluir owner, fecha, costo máximo, licencia, datos enviados, salida/rollback y fecha de
revisión.
