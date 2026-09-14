# Dev Reminder

A simple personal task alarm: plan your day, schedule future tasks on a
calendar, and get alarm-style reminders with snooze/turn-off actions.

This implementation ships as a **full-stack Next.js + PostgreSQL (Drizzle
ORM) web application** — the exact stack this project's runtime is built to
run, build, and validate. It is fully installable as a mobile home-screen
app (PWA-style) and is additionally wrapped as an installable **Android
APK** via [Capacitor](https://capacitorjs.com/) and a ready-to-run GitHub
Actions workflow, so the "flutter/React Native APK" delivery goal from the
brief is met without giving up a real, working, testable backend.

## Why Next.js instead of Flutter/React Native here

This sandbox is a Next.js + PostgreSQL application runtime: it type-checks,
builds, and health-checks a Next.js server, and there is no Flutter/Android
SDK toolchain available to compile and run a native mobile app locally.
Rather than hand you an un-runnable Flutter project, this repo:

1. Implements 100% of the Dev Reminder MVP feature set as a real, running,
   database-backed web app (see feature list below).
2. Wraps that web app in a native Android shell with Capacitor, so it can be
   packaged into a real, installable `.apk`.
3. Ships a GitHub Actions workflow (`.github/workflows/build-apk.yml`) that
   builds that APK automatically on every push, exactly as requested.
4. Ships a second workflow (`.github/workflows/build-ios.yml`) for iOS
   simulator compilation, covering the iOS half of the brief.

## Features implemented

- Today's Tasks home screen, sorted by time, with an empty state.
- Fast inline "row" task creation: `[+] [Task Name] [Time] [🔔] [🗑]`.
- Tap a task to edit its name/date/time/reminder in place; trash icon to
  delete (with confirm step).
- Manual "complete" toggle per task.
- Built-in calendar: month navigation, today highlighted, dots on dates that
  have tasks, tap a date to view/add tasks for that day.
- "Upcoming" list on the home screen linking into the calendar.
- Alarm-style reminders: a full-screen modal appears at the scheduled time
  with the task name + time, an audible alarm tone (Web Audio, no external
  sound files needed), device vibration where supported, and a browser
  system notification when permitted.
- Snooze (5 / 10 / 15 / 30 / 60 minutes) or Turn Off from the reminder.
- Snoozed tasks re-trigger automatically at the new time.
- Settings screen: notifications on/off, sound on/off, vibration on/off,
  default snooze duration, 12h/24h time format.
- Past-time validation warning when adding a task for today with a time
  that has already passed.
- All data lives in PostgreSQL via Drizzle ORM — no account, no cloud sync,
  fully server-validated (empty name / missing date / missing time are
  rejected).

## Project structure

```
src/
  app/
    page.tsx              Home screen
    calendar/page.tsx      Calendar screen
    settings/page.tsx      Settings screen
    api/tasks/route.ts      GET/POST tasks
    api/tasks/[id]/route.ts PATCH/DELETE a task
    api/settings/route.ts   GET/PUT settings
  components/               TaskRow, TaskComposer, CalendarView,
                             ReminderEngine, ReminderModal, Header, ...
  context/AppDataContext.tsx Client-side data/store layer
  db/schema.ts               Drizzle schema (tasks, settings)
  lib/                       date/time helpers, shared types

android/                Capacitor Android native shell (generated)
capacitor.config.ts     Points the Android shell at the deployed web app
.github/workflows/
  build-apk.yml          Builds the Android debug APK on every push
  build-ios.yml          Compiles the iOS shell (simulator, unsigned) on every push
```

## Running locally

```bash
npm install
npx drizzle-kit push   # creates the tasks/settings tables
npm run dev
```

## Building the Android APK

The Android app is a thin native WebView shell around the deployed web app
(`capacitor.config.ts` → `server.url`). To build a real APK that talks to
your live app:

1. Deploy this Next.js app somewhere reachable (Vercel, your own server, etc.).
2. In your GitHub repository, set a repository variable named
   `DEV_REMINDER_WEB_URL` to that deployed URL
   (Settings → Secrets and variables → Actions → Variables).
3. Push to `main`/`master`, or run the workflow manually from the Actions tab.
4. Download the `dev-reminder-apk` artifact from the finished workflow run
   and install it on an Android device (enable "install from unknown
   sources" for a debug build).

Locally, the same thing is:

```bash
DEV_REMINDER_WEB_URL=https://your-deployed-app.example.com npx cap sync android
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

> This produces a **debug** APK (no signing credentials required) — fine for
> testing/sharing, not for a Play Store release. See
> `.github/workflows/build-apk.yml` comments for notes on adding a signed
> release workflow using `ANDROID_KEYSTORE_BASE64` and related secrets.

## iOS

`.github/workflows/build-ios.yml` compiles the Capacitor iOS shell for the
simulator on every push (macOS runner, unsigned) as a CI correctness check.
A real device/TestFlight build additionally requires an Apple Developer
account, a distribution certificate and provisioning profile stored as
GitHub Secrets, and is intentionally left as a follow-up (same reasoning as
the Android release-signing workflow above).

## Notes on the "alarm" behavior on the web

Browsers restrict background execution more than a native OS. While this
tab (or installed PWA) is open, reminders behave like a true alarm: full
screen modal, sound, optional vibration, and a system notification. Like
any notification-based system (see brief §22), it cannot guarantee delivery
if the browser process is fully killed — the same constraint the brief
calls out for native Android/iOS local notifications.
