jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}), { virtual: true });

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  createSessionStorage,
  SESSION_KEYS,
  LEGACY_SESSION_KEYS,
} from "../../services/auth/sessionStorage";

describe("sessionStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("SESSION_KEYS", () => {
    it("defines secure keys per the plan spec", () => {
      expect(SESSION_KEYS.ACCESS_TOKEN).toBe("@planearia:secure:access_token");
      expect(SESSION_KEYS.REFRESH_TOKEN).toBe("@planearia:secure:refresh_token");
      expect(SESSION_KEYS.USER).toBe("@planearia:auth_user");
      expect(SESSION_KEYS.IS_GUEST).toBe("@planearia:is_guest");
    });

    it("preserves legacy key references for migration", () => {
      expect(LEGACY_SESSION_KEYS.TOKEN).toBe("@planearia:auth_token");
      expect(LEGACY_SESSION_KEYS.USER).toBe("@planearia:auth_user");
    });
  });

  describe("AsyncStorage fallback (web platform)", () => {
    let originalOS: typeof Platform.OS;

    beforeAll(() => {
      originalOS = Platform.OS;
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
    });

    afterAll(() => {
      Object.defineProperty(Platform, "OS", { value: originalOS, writable: true });
    });

    it("creates an async storage adapter on web", () => {
      const storage = createSessionStorage();
      expect(storage).toBeDefined();
      expect(storage.getToken).toBeInstanceOf(Function);
      expect(storage.setToken).toBeInstanceOf(Function);
      expect(storage.removeToken).toBeInstanceOf(Function);
      expect(storage.clearTokens).toBeInstanceOf(Function);
    });

    it("reads from AsyncStorage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("test-token");
      const storage = createSessionStorage();
      const value = await storage.getToken(SESSION_KEYS.ACCESS_TOKEN);
      expect(value).toBe("test-token");
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(SESSION_KEYS.ACCESS_TOKEN);
    });

    it("writes to AsyncStorage", async () => {
      const storage = createSessionStorage();
      await storage.setToken(SESSION_KEYS.ACCESS_TOKEN, "new-token");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(SESSION_KEYS.ACCESS_TOKEN, "new-token");
    });

    it("removes from AsyncStorage", async () => {
      const storage = createSessionStorage();
      await storage.removeToken(SESSION_KEYS.ACCESS_TOKEN);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SESSION_KEYS.ACCESS_TOKEN);
    });

    it("clears both token keys on clearTokens", async () => {
      const storage = createSessionStorage();
      await storage.clearTokens();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SESSION_KEYS.ACCESS_TOKEN);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SESSION_KEYS.REFRESH_TOKEN);
    });
  });

  describe("SecureStore adapter (native platform)", () => {
    let originalOS: typeof Platform.OS;
    let SecureStore: typeof import("expo-secure-store");

    beforeAll(() => {
      originalOS = Platform.OS;
      Object.defineProperty(Platform, "OS", { value: "android", writable: true });
      SecureStore = require("expo-secure-store");
    });

    afterAll(() => {
      Object.defineProperty(Platform, "OS", { value: originalOS, writable: true });
    });

    beforeEach(() => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    });

    it("creates a secure store adapter on native", () => {
      const storage = createSessionStorage();
      expect(storage).toBeDefined();
    });

    it("reads from SecureStore", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("secure-token");
      const storage = createSessionStorage();
      const value = await storage.getToken(SESSION_KEYS.ACCESS_TOKEN);
      expect(value).toBe("secure-token");
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(SESSION_KEYS.ACCESS_TOKEN);
    });

    it("writes to SecureStore", async () => {
      const storage = createSessionStorage();
      await storage.setToken(SESSION_KEYS.REFRESH_TOKEN, "refresh-123");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SESSION_KEYS.REFRESH_TOKEN, "refresh-123");
    });

    it("clears both token keys from SecureStore", async () => {
      const storage = createSessionStorage();
      await storage.clearTokens();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEYS.ACCESS_TOKEN);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEYS.REFRESH_TOKEN);
    });
  });
});
