# Checklist Manual - Fase 9 Planeaciones

Fecha de validacion: `2026-05-30`
Validador: `Usuario + Codex`
Build usada: `dev local`
Plataformas probadas: `Web / movil fisico reportado por usuario`

## A. Flujo principal de creacion

- [x] A1. Ir a `Contenido` -> `Crear nuevo` -> `Planeacion`.
- [x] A2. Verificar que abre `CrearPlaneacion` (selector de plantillas) sin pedir nivel en modal previo.
- [x] A3. Seleccionar plantilla `base/default` y abrir `DocEditor`.
- [x] A4. Verificar que el documento abre con hoja visible tipo Word/Docs (A4/Carta), no solo formulario.
- [x] A5. Editar contenido en documento, guardar y permanecer en editor.
- [x] A6. Usar `Guardar y salir` y confirmar regreso correcto al hub.

## B. Edicion de planeaciones existentes

- [x] B1. Abrir planeacion existente desde card en `Contenido` -> abre `DocEditor`.
- [x] B2. Abrir planeacion existente desde menu contextual `Editar` -> abre `DocEditor`.
- [x] B3. Abrir planeacion desde `ListaPlaneaciones` -> abre `DocEditor`.
- [x] B4. Confirmar que no aparece ningun flujo/formulario legacy de edicion.

## C. Plantillas

- [x] C1. En selector, verificar secciones: `base`, `predeterminadas`, `guardadas`, `online placeholder`.
- [x] C2. Verificar que tarjetas muestran metadata (tags y compatibilidad).
- [x] C3. Elegir plantilla predeterminada y validar que estructura cambia en DocEditor.
- [x] C4. Escanear plantilla (`EscanerPlantilla`) y confirmar que se puede crear documento desde ella. Revalidado despues del hotfix de gateway/fallback local.

## D. Editor Word/Docs

- [x] D1. En web, escribir directamente sobre la hoja del documento.
- [x] D2. Probar toolbar base: negrita, cursiva, titulos, lista, numerada, checklist, tabla.
- [x] D3. Probar selector de formato de pagina `A4/Carta`.
- [x] D4. Probar `Pantalla completa` y `Salir pantalla completa`.
- [x] D5. En movil, alternar `Documento` <-> `Formulario`.
- [x] D6. En formulario, editar campos y usar `Sincronizar plantilla`; validar cambio en documento.
- [x] D7. Reemplazar logos y validar restricciones (PNG/JPG, 2 MB max, 1500 px max lado).

## E. Copiloto IA en editor

- [x] E1. Verificar estado IA visible en toolbar:
- [x] E1.1 `IA en nube configurada` (si hay backend/env).
- [x] E1.2 `Modo local temporal` (si falta config).
- [x] E2. Probar acciones: `Sugerir`, `Mejorar`, `Completar`, `Rubrica`, `Revisar`.
- [x] E3. Confirmar que cada accion responde sin spinner infinito.
- [x] E4. Insertar resultado IA y validar persistencia en documento/campos.
- [x] E5. Confirmar fallback local usable cuando no hay backend IA.

## F. Web scroll y clicks

- [x] F1. En `Contenido`, hacer scroll largo sin zoom out y sin cortes.
- [x] F2. Abrir/cerrar modal `Crear nuevo` y verificar que no bloquea clicks luego de cerrar.
- [x] F3. En `CrearPlaneacion`, scroll completo funcional y botones clickeables.
- [x] F4. En `DocEditor`, scroll vertical funcional (normal y pantalla completa).

## G. Persistencia y sync

- [x] G1. Editar documento y esperar autosave de borrador.
- [x] G2. Salir sin guardar final, volver a abrir y verificar recuperacion del borrador esperado.
- [x] G3. Guardar documento y confirmar que ya no hay alerta de cambios pendientes al salir.
- [x] G4. Duplicar, eliminar, buscar y filtrar desde lista/contenido; confirmar consistencia.
- [x] G5. Probar flujo offline: editar sin conexion, reconectar y validar sync sin duplicados.

## H. Exportacion

- [x] H1. Exportar planeacion a PDF desde flujo actual.
- [x] H2. Exportar planeacion a DOCX desde flujo actual.
- [x] H3. Abrir archivos exportados y verificar estructura legible.

## Resultado final

- [x] APROBADO Fase 9
- [ ] REQUIERE AJUSTES

Observaciones:

- `2026-05-29: C4 detecto errores de layout/contraste y fallo IA del escaner. Resuelto tras hotfix.`
- `2026-05-30: Fase 9 aprobada documentalmente; el flujo principal queda cerrado para continuar con la reorientacion global.`
- `____________________________________________________________`
- `____________________________________________________________`
