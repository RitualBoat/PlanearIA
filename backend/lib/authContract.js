const authContract = require("../../shared/authContract.json");

const CANONICAL_AUTH_ROLES = authContract.roles.canonical;
const LEGACY_AUTH_ROLES = authContract.roles.legacy;
const ASSIGNABLE_AUTH_ROLES = authContract.roles.assignable;
const LEGACY_ROLE_ALIASES = authContract.roles.aliases;
const ROLE_LABELS = authContract.roles.labels;
const AUTH_PERMISSIONS = authContract.permissions;
const PERMISSIONS_BY_ROLE = authContract.permissionsByRole;
const AUTH_PERMISSIONS_VERSION = authContract.permissionsVersion;
const VALID_AUTH_ROLES = [...CANONICAL_AUTH_ROLES, ...LEGACY_AUTH_ROLES];

function isCanonicalRole(role) {
  return CANONICAL_AUTH_ROLES.includes(role);
}

function isLegacyRole(role) {
  return LEGACY_AUTH_ROLES.includes(role);
}

function isKnownRole(role) {
  return isCanonicalRole(role) || isLegacyRole(role);
}

function normalizeRole(role) {
  if (isCanonicalRole(role)) return role;
  if (isLegacyRole(role)) return LEGACY_ROLE_ALIASES[role];
  return "docente";
}

function getPermissionsForRole(role) {
  if (!isKnownRole(role)) return [];
  return PERMISSIONS_BY_ROLE[role] || [];
}

function hasPermission(role, permission) {
  return getPermissionsForRole(role).includes(permission);
}

module.exports = {
  authContract,
  AUTH_PERMISSIONS,
  AUTH_PERMISSIONS_VERSION,
  CANONICAL_AUTH_ROLES,
  LEGACY_AUTH_ROLES,
  ASSIGNABLE_AUTH_ROLES,
  LEGACY_ROLE_ALIASES,
  ROLE_LABELS,
  PERMISSIONS_BY_ROLE,
  VALID_AUTH_ROLES,
  getPermissionsForRole,
  hasPermission,
  isCanonicalRole,
  isKnownRole,
  isLegacyRole,
  normalizeRole,
};
