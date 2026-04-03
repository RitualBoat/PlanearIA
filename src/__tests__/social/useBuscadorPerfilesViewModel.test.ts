import { renderHook, act } from "@testing-library/react-native";
import { useBuscadorPerfilesViewModel } from "../../hooks/useBuscadorPerfilesViewModel";

// Mock ContactosContext
const mockEnviarSolicitud = jest.fn().mockResolvedValue(undefined);
let mockContactos: any[] = [];
let mockSolicitudes: any[] = [];

jest.mock("../../context/ContactosContext", () => ({
  useContactos: () => ({
    contactos: mockContactos,
    solicitudes: mockSolicitudes,
    enviarSolicitud: mockEnviarSolicitud,
  }),
}));

// Mock AuthContext
const mockUsuario = { id: 1, nombre: "Test", apellidos: "User", fotoPerfil: null };

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: mockUsuario,
  }),
}));

// Mock inviteLinkService
const mockCopyToClipboard = jest.fn().mockResolvedValue(true);
const mockShareInviteLink = jest.fn().mockResolvedValue(true);

jest.mock("../../services/inviteLinkService", () => ({
  createInviteLink: (fromUserId?: string) => ({
    token: "mock-token-123",
    url: `https://planearia.app/invite/mock-token-123${fromUserId ? `?from=${fromUserId}` : ""}`,
    webUrl: `https://planearia.app/invite/mock-token-123${fromUserId ? `?from=${fromUserId}` : ""}`,
    deepUrl: `planearia://invite/mock-token-123${fromUserId ? `?from=${fromUserId}` : ""}`,
    expiresAt: "2026-04-09T00:00:00.000Z",
  }),
  copyToClipboard: (...args: any[]) => mockCopyToClipboard(...args),
  shareInviteLink: (...args: any[]) => mockShareInviteLink(...args),
}));

describe("useBuscadorPerfilesViewModel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockContactos = [];
    mockSolicitudes = [];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("inicia con valores por defecto correctos", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    expect(result.current.searchQuery).toBe("");
    expect(result.current.filtroNivel).toBe("Todos");
    expect(result.current.filtrosExpandidos).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.hasSearched).toBe(false);
    expect(result.current.resultados).toEqual([]);
    expect(result.current.sugeridos.length).toBe(3);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it("actualiza searchQuery", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.setSearchQuery("matemáticas"));
    expect(result.current.searchQuery).toBe("matemáticas");
  });

  it("toggle filtros expandidos", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    expect(result.current.filtrosExpandidos).toBe(false);
    act(() => result.current.toggleFiltros());
    expect(result.current.filtrosExpandidos).toBe(true);
    act(() => result.current.toggleFiltros());
    expect(result.current.filtrosExpandidos).toBe(false);
  });

  it("handleSearch busca y encuentra resultados", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.setSearchQuery("Sofía"));
    act(() => result.current.handleSearch());
    expect(result.current.isSearching).toBe(true);
    expect(result.current.hasSearched).toBe(true);

    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.isSearching).toBe(false);
    expect(result.current.resultados.length).toBeGreaterThan(0);
  });

  it("handleSearch no busca si query está vacío", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleSearch());
    expect(result.current.isSearching).toBe(false);
    expect(result.current.hasSearched).toBe(false);
  });

  it("handleClearSearch limpia query y resultados", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.setSearchQuery("test"));
    act(() => result.current.handleSearch());
    act(() => jest.advanceTimersByTime(1000));
    act(() => result.current.handleClearSearch());
    expect(result.current.searchQuery).toBe("");
    expect(result.current.resultados).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });

  it("handleConectar abre modal de solicitud", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    const docente = result.current.sugeridos[0];
    act(() => result.current.handleConectar(docente));
    expect(result.current.solicitudModal.visible).toBe(true);
    expect(result.current.solicitudModal.docente).toEqual(docente);
  });

  it("handleEnviarSolicitud cierra modal, persiste solicitud y muestra toast", async () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    const docente = result.current.sugeridos[0];
    act(() => result.current.handleConectar(docente));
    await act(async () => result.current.handleEnviarSolicitud("Hola!"));
    expect(result.current.solicitudModal.visible).toBe(false);
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.type).toBe("solicitud");
    expect(mockEnviarSolicitud).toHaveBeenCalledWith(
      expect.objectContaining({
        deUsuarioId: "1",
        deUsuarioNombre: "Test User",
        paraUsuarioId: docente.id,
        mensaje: "Hola!",
      })
    );
  });

  it("handleCerrarSolicitudModal cierra modal", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleConectar(result.current.sugeridos[0]));
    act(() => result.current.handleCerrarSolicitudModal());
    expect(result.current.solicitudModal.visible).toBe(false);
  });

  it("handleAbrirInviteModal genera URL y abre modal", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    expect(result.current.inviteModal).toBe(true);
    expect(result.current.inviteUrl).toContain("https://planearia.app/invite/mock-token-123");
    expect(result.current.inviteUrl).toContain("from=1");
    act(() => result.current.handleCerrarInviteModal());
    expect(result.current.inviteModal).toBe(false);
  });

  it("handleCopiarEnlace copies URL, cierra modal y muestra toast", async () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    await act(async () => result.current.handleCopiarEnlace());
    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      expect.stringContaining("https://planearia.app/invite/mock-token-123")
    );
    expect(result.current.inviteModal).toBe(false);
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.type).toBe("enlace");
  });

  it("handleCompartirEnlace shares invite link via native share", async () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    await act(async () => result.current.handleCompartirEnlace());
    expect(mockShareInviteLink).toHaveBeenCalledWith(
      expect.stringContaining("https://planearia.app/invite/mock-token-123"),
      "Test User"
    );
  });

  it("setFiltroNivel actualiza filtro de nivel", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.setFiltroNivel("Secundaria"));
    expect(result.current.filtroNivel).toBe("Secundaria");
  });

  it("toast auto-dismiss después de 3 segundos", async () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    await act(async () => result.current.handleCopiarEnlace());
    expect(result.current.toast.visible).toBe(true);
    act(() => jest.advanceTimersByTime(3100));
    expect(result.current.toast.visible).toBe(false);
  });

  it("sugeridos reflect real status from contactos context", () => {
    mockContactos = [{ usuarioId: "s1", estado: "aceptada" }];
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    const s1 = result.current.sugeridos.find((s: any) => s.id === "s1");
    expect(s1?.estado).toBe("conectado");
  });

  it("sugeridos reflect pending solicitud from solicitudes context", () => {
    mockSolicitudes = [{ paraUsuarioId: "s2", estado: "pendiente" }];
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    const s2 = result.current.sugeridos.find((s: any) => s.id === "s2");
    expect(s2?.estado).toBe("solicitud_enviada");
  });

  it("enriches search results with real connection status", () => {
    mockContactos = [{ usuarioId: "r5", estado: "aceptada" }];
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.setSearchQuery("Sec"));
    act(() => result.current.handleSearch());
    act(() => jest.advanceTimersByTime(1000));
    const r5 = result.current.resultados.find((r: any) => r.id === "r5");
    if (r5) expect(r5.estado).toBe("conectado");
  });

  it("enviarSolicitud sends empty mensaje as undefined", async () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    const docente = result.current.sugeridos[0];
    act(() => result.current.handleConectar(docente));
    await act(async () => result.current.handleEnviarSolicitud(""));
    expect(mockEnviarSolicitud).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: undefined })
    );
  });
});
