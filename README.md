# Dev Reminder

Dev Reminder is a simple personal task reminder app focused on planning today and remembering important work at the right time.

## App logo

The project includes the app logo in the workspace as `Logo.png`. This can be used for the app icon and splash assets when you package the app for release.

## Project structure

- `src/components` — reusable UI components
- `src/screens` — app screens
- `src/services` — storage and task behavior
- `src/utils` — date/time helpers
- `src/constants` — color and theme values
- `src/navigation` — app navigation
- `.github/workflows` — CI workflow for Android APK build

## Required libraries

Install the following packages before running the app:

```bash
npm install
npm install @react-native-async-storage/async-storage
npm install @react-native-community/datetimepicker
npm install @react-navigation/native @react-navigation/native-stack react-native-safe-area-context react-native-screens
```

## Android setup

Make sure Android Studio is installed and the Android SDK is present. The app expects the SDK path in:

```properties
android/local.properties
```

Example:

```properties
sdk.dir=C:\Users\Aman\AppData\Local\Android\Sdk
```

## Run locally

```bash
npm install
npm start
npm run android
```

## Build APK via GitHub Actions

The repository includes:

```text
.github/workflows/build-apk.yml
```

This workflow checks out the code, installs dependencies, sets up Java, builds the Android debug APK, and uploads it as a GitHub Actions artifact.

## Notes

- The app uses local storage, so no backend is required.
- This is a minimal MVP for task creation, scheduling, completion, and daily reminder-style workflows.
- The project is intentionally lightweight and easy to extend.
