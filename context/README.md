# Contexto y Ground Truth - PlanearIA

Esta carpeta guarda evidencia visual, referencias reales, capturas actuales, errores y repos curados para que futuras IAs no implementen modulos "a ojo".

## Regla principal

Si un modulo busca parecerse a una experiencia conocida, el plan maestro debe citar rutas concretas de esta carpeta por fase.

Experiencias de paridad alta:

- Planeaciones: Word/Google Docs.
- Classroom: Google Classroom/Classroomio.
- Recursos visuales: Canva/Genially.
- Listas: Excel/Google Sheets.
- Chat: WhatsApp profesional.

## Estructura esperada por modulo

```text
context/<modulo>-ground-truth/
  01-errores-actuales/README.md
  02-capturas-actuales-de-la-app/
  03-referencias-reales/
  04-flujos-deseados/
  05-notas-del-desarrollador/README.md
```

## Como usarlo

- `01-errores-actuales`: describir bugs actuales y enlazar capturas.
- `02-capturas-actuales-de-la-app`: guardar como se ve PlanearIA hoy.
- `03-referencias-reales`: guardar capturas de apps madre como Word, Classroom, Excel, Canva o WhatsApp.
- `04-flujos-deseados`: guardar diagramas, prompts, Stitch/Figma, HTML/MD o notas del flujo ideal.
- `05-notas-del-desarrollador`: explicar preferencias, tradeoffs y decisiones de producto.

## Referencias open source

Los repos curados viven en `context/referencias-opensource/`.

Si falta una referencia open source para un modulo, la IA debe pedir URLs de GitHub antes de implementar fases visuales de paridad alta.

