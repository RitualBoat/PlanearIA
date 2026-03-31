import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  asignarEntregablesAGrupo,
  asignarRecursosAGrupo,
  desvincularEntregableDeGrupo,
  desvincularRecursoDeGrupo,
  listarAsignadosGrupo,
} from "../../services/grupoAsignacionesService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("grupoAsignacionesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("vincula recursos a un grupo", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, titulo: "Video Algebra", tipo: "video" },
        { id: 2, titulo: "Guia", tipo: "documento", grupoId: 3 },
      ])
    );

    const updated = await asignarRecursosAGrupo(7, [1]);

    expect(updated).toBe(1);
    const payload = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(payload.find((item: { id: number }) => item.id === 1).grupoId).toBe(7);
  });

  it("vincula entregables a un grupo", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        { id: 10, titulo: "Ensayo", tipo: "tarea" },
        { id: 11, titulo: "Examen", tipo: "examen", grupoId: 2 },
      ])
    );

    const updated = await asignarEntregablesAGrupo(7, [10]);

    expect(updated).toBe(1);
    const payload = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(payload.find((item: { id: number }) => item.id === 10).grupoId).toBe(7);
  });

  it("desvincula recurso sin eliminarlo", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, titulo: "Video Algebra", tipo: "video", grupoId: 7 },
        { id: 2, titulo: "Guia", tipo: "documento", grupoId: 7 },
      ])
    );

    const changed = await desvincularRecursoDeGrupo(7, 1);

    expect(changed).toBe(true);
    const payload = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(payload.find((item: { id: number }) => item.id === 1).grupoId).toBeUndefined();
    expect(payload).toHaveLength(2);
  });

  it("desvincula entregable sin eliminarlo", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        { id: 10, titulo: "Ensayo", tipo: "tarea", grupoId: 7 },
        { id: 11, titulo: "Examen", tipo: "examen", grupoId: 7 },
      ])
    );

    const changed = await desvincularEntregableDeGrupo(7, 10);

    expect(changed).toBe(true);
    const payload = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(payload.find((item: { id: number }) => item.id === 10).grupoId).toBeUndefined();
    expect(payload).toHaveLength(2);
  });

  it("lista asignados combinando recursos y entregables", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(
        JSON.stringify([
          { id: 1, titulo: "Video Algebra", tipo: "video", grupoId: 7 },
          { id: 2, titulo: "Guia", tipo: "documento", grupoId: 3 },
        ])
      )
      .mockResolvedValueOnce(
        JSON.stringify([
          { id: 10, titulo: "Ensayo", tipo: "tarea", grupoId: 7 },
          { id: 11, titulo: "Examen", tipo: "examen", grupoId: 4 },
        ])
      );

    const asignados = await listarAsignadosGrupo(7);

    expect(asignados).toHaveLength(2);
    expect(asignados.find((item) => item.id === 1)?.tipo).toBe("recurso");
    expect(asignados.find((item) => item.id === 10)?.tipo).toBe("entregable");
  });
});
