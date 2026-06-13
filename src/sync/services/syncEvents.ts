/**
 * Lightweight event bus for the sync layer.
 *
 * Contexts and view models subscribe to entity updates so a pull from the
 * backend (triggered by the orchestrator from anywhere in the app)
 * refreshes every screen that displays that data. Module-level so it works
 * outside the React tree (services, repositories).
 */

import logger from "../../utils/logger";

export type SyncReason =
  | "startup"
  | "login"
  | "reconnect"
  | "interval"
  | "foreground"
  | "manual"
  | "mutation";

export type SyncEvent =
  | { type: "entity-updated"; entity: string }
  | { type: "sync-started"; reason: SyncReason }
  | {
      type: "sync-finished";
      reason: SyncReason;
      ok: boolean;
      changedEntities: string[];
      pushed: number;
    };

type SyncEventListener = (event: SyncEvent) => void;

const listeners = new Set<SyncEventListener>();

export const onSyncEvent = (listener: SyncEventListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitSyncEvent = (event: SyncEvent): void => {
  for (const listener of [...listeners]) {
    try {
      listener(event);
    } catch (error) {
      // A broken listener must never abort the sync pipeline
      logger.error("[syncEvents] Listener failed:", error);
    }
  }
};
