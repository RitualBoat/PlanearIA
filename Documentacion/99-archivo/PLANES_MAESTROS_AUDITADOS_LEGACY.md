# Auditoria De Planes Maestros Y Correccion De Metodo

Este documento conserva la leccion aprendida del plan Classroom y de planes de paridad alta.

## Problema Detectado

El problema no fue falta de capacidad tecnica. El problema fue permitir avanzar fases funcionales antes de fijar un contrato visual y de flujo suficientemente claro.

En Classroom, varias fases integraron alumnos, materiales, actividades, asistencia, reportes e IA, pero la experiencia podia sentirse mas como dashboard administrativo que como una experiencia cercana a Google Classroom/Classroomio.

## Leccion Principal

Para experiencias madre de paridad alta, no basta escribir "tipo Classroom", "tipo Office" o "tipo Canva". Cada fase debe convertir el ground truth en contrato verificable.

Experiencias de paridad alta actuales:

- Office Docente: Word/Docs + Excel/Sheets + LibreOffice/OnlyOffice como ground truth conceptual.
- Asistente IA / ChatGPT Docente: ChatGPT, Gemini, NotebookLM o copilotos similares como ground truth de conversacion, adjuntos y acciones.
- Classroom: Google Classroom/Classroomio.
- Canva/Genially.
- WhatsApp profesional.

## Reglas Nuevas Para Futuros Planes

- Todo plan de paridad alta debe declarar su experiencia madre.
- Cada fase visual debe citar referencias concretas.
- Cada fase debe prohibir rutas legacy que rompan el flujo.
- TypeScript, lint y tests no bastan para cerrar UX/UI de alta paridad.
- Debe existir validacion manual o checklist visual antes de marcar fase como `[x]`.
- Los planes cerrados prueban funcionalidad, no congelan la vision visual.

## Brief De Ground Truth Por Fase

Antes de implementar una fase visual de paridad alta, la IA debe escribir un brief con:

- Nivel de paridad.
- Capturas/referencias reales.
- Referencias open source si existen.
- Pantallas a imitar.
- Pantallas o flujos prohibidos.
- Rutas legacy que no deben abrirse.
- Criterio de cierre visual y de navegacion.

## Checklist Obligatorio

- [ ] La fase cita rutas concretas de `context/<experiencia>-ground-truth/`.
- [ ] La fase cita referencias open source o reales relevantes.
- [ ] La fase define que comportamiento debe parecerse al producto madre.
- [ ] La fase define que rutas legacy quedan prohibidas.
- [ ] Crear, editar, guardar, cancelar y volver tienen destino claro.
- [ ] La pantalla no introduce CTAs administrativos sueltos si el producto madre no los tiene.
- [ ] Web, tablet y movil tienen validacion manual cuando aplica.
- [ ] El usuario confirma si la experiencia se siente como la experiencia madre antes de cerrar la fase.

## Interpretacion Actual

La vision nueva une Word y Excel dentro de Office Docente. Por lo tanto, futuros planes no deben tratar documentos y hojas como mundos aislados salvo que el plan lo justifique.

Classroom sigue siendo experiencia madre, pero debe recibir objetos creados desde Office, Asistente IA, Canva, WhatsApp y Calendario.

## Relacion Con La Meta Guia

Las reglas vigentes viven en:

- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
