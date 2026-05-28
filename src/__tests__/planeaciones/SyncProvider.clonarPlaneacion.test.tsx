import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { NivelAcademico, Planeacion } from "../../../types/planeacionLegacy";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
}));

const { SyncProvider, usePlaneaciones } = require("../../sync/providers/SyncProvider");

describe("SyncProvider.clonarPlaneacion", () => {
  const contextRef: { current: any } = {
    current: null,
  };

  const Consumer = () => {
    contextRef.current = usePlaneaciones();
    return null;
  };

  const planeacionOriginal: Planeacion = {
    id: "plan-original",
    nivelAcademico: NivelAcademico.PRIMARIA,
    asignatura: "Matemáticas",
    grado: "3°",
    grupo: "A",
    fecha: "2024-03-01T00:00:00.000Z",
    horaInicio: "08:00",
    duracionTotal: 50,
    unidadTematica: "Números naturales",
    temaSesion: "Suma y resta",
    aprendizajesEsperados: ["Resuelve sumas básicas"],
    actividades: [
      { tipo: "inicio", descripcion: "Repaso", duracion: 10 },
      { tipo: "desarrollo", descripcion: "Ejercicios", duracion: 30 },
      { tipo: "cierre", descripcion: "Conclusiones", duracion: 10 },
    ],
    recursos: ["Pizarrón"],
    evaluacion: "Lista de cotejo",
    evidencias: ["Cuaderno"],
    observaciones: "Ninguna",
    fechaCreacion: "2024-03-01T00:00:00.000Z",
    fechaModificacion: "2024-03-01T00:00:00.000Z",
    campoFormativo: "Pensamiento matemático",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    contextRef.current = null;
  });

  it("crea copia con ID distinto, nombre con '(Copia)' y estado independiente", async () => {
    render(
      <SyncProvider>
        <Consumer />
      </SyncProvider>
    );

    await waitFor(() => {
      expect(contextRef.current?.isLoading).toBe(false);
    });

    await act(async () => {
      await contextRef.current?.agregarPlaneacion(planeacionOriginal);
    });

    await waitFor(() => {
      expect(contextRef.current?.planeaciones).toHaveLength(1);
    });

    await act(async () => {
      await contextRef.current?.clonarPlaneacion("plan-original");
    });

    await waitFor(() => {
      expect(contextRef.current?.planeaciones).toHaveLength(2);
    });

    const original = contextRef.current?.planeaciones.find((p) => p.id === "plan-original");
    const copia = contextRef.current?.planeaciones.find((p) => p.id !== "plan-original");

    expect(copia).toBeDefined();
    expect(copia?.id).not.toBe("plan-original");
    expect(copia?.temaSesion).toContain("(Copia)");

    await act(async () => {
      if (copia?.id) {
        await contextRef.current?.actualizarPlaneacion(copia.id, {
          temaSesion: "Suma avanzada",
        });
      }
    });

    const originalDespues = contextRef.current?.planeaciones.find((p) => p.id === "plan-original");

    expect(originalDespues?.temaSesion).toBe("Suma y resta");
    expect(original?.temaSesion).toBe("Suma y resta");
  });
});
