export const CARRERA_OPTIONS = ["ISC", "IGE", "ARQ", "ITICS"] as const;
export type CarreraSelectorValue = (typeof CARRERA_OPTIONS)[number] | "";
