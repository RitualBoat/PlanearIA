import authContract from "../shared/authContract.json";

export type PlaneariaRole = "dev" | "admin" | "docente" | "alumno";
export type LegacyRole = "supervisor" | "usuario";
export type RolUsuario = PlaneariaRole | LegacyRole;

export type Permission =
  | "gestionar_usuarios"
  | "cambiar_roles"
  | "ver_todos_grupos"
  | "gestionar_planeaciones"
  | "gestionar_grupos"
  | "gestionar_alumnos"
  | "gestionar_calificaciones"
  | "gestionar_entregables"
  | "gestionar_recursos"
  | "gestionar_asistencia"
  | "ver_propios_datos";

export type Permiso = Permission;

export interface AuthUser {
  id: number | string;
  nombre: string;
  apellidos?: string;
  email: string;
  rol: RolUsuario;
  canonicalRole?: PlaneariaRole;
  permissionsVersion?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: "Bearer";
  expiresAt?: string;
  refreshExpiresAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  sessionId?: string;
  deviceId?: string;
  isGuest?: boolean;
  permissionsVersion: number;
}

export interface AuthTokenClaims {
  sub?: string;
  userId: number | string;
  email: string;
  role: PlaneariaRole;
  rol?: RolUsuario;
  sessionId?: string;
  jti?: string;
  permissionsVersion: number;
  iat?: number;
  exp?: number;
}

export const AUTH_CONTRACT = authContract;

export const PLANEARIA_ROLES = authContract.roles.canonical as PlaneariaRole[];
export const LEGACY_ROLES = authContract.roles.legacy as LegacyRole[];
export const ASSIGNABLE_ROLES = authContract.roles.assignable as RolUsuario[];
export const LEGACY_ROLE_ALIASES = authContract.roles.aliases as Record<LegacyRole, PlaneariaRole>;
export const ROLE_LABELS = authContract.roles.labels as Record<RolUsuario, string>;
export const PERMISOS = authContract.permissions as Record<string, Permission>;
export const PERMISOS_POR_ROL = authContract.permissionsByRole as Record<RolUsuario, Permission[]>;
export const AUTH_PERMISSIONS_VERSION = authContract.permissionsVersion;

export function isCanonicalRole(role: string | null | undefined): role is PlaneariaRole {
  return PLANEARIA_ROLES.includes(role as PlaneariaRole);
}

export function isLegacyRole(role: string | null | undefined): role is LegacyRole {
  return LEGACY_ROLES.includes(role as LegacyRole);
}

export function isKnownRole(role: string | null | undefined): role is RolUsuario {
  return isCanonicalRole(role) || isLegacyRole(role);
}

export function normalizeRole(role: string | null | undefined): PlaneariaRole {
  if (isCanonicalRole(role)) return role;
  if (isLegacyRole(role)) return LEGACY_ROLE_ALIASES[role];
  return "docente";
}

export function getRoleLabel(role: RolUsuario): string {
  return ROLE_LABELS[role] || role;
}

export function getPermissionsForRole(role: string | null | undefined): Permission[] {
  if (!isKnownRole(role)) return [];
  return PERMISOS_POR_ROL[role] || [];
}

export function hasPermissionForRole(
  role: string | null | undefined,
  permission: Permission
): boolean {
  return getPermissionsForRole(role).includes(permission);
}
