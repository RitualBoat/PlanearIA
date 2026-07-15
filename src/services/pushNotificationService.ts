import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import logger from "../utils/logger";

// Configure notification behavior for when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and register for push notifications.
 * Returns the Expo Push Token or null if registration fails or on simulator.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // On web, push notifications are not natively supported in this setup
  if (Platform.OS === "web") {
    return null;
  }

  if (!Device.isDevice) {
    logger.warn("Must use physical device for native push notifications");
    return "mock-push-token-simulator";
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.warn("Failed to get push token: permission not granted");
      return null;
    }

    // Attempt to retrieve token. If EAS project ID is missing, catch error
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (tokenError) {
      logger.warn("Could not retrieve Expo Push Token, using fallback");
      return "fallback-push-token-" + Platform.OS;
    }
  } catch (error) {
    logger.error("Error registering for push notifications:", error);
    return null;
  }
}

