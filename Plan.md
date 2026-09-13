# Dev Reminder

## 1. Project Overview

**App Name:** Dev Reminder

**Platform:** Mobile
**Framework:** React Native

**Purpose:**
Dev Reminder is a simple productivity and task-reminder application that helps users plan their day, schedule future tasks, and receive alarm-style reminders so they do not forget important work.

The app should focus on:

* Simple task scheduling
* Today's task management
* Future task scheduling through a built-in calendar
* Alarm-style reminders
* Snooze functionality
* Easy task creation
* Minimal and clean interface
* Fast interaction with very little navigation

The application should feel more like a **personal task alarm clock** than a complicated project-management application.

---

# 2. Core Concept

The basic workflow is:

```text
Open Dev Reminder
       ↓
View Today's Tasks
       ↓
Add Task
       ↓
Enter Task Name + Select Time
       ↓
Save Task
       ↓
Task appears in Today's Task List
       ↓
At scheduled time
       ↓
Alarm / Reminder Notification
       ↓
User chooses:
   ├── Turn Off
   └── Snooze
```

Users can also select a future date from the calendar:

```text
Today's Tasks
      ↓
Calendar
      ↓
Select Date
      ↓
Add Task
      ↓
Set Time
      ↓
Save
      ↓
Task is scheduled for selected date
```

---

# 3. Main Goals

## Primary Goals

1. Allow users to quickly schedule tasks.
2. Make today's tasks immediately visible.
3. Allow tasks to be scheduled for future dates.
4. Provide reliable reminder notifications.
5. Provide alarm-like behavior.
6. Support snoozing reminders.
7. Keep the UI extremely simple.
8. Make adding multiple tasks fast.
9. Allow users to delete scheduled tasks.
10. Help users structure their day without overwhelming them.

---

# 4. Target User Experience

The app should answer one simple question immediately:

> "What do I need to do today?"

When the user opens the application, they should not need to navigate through multiple screens.

The home screen should primarily contain:

```text
DEV REMINDER

Today
Sunday, September 13

[ + ]  Task Name                         10:30 AM
[ + ]  Task Name                          1:00 PM
[ + ]  Task Name                          5:30 PM

                    + Add Task

Upcoming
September 14
September 15
...
```

The interface should remain clean and uncluttered.

---

# 5. Main Features

## 5.1 Today's Tasks

The home screen displays all tasks scheduled for the current day.

Each task should show:

* Task name
* Scheduled time
* Task status
* Optional alarm/reminder status
* Delete button when editing

Example:

```text
Today's Tasks

┌─────────────────────────────────────────┐
│ +   Complete project documentation      │
│                              10:30 AM   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ +   Study React Native                  │
│                               2:00 PM   │
└─────────────────────────────────────────┘
```

Tasks should preferably be sorted chronologically.

---

# 6. Add Task Interface

The user specifically wants the task list to use rows.

The initial task row should contain:

```text
[ + ] [ Task Name ] [ Time ]
```

When the user clicks the `+` button, a new task row is created.

Example:

```text
[ + ] [ Task Name ] [ Time ]

After clicking +

[ + ] [ Task Name ] [ Time ] [ 🗑 ]

[ + ] [ Task Name ] [ Time ] [ 🗑 ]
```

The newly created row should contain fresh inputs.

---

# 7. Task Row Structure

Each editable task row should contain:

```text
┌───────────────────────────────────────────────────┐
│ + │ Task Name │ 10:30 AM │ 🗑                     │
└───────────────────────────────────────────────────┘
```

### Components

### 1. Add / Confirm Button

The `+` button creates or confirms a task row.

Possible states:

```text
+
```

and after task data is entered:

```text
✓
```

The implementation can use either behavior, but the interaction must remain obvious.

### 2. Task Name

Text input.

Example:

```text
Finish React Native project
```

### 3. Time

Time picker.

Example:

```text
10:30 AM
```

The user should not manually type time unless there is a strong reason to support it.

### 4. Delete Button

Trash icon.

Clicking it removes the task row.

---

# 8. Task Creation Flow

## Flow A — Today's Task

```text
Home Screen
    ↓
Click Add / +
    ↓
New Task Row
    ↓
Enter Task Name
    ↓
Select Time
    ↓
Confirm Task
    ↓
Task Saved
    ↓
Task Appears in Today's List
```

---

# 9. Calendar Feature

Dev Reminder must have a built-in calendar for scheduling tasks on future dates.

The calendar can be accessed from the home screen.

Example:

```text
Today: September 13

[ Calendar ]

September 2026

Mon Tue Wed Thu Fri Sat Sun
       1   2   3   4   5   6
 7   8   9  10  11  12  13
14  15  16  17  18  19  20
21  22  23  24  25  26  27
28  29  30
```

