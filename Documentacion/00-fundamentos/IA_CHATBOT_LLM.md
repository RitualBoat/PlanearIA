# IA, Chatbot y LLM Propio

## Decision De Vision

PlanearIA debe contemplar dos superficies de IA:

1. **IA silenciosa/contextual**: aparece dentro de Office, Classroom, Canva, WhatsApp, Calendario o Reportes cuando puede sugerir una accion concreta.
2. **Asistente IA / ChatGPT Docente**: una experiencia conversacional propia, familiar para docentes que ya trabajan con ChatGPT, Gemini o herramientas similares.

El asistente no reemplaza la IA contextual. La complementa. Sirve cuando el docente quiere conversar, subir material, pedir una transformacion abierta o trabajar con varios objetos de la app al mismo tiempo.

## Experiencia Objetivo

El docente debe poder:

- Abrir un chat propio de PlanearIA.
- Hacer preguntas pedagogicas, administrativas o de organizacion.
- Adjuntar documentos, planeaciones, hojas, listas o rubricas de Office Docente.
- Adjuntar recursos visuales creados en Canva/Genially Docente.
- Adjuntar contexto de una clase, unidad, actividad, alumno o reporte.
- Subir archivos cuando la plataforma lo permita.
- Pedir conversiones: documento a tarea, planeacion a calendario, hoja a asistencia, recurso visual a material de clase.
- Guardar respuestas como borradores editables.
- Enviar o asignar resultados a Classroom solo con confirmacion.

La regla sigue siendo la misma: la IA puede proponer, pero el docente decide.

## Arquitectura Esperada

Toda IA debe pasar por backend:

```text
Frontend
  -> backend/api o backend/routes
    -> backend/lib/aiGateway.js
      -> proveedor OpenAI-compatible cloud o local
```

El frontend no debe llamar directo a OpenAI, Gemini, OpenRouter, Groq, LM Studio ni ningun proveedor. Las llaves, URLs privadas y configuracion viven en backend.

## AI Gateway

El gateway actual ya soporta proveedores OpenAI-compatible:

- OpenRouter.
- Groq.
- OpenAI.
- Together.
- Proveedores custom mediante `AI_GATEWAY_PROVIDERS`.

Esto permite pensar en un chatbot propio sin amarrarse a un solo proveedor.

## IA Local Con LM Studio

LM Studio puede integrarse como proveedor custom si expone una API compatible con OpenAI.

Ejemplo conceptual para backend local:

```env
AI_GATEWAY_PROVIDERS=[{"id":"lmstudio","label":"LM Studio Local","baseUrl":"http://localhost:1234/v1","apiKey":"lm-studio","model":"local-model"}]
```

Notas importantes:

- Esta configuracion aplica para backend local o una red donde el backend pueda alcanzar LM Studio.
- Un despliegue en Vercel no puede llamar al `localhost` de la computadora del usuario.
- Para demo hosteada, se requiere proveedor cloud o un puente/proxy explicitamente aceptado.
- No habilitar endpoints locales inseguros en produccion.
- El modo local debe tener timeout, fallback y mensajes claros si el modelo no responde.

## Relacion Con Offline-First

La app sigue siendo offline-first para trabajo manual y datos locales. La IA local/cloud es una mejora, no una dependencia critica.

- Si no hay proveedor IA, el docente debe poder seguir editando y organizando manualmente.
- Si la IA falla, no se debe perder el trabajo.
- Las respuestas generadas deben guardarse solo cuando el docente confirme.
- Los adjuntos usados por IA deben respetar permisos, `userId` y privacidad.

## Riesgos

- Costo por uso si se abusa de proveedores cloud.
- Privacidad al enviar documentos o datos de alumnos a proveedores externos.
- Latencia o respuestas pobres en modelos locales pequenos.
- Confusion si la IA parece tomar acciones sin confirmacion.
- Duplicar chat, Classroom y Office si no se define bien donde vive cada accion.

## Reglas De Producto

- El asistente debe poder leer contexto de la app, pero no actuar sin permiso.
- Cada respuesta importante debe ofrecer acciones claras: guardar como borrador, asignar, crear tarea, crear recurso, crear recordatorio, copiar o descartar.
- La interfaz debe explicar si se usa proveedor cloud, proveedor local o IA no configurada.
- El futuro plan UX/UI debe decidir si el asistente vive como tab, panel lateral, command palette o accion flotante contextual.
- El futuro plan tecnico debe definir historial de conversaciones, adjuntos, limites, privacidad, costos y pruebas.

## Planes Relacionados

- `Plan Maestro: UX/UI y Navegacion Global`: define ubicacion y comportamiento del asistente.
- `Plan Maestro: Asistente IA / ChatGPT Docente`: define chat, adjuntos, historial, acciones y seguridad.
- `Plan Maestro: AI Gateway y Proveedores Locales/Cloud`: define LM Studio, proveedores custom, limites y fallback si se separa del plan del asistente.
