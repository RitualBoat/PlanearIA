/**
 * Fuente unica de presentacion del estado de sincronizacion (change sync-status-ui, #83).
 *
 * Antes de este change la app traducia el mismo estado de tres formas distintas, y la mas
 * visible mentia: con la sesion expirada mostraba "Sincronizado" en verde. Este hook es la
 * unica traduccion de estado a lenguaje visible; los componentes renderizan su resultado y
 * no vuelven a decidir texto, icono ni tono.
 *
 * La tabla vive en `syncPresentation.ts` como funcion pura; aqui solo se la alimenta desde
 * el contexto global y se memoiza.
 */

import { useMemo } from "react";
import { useSyncStatus } from "../context/SyncContext";
import { derivarPresentacionSync, type PresentacionSync } from "./syncPresentation";

export type {
  AccionSync,
  EntradaSync,
  EstadoSync,
  PresentacionSync,
  TonoSync,
} from "./syncPresentation";
export { derivarPresentacionSync } from "./syncPresentation";

export function useSyncPresentation(): PresentacionSync {
  const { syncEnabled, isOnline, status, pendingCount, authError } = useSyncStatus();
  return useMemo(
    () => derivarPresentacionSync({ syncEnabled, isOnline, status, pendingCount, authError }),
    [syncEnabled, isOnline, status, pendingCount, authError]
  );
}

export default useSyncPresentation;
