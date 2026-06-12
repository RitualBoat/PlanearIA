import { renderHook } from "@testing-library/react-native";
import { usePermission } from "../../hooks/usePermission";

interface MockAuth {
  usuario: { rol?: string } | null;
  isGuest: boolean;
  isAuthenticated: boolean;
}

let mockAuth: MockAuth = { usuario: null, isGuest: false, isAuthenticated: false };

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function setAuth(partial: Partial<MockAuth>): void {
  mockAuth = { usuario: null, isGuest: false, isAuthenticated: false, ...partial };
}

describe("usePermission", () => {
  it("grants cambiar_roles to admin and dev", () => {
    setAuth({ usuario: { rol: "admin" }, isAuthenticated: true });
    expect(renderHook(() => usePermission()).result.current.can("cambiar_roles")).toBe(true);

    setAuth({ usuario: { rol: "dev" }, isAuthenticated: true });
    const dev = renderHook(() => usePermission()).result.current;
    expect(dev.can("cambiar_roles")).toBe(true);
    expect(dev.isAdmin).toBe(true);
    expect(dev.isDev).toBe(true);
  });

  it("denies cambiar_roles to docente but allows academic permissions", () => {
    setAuth({ usuario: { rol: "docente" }, isAuthenticated: true });
    const { result } = renderHook(() => usePermission());
    expect(result.current.can("cambiar_roles")).toBe(false);
    expect(result.current.can("gestionar_grupos")).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it("limits alumno to ver_propios_datos", () => {
    setAuth({ usuario: { rol: "alumno" }, isAuthenticated: true });
    const { result } = renderHook(() => usePermission());
    expect(result.current.can("ver_propios_datos")).toBe(true);
    expect(result.current.can("gestionar_grupos")).toBe(false);
  });

  it("maps legacy roles to canonical permissions", () => {
    setAuth({ usuario: { rol: "supervisor" }, isAuthenticated: true });
    const sup = renderHook(() => usePermission()).result.current;
    expect(sup.canonicalRole).toBe("docente");
    expect(sup.can("gestionar_grupos")).toBe(true);
    expect(sup.can("cambiar_roles")).toBe(false);
  });

  it("denies every elevated permission to guests", () => {
    setAuth({ usuario: { rol: "docente" }, isGuest: true, isAuthenticated: true });
    const { result } = renderHook(() => usePermission());
    expect(result.current.can("gestionar_grupos")).toBe(false);
    expect(result.current.can("cambiar_roles")).toBe(false);
    expect(result.current.can("ver_propios_datos")).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.hasRole("docente")).toBe(false);
  });

  it("hasRole matches the raw role only", () => {
    setAuth({ usuario: { rol: "admin" }, isAuthenticated: true });
    const { result } = renderHook(() => usePermission());
    expect(result.current.hasRole("admin")).toBe(true);
    expect(result.current.hasRole("docente", "dev")).toBe(false);
  });

  it("denies all permissions with no session", () => {
    setAuth({ usuario: null });
    const { result } = renderHook(() => usePermission());
    expect(result.current.can("ver_propios_datos")).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.canonicalRole).toBeNull();
  });
});
