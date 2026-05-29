1. [corregido pendiente de revalidacion manual] Texto amontonado o sobrepuesto en web a la hora de escanear planeacion, boton seleccionado se pone azul y hace ilegible el texto en la pantalla de escanear planeacion, ademas en web al darle clic en analizar estructura sale un aviso que dice failed to fetch, y en movil sale un JSON Parse error: Unexpected character: T, probablemente falte configurar la IA de escanear planeacion.

   Hotfix aplicado 2026-05-29:
   - Preview del texto extraido con scroll propio para evitar sobreposicion con el boton.
   - Contraste reforzado en chips/badges/botones activos.
   - Escaner usa fallback local si el backend IA no esta configurado o responde texto no JSON.
   - Backend IA ahora usa gateway multi-provider y limite por accion.
