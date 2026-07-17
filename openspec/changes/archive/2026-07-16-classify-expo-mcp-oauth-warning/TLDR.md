# TLDR: classify-expo-mcp-oauth-warning

## Que problema resuelve (Proposal)

El doctor del harness reporta `FAIL mcp-smoke` porque el MCP de Expo pide un permiso OAuth que solo una persona puede dar desde el navegador. Es una condicion del entorno, no un error del codigo. Un gate siempre rojo entrena a ignorarlo y esconde cualquier falla real que aparezca despues. Figma ya se trata como aviso, pero por un camino mas debil: su configuracion ni siquiera se contacta. Expo si se lanza y deja evidencia real. Queremos avisar sin mentir: ni ocultar un servidor caido ni exigir autenticacion manual en cada sesion de agente.

## Como se resuelve (Design)

La decision vive solo en el doctor. El smoke sigue diciendo la verdad cruda: Expo queda en `ok: false` y su comando sigue fallando. Solo agrega una etiqueta legible por maquina. El doctor la lee y baja a aviso unicamente si la evidencia lo prueba: el mensaje de autorizacion con una direccion segura del mismo dominio configurado, y un servidor que nunca llego a inicializar. El codigo de salida se ignora, porque varia segun el entorno. La degradacion solo aplica a servidores en una lista explicita de configuracion, nunca por sorpresa.

## Que comportamiento se espera (Spec)

Un MCP autenticado y respondiente da `PASS`. Expo sin autorizar da `WARN`, nombra el servidor y explica como autorizarlo, sin afirmar que sus herramientas quedaron verificadas. Un MCP realmente roto (ausente, sin red, con error de protocolo o con respuesta invalida) sigue dando `FAIL`. Si un fallo real coincide con Expo sin autorizar, gana el `FAIL`: un problema real nunca queda tapado. Un servidor con OAuth pendiente fuera de la lista permitida tambien sigue en `FAIL`, porque degradarlo exige una decision humana explicita.

## Plan practico (Tasks)

Primero se agrega la clasificacion al smoke sin cambiar su veredicto. Luego el doctor pasa a inspeccionar los resultados antes de decidir, con la lista permitida declarada en su archivo de configuracion. Despues se cubren los tres casos con pruebas de resultados inyectados, que no lanzan ningun servidor real y por eso son reproducibles en cualquier maquina. Se documenta la limitacion y como autorizar Expo cuando una tarea si lo necesite. Se cierra ejecutando las validaciones del harness y comprobando que el doctor queda sin fallas.

## Resumen integral del change

El doctor deja de confundir "falta un permiso humano" con "el servidor esta caido". La diferencia se decide con evidencia verificable, no con el codigo de salida, que resulto inestable segun el entorno. La senal cruda del smoke se conserva intacta: nada se vuelve verde por conveniencia. El criterio queda escrito en configuracion, auditable y reversible sin tocar codigo. Los checks de Figma no se debilitan y Expo sigue en el smoke. El resultado es un gate local que vuelve a ser creible: sin fallas rojas permanentes por una condicion de entorno, y con un aviso honesto que dice exactamente que falta y como resolverlo.
