# Auditoria del Plan Classroom y Correccion de Metodo para Futuros Planes

## Resumen

El problema no fue que faltara capacidad tecnica. El problema fue que el plan permitio avanzar fases funcionales antes de fijar un contrato visual/flujo tipo “clon Classroom/Classroomio”. Por eso despues de Fase 2 se acumularon refactors: la IA implemento un Classroom funcional, pero no suficientemente fiel a las referencias reales.

Conclusion: futuros planes deben seguir siendo planes maestros completos, pero cada fase ejecutable debe incluir su propio “brief de ground truth” con rutas concretas de capturas/referencias, criterios de paridad visual/flujo y restricciones legacy. La implementacion debe avanzar fase por fase, no como una ejecucion larga donde la IA pueda perder el norte.

## Hallazgos Clave

- El plan decia “tipo Google Classroom/Classroomio”, pero no convertia las capturas en contrato obligatorio por fase.
- Las fases 3-9 priorizaron integrar funcionalidad existente: alumnos, materiales, actividades, asistencia, reportes, IA. Eso produjo una app operativa, pero con sabor a dashboard administrativo.
- La limpieza legacy estaba demasiado tarde. Permitio que crear/editar siguiera saltando a formularios antiguos.
- La Fase 10 corrigio tarde decisiones base de UX: tabs reales, trabajo por unidades, sin “Sin seccion”, editor contextual, adjuntos multiples y retorno correcto.
- Las referencias reales en `context/classroom-ground-truth/03-referencias-reales` debieron estar citadas dentro de cada fase, no solo en una seccion global.
- Varias fases se marcaron como completadas por pasar TypeScript/tests, aunque la validacion manual de paridad visual/flujo seguia abierta.
- La frase “UX/UI Global lo pule despues” fue demasiado permisiva. Para modulos que buscan clonar una experiencia madre, la UX base no puede posponerse al final.

## Cambios Recomendados al Metodo de Planes Maestros

- Agregar en `meta_guia_planes.md` una regla llamada `Contrato de Experiencia Madre`.
- Cada plan debe declarar si el modulo es:
  - `Clon/paridad alta`: Word, Classroom, Excel, Canva.
  - `Inspirado/paridad media`: social, chat, reportes.
  - `Funcional/administrativo`: configuracion, seguridad, infraestructura.
- Si es `Clon/paridad alta`, no se puede cerrar una fase UI sin comparar contra capturas/referencias.
- Cada fase debe incluir:
  - rutas exactas de ground truth,
  - pantallas afectadas,
  - flujos prohibidos,
  - rutas legacy que no deben usarse,
  - criterio visual y de navegacion.
- Antes de implementar una fase, la IA debe generar un mini-brief de fase con referencias concretas y confirmarlo contra el plan.
- Despues de cada fase, debe existir validacion manual o checklist visual antes de avanzar a la siguiente fase grande.
- Los tests automaticos no sustituyen la validacion de experiencia clon.

## Regla Nueva Para Futuros Modulos

Para experiencias madre:

- `Planeaciones = Word/Docs`: cada fase debe citar referencias de documento/editor/plantilla.
- `Classroom = Google Classroom/Classroomio`: cada fase debe citar capturas de cursos, trabajo de clase, personas, detalle de actividad/material.
- `Recursos visuales = Canva/Genially`: cada fase debe citar editor canvas, templates, panel lateral, timeline/capas si aplica.
- `Listas = Excel`: cada fase debe citar grid, formulas, filtros, columnas, import/export.
- `Chat = WhatsApp profesional`: cada fase debe citar lista de chats, conversacion, adjuntos, estados de envio.

## Ajuste al Flujo de Ejecucion

No recomiendo generar solo una fase del plan maestro a la vez. Eso perderia vision completa.

Recomiendo este esquema:

- Plan maestro completo para arquitectura, dependencias y roadmap.
- Ejecucion estrictamente por fase.
- Antes de cada fase: crear “Brief de Implementacion de Fase” con ground truth exacto.
- Despues de cada fase: captura/validacion manual contra referencias.
- No avanzar si el flujo se siente como “modulos sueltos” aunque compile perfecto.

## Checklist Obligatorio Para Cada Fase UX

- [ ] La fase cita rutas concretas de `context/<modulo>-ground-truth/`.
- [ ] La fase cita referencias open source o reales relevantes.
- [ ] La fase define qué comportamiento debe parecerse al producto madre.
- [ ] La fase define qué rutas legacy quedan prohibidas.
- [ ] Crear, editar, guardar, cancelar y volver tienen destino claro.
- [ ] La pantalla no introduce CTAs administrativos sueltos si el producto madre no los tiene.
- [ ] Web y movil tienen validacion manual.
- [ ] El usuario confirma si la experiencia se siente como el producto madre antes de cerrar la fase.

## Asunciones

- La meta futura no es solo “inspirarse”, sino lograr paridad alta con experiencias conocidas: Word, Classroom, Canva y Excel.
- Los planes deben seguir siendo detallados, pero menos permisivos con UX vaga.
- La documentacion debe guiar a futuras IAs para no interpretar “tipo Classroom” como “dashboard escolar con tarjetas”.