The current date should be visually highlighted.

---

# 10. Calendar Task Scheduling

When the user selects a date:

```text
Calendar
   ↓
Select September 18
   ↓
September 18 selected
   ↓
Show tasks scheduled for September 18
   ↓
Add Task
   ↓
Set task name
   ↓
Set time
   ↓
Save
```

The user should be able to navigate between months.

---

# 11. Calendar Rules

The calendar should support:

* Previous month
* Next month
* Current date
* Date selection
* Future task scheduling
* Viewing tasks on a selected date
* Adding tasks to selected dates

Optional visual indicators can show dates containing tasks.

Example:

```text
13 ●
14
15 ●
16
17 ●
```

A small dot can indicate that tasks are scheduled on that date.

---

# 12. Reminder / Alarm System

The most important feature is the reminder system.

A scheduled task should generate a reminder at the selected date and time.

Example:

```text
Task:
Submit project report

Date:
September 15

Time:
10:30 AM
```

At 10:30 AM:

```text
┌───────────────────────────────┐
│       DEV REMINDER            │
│                               │
│       Submit project report   │
│                               │
│       10:30 AM                │
│                               │
│    [ SNOOZE ]   [ TURN OFF ]  │
└───────────────────────────────┘
```

---

# 13. Alarm Behavior

The reminder should behave similarly to an alarm clock.

When the reminder triggers:

1. Play notification/alarm sound.
2. Display the task name.
3. Show the scheduled time.
4. Give the user two main options:

   * Turn Off
   * Snooze

---

# 14. Turn Off

When the user selects:

```text
TURN OFF
```

the current reminder should stop.

The task should be marked as:

```text
Completed / Dismissed
```

depending on the final task-state design.

Recommended behavior:

```text
Reminder triggered
      ↓
Turn Off
      ↓
Reminder stops
      ↓
Task marked completed
```

The task should remain visible in the day's history if desired.

---

# 15. Snooze

The user should be able to postpone the reminder.

Example:

```text
Reminder
10:30 AM

[ Snooze ] [ Turn Off ]
```

If the user selects Snooze:

```text
Snooze for:

5 minutes
10 minutes
15 minutes
30 minutes
1 hour
```

Recommended default:

```text
10 minutes
```

After snoozing:

```text
10:30 AM reminder
      ↓
Snooze 10 minutes
      ↓
Next reminder: 10:40 AM
```

---

# 16. Snooze Configuration

The user should eventually be able to configure the default snooze duration.

Settings:

```text
Default Snooze

○ 5 minutes
● 10 minutes
○ 15 minutes
○ 30 minutes
○ 1 hour
```

This can be implemented after the MVP.

---

# 17. Task States

Every task should have a clear state.

Recommended states:

```text
scheduled
triggered
snoozed
completed
deleted
```

Example:

```text
Scheduled
    ↓
Reminder Triggered
    ↓
 ┌───────────────┐
 ↓               ↓
Snooze         Turn Off
 ↓               ↓
Snoozed        Completed
 ↓
Reminder Again
```

---

# 18. Task Data Model

Each task should contain:

```javascript
{
  id: "unique-task-id",
  title: "Complete project documentation",
  date: "2026-09-13",
  time: "10:30",
  status: "scheduled",
  reminderEnabled: true,
  snoozeDuration: 10,
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

---

# 19. Storage

The application should work without requiring an online account.

Tasks should be stored locally.

Recommended storage options:

### MVP

Use:

```text
AsyncStorage
```

This is sufficient for a simple first version.

### Future

For larger functionality:

```text
SQLite
```

or another local database can be introduced.

The application should not depend on a backend for basic reminders.

---

# 20. Offline Functionality

Dev Reminder should work offline.

The user should be able to:

* Create tasks
* Edit tasks
* Delete tasks
* Schedule reminders
* View calendar
* Receive local notifications

without an internet connection.

Internet should not be required for basic functionality.

---

# 21. Notification System

React Native requires native notification handling.

The implementation should use a suitable local-notification solution compatible with the chosen React Native setup.

The notification system must support:

* Scheduled notifications
* Notification sound
* Notification title
* Task description
* Snooze action
* Dismiss/turn-off action
* Background notification handling

Example notification:

```text
DEV REMINDER

Complete project documentation

10:30 AM

