/**
 * SessionStoragePort: abstraction over secure token storage.
 *
 * Native (Android/iOS): expo-secure-store (encrypted keychain/keystore).
 * Web/dev/tests: AsyncStorage fallback (not encrypted, acceptable for dev).
 *
 * User profile data stays in AsyncStorage regardless of platform --
 * only tokens need the secure path.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// -- Storage keys (plan spec section 5.5) --

export const SESSION_KEYS = {
  /**
   * Secure storage: access token (JWT).
   * SecureStore keys must match /^[\w.-]+$/ -- no "@" or ":" allowed --
   * so secure keys use dot notation, not the legacy "@planearia:" namespace.
   * These keys are new (no prior data), so the format change needs no migration.
   */
  ACCESS_TOKEN: "planearia.secure.access_token",
  /** Secure storage: refresh token */
  REFRESH_TOKEN: "planearia.secure.refresh_token",
  /** AsyncStorage: serialized user object (legacy key, colons valid here) */
  USER: "@planearia:auth_user",
  /** AsyncStorage: guest flag (legacy key, colons valid here) */
  IS_GUEST: "@planearia:is_guest",
} as const;

/** Legacy keys -- read-only during migration, never delete programmatically */
export const LEGACY_SESSION_KEYS = {
  TOKEN: "@planearia:auth_token",
  USER: "@planearia:auth_user",
  IS_GUEST: "@planearia:is_guest",
} as const;

// -- Port interface --

export interface SessionStoragePort {
  getToken(key: string): Promise<string | null>;
  setToken(key: string, value: string): Promise<void>;
  removeToken(key: string): Promise<void>;
  clearTokens(): Promise<void>;
}

// -- SecureStore implementation (native) --

// eslint-disable-next-line @typescript-eslint/no-var-requires
function getSecureStore(): typeof import("expo-secure-store") {
  return require("expo-secure-store") as typeof import("expo-secure-store");
}

const secureStoreAdapter: SessionStoragePort = {
  async getToken(key) {
    return getSecureStore().getItemAsync(key);
  },
  async setToken(key, value) {
    await getSecureStore().setItemAsync(key, value);
  },
  async removeToken(key) {
    await getSecureStore().deleteItemAsync(key);
  },
  async clearTokens() {
    const SecureStore = getSecureStore();
    await Promise.all([
      SecureStore.deleteItemAsync(SESSION_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(SESSION_KEYS.REFRESH_TOKEN),
    ]);
  },
};

// -- AsyncStorage fallback (web / dev / tests) --

const asyncStorageAdapter: SessionStoragePort = {
  async getToken(key) {
    return AsyncStorage.getItem(key);
  },
  async setToken(key, value) {
    await AsyncStorage.setItem(key, value);
  },
  async removeToken(key) {
    await AsyncStorage.removeItem(key);
  },
  async clearTokens() {
    await Promise.all([
      AsyncStorage.removeItem(SESSION_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(SESSION_KEYS.REFRESH_TOKEN),
    ]);
  },
};

// -- Platform detection --

function isNativePlatform(): boolean {
  return Platform.OS === "android" || Platform.OS === "ios";
}

// -- Factory --

/**
 * Returns the appropriate storage adapter for the current platform.
 * Native platforms get SecureStore; everything else gets AsyncStorage.
 *
 * Deterministic and side-effect-free -- safe to call multiple times.
 */
export function createSessionStorage(): SessionStoragePort {
  if (isNativePlatform()) {
    return secureStoreAdapter;
  }
  return asyncStorageAdapter;
}

/**
 * Singleton instance for convenience imports.
 * Most code should use this directly.
 */
export const sessionStorage = createSessionStorage();
