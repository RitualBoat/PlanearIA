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
  /**
   * Frase breve para acompanar el estado de guardado de un documento, o `null` cuando el
   * estado global no agrega nada a "esta guardado".
   *
   * Existe porque `titulo` no sirve para ese uso: tres de los siete estados se titulan
   * "Guardado en este dispositivo", asi que junto a la etiqueta de guardado producian
   * "Guardado - Guardado en este dispositivo". El complemento solo aparece cuando el estado
   * remoto es noticia distinta de lo que la etiqueta local ya dijo.
   */
  complementoGuardado: string | null;
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

/**
 * Duracion del fundido al cambiar de estado, o `null` para servir el cambio sin animar.
 *
 * Se extrae como funcion pura para que la regla sea verificable: una prueba que solo
 * renderice el chip con la preferencia activa pasaria igual aunque el componente la
 * ignorara, porque rol, etiqueta y texto son identicos en ambas ramas. Ese fue justamente
 * el hallazgo de la revision adversarial de #82 sobre la prueba del Skeleton.
 */
export const duracionTransicionSync = (reduceMotion: boolean): number | null =>
  reduceMotion ? null : DURACION_FUNDIDO_MS;

/** Fundido corto: comunica el cambio sin competir con el contenido. */
export const DURACION_FUNDIDO_MS = 150;

const componerEtiqueta = (titulo: string, detalle: string | null): string =>
  detalle ? `${titulo}. ${detalle}` : titulo;

const presentar = (
  estado: EstadoSync,
  tono: TonoSync,
  icono: keyof typeof MaterialIcons.glyphMap,
  titulo: string,
  detalle: string | null,
  accion: AccionSync | null = null,
  ocupado = false,
  complementoGuardado: string | null = null
): PresentacionSync => ({
  estado,
  tono,
  icono,
  titulo,
  detalle,
  etiquetaA11y: componerEtiqueta(titulo, detalle),
  accion,
  ocupado,
  complementoGuardado,
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
      "Puedes seguir trabajando: tus cambios se guardan en este dispositivo.",
      null,
      false,
      "Sin conexion"
    );
  }

  if (authError) {
    return presentar(
      "sesion-expirada",
      "aviso",
      "lock-outline",
      "Tu sesion expiro",
      "Vuelve a iniciar sesion para sincronizar tus cambios.",
      "reingresar",
      false,
      "Sesion expirada"
    );
  }

  if (status === "syncing") {
    return presentar(
      "sincronizando",
      "info",
      "sync",
      "Sincronizando",
      null,
      null,
      true,
      "Sincronizando"
    );
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
      "Se sincronizaran solos en cuanto sea posible.",
      null,
      false,
      "Sin subir"
    );
  }

  return presentar("sincronizado", "exito", "cloud-done", "Todo sincronizado", null);
}
