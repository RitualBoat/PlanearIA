/**
 * Nucleo de la guardia de senal de consola (spec: test-console-signal-guard).
 *
 * Por que existe: la suite pasaba verde mientras emitia console.error/warn;
 * ese ruido escondia regresiones. Este modulo captura error/warn por test,
 * exige declarar la salida esperada y falla ante lo inesperado. Una
 * declaracion que no se usa tambien falla: una allowance muerta es la forma
 * en que el silenciamiento vuelve a entrar.
 *
 * Semantica de consumo: una declaracion que coincidio al menos una vez queda
 * "consumida" y sigue activa hasta el fin del test (cubrir repeticiones del
 * MISMO aviso, p.ej. warnings de terceros por render). Lo que no coincide
 * con ninguna declaracion sigue fallando: declarar algo nunca silencia un
 * mensaje distinto.
 */

export type ConsoleSignalMethod = "error" | "warn";
export type ConsoleSignalPattern = string | RegExp;

interface CapturedCall {
  method: ConsoleSignalMethod;
  text: string;
}

interface Declaration {
  pattern: ConsoleSignalPattern;
  used: boolean;
}

interface ConsoleSignalState {
  enabled: boolean;
  installed: boolean;
  originals: {
    error: typeof console.error;
    warn: typeof console.warn;
  } | null;
  declarations: Record<ConsoleSignalMethod, Declaration[]>;
  unexpected: CapturedCall[];
}

const state: ConsoleSignalState = {
  enabled: true,
  installed: false,
  originals: null,
  declarations: { error: [], warn: [] },
  unexpected: [],
};

function stringifyArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    return String(arg);
  }
}

function matches(pattern: ConsoleSignalPattern, text: string): boolean {
  return typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);
}

function resetPerTest(): void {
  state.declarations = { error: [], warn: [] };
  state.unexpected = [];
}

/** Declara un console.error esperado en el test actual. */
export function expectConsoleError(...patterns: ConsoleSignalPattern[]): void {
  state.declarations.error.push(...patterns.map((pattern) => ({ pattern, used: false })));
}

/** Declara un console.warn esperado en el test actual. */
export function expectConsoleWarn(...patterns: ConsoleSignalPattern[]): void {
  state.declarations.warn.push(...patterns.map((pattern) => ({ pattern, used: false })));
}

/**
 * Solo para las pruebas de la propia guardia: desactiva el cableado global
 * para poder observar el fallo sin romper la corrida. Nunca usar en suites
 * de producto.
 */
export function setConsoleGuardEnabled(enabled: boolean): void {
  state.enabled = enabled;
}

function capture(method: ConsoleSignalMethod, args: unknown[]): void {
  const text = args.map(stringifyArg).join(" ");
  const declaration = state.declarations[method].find((entry) => matches(entry.pattern, text));
  if (declaration) {
    declaration.used = true;
    return;
  }
  state.unexpected.push({ method, text });
}

function formatCalls(calls: CapturedCall[]): string {
  return calls.map((call) => `console.${call.method}: ${call.text}`).join("\n");
}

/** Instala los wrappers de consola. Devuelve la funcion de restauracion. */
export function installConsoleSignalGuard(): () => void {
  // Los originales solo se guardan en la primera instalacion; guardarlos de
  // nuevo capturaria los propios wrappers y romperia la restauracion.
  if (!state.installed) {
    state.originals = { error: console.error, warn: console.warn };
  }
  state.installed = true;
  resetPerTest();
  const originals = state.originals;
  console.error = ((...args: unknown[]) => {
    if (!state.enabled) return originals.error(...args);
    capture("error", args);
  }) as typeof console.error;
  console.warn = ((...args: unknown[]) => {
    if (!state.enabled) return originals.warn(...args);
    capture("warn", args);
  }) as typeof console.warn;
  return () => {
    console.error = originals.error;
    console.warn = originals.warn;
    state.installed = false;
  };
}

/**
 * Veredicto al final de cada test: falla ante salida inesperada o ante
 * declaraciones no consumidas. Expuesto para poder probar la guardia.
 */
export function verifyConsoleSignal(): void {
  const problems: string[] = [];
  if (state.unexpected.length) {
    problems.push(
      `console.error/warn inesperados (${state.unexpected.length}). Declara la salida esperada con expectConsoleError/expectConsoleWarn si es intencional, o corrige la causa:\n${formatCalls(state.unexpected)}`,
    );
  }
  const unused = [
    ...state.declarations.error.filter((entry) => !entry.used).map((entry) => `error: ${String(entry.pattern)}`),
    ...state.declarations.warn.filter((entry) => !entry.used).map((entry) => `warn: ${String(entry.pattern)}`),
  ];
  if (unused.length) {
    problems.push(
      `Declaraciones de consola no consumidas; retiralas para no acumular allowances muertas:\n${unused.join("\n")}`,
    );
  }
  resetPerTest();
  if (problems.length) {
    throw new Error(problems.join("\n\n"));
  }
}
