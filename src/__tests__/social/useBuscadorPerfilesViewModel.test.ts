import { renderHook, act } from "@testing-library/react-native";
import { useBuscadorPerfilesViewModel } from "../../hooks/useBuscadorPerfilesViewModel";

describe("useBuscadorPerfilesViewModel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
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

  it("handleEnviarSolicitud cierra modal y muestra toast", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    const docente = result.current.sugeridos[0];
    act(() => result.current.handleConectar(docente));
    act(() => result.current.handleEnviarSolicitud("Hola!"));
    expect(result.current.solicitudModal.visible).toBe(false);
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.type).toBe("solicitud");
  });

  it("handleCerrarSolicitudModal cierra modal", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleConectar(result.current.sugeridos[0]));
    act(() => result.current.handleCerrarSolicitudModal());
    expect(result.current.solicitudModal.visible).toBe(false);
  });

  it("handleAbrirInviteModal / handleCerrarInviteModal", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    expect(result.current.inviteModal).toBe(true);
    act(() => result.current.handleCerrarInviteModal());
    expect(result.current.inviteModal).toBe(false);
  });

  it("handleCopiarEnlace cierra modal y muestra toast", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    act(() => result.current.handleCopiarEnlace());
    expect(result.current.inviteModal).toBe(false);
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.type).toBe("enlace");
  });

  it("setFiltroNivel actualiza filtro de nivel", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.setFiltroNivel("Secundaria"));
    expect(result.current.filtroNivel).toBe("Secundaria");
  });

  it("toast auto-dismiss después de 3 segundos", () => {
    const { result } = renderHook(() => useBuscadorPerfilesViewModel());
    act(() => result.current.handleAbrirInviteModal());
    act(() => result.current.handleCopiarEnlace());
    expect(result.current.toast.visible).toBe(true);
    act(() => jest.advanceTimersByTime(3100));
    expect(result.current.toast.visible).toBe(false);
  });
});
