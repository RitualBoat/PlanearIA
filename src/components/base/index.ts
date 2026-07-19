/**
 * Biblioteca base de PlanearIA (change componentes-base, #82).
 *
 * Diez componentes presentacionales que traducen los tokens de #80 en piezas
 * ensamblables, con estados y accesibilidad resueltos por construccion.
 *
 * La navegacion primaria (AppShell, barra, rail y sidebar) NO vive aqui: la entrego #81 y
 * su comportamiento es la spec `adaptive-app-shell`.
 *
 * Importar desde este barrel es conveniencia, no obligacion: cada componente sigue siendo
 * importable por su ruta directa cuando convenga no arrastrar el resto.
 */
export { default as Screen } from "./Screen";
export type { ScreenProps } from "./Screen";

export { default as Card } from "./Card";
export type { CardProps } from "./Card";

export { default as Button } from "./Button";
export type { ButtonProps } from "./Button";

export { default as Input } from "./Input";
export type { InputProps } from "./Input";

export { default as Chip } from "./Chip";
export type { ChipProps } from "./Chip";

export { default as Sheet } from "./Sheet";
export type { SheetProps } from "./Sheet";

export { default as Toast } from "./Toast";
export type { ToastProps } from "./Toast";

export { default as Banner } from "./Banner";
export type { BannerProps } from "./Banner";

export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps, EmptyStateVariant } from "./EmptyState";

export { default as Skeleton } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

export { MIN_TOUCH_TARGET } from "./primitives";
export type { ActionVariant, ToneVariant } from "./primitives";