[Snooze] [Turn Off]
```

---

# 22. Important Mobile Consideration

A normal notification is not always equivalent to a real alarm clock.

Android and iOS have restrictions around:

* Background execution
* Notification permissions
* Exact alarms
* Battery optimization
* Lock-screen notifications
* App termination
* Do Not Disturb
* Notification sounds

Therefore, the implementation must use platform-supported scheduling mechanisms rather than assuming React Native JavaScript will stay running in the background.

For Android, exact alarm behavior may require additional platform-specific configuration depending on the implementation.

For iOS, the application must follow Apple's notification and background-execution restrictions.

---

# 23. Home Screen

The home screen is the most important screen.

Recommended structure:

```text
┌─────────────────────────────────────┐
│ DEV REMINDER                  ⚙     │
│                                     │
│ Sunday, September 13                │
│                                     │
│ Today's Tasks                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ +  Complete documentation       │ │
│ │                         10:30 AM│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ +  Study React Native           │ │
│ │                          2:00 PM│ │
│ └─────────────────────────────────┘ │
│                                     │
│             [+ Add Task]            │
│                                     │
│             [ Calendar ]             │
│                                     │
└─────────────────────────────────────┘
```

---

# 24. Empty State

If there are no tasks today:

```text
Today's Tasks

No tasks scheduled for today.

Plan your day and stay productive.

[ + Add Task ]
```

The empty state should be simple and encouraging without adding unnecessary content.

---

# 25. Today's Task Display

Tasks should be sorted by time.

Example:

```text
8:00 AM
Study

10:30 AM
Work on project

1:00 PM
Lunch

3:30 PM
Complete assignment

7:00 PM
Review today's work
```

---

# 26. Task Completion

The user should be able to mark a task as completed manually.

Recommended interaction:

```text
○ Complete project
```

After completion:

```text
✓ Complete project
```

Completed tasks can be visually separated from pending tasks.

For example:

```text
Today's Tasks

✓ Complete documentation       10:30 AM
○ Study React Native            2:00 PM
○ Submit assignment             5:00 PM
```

---

# 27. Editing Tasks

Users should be able to edit:

* Task name
* Date
* Time
* Reminder status

Example:

```text
Tap Task
    ↓
Edit Task
    ↓
Task Name
Date
Time
Reminder
    ↓
Save
```

When the time/date changes, the existing scheduled notification must also be updated.

---

# 28. Deleting Tasks

Each editable task row should have a delete icon.

Example:

```text
[ Task Name ] [ Time ] [ 🗑 ]
```

When deleted:

1. Remove task from local storage.
2. Cancel its scheduled notification.
3. Remove it from the UI.

For accidental deletion, a small confirmation can be shown:

```text
Delete this task?

[Cancel] [Delete]
```

---

# 29. Settings

The first version can keep settings minimal.

Possible settings:

```text
Settings

Notifications
Default Snooze
Alarm Sound
Vibration
24-hour / 12-hour format
Theme
About
```

Not all settings need to be implemented in the MVP.

---

# 30. Notification Settings

Recommended:

```text
Notifications       ON
Sound               ON
Vibration           ON
Default Snooze      10 minutes
```

The user should be informed if notification permissions are disabled.

---

# 31. Time Format

Support:

```text
12-hour
10:30 AM
```

and optionally:

```text
24-hour
10:30
```

The app should use the device's preferred time format by default.

---

# 32. Date Handling

Store dates in a consistent machine-readable format.

Recommended:

```text
YYYY-MM-DD
```

Example:

```text
2026-09-13
```

Store time separately:

```text
10:30
```

For actual notification scheduling, convert the date and time into a native JavaScript `Date` object.

---

# 33. Recommended Project Architecture

```text
dev-reminder/
│
├── android/
├── ios/
│
├── src/
│   │
│   ├── components/
│   │   ├── TaskRow.js
│   │   ├── TaskInput.js
│   │   ├── TimePicker.js
│   │   ├── CalendarView.js
│   │   ├── EmptyState.js
│   │   └── ReminderModal.js
│   │
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── CalendarScreen.js
│   │   ├── TaskDetailsScreen.js
│   │   └── SettingsScreen.js
│   │
│   ├── services/
│   │   ├── notificationService.js
│   │   ├── taskService.js
│   │   └── storageService.js
│   │
│   ├── hooks/
│   │   ├── useTasks.js
│   │   └── useNotifications.js
│   │
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── timeUtils.js
│   │   └── taskUtils.js
│   │
│   ├── constants/
│   │   ├── colors.js
│   │   └── config.js
│   │
│   └── navigation/
│       └── AppNavigator.js
│
├── App.js
├── package.json
└── README.md
```

---

# 34. Component Responsibilities

## TaskRow

Responsible for:

* Displaying task
* Task name
* Time
* Completion state
* Delete action
* Edit action

---

## TaskInput

Responsible for:

* Creating new task
* Task name input
* Date selection
* Time selection
* Validation

---

## CalendarView

Responsible for:

* Rendering calendar
* Selecting date
* Navigating months
* Showing task indicators

---

## ReminderModal

Responsible for:

* Showing triggered task
* Showing task name
* Snooze
* Turn off
* Reminder interaction

---

## NotificationService

Responsible for:

* Scheduling notifications
* Cancelling notifications
* Updating notifications
* Snoozing notifications
* Handling notification actions

---

## StorageService

Responsible for:

* Save task
* Retrieve tasks
* Update task
* Delete task
* Persist settings

---

# 35. Navigation

Keep navigation simple.

Recommended:

```text
Home
 │
 ├── Calendar
 │
 ├── Task Details
 │
 └── Settings
