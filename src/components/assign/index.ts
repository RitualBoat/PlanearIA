/**
 * Selector transversal de asignar y adjuntar (change assign-sheet, #84).
 *
 * Una sola hoja para toda la app. Su contrato de entrada son los elementos a asignar, no
 * una pantalla concreta: por eso Office, Clases y Conecta pueden montarla en las olas
 * siguientes sin copiarla ni construir su propio selector.
 *
 * La escritura no vive aqui: la ejecuta `useAssignSheet()` a traves de los contextos que ya
 * encolan en `src/sync`. Ninguna superficie debe escribir una asignacion por otro camino.
 */
export { default as AssignSheet } from "./AssignSheet";
export type { AssignSheetProps } from "./AssignSheet";

export { useAssignSheet } from "../../hooks/useAssignSheet";
export type {
  AssignSheetViewModel,
  DestinoAsignacion,
  ElementoAsignable,
  ElementoAsignableTipo,
  OpcionDestino,
  ResultadoAsignacion,
} from "../../hooks/useAssignSheet";
