// Clasificacion de fallos del smoke MCP. Vive aparte de scripts/testMcpServers.mjs porque ese script
// ejecuta el smoke al importarse: el doctor y las pruebas necesitan la clasificacion sin lanzar procesos.

export const OAUTH_INTERACTIVE_REQUIRED = "oauth-interactive-required";
export const UNCLASSIFIED_FAILURE = "failure";

const AUTHORIZATION_PROMPT = /Please authorize this client by visiting:\s+(https:\/\/\S+)/i;

// Un servidor stdio remoto declara su endpoint como primer argumento https del wrapper (mcp-remote).
export function configuredEndpoint(server = {}) {
  if (server.url) return server.url;
  return (server.args ?? []).find((value) => typeof value === "string" && value.startsWith("https://")) ?? null;
}

// Solo el prompt de autorizacion mas la ausencia de inicializacion prueban OAuth pendiente. Para emitir ese
// prompt, mcp-remote ya resolvio DNS, alcanzo el endpoint, recibio un 401 con WWW-Authenticate, leyo la
// metadata OAuth y registro un cliente: conectividad, instalacion y protocolo quedan probados. Falta solo el
// consentimiento humano, y tools/list nunca corrio, asi que el llamador degrada a WARN pero nunca a PASS.
//
// El sintoma terminal se ignora a proposito: el mismo estado expira por timeout o sale con codigo distinto de
// cero (EADDRINUSE del puerto de callback) segun haya otro mcp-remote vivo. No es un invariante.
export function classifyFailure({ stderr = "", initialized = false, endpoint = null } = {}) {
  if (initialized || !endpoint) return UNCLASSIFIED_FAILURE;

  const prompt = AUTHORIZATION_PROMPT.exec(stderr);
  if (!prompt) return UNCLASSIFIED_FAILURE;

  try {
    const authorize = new URL(prompt[1]);
    const configured = new URL(endpoint);
    // Atar la evidencia al servidor evaluado impide que una salida ajena que mencione autorizacion la simule.
    if (authorize.origin !== configured.origin) return UNCLASSIFIED_FAILURE;
    if (!authorize.pathname.includes("authorize")) return UNCLASSIFIED_FAILURE;
    return OAUTH_INTERACTIVE_REQUIRED;
  } catch {
    return UNCLASSIFIED_FAILURE;
  }
}