```

The home screen should remain the default screen.

---

# 36. MVP Screen List

The first version only needs:

### Screen 1 — Home

Contains:

* Today's date
* Today's tasks
* Add task
* Calendar button
* Task completion
* Delete

### Screen 2 — Calendar

Contains:

* Monthly calendar
* Date selection
* Tasks for selected date
* Add task

### Screen 3 — Add/Edit Task

Contains:

* Task name
* Date
* Time
* Reminder toggle
* Save

### Screen 4 — Settings

Contains basic notification settings.

---

# 37. UI Design Principles

The application should follow these principles:

### Simple

Avoid unnecessary menus.

### Fast

Adding a task should take only a few seconds.

### Clear

The user should immediately understand:

```text
What?
When?
Reminder?
```

### Minimal

Avoid excessive cards, gradients, animations, and decorative elements.

### Accessible

Use:

* Readable font sizes
* Large touch targets
* Clear icons
* Strong contrast
* Simple wording

---

# 38. Suggested Color Direction

Use a clean productivity-oriented interface.

Possible design:

```text
Background:
Light / neutral

Primary:
Dark text

Accent:
One strong accent color

Cards:
White / slightly elevated

Danger:
Red for delete

Success:
Green for completed tasks
```

Do not use too many colors.

A dark mode can be added later.

---

# 39. Task Validation

A task should not be saved if:

```text
Task name = empty
```

or:

```text
Time = not selected
```

or:

```text
Date = not selected
```

Show a clear message:

```text
Please enter a task name.
```

---

# 40. Past Time Validation

For today's tasks:

If the user selects a time that has already passed, the app should warn them.

Example:

```text
Current time:
6:00 PM

Selected:
4:00 PM
```

Display:

```text
This time has already passed today.

Choose a future time or select another date.
```

For future dates, any valid time should be allowed.

---

# 41. Duplicate Tasks

Duplicate task names should be allowed.

Example:

```text
Study
8:00 AM

Study
6:00 PM
```

They are separate tasks because they have different IDs.

---

# 42. Multiple Tasks

The app must support multiple tasks per day.

Example:

```text
Today's Tasks

8:00 AM  Wake up
9:00 AM  Start work
11:00 AM Team meeting
1:00 PM  Lunch
3:00 PM  Project work
6:00 PM  Exercise
8:00 PM  Study
```

There should be no artificial small limit on the number of tasks.

---

# 43. Reminder Scheduling Logic

When a task is saved:

```text
Task Saved
    ↓
Is reminder enabled?
    ↓
YES
    ↓
Create local notification
    ↓
Store notification ID
```

Example task:

```javascript
{
  id: "task-001",
  title: "Finish project",
  date: "2026-09-15",
  time: "10:30",
  reminderEnabled: true,
  notificationId: "notification-001"
}
```

---

# 44. Updating a Scheduled Task

If the user changes:

```text
10:30 AM
```

to:

```text
11:30 AM
```

the app should:

```text
Cancel old notification
        ↓
Create new notification
        ↓
Update stored task
```

Never leave the old reminder active.

---

# 45. Snooze Logic

When a reminder is triggered:

```text
Current reminder
      ↓
User taps Snooze
      ↓
Calculate new trigger time
      ↓
Schedule new notification
      ↓
Update task status
```

Example:

```text
10:30 AM
+
10 minutes
=
10:40 AM
```

The original notification must not continue triggering at the same time.

---

# 46. Turn Off Logic

When the user selects Turn Off:

```text
Cancel current reminder
        ↓
Mark task completed
        ↓
Persist task state
        ↓
Update UI
```

---

# 47. App Startup Logic

Every time the application starts:

```text
Open App
   ↓
Load local tasks
   ↓
Determine today's date
   ↓
Load today's tasks
   ↓
Sort by time
   ↓
Display tasks
```

The app should not require an internet connection to load tasks.

---

# 48. Date Change Logic

At midnight:

```text
September 13
      ↓
