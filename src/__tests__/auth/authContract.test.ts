import {
  ASSIGNABLE_ROLES,
  AUTH_CONTRACT,
  AUTH_PERMISSIONS_VERSION,
  LEGACY_ROLE_ALIASES,
  PERMISOS,
  PLANEARIA_ROLES,
  getPermissionsForRole,
  hasPermissionForRole,
  normalizeRole,
} from "../../../types/auth";

const backendAuthContract = require("../../../backend/lib/authContract");

describe("auth contract", () => {
  it("uses the same contract in frontend and backend", () => {
    expect(backendAuthContract.authContract).toEqual(AUTH_CONTRACT);
    expect(backendAuthContract.AUTH_PERMISSIONS_VERSION).toBe(AUTH_PERMISSIONS_VERSION);
  });

  it("defines canonical roles and legacy aliases", () => {
    expect(PLANEARIA_ROLES).toEqual(["dev", "admin", "docente", "alumno"]);
    expect(LEGACY_ROLE_ALIASES).toEqual({
      supervisor: "docente",
      usuario: "alumno",
    });
    expect(normalizeRole("supervisor")).toBe("docente");
    expect(normalizeRole("usuario")).toBe("alumno");
  });

  it("keeps dev out of assignable roles by default", () => {
    expect(ASSIGNABLE_ROLES).toContain("admin");
    expect(ASSIGNABLE_ROLES).not.toContain("dev");
  });

  it("checks permissions from the shared contract", () => {
    expect(hasPermissionForRole("admin", PERMISOS.CAMBIAR_ROLES)).toBe(true);
    expect(hasPermissionForRole("docente", PERMISOS.CAMBIAR_ROLES)).toBe(false);
    expect(getPermissionsForRole("usuario")).toEqual([PERMISOS.VER_PROPIOS_DATOS]);

    expect(backendAuthContract.hasPermission("admin", PERMISOS.CAMBIAR_ROLES)).toBe(true);
    expect(backendAuthContract.hasPermission("docente", PERMISOS.CAMBIAR_ROLES)).toBe(false);
  });
});
