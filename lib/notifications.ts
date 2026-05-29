import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "./api";

// ─── Configure how notifications behave when app is foregrounded ─────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Register device for push notifications ──────────────────────────────────
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices.");
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Team L-Evate",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7ED957",
    });
  }

  // Get the Expo push token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  return token;
}

// ─── Send push token to backend so server can send pushes later ──────────────
export async function syncPushTokenWithBackend(
  token: string,
  userId: string
): Promise<void> {
  try {
    await api.post("/api/notifications/register-token", {
      token,
      userId,
      platform: Platform.OS,
    });
  } catch (error) {
    console.error("Failed to sync push token with backend:", error);
  }
}

// ─── Schedule a LOCAL notification (no server needed) ────────────────────────
// Used for things like rest timer alerts
export async function scheduleLocalNotification(
  title: string,
  body: string,
  secondsFromNow: number
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { seconds: secondsFromNow },
  });
}

// ─── Cancel all scheduled local notifications ────────────────────────────────
export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Set up notification response listeners ──────────────────────────────────
// Call this in your root layout once
export function setupNotificationListeners(
  onReceive: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void
) {
  const receiveSubscription =
    Notifications.addNotificationReceivedListener(onReceive);
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(onResponse);

  return () => {
    receiveSubscription.remove();
    responseSubscription.remove();
  };
}

/*
─── HOW PUSH NOTIFICATIONS WORK IN PRODUCTION ──────────────────────────────

1. On app launch, registerForPushNotificationsAsync() gets a device token.
2. syncPushTokenWithBackend() sends that token to your Express backend.
3. Backend stores token in MongoDB: users.pushToken field.
4. When server wants to notify a user (e.g. workout reminder), it calls:
   
   POST https://exp.host/--/api/v2/push/send
   {
     to: "<user's expo push token>",
     title: "Time to train",
     body: "Your hybrid session is ready."
   }

5. Expo's push service delivers it to the device via Apple APNs / Google FCM.

Your backend scheduler (BullMQ cron):
- 7:00am daily → send "Time to train" to all users with workouts today
- After 3 missed days → send streak warning
- After workout logged → send completion congratulations

─────────────────────────────────────────────────────────────────────────────
*/