September 14
```

The home screen should automatically show:

```text
Today's Tasks
```

for September 14.

Previously scheduled tasks must remain associated with their original dates.

---

# 49. Time Zone Handling

The application should use the device's local timezone.

If the user travels:

```text
Device timezone changes
        ↓
App detects local timezone
        ↓
Reminder scheduling should follow
the device's supported local-time behavior
```

Timezone behavior should be tested carefully because alarms and notifications are platform-dependent.

---

# 50. Permissions

On first use, the app should request required notification permissions.

Example:

```text
Stay on schedule

Dev Reminder needs notification permission
to remind you about scheduled tasks.

[Allow Notifications]
```

Do not request unnecessary permissions.

---

# 51. Error Handling

The app should gracefully handle:

* Notification permission denied
* Invalid task
* Invalid time
* Storage failure
* Notification scheduling failure
* Deleted notification
* App restart
* Device restart
* Calendar errors

Example:

```text
Unable to schedule reminder.

Please check notification permissions.
```

---

# 52. Android Testing

Test:

* App open
* App closed
* App in background
* Phone locked
* Notification permission enabled
* Notification permission disabled
* Scheduled notification
* Snooze
* Turn off
* Multiple reminders
* Device restart
* Battery optimization
* Exact timing behavior

---

# 53. iOS Testing

Test:

* Notification permission
* Scheduled local notifications
* Lock screen
* Background state
* App terminated
* Multiple reminders
* Snooze behavior
* Notification actions
* Sound behavior
* Focus / Do Not Disturb restrictions

---

# 54. Security / Privacy

Dev Reminder does not need a backend for the MVP.

Therefore:

* Tasks stay on the device.
* No account is required.
* No task data needs to be uploaded.
* No unnecessary personal information should be collected.

Privacy should be a design advantage of the application.

---

# 55. MVP Development Phases

## Phase 1 — Project Setup

Tasks:

* Initialize React Native project
* Configure Android
* Configure iOS
* Create project structure
* Configure navigation
* Create theme/constants

Deliverable:

```text
App launches successfully.
```

---

# 56. Phase 2 — Home Screen

Implement:

* Header
* Current date
* Today's tasks
* Empty state
* Add task button
* Task row
* Delete button

Deliverable:

```text
User can view today's tasks.
```

---

# 57. Phase 3 — Task Creation

Implement:

* Task name input
* Date selection
* Time picker
* Save button
* Validation
* Local storage

Deliverable:

```text
User can create and save tasks.
```

---

# 58. Phase 4 — Calendar

Implement:

* Calendar UI
* Month navigation
* Date selection
* Task indicators
* Selected date tasks

Deliverable:

```text
User can schedule tasks for future dates.
```

---

# 59. Phase 5 — Notifications

Implement:

* Notification permissions
* Local notification scheduling
* Notification sound
* Scheduled date/time
* Notification cancellation

Deliverable:

```text
Scheduled tasks generate reminders.
```

---

# 60. Phase 6 — Alarm Interaction

Implement:

* Reminder screen/action
* Snooze
* Turn Off
* Snooze duration
* Task status updates

Deliverable:

```text
Reminder behaves like a task alarm.
```

---

# 61. Phase 7 — Editing

Implement:

* Edit task
* Change task name
* Change date
* Change time
* Enable/disable reminder
* Reschedule notification

Deliverable:

```text
Users can modify existing tasks safely.
```

---

# 62. Phase 8 — Polish

Implement:

* Better spacing
* Icons
* Animations where useful
* Loading states
* Error states
* Empty states
* Accessibility
* Dark mode if desired

Deliverable:

```text
Production-quality MVP.
```

---

# 63. Phase 9 — Testing

Test all major workflows.

### Test Case 1

Create today's task.

Expected:

```text
Task appears in today's list.
```

### Test Case 2

Create future task.

Expected:

```text
Task appears on selected calendar date.
```

### Test Case 3

Schedule reminder.

Expected:

```text
Notification appears at scheduled time.
```

### Test Case 4

Snooze reminder.

Expected:

```text
Reminder appears again after selected snooze period.
```

### Test Case 5

Turn off reminder.

Expected:

```text
Reminder stops.
```

### Test Case 6

Delete task.

Expected:

```text
Task disappears and notification is cancelled.
```

### Test Case 7

Edit task time.

Expected:

```text
Old notification is cancelled.
New notification is scheduled.
```

---

# 64. Recommended MVP Scope

The first version should NOT attempt to become a full productivity suite.

Keep the MVP focused on:

```text
✓ Today's tasks
✓ Add task
✓ Delete task
✓ Complete task
✓ Calendar
✓ Future task scheduling
✓ Time picker
✓ Local storage
✓ Local notifications
✓ Snooze
✓ Turn off
✓ Basic settings
```

Avoid initially adding:

```text
✗ Team collaboration
✗ Accounts
✗ Social features
✗ Chat
✗ Cloud synchronization
✗ Complex project management
✗ AI assistant
✗ Analytics dashboards
✗ Excessive customization
```

These can be considered later.

---

# 65. Future Features

After the MVP is stable, possible additions include:

## Recurring Tasks

```text
Every day
Every weekday
Every week
Every month
```

Example:

```text
Study
Every Monday at 7 PM
```

---

## Priority

```text
Low
Medium
High
Urgent
```

---

## Categories

```text
Work
Study
Personal
Health
Projects
Other
```

---

## Daily Productivity Summary

Example:

```text
Today's Progress

