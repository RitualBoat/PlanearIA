/**
 * Tabla de presentacion del estado de sincronizacion (change sync-status-ui, #83).
 *
 * Modulo deliberadamente puro: no importa React, contextos ni almacenamiento en tiempo de
 * ejecucion (el unico import es de tipo y se borra al compilar). Esa pureza es estructural,
 * no una convencion: permite congelar la tabla completa en prueba sin montar React ni
 * simular AsyncStorage, y garantiza que traducir un estado no pueda tener efectos.
 *
 * El hook que la alimenta vive en `useSyncPresentation.ts`.
 */

import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { GlobalSyncStatus } from "../context/SyncContext";

export type EstadoSync =
  | "local"
  | "sin-conexion"
  | "sesion-expirada"
  | "sincronizando"
  | "sin-servidor"
  | "pendiente"
  | "sincronizado";

/**
 * Tonos admitidos para un estado de sincronizacion.
 *
 * Excluye deliberadamente el tono de error. Un servidor caido o la falta de conexion no
 * son fallos del docente ni ponen su trabajo en riesgo: queda en cola local y sube solo.
 * Pintarlos de rojo ensena a desconfiar de una app cuya promesa es funcionar sin conexion.
 * El rojo pertenece al fallo de guardado local, que vive en `SaveStateLabel`. Que el tipo
 * no admita "error" hace que esta regla la garantice el compilador y no la disciplina.
 */
export type TonoSync = "neutro" | "info" | "exito" | "aviso";

export type AccionSync = "reintentar" | "reingresar";

export interface PresentacionSync {
  estado: EstadoSync;
  tono: TonoSync;
  icono: keyof typeof MaterialIcons.glyphMap;
  /** Texto corto para superficies compactas como el chip del chrome. */
  titulo: string;
  /** Explicacion tranquilizadora para superficies con espacio, como la barra. */
  detalle: string | null;
  /** Situacion completa en texto: comprensible sin percibir color ni icono. */
  etiquetaA11y: string;
  accion: AccionSync | null;
  /** Alimenta `aria-busy`, que React Native Web no deriva de accessibilityState. */
  ocupado: boolean;
}

export interface EntradaSync {
  syncEnabled: boolean;
  isOnline: boolean;
  status: GlobalSyncStatus;
  pendingCount: number;
  authError: boolean;
}

/**
 * Frase del trabajo en cola, en un solo lugar.
 *
 * La usan el estado `pendiente` de la tabla, el badge de conteo y el sufijo de la barra
 * global. Estaba escrita tres veces con tres redacciones distintas antes de este change;
 * centralizarla es la misma razon por la que existe la tabla.
 */
export const frasePendientes = (pendingCount: number): string =>
  `${pendingCount} ${pendingCount === 1 ? "cambio" : "cambios"} por sincronizar`;

const componerEtiqueta = (titulo: string, detalle: string | null): string =>
  detalle ? `${titulo}. ${detalle}` : titulo;

const presentar = (
  estado: EstadoSync,
  tono: TonoSync,
  icono: keyof typeof MaterialIcons.glyphMap,
  titulo: string,
  detalle: string | null,
  accion: AccionSync | null = null,
  ocupado = false
): PresentacionSync => ({
  estado,
  tono,
  icono,
  titulo,
  detalle,
  etiquetaA11y: componerEtiqueta(titulo, detalle),
  accion,
  ocupado,
});

/**
 * Resuelve el estado presentado por precedencia: gana la primera condicion que aplica.
 *
 * El orden no es arbitrario y dos posiciones lo justifican.
 *
 * `syncEnabled === false` va primero porque es el estado por defecto de todo docente
 * invitado o con la API sin configurar. Cuando no hay sincronizacion en absoluto, ninguna
 * otra condicion puede producir la afirmacion falsa de que todo esta sincronizado.
 *
 * La falta de conexion gana sobre la sesion expirada porque sin red la accion de reingreso
 * no puede completarse: ofrecerla convertiria un estado tranquilo, donde todo esta a salvo,
 * en una alarma sin salida. El codigo vigente ya asumia esta precedencia al calcular la
 * barra global; aqui se formaliza y se extiende al resto de la app.
 */
export function derivarPresentacionSync({
  syncEnabled,
  isOnline,
  status,
  pendingCount,
  authError,
}: EntradaSync): PresentacionSync {
  if (!syncEnabled) {
    return presentar(
      "local",
      "neutro",
      "smartphone",
      "Guardado en este dispositivo",
      "Tus cambios se guardan aqui. Inicia sesion para sincronizarlos."
    );
  }

  if (!isOnline) {
    return presentar(
      "sin-conexion",
      "aviso",
      "cloud-off",
      "Sin conexion",
      "Puedes seguir trabajando: tus cambios se guardan en este dispositivo."
    );
  }

  if (authError) {
    return presentar(
      "sesion-expirada",
      "aviso",
      "lock-outline",
      "Tu sesion expiro",
      "Vuelve a iniciar sesion para sincronizar tus cambios.",
      "reingresar"
    );
  }

  if (status === "syncing") {
    return presentar("sincronizando", "info", "sync", "Sincronizando", null, null, true);
  }

  if (status === "error") {
    return presentar(
      "sin-servidor",
      "aviso",
      "cloud-queue",
      "Guardado en este dispositivo",
      "No se pudo sincronizar con el servidor. Tus cambios estan guardados en este dispositivo.",
      "reintentar"
    );
  }

  if (pendingCount > 0) {
    return presentar(
      "pendiente",
      "info",
      "cloud-upload",
      frasePendientes(pendingCount),
      "Se sincronizaran solos en cuanto sea posible."
    );
  }

  return presentar("sincronizado", "exito", "cloud-done", "Todo sincronizado", null);
}
