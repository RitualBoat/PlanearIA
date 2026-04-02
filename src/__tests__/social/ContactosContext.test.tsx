import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { ContactosProvider, useContactos } from "../../context/ContactosContext";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ContactosProvider>{children}</ContactosProvider>
);

describe("ContactosContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  it("carga sin contactos ni solicitudes inicialmente", async () => {
    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contactos).toEqual([]);
    expect(result.current.solicitudes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("carga contactos almacenados desde AsyncStorage", async () => {
    const stored = [
      {
        id: 1,
        usuarioId: "u1",
        nombre: "María",
        apellidos: "Hernández",
        email: "maria@test.com",
        materia: "Matemáticas",
        estado: "aceptada",
        enLinea: true,
        fechaConexion: "2025-01-01T00:00:00.000Z",
        fechaModificacion: "2025-01-01T00:00:00.000Z",
      },
    ];
    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_CONTACTOS_DATA") return Promise.resolve(JSON.stringify(stored));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contactos).toHaveLength(1);
    expect(result.current.contactos[0].nombre).toBe("María");
  });

  it("agrega un contacto y persiste en AsyncStorage", async () => {
    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.agregarContacto({
        usuarioId: "u2",
        nombre: "José",
        apellidos: "Ramírez",
        email: "jose@test.com",
        materia: "Ciencias",
        estado: "aceptada",
        enLinea: false,
      });
    });

    expect(result.current.contactos).toHaveLength(1);
    expect(result.current.contactos[0].nombre).toBe("José");
    expect(result.current.contactos[0].syncStatus).toBe("pending");
    expect(mockSetItem).toHaveBeenCalledWith("APP_CONTACTOS_DATA", expect.any(String));
  });

  it("elimina un contacto y persiste", async () => {
    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_CONTACTOS_DATA") {
        return Promise.resolve(
          JSON.stringify([
            {
              id: 100,
              usuarioId: "u1",
              nombre: "Ana",
              apellidos: "López",
              email: "",
              estado: "aceptada",
              enLinea: false,
              fechaConexion: "2025-01-01",
              fechaModificacion: "2025-01-01",
            },
          ])
        );
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.contactos).toHaveLength(1);
    });

    await act(async () => {
      await result.current.eliminarContacto(100);
    });

    expect(result.current.contactos).toHaveLength(0);
    expect(mockSetItem).toHaveBeenCalled();
  });

  it("envía una solicitud de conexión y la persiste", async () => {
    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.enviarSolicitud({
        deUsuarioId: "u1",
        deUsuarioNombre: "Carlos Pérez",
        paraUsuarioId: "u2",
        mensaje: "Hola, quiero colaborar",
      });
    });

    expect(result.current.solicitudes).toHaveLength(1);
    expect(result.current.solicitudes[0].estado).toBe("pendiente");
    expect(result.current.solicitudes[0].mensaje).toBe("Hola, quiero colaborar");
    expect(mockSetItem).toHaveBeenCalledWith("APP_SOLICITUDES_DATA", expect.any(String));
  });

  it("acepta una solicitud: cambia estado y crea contacto", async () => {
    const solicitudes = [
      {
        id: 200,
        deUsuarioId: "u3",
        deUsuarioNombre: "Roberto González",
        deUsuarioMateria: "Cálculo",
        deUsuarioInstitucion: "UNAM",
        paraUsuarioId: "u1",
        mensaje: "Colaboremos",
        estado: "pendiente",
        fechaCreacion: "2025-02-01",
        fechaModificacion: "2025-02-01",
      },
    ];
    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_SOLICITUDES_DATA") return Promise.resolve(JSON.stringify(solicitudes));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.solicitudes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.aceptarSolicitud(200);
    });

    // Solicitud marcada como aceptada
    expect(result.current.solicitudes[0].estado).toBe("aceptada");
    // Contacto nuevo creado
    expect(result.current.contactos).toHaveLength(1);
    expect(result.current.contactos[0].nombre).toBe("Roberto");
    expect(result.current.contactos[0].materia).toBe("Cálculo");
    expect(result.current.contactos[0].institucion).toBe("UNAM");
  });

  it("rechaza una solicitud: cambia estado sin crear contacto", async () => {
    const solicitudes = [
      {
        id: 300,
        deUsuarioId: "u4",
        deUsuarioNombre: "Elena Ruiz",
        paraUsuarioId: "u1",
        estado: "pendiente",
        fechaCreacion: "2025-02-01",
        fechaModificacion: "2025-02-01",
      },
    ];
    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_SOLICITUDES_DATA") return Promise.resolve(JSON.stringify(solicitudes));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.solicitudes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.rechazarSolicitud(300);
    });

    expect(result.current.solicitudes[0].estado).toBe("rechazada");
    expect(result.current.contactos).toHaveLength(0);
  });

  it("busca contactos por nombre, materia e institución", async () => {
    const stored = [
      {
        id: 1,
        usuarioId: "u1",
        nombre: "María",
        apellidos: "Hernández",
        email: "",
        materia: "Álgebra",
        institucion: "UNAM",
        estado: "aceptada",
        enLinea: true,
        fechaConexion: "2025-01-01",
        fechaModificacion: "2025-01-01",
      },
      {
        id: 2,
        usuarioId: "u2",
        nombre: "José",
        apellidos: "Ramírez",
        email: "",
        materia: "Física",
        institucion: "IPN",
        estado: "aceptada",
        enLinea: false,
        fechaConexion: "2025-01-01",
        fechaModificacion: "2025-01-01",
      },
    ];
    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_CONTACTOS_DATA") return Promise.resolve(JSON.stringify(stored));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useContactos(), { wrapper });

    await waitFor(() => {
      expect(result.current.contactos).toHaveLength(2);
    });

    // Buscar por nombre
    expect(result.current.buscarContactos("María")).toHaveLength(1);
    // Buscar por materia
    expect(result.current.buscarContactos("Física")).toHaveLength(1);
    // Buscar por institución
    expect(result.current.buscarContactos("UNAM")).toHaveLength(1);
    // Búsqueda vacía retorna todos
    expect(result.current.buscarContactos("")).toHaveLength(2);
    // Sin resultados
    expect(result.current.buscarContactos("xyz")).toHaveLength(0);
  });

  it("lanza error si useContactos se usa fuera del provider", () => {
    expect(() => {
      renderHook(() => useContactos());
    }).toThrow("useContactos must be used within ContactosProvider");
  });
});
