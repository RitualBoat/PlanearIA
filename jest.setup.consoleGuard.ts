/**
 * Setup Jest (setupFilesAfterEnv): cablea la guardia de senal de consola a
 * cada test. La logica vive en src/__tests__/helpers/consoleSignal.ts para
 * que las suites puedan declarar salida esperada y para que las pruebas de
 * la propia guardia puedan desactivarla de forma controlada.
 */
import { installConsoleSignalGuard, verifyConsoleSignal } from "./src/__tests__/helpers/consoleSignal";

let restoreConsole: (() => void) | null = null;

beforeEach(() => {
  restoreConsole = installConsoleSignalGuard();
});

afterEach(() => {
  try {
    verifyConsoleSignal();
  } finally {
    restoreConsole?.();
    restoreConsole = null;
  }
});
