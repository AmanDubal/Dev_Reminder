# Dev Reminder

A simple, fully **offline** task-alarm app built with Flutter.

- No internet permission
- No account / login
- No backend / cloud sync
- All data stored locally in SQLite (`sqflite`)
- Alarm-style reminders via `flutter_local_notifications` with Snooze / Turn Off actions

## Features
- Today's task list, sorted by time
- Add / edit / delete tasks
- Built-in calendar for scheduling future tasks
- Alarm-style reminders with Snooze and Turn Off
- Configurable default snooze duration
- Mark tasks complete

## Tech
- Flutter (Dart)
- sqflite (local DB)
- flutter_local_notifications + timezone (offline alarms)
- shared_preferences (settings)
- table_calendar (calendar UI)

## Build
See `STEP.md` for full setup + GitHub Actions APK build instructions.