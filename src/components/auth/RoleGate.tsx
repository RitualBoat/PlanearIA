import React from "react";
import { usePermission } from "../../hooks/usePermission";
import type { Permission, RolUsuario } from "../../../types/auth";

/**
 * Conditionally renders children based on the current role/permissions.
 * UX-only gate: it hides UI, it does NOT enforce security. The backend is
 * the real authority for every protected action.
 *
 * Conditions are ANDed. An absent condition is ignored. With no condition
 * the gate is a passthrough (renders children).
 */
interface RoleGateProps {
  children: React.ReactNode;
  /** Require this single permission */
  permission?: Permission;
  /** Require at least one of these permissions */
  anyOf?: Permission[];
  /** Require the raw role to match one of these */
  roles?: RolUsuario[];
  /** Rendered when the gate denies access (defaults to nothing) */
  fallback?: React.ReactNode;
}

export function RoleGate({
  children,
  permission,
  anyOf,
  roles,
  fallback = null,
}: RoleGateProps): React.ReactElement {
  const { can, hasRole } = usePermission();

  let allowed = true;
  if (permission) allowed = allowed && can(permission);
  if (anyOf && anyOf.length > 0) allowed = allowed && anyOf.some((p) => can(p));
  if (roles && roles.length > 0) allowed = allowed && hasRole(...roles);

  return <>{allowed ? children : fallback}</>;
}

export default RoleGate;
