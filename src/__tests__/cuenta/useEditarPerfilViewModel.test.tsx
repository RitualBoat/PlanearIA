import { renderHook, act } from "@testing-library/react-native";
import { useEditarPerfilViewModel, BIO_MAX_LENGTH } from "../../hooks/useEditarPerfilViewModel";

// ─── Mocks ───

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

const mockActualizarPerfil = jest.fn().mockResolvedValue({ success: true });

// Stable usuario reference to prevent useEffect re-running
const mockUsuario = {
  id: "u1",
  nombre: "Ana",
  apellidos: "López",
  email: "ana@test.com",
  biografia: "Docente",
  pais: "México",
};

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: mockUsuario,
    actualizarPerfil: mockActualizarPerfil,
  }),
}));

// ─── Tests ───

describe("useEditarPerfilViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inicializa con datos del usuario", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());

    expect(result.current.nombre).toBe("Ana");
    expect(result.current.apellidos).toBe("López");
    expect(result.current.email).toBe("ana@test.com");
    expect(result.current.pais).toBe("México");
  });

  it("isDirty es false cuando no hay cambios", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    expect(result.current.isDirty).toBe(false);
  });

  it("isDirty es true al cambiar nombre", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    act(() => result.current.setNombre("María"));
    expect(result.current.isDirty).toBe(true);
  });

  it("isDirty es true al cambiar país", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    act(() => result.current.setPais("Colombia"));
    expect(result.current.isDirty).toBe(true);
  });

  it("setNombre limpia nombreError", async () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());

    // Trigger error by saving with empty name
    act(() => result.current.setNombre(""));
    await act(async () => {
      result.current.handleGuardar();
    });

    expect(result.current.nombreError).toBe("Este campo es obligatorio");

    // Now set a valid name
    act(() => result.current.setNombre("María"));
    expect(result.current.nombreError).toBe("");
  });

  it("setBiografia respeta BIO_MAX_LENGTH", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    const longText = "a".repeat(BIO_MAX_LENGTH + 50);

    act(() => result.current.setBiografia(longText));
    // Should not update since it exceeds max length — stays at original "Docente"
    expect(result.current.bioCharCount).toBeLessThanOrEqual(BIO_MAX_LENGTH);
  });

  it("bioCharCount refleja longitud de biografía", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    act(() => result.current.setBiografia("Hola mundo"));
    expect(result.current.bioCharCount).toBe(10);
  });

  it("bioMaxLength es BIO_MAX_LENGTH", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    expect(result.current.bioMaxLength).toBe(BIO_MAX_LENGTH);
  });

  it("handleGuardar falla con nombre vacío", async () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());

    act(() => result.current.setNombre("   "));
    await act(async () => {
      result.current.handleGuardar();
    });

    expect(result.current.nombreError).toBe("Este campo es obligatorio");
    expect(mockActualizarPerfil).not.toHaveBeenCalled();
  });

  it("handleGuardar llama actualizarPerfil con datos correctos", async () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());

    await act(async () => {
      result.current.handleGuardar();
    });

    expect(mockActualizarPerfil).toHaveBeenCalledWith({
      nombre: "Ana",
      apellidos: "López",
      biografia: "Docente",
      pais: "México",
    });
  });

  it("handleGuardar pone saveSuccess=true cuando exitoso", async () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());

    await act(async () => {
      result.current.handleGuardar();
    });

    expect(result.current.saveSuccess).toBe(true);
  });

  it("handleGuardar pone saveError=true cuando falla", async () => {
    mockActualizarPerfil.mockResolvedValueOnce({ success: false, error: "Error test" });
    const { result } = renderHook(() => useEditarPerfilViewModel());

    await act(async () => {
      result.current.handleGuardar();
    });

    expect(result.current.saveError).toBe(true);
  });

  it("handleCancelar llama goBack", () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());
    act(() => result.current.handleCancelar());
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("dismissSuccess resets saveSuccess", async () => {
    const { result } = renderHook(() => useEditarPerfilViewModel());

    await act(async () => {
      result.current.handleGuardar();
    });

    expect(result.current.saveSuccess).toBe(true);
    act(() => result.current.dismissSuccess());
    expect(result.current.saveSuccess).toBe(false);
  });
});
