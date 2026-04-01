import type { ComentarioAlumno } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

interface SyncResult {
  ok: boolean;
}

export const parseArray = <T>(raw: string | null): T[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
};

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

export const syncComentarioRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<ComentarioAlumno>
): Promise<SyncResult> => {
  if (!isAPIConfigured()) {
    return { ok: true };
  }

  try {
    if (type === "delete") {
      await apiRequest(`/api/comentarios-alumno?id=${payload.id}`, { method: "DELETE" });
      return { ok: true };
    }

    await apiRequest("/api/comentarios-alumno", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });

    return { ok: true };
  } catch {
    return { ok: false };
  }
};

export const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
};

export interface NotaAlumnoItem extends ComentarioAlumno {
  fechaDate: Date;
}

export const normalizeNota = (item: ComentarioAlumno): NotaAlumnoItem => ({
  ...item,
  fechaDate: toDate(item.fecha),
});
