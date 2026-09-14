import type { CapacitorConfig } from "@capacitor/cli";

// Dev Reminder is a full Next.js + PostgreSQL app (task storage, reminders,
// settings all live server-side). The Android app is a lightweight native
// shell (via Capacitor) that loads the deployed Dev Reminder web app in a
// WebView, giving it a real app icon, splash screen and installable APK.
//
// Point DEV_REMINDER_WEB_URL at your deployed Dev Reminder instance
// (set it as a GitHub Actions repo variable/secret, or edit the fallback
// below once the app is deployed).
const remoteUrl = process.env.DEV_REMINDER_WEB_URL || "https://example.com";

const config: CapacitorConfig = {
  appId: "com.devreminder.app",
  appName: "Dev Reminder",
  webDir: "www",
  server: {
    url: remoteUrl,
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
