/**
 * Componentes de estado de sincronizacion (change sync-status-ui, #83).
 *
 * Los tres renderizan lo que resuelve `useSyncPresentation()`, la unica traduccion de
 * estado de sync a lenguaje visible. Ninguno decide texto, icono ni tono por su cuenta:
 * esa duplicacion es exactamente el defecto que este change cierra.
 *
 * La barra global de interrupcion (`SyncOfflineBar`) sigue viviendo en
 * `src/components/SyncStatusBanner.tsx` y consume el mismo hook.
 */
export { default as SyncStatusChip } from "./SyncStatusChip";
export type { SyncStatusChipProps } from "./SyncStatusChip";

export { default as SaveStateLabel } from "./SaveStateLabel";
export type { SaveStateLabelProps, EstadoGuardado } from "./SaveStateLabel";

export { default as PendingBadge } from "./PendingBadge";
export type { PendingBadgeProps } from "./PendingBadge";
