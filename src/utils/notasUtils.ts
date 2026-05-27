import type { ComentarioAlumno } from "../../types";
import { apiRequest } from "./apiClient";
import { isAPIConfigured } from "../sync/config/apiConfig";

interface SyncResult {
  ok: boolean;
}

export const parseArray = <T>(raw: string | null): T[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
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
