# Evidencia Deploy - Fase 5 Estrategia Low-Cost y Demo - 2026-06-06

## Alcance

Fase 5 del plan de infraestructura: elegir una ruta realista para mostrar PlanearIA fuera o alrededor de la laptop cuando sea necesario.

No se hizo deploy, no se abrieron tuneles publicos, no se tocaron secretos reales, no se instalo Docker, no se ejecuto EAS y no se migro a SQLite.

## Fuentes oficiales consultadas

- Vercel plans: https://vercel.com/docs/plans
- Vercel limits: https://vercel.com/docs/limits
- Render free services: https://render.com/docs/free
- Railway pricing: https://railway.com/pricing
- MongoDB Atlas Free Cluster Limits: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- Expo EAS pricing: https://expo.dev/pricing
- ngrok pricing/limits: https://ngrok.com/docs/pricing-limits/
- Cloudflare Tunnel docs: https://developers.cloudflare.com/tunnel/
- Cloudflare Zero Trust plans: https://www.cloudflare.com/plans/zero-trust-services/
- Floci AWS emulator: https://floci.io/floci/
- Docker Compose docs: https://docs.docker.com/compose/
- Docker Personal: https://www.docker.com/products/personal/
- No-IP Free Dynamic DNS: https://www.noip.com/free
- No-IP Dynamic DNS at home: https://www.noip.com/personal

## Matriz de alternativas

| Opcion | Costo inicial | Encaje para PlanearIA hoy | Riesgos / limites |
| --- | --- | --- | --- |
| Vercel backend actual + MongoDB Atlas Free | $0 si se mantiene en Hobby/personal y dentro de limites | Mejor ruta para demo backend cloud porque el backend ya tiene forma serverless. HTTPS automatico y despliegue simple. | Requiere cuenta/login Vercel; funciones serverless no son servidor persistente; revisar limite de builds/usos; Hobby tiene limitaciones de integracion con repos de organizaciones. |
| Render Free web service + MongoDB Atlas Free | $0 inicial | Fallback si se necesita un servidor Node siempre con proceso HTTP tradicional. | Free web services duermen tras inactividad, tardan en despertar, tienen filesystem efimero y no soportan discos persistentes gratuitos. |
| Railway Trial/Free | $0 inicial limitado | Bueno para experimentar con servicios persistentes y volumenes pequenos. | Trial/Free tiene creditos/limites; Hobby ya implica costo mensual minimo. No es default para presupuesto cero. |
| Self-host laptop en LAN | $0 | Mejor para demos locales en clase/laboratorio: web, backend local y celular fisico en misma red. | No sirve para demo remota sin tunel; depende de firewall/red; no exponer publicamente en esta fase. |
| Tunnel temporal desde laptop | $0 o free tier segun herramienta | Util solo para demo externa puntual. | Riesgo de exponer backend local/secrets/logs. No activar sin decision explicita. |
| Expo Go / Expo local | $0 | Mejor para demo movil temprana mientras no se necesiten builds nativos reales. | Push y algunas capacidades nativas pueden requerir dev build. |
| EAS Free | $0 con limites incluidos | Usar cuando haga falta dev build real o beta movil. | No activarlo antes de necesitar capacidades nativas o distribucion movil; revisar limites vigentes antes de usar. |

## Opciones mencionadas por profesor

| Opcion | Tiene que ver con Fase 5 | Evaluacion para PlanearIA |
| --- | --- | --- |
| ngrok | Si, como tunnel temporal para mostrar la laptop fuera de la red local. | Conviene para una demo puntual y rapida si el profesor necesita abrir una URL publica. No sustituye a Vercel/Render como deploy real. Usarlo solo con variables revisadas y endpoint de health validado. |
| Cloudflare Tunnel | Si, como tunnel mas estable/profesional que ngrok. | Mejor que No-IP para exponer un servicio local sin abrir puertos entrantes. Requiere cuenta/configuracion Cloudflare y probablemente dominio si se quiere una URL cuidada; dejar como opcion avanzada de demo externa. |
| Floci AWS | Parcialmente. Es emulacion local de servicios AWS, no hosting/deploy publico. | No conviene para Fase 5 default porque PlanearIA no depende hoy de S3/SQS/Lambda/Cognito ni de AWS. Puede servir en una fase academica si se quiere practicar cloud emulado en CI sin costo. |
| Docker | Si, pero mas como reproducibilidad local/futura fase que como deploy inmediato. | Conviene a mediano plazo para levantar backend/base/servicios auxiliares de forma repetible. No hacerlo requisito de demo actual ni instalarlo sin decision explicita. |
| No-IP | Si, solo para self-hosting con IP dinamica. | No conviene como ruta default: exige router/puertos, revisar CGNAT, HTTPS, firewall y seguridad. Es util para homelab o VPN, no para una entrega rapida de estudiante. |

