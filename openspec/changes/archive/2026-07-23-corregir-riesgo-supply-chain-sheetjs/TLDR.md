# La intención de la propuesta

Corregir el falso verde de #133 sin reescribir su evidencia. El riesgo de bloqueo síncrono de SheetJS se registra como deuda externa aceptada temporalmente, mientras el artefacto se vendoriza y su atribución se hace visible. El cambio no declara eliminado el riesgo ni mezcla el trabajo posterior de #136.

# El enfoque del diseño

Se conserva SheetJS 0.20.3, pero el tarball oficial pasa a una ruta local verificada por SHA-256, versión y licencia. El registro de deuda es la única fuente del estado de la excepción. La pantalla legal existente gana una tercera pestaña tipada y accesible, sin rediseño ni archivos por plataforma.

# El comportamiento esperado por la spec

Las excepciones lanzadas por el parser se convierten en error controlado; un bloqueo síncrono se reconoce como no capturable por `try/catch`. `npm ci` resuelve `xlsx` desde el tarball local. Los notices son encontrables en repo y app, y la excepción queda `accepted-exception` hasta el 31 de octubre de 2026.

# El plan práctico de tareas

Primero se protege el hash histórico y se vendoriza con checks negativos. Después se corrigen contrato, notices, UI, tipos y tests. Se captura el assessment mediante el motor, se ejecuta validación técnica/visual completa y una revisión adversarial. Solo con evidencia se marcan tareas, se archiva y se cierra mediante PR protegido.

# Resumen integral del change

Este change convierte un riesgo narrativo en un riesgo gobernado, reduce dependencia operativa del CDN y cumple la atribución de SheetJS CE. Conserva import/export y documentos legales, añade un rollback que nunca borra evidencia y obliga a desactivar import `.xlsx` si la excepción vence sin solución.
