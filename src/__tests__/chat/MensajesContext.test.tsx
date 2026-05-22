import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { MensajesProvider, useMensajes } from "../../context/MensajesContext";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MensajesProvider>{children}</MensajesProvider>
);

const sampleConversacion = {
  participantes: ["user-ana", "user-maria"],
  contactoId: 1,
  contactoNombre: "María Hernández López",
  contactoColor: "#4A90D9",
  contactoEnLinea: true,
};

describe("MensajesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  it("carga sin conversaciones ni mensajes inicialmente", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversaciones).toEqual([]);
    expect(result.current.mensajes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("crea una conversación correctamente", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let nuevaConv: any;
    await act(async () => {
      nuevaConv = await result.current.crearConversacion(sampleConversacion);
    });

    expect(result.current.conversaciones).toHaveLength(1);
    expect(result.current.conversaciones[0].contactoNombre).toBe("María Hernández López");
    expect(result.current.conversaciones[0].mensajesNoLeidos).toBe(0);
    expect(nuevaConv.id).toBeDefined();
    expect(mockSetItem).toHaveBeenCalled();
  });

  it("elimina una conversación y sus mensajes", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    // Send a message in the conversation
    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "Hola María!",
        tipo: "texto",
      });
    });

    expect(result.current.mensajes).toHaveLength(1);

    await act(async () => {
      await result.current.eliminarConversacion(conv.id);
    });

    expect(result.current.conversaciones).toHaveLength(0);
    expect(result.current.mensajes).toHaveLength(0);
  });

  it("envía un mensaje de texto correctamente", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "¡Hola! ¿Cómo estás?",
        tipo: "texto",
      });
    });

    expect(result.current.mensajes).toHaveLength(1);
    expect(result.current.mensajes[0].contenido).toBe("¡Hola! ¿Cómo estás?");
    expect(result.current.mensajes[0].tipo).toBe("texto");
    expect(result.current.mensajes[0].estado).toBe("enviado");

    // Verify conversation was updated with last message
    const updatedConv = result.current.conversaciones.find((c) => c.id === conv.id);
    expect(updatedConv?.ultimoMensaje).toBe("¡Hola! ¿Cómo estás?");
  });

  it("envía un mensaje de archivo y actualiza preview", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "",
        tipo: "archivo",
        archivo: {
          nombre: "Planeación_S3.pdf",
          tamaño: 245000,
          formato: "pdf",
        },
      });
    });

    const updatedConv = result.current.conversaciones.find((c) => c.id === conv.id);
    expect(updatedConv?.ultimoMensaje).toBe("📎 Planeación_S3.pdf");
    expect(updatedConv?.ultimoMensajeTipo).toBe("archivo");
  });

  it("obtiene mensajes de una conversación ordenados por fecha", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "Primer mensaje",
        tipo: "texto",
      });
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-maria",
        contenido: "Segundo mensaje",
        tipo: "texto",
      });
    });

    const msgs = result.current.getMensajesDeConversacion(conv.id);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].contenido).toBe("Primer mensaje");
    expect(msgs[1].contenido).toBe("Segundo mensaje");
  });

  it("marca como leído una conversación", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Preload with a conversation that has unread messages
    const storedConv = [
      {
        id: 100,
        participantes: ["user-ana", "user-maria"],
        contactoId: 1,
        contactoNombre: "María",
        contactoColor: "#4A90D9",
        contactoEnLinea: true,
        mensajesNoLeidos: 3,
        fechaCreacion: "2025-01-01T00:00:00.000Z",
        fechaModificacion: "2025-01-01T00:00:00.000Z",
      },
    ];
    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_CONVERSACIONES_DATA") return Promise.resolve(JSON.stringify(storedConv));
      return Promise.resolve(null);
    });

    const { result: result2 } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result2.current.isLoading).toBe(false));
    expect(result2.current.conversaciones[0].mensajesNoLeidos).toBe(3);

    act(() => {
      result2.current.marcarComoLeido(100);
    });

    expect(result2.current.conversaciones[0].mensajesNoLeidos).toBe(0);
  });

  it("busca conversación por contactoId", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.crearConversacion(sampleConversacion);
    });

    const found = result.current.getConversacionByContacto(1);
    expect(found).toBeDefined();
    expect(found?.contactoNombre).toBe("María Hernández López");

    const notFound = result.current.getConversacionByContacto(999);
    expect(notFound).toBeUndefined();
  });

  it("reintenta envío de un mensaje con error", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "Mensaje con error",
        tipo: "texto",
      });
    });

    const msgId = result.current.mensajes[0].id;

    await act(async () => {
      await result.current.reintentarMensaje(msgId);
    });

    expect(result.current.mensajes[0].estado).toBe("enviado");
    expect(result.current.mensajes[0].syncStatus).toBe("pending");
  });

  it("lanza error al usar useMensajes fuera del provider", () => {
    expect(() => {
      renderHook(() => useMensajes());
    }).toThrow("useMensajes debe ser usado dentro de MensajesProvider");
  });

  it("carga datos almacenados desde AsyncStorage", async () => {
    const storedConversaciones = [
      {
        id: 200,
        participantes: ["user-ana", "user-jose"],
        contactoId: 2,
        contactoNombre: "José Ramírez",
        contactoColor: "#E67E22",
        contactoEnLinea: false,
        ultimoMensaje: "Gracias por el material",
        mensajesNoLeidos: 1,
        fechaCreacion: "2025-01-01T00:00:00.000Z",
        fechaModificacion: "2025-01-01T00:00:00.000Z",
      },
    ];
    const storedMensajes = [
      {
        id: 300,
        conversacionId: 200,
        remitenteId: "user-jose",
        contenido: "Gracias por el material",
        tipo: "texto",
        estado: "entregado",
        fechaCreacion: "2025-01-01T10:00:00.000Z",
        fechaModificacion: "2025-01-01T10:00:00.000Z",
      },
    ];

    mockGetItem.mockImplementation((key: string) => {
      if (key === "APP_CONVERSACIONES_DATA")
        return Promise.resolve(JSON.stringify(storedConversaciones));
      if (key === "APP_MENSAJES_DATA") return Promise.resolve(JSON.stringify(storedMensajes));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.conversaciones).toHaveLength(1);
    expect(result.current.conversaciones[0].contactoNombre).toBe("José Ramírez");
    expect(result.current.mensajes).toHaveLength(1);
    expect(result.current.mensajes[0].contenido).toBe("Gracias por el material");
  });

  it("envía un mensaje de planeación y actualiza preview", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "",
        tipo: "planeacion",
        planeacion: {
          planeacionId: "plan-123",
          titulo: "Fracciones equivalentes",
          materia: "Matemáticas",
          grado: "4to",
        },
      });
    });

    expect(result.current.mensajes).toHaveLength(1);
    expect(result.current.mensajes[0].tipo).toBe("planeacion");
    expect(result.current.mensajes[0].planeacion?.titulo).toBe("Fracciones equivalentes");

    const updatedConv = result.current.conversaciones.find((c) => c.id === conv.id);
    expect(updatedConv?.ultimoMensaje).toBe("📋 Fracciones equivalentes");
    expect(updatedConv?.ultimoMensajeTipo).toBe("planeacion");
  });

  it("envía un mensaje de recurso y actualiza preview", async () => {
    const { result } = renderHook(() => useMensajes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let conv: any;
    await act(async () => {
      conv = await result.current.crearConversacion(sampleConversacion);
    });

    await act(async () => {
      await result.current.enviarMensaje({
        conversacionId: conv.id,
        remitenteId: "user-ana",
        contenido: "",
        tipo: "recurso",
        recurso: {
          recursoId: 42,
          titulo: "Guía de laboratorio",
          tipo: "documento",
          formato: "pdf",
        },
      });
    });

    expect(result.current.mensajes).toHaveLength(1);
    expect(result.current.mensajes[0].tipo).toBe("recurso");
    expect(result.current.mensajes[0].recurso?.titulo).toBe("Guía de laboratorio");

    const updatedConv = result.current.conversaciones.find((c) => c.id === conv.id);
    expect(updatedConv?.ultimoMensaje).toBe("📚 Guía de laboratorio");
    expect(updatedConv?.ultimoMensajeTipo).toBe("recurso");
  });
});