Completed: 5
Remaining: 2

Productivity:
████████░░ 80%
```

---

## Daily Planning

At the beginning of the day:

```text
Good morning!

Plan your day.

[ Add Task ]
```

---

## Task Notes

Allow:

```text
Task:
Finish React Native project

Notes:
Complete notification module and test Android.
```

---

## Search

Search through historical tasks.

---

## History

View completed tasks from previous days.

---

## Statistics

Possible statistics:

```text
Tasks completed
Tasks missed
Tasks snoozed
Completion rate
Most productive days
```

These should only be added if they genuinely help users rather than making the app unnecessarily complex.

---

# 66. Recommended User Flow

The ideal flow should remain:

```text
OPEN APP
   ↓
TODAY'S TASKS
   ↓
ADD TASK
   ↓
TASK NAME
   ↓
TIME
   ↓
SAVE
   ↓
TASK SCHEDULED
   ↓
REMINDER
   ↓
SNOOZE / TURN OFF
```

For future tasks:

```text
OPEN APP
   ↓
CALENDAR
   ↓
SELECT DATE
   ↓
ADD TASK
   ↓
TASK NAME
   ↓
TIME
   ↓
SAVE
   ↓
FUTURE REMINDER
```

---

# 67. Final UI Structure

```text
DEV REMINDER
│
├── HOME
│   │
│   ├── Today's Date
│   │
│   ├── Today's Tasks
│   │   ├── Task Row
│   │   ├── Task Row
│   │   └── Task Row
│   │
│   ├── Add Task
│   │
│   └── Calendar
│
├── CALENDAR
│   │
│   ├── Month
│   ├── Dates
│   ├── Task Indicators
│   └── Selected Date Tasks
│
├── TASK
│   │
│   ├── Task Name
│   ├── Date
│   ├── Time
│   ├── Reminder
│   └── Save
│
└── SETTINGS
    │
    ├── Notifications
    ├── Snooze
    ├── Sound
    ├── Vibration
    └── Theme
```

---

# 68. Definition of Done

The Dev Reminder MVP is complete when:

* [ ] React Native project builds successfully.
* [ ] App opens directly to today's tasks.
* [ ] User can create a task.
* [ ] User can enter a task name.
* [ ] User can select a date.
* [ ] User can select a time.
* [ ] User can save multiple tasks.
* [ ] Tasks persist after closing the app.
* [ ] Today's tasks are displayed automatically.
* [ ] Tasks are sorted by time.
* [ ] User can select future dates from the calendar.
* [ ] Future tasks can be scheduled.
* [ ] User can delete tasks.
* [ ] User can complete tasks.
* [ ] User can edit tasks.
* [ ] Local notifications are scheduled.
* [ ] Notifications work when the app is in the background.
* [ ] Notification sound works where platform permissions allow it.
* [ ] User can snooze a reminder.
* [ ] User can turn off a reminder.
* [ ] Snoozed reminders trigger again correctly.
* [ ] Editing a task correctly reschedules its notification.
* [ ] Deleting a task cancels its notification.
* [ ] Notification permissions are handled correctly.
* [ ] Android is tested.
* [ ] iOS is tested.
* [ ] App works without internet.
* [ ] No unnecessary backend is required.
* [ ] UI remains simple and responsive.

---

# 69. Final Product Vision

**Dev Reminder should not try to compete with complicated productivity applications.**

Its core identity should be:

> **A simple personal task alarm that helps you plan today and remember what needs to be done.**

The user should be able to open the app, add a task in seconds, select a time, close the app, and trust the reminder system to bring the task back to their attention at the right time.

The core experience is:

```text
PLAN → SCHEDULE → REMEMBER → COMPLETE
```

That simplicity should remain the central design principle even as future features are added.
# 70. GitHub Actions APK Build

Dev Reminder should include an automated GitHub Actions workflow that builds the Android APK whenever code is pushed to the repository.

## Workflow Location

The workflow file must be:

```text
.github/
└── workflows/
    └── build-apk.yml