## Lectura de diapositivas de clase

Los PDF de clase apuntan a un flujo academico de CI/CD con GitHub Actions: workflows por `push`/`pull_request`, jobs/steps/runners, variables y secrets, artifacts como APK/logs/reportes, Docker, deploy de API, y una variante con Azure App Service/PostgreSQL/Expo.

Traduccion para PlanearIA:

- La Fase 4 ya cubre la parte correcta del temario para CI: TypeScript, ESLint, Jest y smoke backend en GitHub Actions.
- La Fase 5 no debe absorber automaticamente Azure/PostgreSQL/APK, porque eso implicaria secrets, deploy real y build movil. Esa ruta merece una fase academica separada si el profesor la exige.
- Docker si encaja con el temario, pero como siguiente capa de reproducibilidad, no como bloqueo para cerrar la estrategia low-cost.

## Decision recomendada 2026-06-06

Ruta default para demo sin costo:

1. Demo local principal: laptop con `npm run web`, `npm run backend:dev:local` o `npm run backend:dev` si hay login Vercel, y celular fisico por IP LAN.
2. Backend cloud para demo externa: mantener Vercel como primera opcion porque el repo ya esta adaptado a funciones serverless.
3. Base remota: mantener MongoDB Atlas Free mientras los datos sean de demo y caben en limites.
4. Movil: usar Expo Go/local primero; posponer EAS hasta que una fase requiera dev build o distribucion.
5. Demo externa temporal para entrega actual: ngrok es la opcion elegida por menor friccion si se necesita una URL publica rapida; Cloudflare Tunnel queda como alternativa mas seria para despues.
6. Fallback: evaluar Render si Vercel deja de encajar; Railway no es default por costo mensual posterior al trial/free.
7. Docker queda como fase futura de reproducibilidad local/CI; No-IP y Floci no son default para el alcance actual.

## Criterios antes de cualquier deploy real

- Correr `npm run check`.
- Correr `npm run backend:check`.
- Revisar `.env.local` y `backend/.env.local` sin imprimir valores.
- Confirmar que no se suben secretos.
- Confirmar URL final de backend con `npm run backend:health -- https://URL`.
- Registrar evidencia sin tokens, secrets ni URI de MongoDB.

## Review manual pendiente

Fase 4:

- Hacer commit/push o abrir PR contra `development`.
- Esperar el run remoto de GitHub Actions.
- Confirmar que pasan los jobs TypeScript, ESLint, Jest y Backend smoke.
- Guardar link o captura del run sin secretos en `context/infraestructura-ground-truth/03-evidencia-ci/`.
- Si pasa, mover issue #13 a `Done`; si falla, reproducir localmente el comando del job fallido.

Fase 5:

- Ruta decidida para entrega/demo actual: demo externa temporal con ngrok si se necesita URL publica.
- Mantener Vercel como primera opcion futura para backend cloud real; Cloudflare Tunnel/Docker quedan para evolucion posterior.
- Antes de cualquier opcion publica, revisar `.env.local` y `backend/.env.local` sin imprimir valores.
- Probar `npm run check` y `npm run backend:check`.
- Si se expone una URL, validar `npm run backend:health -- https://URL` y registrar evidencia sin secrets.
- Si se descarta deploy real, cerrar Fase 5 como decision pospuesta y mover issue #14 a `Done`.

## Estado

La decision de ruta queda documentada. El deploy real queda pospuesto hasta que el usuario lo pida explicitamente.
