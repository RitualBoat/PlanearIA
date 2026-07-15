import { useMemo } from "react";
import { useAuth } from ".//useAuth";
import {
  hasPermissionForRole,
  normalizeRole,
  type Permission,
  type PlaneariaRole,
  type RolUsuario,
} from "../../types/auth";

/**
 * Frontend RBAC helper. UX-only: hides or guides UI based on the current
 * role/permissions. Real authorization is enforced by the backend.
 *
 * Reads the session role from AuthContext and resolves it against the
 * shared permissions contract (shared/authContract.json).
 */
export interface PermissionApi {
  /** Raw role as stored on the user (may be a legacy alias) */
  role: RolUsuario | null;
  /** Canonical role after mapping legacy aliases */
  canonicalRole: PlaneariaRole | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  /** True if the current role grants the given permission */
  can: (permission: Permission) => boolean;
  /** True if the current raw role matches any of the given roles */
  hasRole: (...roles: RolUsuario[]) => boolean;
  /** Convenience: admin or dev */
  isAdmin: boolean;
  /** Convenience: dev only */
  isDev: boolean;
}

export function usePermission(): PermissionApi {
  const { usuario, isGuest, isAuthenticated } = useAuth();

  return useMemo<PermissionApi>(() => {
    const role = (usuario?.rol ?? null) as RolUsuario | null;
    const canonicalRole = role ? normalizeRole(role) : null;

    return {
      role,
      canonicalRole,
      isGuest,
      isAuthenticated,
      can: (permission: Permission) => {
        // Guests are local-only and never hold elevated permissions.
        if (isGuest) return permission === "ver_propios_datos";
        if (!role) return false;
        return hasPermissionForRole(role, permission);
      },
      hasRole: (...roles: RolUsuario[]) => !!role && !isGuest && roles.includes(role),
      isAdmin: !isGuest && (canonicalRole === "admin" || canonicalRole === "dev"),
      isDev: !isGuest && canonicalRole === "dev",
    };
  }, [usuario, isGuest, isAuthenticated]);
}
