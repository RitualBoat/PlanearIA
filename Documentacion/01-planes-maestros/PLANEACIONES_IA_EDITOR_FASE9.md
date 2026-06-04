# Planeaciones Fase 9: IA Gateway y Criterio de Aceptacion del Editor

> **Estado:** documento de soporte cerrado el 2026-05-30 junto con la Fase 9 de `Documentacion/01-planes-maestros/plan_planeaciones.md`.

## 1) IA usada realmente en Planeaciones

Arquitectura real actual:
- Backend centraliza las llamadas en `backend/lib/aiGateway.js`.
- El gateway usa proveedores OpenAI-compatible en cascada.
- Las API keys viven solo en backend; la app movil/web nunca debe almacenar keys privadas de IA.

Endpoints IA activos:
- `backend/api/planeaciones/generar.js`
- `backend/api/planeaciones/mejorar.js`
- `backend/api/planeaciones/copiloto.js`
- `backend/api/planeaciones/escanear-plantilla.js`

Proveedores soportados por variables de entorno:
- OpenRouter: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` opcional, default `openrouter/free`.
- Groq: `GROQ_API_KEY`, `GROQ_MODEL` requerido si se usa Groq.
- OpenAI: `OPENAI_API_KEY`, `OPENAI_MODEL` opcional, default `gpt-4o-mini`.
- Together/OpenAI-compatible: `TOGETHER_API_KEY`, `TOGETHER_MODEL` requerido si se usa Together.
- Custom: `AI_GATEWAY_PROVIDERS` permite registrar una lista JSON de proveedores OpenAI-compatible.

Variables generales:
- Backend: `API_SECRET`.
- Backend: `AI_MAX_REQUESTS_PER_ACTION` opcional, default `10`.
- Backend: `AI_DEV_MODE` opcional, default apagado. Si esta en `true`, solo solicitudes con token dev local o usuario admin/dev usan limite ampliado.
- Backend: `AI_DEV_MAX_REQUESTS_PER_ACTION` opcional, default `100`.
- Backend: `AI_DEV_TOKEN` opcional, default `dev-token-local-testing-only`.
- Backend: `AI_LIMIT_WINDOW_MS` opcional, default 24 horas.
- Backend: `OPENAI_TIMEOUT_MS` opcional, usado tambien como timeout general del gateway.
- App: `EXPO_PUBLIC_API_URL`.
- App: `EXPO_PUBLIC_API_SECRET`.

Comportamiento real vs fallback:
- `copiloto` y `escanear-plantilla`: si no hay proveedor IA configurado, o si falla la nube, devuelven fallback heuristico/local usable.
- `escanear-plantilla` tambien tiene fallback local en frontend para evitar errores visibles como `Failed to fetch` o `JSON Parse error` cuando el backend responde HTML/texto plano.
- `mejorar`: si no hay proveedor IA configurado, devuelve sugerencias heuristicas.
- `generar`: requiere al menos un proveedor IA configurado porque genera una planeacion completa nueva.
- El gateway intenta el siguiente proveedor cuando uno falla, agota cuota, responde 429/5xx o no puede entregar contenido utilizable.

Limites de uso IA:
- Cada accion IA queda limitada por backend a 10 solicitudes por ventana por defecto.
- Invitados y usuarios registrados se mantienen en limite estandar de 10.
- Modo dev permite mas usos solo si el backend tiene `AI_DEV_MODE=true`; cada respuesta en modo dev incluye `usage.warning` y la UI del copiloto muestra una advertencia visible.
- Acciones actuales: `generar_planeacion`, `generar_planeacion_v2`, `mejorar_planeacion`, `escanear_plantilla`, `copiloto_sugerir_actividades`, `copiloto_autocompletar_seccion`, `copiloto_generar_evaluacion`, `copiloto_revisar_alineamiento`, `copiloto_mejorar_texto`.
- El limite actual es in-memory para desarrollo/Vercel basico. Cuando haya usuarios reales debe migrarse a MongoDB/Redis para persistencia fuerte.

Ejemplo `AI_GATEWAY_PROVIDERS`:

```json
[
  {
    "id": "mi_provider",
    "baseUrl": "https://api.provider.com/v1",
    "apiKeyEnv": "MI_PROVIDER_API_KEY",
    "modelEnv": "MI_PROVIDER_MODEL"
  }
]
```

Nota pedagogica obligatoria:
- Toda salida de IA es sugerencia y debe ser revisada/validada por el docente antes de usarla en clase.

## 2) Criterio de aceptacion del editor tipo Word/Docs

El editor se considera aceptado si cumple todo:

- Existe un canvas principal de documento, no solo formulario por secciones.
- Permite texto libre, seleccion, negritas, cursivas, encabezados, listas, checklist, tablas, undo/redo y guardado.
- Abre siempre con una plantilla visible, base/default o seleccionada.
- Los placeholders/campos viven dentro del documento editable.
- En web, la edicion primaria ocurre directo sobre el documento.
- En movil, existe alternancia `Documento` <-> `Formulario` con sincronizacion bidireccional.
- Guarda y reabre rich text sin perder `contenidoRaw` ni mapeo de campos.
- Funciona en web, Android e iOS sin bloquear scroll o clicks.
- El flujo principal de creacion/edicion entra por selector de plantillas y abre `DocEditor`.

## 3) Estado de cumplimiento (cerrado 2026-05-30)

- El flujo principal ya abre DocEditor desde selector de plantillas.
- El acceso legacy `Planeaciones` y `GenerarPlaneacionIA` fue redirigido al selector moderno o retirado del flujo principal.
- `Generar con IA` desde selector ya crea documento V2 y abre DocEditor para trabajo con Copiloto IA in-editor.
- Soporte de configuracion publica para backend agregado con `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_API_SECRET`.
- Gateway IA multi-provider agregado en backend.
- Escaner de plantillas endurecido con fallback local para que no bloquee C4 cuando falte backend/proveedor.
- Checklist manual Fase 9 ejecutado y documentado en `Documentacion/03-validacion/CHECKLIST_VALIDACION_MANUAL_FASE9.md`.
- Fase 9 queda cerrada como base estable para continuar con la reorientacion global de PlanearIA.

