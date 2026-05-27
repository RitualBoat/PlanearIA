import { API_CONFIG } from "../sync/config/apiConfig";

/**
 * Función unificada para realizar peticiones HTTP a la API del backend
 * con cabeceras de autenticación y timeout controlado.
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_CONFIG.apiSecret,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
