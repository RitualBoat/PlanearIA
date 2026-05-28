import React, { type ReactNode } from "react";
import { AuthProvider } from "../../context/AuthContext";
import {
  PlaneacionesProvider,
  usePlaneaciones,
  useSyncPlaneaciones,
} from "../../context/PlaneacionesContext";

interface SyncProviderProps {
  children: ReactNode;
}

/**
 * @deprecated Compatibilidad temporal.
 * La lógica de planeaciones vive en PlaneacionesContext.
 */
export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <PlaneacionesProvider>{children}</PlaneacionesProvider>
    </AuthProvider>
  );
};

export { usePlaneaciones, useSyncPlaneaciones };
