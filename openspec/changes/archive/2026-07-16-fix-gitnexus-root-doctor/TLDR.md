# TLDR: fix-gitnexus-root-doctor

## Intención de la propuesta

Resolver el falso `Not a git repository` que aparece en Windows cuando el diagnóstico de GitNexus se ejecuta mediante el wrapper del proyecto. El cambio trata la causa del directorio de trabajo, no el síntoma ni la deuda Expo asociada a #66.

## Enfoque técnico elegido

El wrapper resolverá la raíz verificada y ejecutará el CLI de npx mediante Node, sin una shell intermedia. También considerará la firma de repositorio ausente como error semántico, aunque el proceso hijo devuelva cero. Se conserva la detección FTS, la versión fijada y el contrato read-only.

## Comportamiento esperado por la spec

Desde un checkout válido de Windows, el diagnóstico se ejecuta en la raíz y no emite el falso error. Si la firma aparece realmente, el diagnóstico falla de forma accionable y ningún consumidor puede reportar la ruta estructural como sana.

## Plan práctico de tareas

Aplicar la corrección mínima al wrapper, añadir cobertura de la ruta Windows y de la señal con salida cero, y ejecutar los tests focalizados, el diagnóstico y el doctor. Antes de archivar se completarán evidencias, revisión adversarial y el gate de cierre.

## Resumen integral del change

El change deja listo un arreglo pequeño y comprobable para el harness de GitNexus. No toca datos, UI, backend ni dependencias. El resultado buscado es un doctor confiable: falla ante problemas reales, pero no por perder la raíz del repositorio durante la invocación Windows.
