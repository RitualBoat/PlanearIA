## Context

`debt:check` devuelve exit distinto de cero cuando cualquier plan está pausado. Es correcto para una
lectura global, pero el workflow se llama Advisory y su propósito es informar, no bloquear un consumidor
que ya pasó sus smokes.

## Goals / Non-Goals

**Goals:** ejecutar la señal en cada matriz, exponerla como warning y conservar fallos contractuales.

**Non-Goals:** cambiar la política de deuda, ocultar el output o tocar el runtime de producto.

## Decisions

- El paso de deuda usa `continue-on-error: true` con `id` estable; el workflow no omite su ejecución.
- Un paso posterior condicionado a fallo escribe `::warning` y conserva causa/recuperación visibles.
- No se usa `continue-on-error` en instalación, contrato consumidor ni documentos.

## Risks / Trade-offs

- [Señal menos bloqueante] → el nombre Advisory, warning explícito y CI required separada preservan la intención.

## Migration Plan

Aplicar por PR; rollback es revertir el PR. No hay datos ni migraciones.

## Open Questions

Ninguna.
