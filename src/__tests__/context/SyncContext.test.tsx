import { AppState } from "react-native";
import { act, renderHook } from "@testing-library/react-native";

/**
 * Verifica la correctitud de render de SyncContext tras mover las escrituras de refs
 * (isOnline/syncEnabled/status/authError) de la fase de render a un efecto post-commit:
 *  - syncNow conserva identidad estable y no re-suscribe conectividad/AppState al cambiar estado
 *    (el patron latest-value ref se preserva).
 *  - syncNow observa el estado de conectividad committeado, no un valor obsoleto.
 * (La ausencia de escrituras de ref durante render la garantiza React Doctor: 0 no-ref-current-in-render.)
 */

const mockAuth = { token: "token-real", isGuest: false, isLoading: false };
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

jest.mock("../../sync/config/apiConfig", () => ({
  SYNC_CONFIG: { pollInterval: 12000 },
  isAPIConfigured: () => true,
}));

let connectivityCallback: ((online: boolean) => void) | null = null;
const mockSubscribeConnectivity = jest.fn();
const mockUnsubscribeConnectivity = jest.fn();
jest.mock("../../sync/services/connectivity", () => ({
  subscribeConnectivity: (cb: (online: boolean) => void) => {
    connectivityCallback = cb;
    mockSubscribeConnectivity();
    return mockUnsubscribeConnectivity;
  },
}));

const mockSyncAllEntities = jest.fn();
jest.mock("../../sync/services/entitySync", () => ({
  DEV_LOCAL_TOKEN: "dev-local-token",
  getTotalPendingCount: jest.fn().mockResolvedValue(0),
  syncAllEntities: (...args: unknown[]) => mockSyncAllEntities(...args),
}));

jest.mock("../../sync/services/syncEvents", () => ({
  emitSyncEvent: jest.fn(),
}));

jest.mock("../../utils/logger", () => ({
  __esModule: true,
  default: { log: jest.fn(), error: jest.fn() },
}));

import { SyncProvider, useSyncStatus, type GlobalSyncStatus } from "../../context/SyncContext";

const okSummary = {
  ok: true,
  skipped: false,
  authError: false,
  unreachable: false,
  changedEntities: [] as string[],
  pushed: 0,
  ranAt: "2026-07-24T00:00:00.000Z",
  failedEntities: [] as string[],
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("SyncContext (correctitud de render)", () => {
  let appStateRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    connectivityCallback = null;
    mockSyncAllEntities.mockResolvedValue(okSummary);
    appStateRemove = jest.fn();
    jest
      .spyOn(AppState, "addEventListener")
      .mockReturnValue({ remove: appStateRemove } as unknown as ReturnType<typeof AppState.addEventListener>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("no recrea syncNow ni re-suscribe conectividad/AppState al cambiar el estado", async () => {
    const { result, unmount } = renderHook(() => useSyncStatus(), { wrapper: SyncProvider });
    await flush();

    const firstSyncNow = result.current.syncNow;
    expect(mockSubscribeConnectivity).toHaveBeenCalledTimes(1);
    expect(AppState.addEventListener).toHaveBeenCalledTimes(1);

    // Primer evento de conectividad = estado inicial (offline): cambia estado sin re-suscribir.
    await act(async () => {
      connectivityCallback?.(false);
    });
    await flush();

    expect(result.current.syncNow).toBe(firstSyncNow);
    expect(mockSubscribeConnectivity).toHaveBeenCalledTimes(1);
    expect(AppState.addEventListener).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("syncNow observa el estado de conectividad committeado, no uno obsoleto", async () => {
    const { result, unmount } = renderHook(() => useSyncStatus(), { wrapper: SyncProvider });
    await flush();
    // El sync de arranque ya corrio (syncEnabled true).
    expect(mockSyncAllEntities).toHaveBeenCalled();

    // Transicion a offline (primer evento = estado inicial): isOnline queda committeado en false.
    await act(async () => {
      connectivityCallback?.(false);
    });
    await flush();

    mockSyncAllEntities.mockClear();
    await act(async () => {
      await result.current.syncNow("interval");
    });
    // Offline + reason no manual: syncNow corta antes de sincronizar (lee isOnlineRef committeado = false).
    expect(mockSyncAllEntities).not.toHaveBeenCalled();
    expect(result.current.status).toBe<GlobalSyncStatus>("offline");

    // Transicion a online: isOnline queda committeado en true (dispara un ciclo reconnect).
    await act(async () => {
      connectivityCallback?.(true);
    });
    await flush();

    mockSyncAllEntities.mockClear();
    await act(async () => {
      await result.current.syncNow("interval");
    });
    // Online: syncNow ya observa el estado fresco y ejecuta el ciclo.
    expect(mockSyncAllEntities).toHaveBeenCalledTimes(1);

    unmount();
  });
});
