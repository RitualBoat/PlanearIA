/**
 * One-time migration from legacy AsyncStorage auth keys to the new
 * SessionStoragePort (SecureStore on native, AsyncStorage on web).
 *
 * Rules from the plan:
 * - Read legacy keys, write to new storage
 * - Do NOT delete legacy keys until validation is complete
 * - Migration runs once; a flag prevents re-running
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { sessionStorage, SESSION_KEYS, LEGACY_SESSION_KEYS } from "./sessionStorage";

const MIGRATION_FLAG = "@planearia:auth_migration_v1_done";

/**
 * Migrate legacy session keys to the new secure storage.
 * Idempotent: skips if already done. Non-destructive: legacy keys are preserved.
 *
 * Call this early in app startup, before restoreSession().
 */
export async function migrateLegacySessionKeys(): Promise<void> {
  try {
    const done = await AsyncStorage.getItem(MIGRATION_FLAG);
    if (done === "true") return;

    const legacyToken = await AsyncStorage.getItem(LEGACY_SESSION_KEYS.TOKEN);

    if (legacyToken) {
      // Check if new keys already have values (avoid overwriting a newer session)
      const existingToken = await sessionStorage.getToken(SESSION_KEYS.ACCESS_TOKEN);
      if (!existingToken) {
        await sessionStorage.setToken(SESSION_KEYS.ACCESS_TOKEN, legacyToken);
      }
    }

    // USER and IS_GUEST keys are identical between legacy and new,
    // so no migration needed for those.

    await AsyncStorage.setItem(MIGRATION_FLAG, "true");
  } catch {
    // Migration is best-effort. If it fails, the user logs in again.
  }
}