```

> Important: The directory is `.github/workflows/` (plural), not `.github/workflow/`.

---

## 70.1 Purpose

The GitHub Actions workflow should:

1. Checkout the repository.
2. Install the required Node.js version.
3. Install npm dependencies.
4. Configure the Android build environment.
5. Build the React Native Android APK.
6. Store the generated APK as a GitHub Actions artifact.
7. Make the APK available for download from the workflow run.

The goal is to allow:

```text
Developer
   ↓
git push
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Build React Native Android App
   ↓
Generate APK
   ↓
Upload APK Artifact
   ↓
Download APK
```

---

# 70.2 Workflow File

Create:

```text
.github/workflows/build-apk.yml
```

Initial workflow:

```yaml
name: Build Dev Reminder APK

on:
  push:
    branches:
      - main
      - master

  workflow_dispatch:

jobs:
  build-apk:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - name: Make Gradle executable
        run: chmod +x android/gradlew

      - name: Build Debug APK
        working-directory: android
        run: ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: dev-reminder-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

---

# 70.3 Build Trigger

The workflow should run automatically when code is pushed to:

```text
main
master
```

It should also support manual execution through:

```text
GitHub
→ Actions
→ Build Dev Reminder APK
→ Run workflow
```

This is provided by:

```yaml
workflow_dispatch:
```

---

# 70.4 APK Output

The debug APK will normally be generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

GitHub Actions should upload this file as:

```text
dev-reminder-apk
```

The developer can then open:

```text
GitHub
→ Repository
→ Actions
→ Build Dev Reminder APK
→ Successful workflow
→ Artifacts
→ dev-reminder-apk
```

and download the APK.

---

# 70.5 Repository Structure

The final repository should look approximately like:

```text
dev-reminder/
│
├── .github/
│   └── workflows/
│       └── build-apk.yml
│
├── android/
│   ├── app/
│   ├── gradle/
│   ├── gradlew
│   ├── gradlew.bat
│   └── build.gradle
│
├── ios/
│
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── navigation/
│
├── App.js
├── package.json
├── package-lock.json
└── README.md
```

---

# 70.6 Important Dependency Requirement

The repository should contain:

```text
package-lock.json
```

because the workflow uses:

```bash
npm ci
```

`npm ci` provides a reproducible dependency installation based on the lock file.

If the project does not have a `package-lock.json`, either generate one locally with:

```bash
npm install
```

or change the workflow to:

```yaml
- name: Install dependencies
  run: npm install
```

For a stable CI build, `npm ci` is preferred.

---

# 70.7 Debug APK vs Release APK

The initial workflow should build:

```text
Debug APK
```

because it does not require Android signing credentials.

The output is:

```text
app-debug.apk
```

This is suitable for:

* Testing
* Development
* Sharing with testers
* Installing on an Android device

It should **not** be treated as the final Play Store release.

---

# 70.8 Future Release APK

Later, create a separate workflow for a signed release APK:

```text
.github/
└── workflows/
    ├── build-apk.yml
    └── release-apk.yml
```

The release workflow should eventually:

```text
Source Code
     ↓
Build Release
     ↓
Sign APK
     ↓
Generate release APK
     ↓
Upload artifact
```

Android signing credentials must be stored securely using GitHub Secrets rather than committing the keystore or passwords to the repository.

Possible secrets:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

---

# 70.9 CI Build Verification

The workflow should fail if:

* npm dependencies cannot be installed
* Java setup fails
* Gradle fails
* React Native Android compilation fails
* Android resources fail
* APK generation fails

A successful workflow should mean that:

```text
Android APK was successfully generated.
```

---

# 70.10 Recommended Development Workflow

The complete development process becomes:

```text
Local Development
       ↓
Test React Native App
       ↓
Commit Changes
       ↓
git push
       ↓
GitHub
       ↓
GitHub Actions
       ↓
Build APK
       ↓
Upload Artifact
       ↓
Download APK
       ↓
Install on Android Phone
       ↓
Test Dev Reminder
```

---

# 70.11 Final Definition of Done — CI/CD

The project is complete from a build/deployment perspective when:

* [ ] `.github/workflows/build-apk.yml` exists.
* [ ] Workflow runs on push to `main`.
* [ ] Workflow can be manually triggered.
* [ ] Node.js is configured.
* [ ] Java 17 is configured.
* [ ] npm dependencies install successfully.
* [ ] Gradle builds successfully.
* [ ] React Native Android project compiles.
* [ ] Debug APK is generated.
* [ ] APK is uploaded as a GitHub Actions artifact.
* [ ] APK can be downloaded from GitHub Actions.
* [ ] No secrets are committed to the repository.
* [ ] Release signing is handled separately when required.

