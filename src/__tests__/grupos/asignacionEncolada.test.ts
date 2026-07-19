import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  asignarEntregablesAGrupo,
  asignarRecursosAGrupo,
  desvincularRecursoDeGrupo,
} from "../../services/grupoAsignacionesService";
import { SYNC_ENTITIES, reconcileWithPending } from "../../sync/services/entitySync";
import { getPendingOps } from "../../sync/services/syncEngine";

/**
 * Regresion de los dos defectos silenciosos que cerro el change assign-sheet (#84).
 *
 * Estas pruebas se escriben contra el sintoma que sufre el docente, no contra la
 * implementacion. La suite anterior pasaba en verde con ambos defectos vivos porque
 * afirmaba que el servicio escribia en "alguna" clave y no verificaba encolado alguno.
 */

jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});

// Sin API configurada no hay flush remoto: la operacion se queda en cola, que es
// exactamente el estado que estas pruebas necesitan observar.
jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: { baseUrl: "https://test.api.com", timeout: 5000 },
  SYNC_CONFIG: { debugMode: false, maxRetries: 5, retryDelay: 10 },
  isAPIConfigured: () => false,
}));

const RECURSO = {
  id: 1,
  titulo: "Guia de fracciones",
  tipo: "documento",
  descripcion: "",
  asignadoComoTarea: false,
  tags: [],
  acceso: "privado",
  origen: "manual",
  profesorId: 1,
  versionActual: 1,
};

const ENTREGABLE = {
  id: 10,
  titulo: "Ensayo",
  tipo: "tarea",
  descripcion: "",
  grupoId: 0,
  valor: 10,
  instrucciones: "",
  estado: "asignada",
  calificacionMaxima: 10,
  profesorId: 1,
  permitirEntregaTardia: false,
};

describe("asignacion encolada (regresion #84)", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("conserva la asignacion cuando el servidor devuelve el recurso sin grupo", async () => {
    await AsyncStorage.setItem(SYNC_ENTITIES.recursos.storageKey, JSON.stringify([RECURSO]));

    await asignarRecursosAGrupo(7, [1]);

    const local = JSON.parse(
      (await AsyncStorage.getItem(SYNC_ENTITIES.recursos.storageKey)) ?? "[]"
    );
    const pendientes = await getPendingOps("recursos");

    // El servidor todavia no sabe de la asignacion: devuelve el recurso sin grupoId.
    const remoto = [{ ...RECURSO }];
    const reconciliado = reconcileWithPending(local, remoto, pendientes);

    // Antes de este change no habia operacion en cola, el remoto ganaba y la asignacion
    // desaparecia sin aviso en el pull siguiente.
    expect(pendientes).toHaveLength(1);
    expect(reconciliado.find((item) => item.id === 1)).toMatchObject({ grupoId: 7 });
  });

  it("encola una operacion por cada recurso asignado", async () => {
    await AsyncStorage.setItem(
      SYNC_ENTITIES.recursos.storageKey,
      JSON.stringify([RECURSO, { ...RECURSO, id: 2 }])
    );

    const asignados = await asignarRecursosAGrupo(7, [1, 2]);

    const pendientes = await getPendingOps("recursos");
    expect(asignados).toBe(2);
    expect(pendientes).toHaveLength(2);
    expect(pendientes.every((op) => op.type === "update")).toBe(true);
  });

  it("asigna un entregable en la clave que la app usa, no en la legacy", async () => {
    await AsyncStorage.setItem(SYNC_ENTITIES.entregables.storageKey, JSON.stringify([ENTREGABLE]));

    const asignados = await asignarEntregablesAGrupo(7, [10]);

    const vigente = JSON.parse(
      (await AsyncStorage.getItem(SYNC_ENTITIES.entregables.storageKey)) ?? "[]"
    );
    const legacy = await AsyncStorage.getItem("@planearia:tareas");
    const pendientes = await getPendingOps("entregables");

    expect(asignados).toBe(1);
    expect(vigente[0].grupoId).toBe(7);
    // La clave legacy no se toca: no se migra ni se escribe en ella.
    expect(legacy).toBeNull();
    expect(pendientes).toHaveLength(1);
  });

  it("no afirma haber asignado cuando ningun elemento coincide", async () => {
    await AsyncStorage.setItem(SYNC_ENTITIES.recursos.storageKey, JSON.stringify([RECURSO]));

    const asignados = await asignarRecursosAGrupo(7, [999]);

    expect(asignados).toBe(0);
    expect(await getPendingOps("recursos")).toHaveLength(0);
  });

  it("encola tambien al desvincular, para que el servidor no reponga el grupo", async () => {
    await AsyncStorage.setItem(
      SYNC_ENTITIES.recursos.storageKey,
      JSON.stringify([{ ...RECURSO, grupoId: 7 }])
    );

    const cambio = await desvincularRecursoDeGrupo(7, 1);

    expect(cambio).toBe(true);
    expect(await getPendingOps("recursos")).toHaveLength(1);
  });
});
