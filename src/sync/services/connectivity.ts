/**
 * Central connectivity tracking.
 *
 * NetInfo's isInternetReachable is unreliable on react-native-web (it can
 * report false while the browser is online), so the web path trusts
 * navigator.onLine and the native path uses NetInfo's isConnected only.
 * The real proof of reachability is always the request itself: callers
 * treat fetch failures as offline regardless of what this module reports.
 */

import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export const getIsOnline = async (): Promise<boolean> => {
  if (Platform.OS === "web") {
    return typeof navigator === "undefined" || navigator.onLine !== false;
  }

  try {
    const state = await NetInfo.fetch();
    return state.isConnected !== false;
  } catch {
    // Assume online; the actual request decides
    return true;
  }
};

/**
 * Subscribes to connectivity transitions. The callback fires only when the
 * online/offline state changes (deduped per subscription).
 */
export const subscribeConnectivity = (
  callback: (isOnline: boolean) => void
): (() => void) => {
  let last: boolean | null = null;

  const notify = (online: boolean) => {
    if (online === last) return;
    last = online;
    callback(online);
  };

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const onOnline = () => notify(true);
    const onOffline = () => notify(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    void getIsOnline().then(notify);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }

  const unsubscribe = NetInfo.addEventListener((state) => {
    notify(state.isConnected !== false);
  });
  return unsubscribe;
};