---

# 71. Complete Dev Reminder Build Pipeline

The final architecture should therefore be:

```text
                    DEV REMINDER
                         │
                         ▼
                  React Native App
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
     Task Management              Calendar System
          │                             │
          └──────────────┬──────────────┘
                         ▼
                  Local Task Storage
                         │
                         ▼
               Notification Service
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
          Snooze                  Turn Off
             │                       │
             └───────────┬───────────┘
                         ▼
                    Task Status
                         │
                         ▼
                  Android APK Build
                         │
                         ▼
                 GitHub Actions
                         │
                         ▼
                  APK Artifact
```

The **MVP priority remains the reminder experience**. GitHub Actions is the automated delivery mechanism, not a core user-facing feature.

---

# 72. iOS Build & Distribution (Missing Piece)

The plan documents iOS testing and iOS-specific notification constraints (Sections 22, 53) and includes an `ios/` folder in the architecture, but no build/distribution pipeline exists for it — only Android APK builds are automated. Since the app targets iOS as well, this gap should be closed.

Recommended addition:

```text
.github/
└── workflows/
    ├── build-apk.yml       (Android)
    └── build-ios.yml       (iOS)
```

Because iOS builds require macOS runners and code signing:

* Use `runs-on: macos-latest`.
* Install CocoaPods dependencies (`pod install`).
* For unsigned/simulator builds, `xcodebuild` can target the simulator without signing — useful for CI verification only.
* For a real device/TestFlight build, signing requires an Apple Developer account, a provisioning profile, and a distribution certificate stored as GitHub Secrets (e.g. `IOS_CERTIFICATE_BASE64`, `IOS_PROVISIONING_PROFILE_BASE64`, `APPLE_TEAM_ID`).
* TestFlight distribution can be automated later with `fastlane` (`fastlane pilot upload`) once signing is in place.

For the MVP, a simulator-only build job (no signing) is enough to verify the iOS side compiles on every push; real-device/TestFlight distribution is a Phase-2 CI concern, similar to the Android release-signing workflow in Section 70.8.

---

# 73. Automated Testing Strategy

Section 63 lists manual test cases, but no automated testing tooling is defined. Recommended additions:

* **Unit tests (Jest):** `dateUtils`, `timeUtils`, `taskUtils`, and reminder-scheduling logic (Section 43–46) are pure-ish functions and should have unit tests first — they are the easiest to break silently.
* **Component tests (React Native Testing Library):** `TaskRow`, `TaskInput`, `CalendarView`, `EmptyState` — verify rendering, empty states, and button interactions.
* **End-to-end tests (Detox or Maestro):** cover the two core flows already diagrammed in Section 66 — "add today's task → see it in list" and "snooze/turn off a triggered reminder."
* **CI integration:** run `jest` as a required check on every push/PR, separate from and prior to the APK build job, so broken logic fails fast without waiting on a full native build.

---

# 74. CI Quality Gates

The existing `build-apk.yml` (Section 70.2) only builds the APK. It has no lint, type-check, or test step, so broken code could still produce an artifact. Recommended addition to the workflow, before the build step:

```yaml
      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm test -- --ci
```

If either step fails, the workflow should stop before spending time on the Gradle build.

---

# 75. Data Backup & Export

Because Dev Reminder is intentionally local-only (Section 54), a lost, reset, or replaced device means all tasks are gone with no recovery path. This is a real risk for a plan that leans on "no backend, no account" as a privacy feature. Recommended addition (post-MVP):

* **Export:** a "Export Tasks" action in Settings that writes all tasks to a JSON file the user can save/share (e.g. via the OS share sheet).
* **Import:** a matching "Import Tasks" action that reads a previously exported JSON file back into local storage.
* This preserves the no-backend design while giving users a manual way to move data between devices or recover from an uninstall.

---

# 76. Onboarding / First-Launch Experience

Section 50 covers the notification-permission prompt, but there's no broader first-launch flow. A short, optional addition:

```text
First Launch
     ↓
1–2 screen intro: "Plan today. Get reminded."
     ↓
Request notification permission (Section 50)
     ↓
Land on empty Home screen (Section 24)
```

Keep this to at most one or two screens — it should not contradict the "fast interaction, minimal navigation" principle in Section 1.

---

# 77. Branding & App Assets

Not currently covered anywhere in the plan:

* App icon (Android adaptive icon + iOS icon set) and splash screen.
* A store-ready app name check — "Dev Reminder" should be searched on the Play Store / App Store ahead of release to confirm it isn't already taken.
* `package.json` metadata (`name`, `version`, `description`, `author`, `license`) consistent with the repository structure in Section 70.5.
