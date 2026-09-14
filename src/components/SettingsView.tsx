"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { SNOOZE_OPTIONS } from "@/lib/types";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-orange-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function SettingsView() {
  const { settings, updateSettings } = useAppData();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Notification.permission is a browser-only API, so it must be read
    // after mount to avoid a server/client render mismatch.
    const value: NotificationPermission | "unsupported" =
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPermission(value);
  }, []);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!settings) {
    return <div className="mx-auto max-w-2xl px-5 py-10 text-sm text-slate-400">Loading settings…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-400">Configure reminders to fit how you work.</p>

      {permission !== "granted" && permission !== "unsupported" && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Stay on schedule</p>
          <p className="mt-1 text-xs text-amber-700">
            Dev Reminder needs notification permission to remind you about scheduled tasks.
          </p>
          <button
            onClick={async () => {
              const result = await Notification.requestPermission();
              setPermission(result);
            }}
            className="mt-3 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
          >
            Allow Notifications
          </button>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Notifications</p>
              <p className="text-xs text-slate-400">Show a system notification when a reminder fires.</p>
            </div>
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => {
                updateSettings({ notificationsEnabled: v });
                flash();
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Sound</p>
              <p className="text-xs text-slate-400">Play an alarm tone when a reminder triggers.</p>
            </div>
            <Toggle
              checked={settings.soundEnabled}
              onChange={(v) => {
                updateSettings({ soundEnabled: v });
                flash();
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Vibration</p>
              <p className="text-xs text-slate-400">Vibrate the device (where supported).</p>
            </div>
            <Toggle
              checked={settings.vibrationEnabled}
              onChange={(v) => {
                updateSettings({ vibrationEnabled: v });
                flash();
              }}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Default Snooze</h2>
        <p className="mt-1 text-xs text-slate-400">Used when a reminder is snoozed.</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {SNOOZE_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => {
                updateSettings({ defaultSnooze: m });
                flash();
              }}
              className={`rounded-xl py-2 text-xs font-semibold transition ${
                settings.defaultSnooze === m
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m < 60 ? `${m}m` : "1h"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Time Format</h2>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              updateSettings({ timeFormat: "12" });
              flash();
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
              settings.timeFormat === "12" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            12-hour (10:30 AM)
          </button>
          <button
            onClick={() => {
              updateSettings({ timeFormat: "24" });
              flash();
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
              settings.timeFormat === "24" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            24-hour (10:30)
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">About</h2>
        <p className="mt-2 text-xs text-slate-500">
          Dev Reminder is a simple personal task alarm. Tasks and settings are stored securely in
          your Dev Reminder database — no account required.
        </p>
        <a
          href="/downloads/dev-reminder.zip"
          download
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          ⬇ Download Full Source (.zip)
        </a>
        <p className="mt-2 text-[11px] text-slate-400">
          Includes the Next.js app, the Android (Capacitor) project, and the GitHub Actions APK
          build workflow.
        </p>
      </section>

      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Saved
        </div>
      )}
    </div>
  );
}
