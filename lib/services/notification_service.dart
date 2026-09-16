import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest_all.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

import '../db/database_helper.dart';
import '../models/task.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const String snoozeActionId = 'SNOOZE_ACTION';
  static const String turnOffActionId = 'TURN_OFF_ACTION';
  static const String _channelId = 'dev_reminder_alarm_channel_v2';

  final ValueNotifier<String?> pendingTaskId = ValueNotifier(null);
  bool _soundEnabled = true;
  static const _native = MethodChannel('dev_reminder/alarms');
  bool get isAndroid => !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
  Future<void>? _syncing;
  Future<void>? _refreshing;

  Future<Map<String, bool>> permissions() async {
    if (!isAndroid) return {};
    final result = await _native.invokeMapMethod<String, bool>('permissions');
    return result ?? {};
  }

  Future<void> openPermissionSettings(String kind) async {
    if (isAndroid) await _native.invokeMethod<void>('settings', kind);
  }

  Future<void> setSoundEnabled(bool enabled) async {
    _soundEnabled = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('alarm_sound_enabled', enabled);
    if (isAndroid) await _native.invokeMethod<void>('sound', enabled);
  }

  Future<void> _scheduleNative(Task task, DateTime at, {bool snoozed = false}) =>
      _native.invokeMethod<void>('schedule', {
        'taskId': task.id, 'notificationId': task.notificationId,
        'title': task.title, 'date': task.date, 'time': task.time,
        'snooze': task.snoozeDuration, 'at': at.millisecondsSinceEpoch,
        'snoozed': snoozed,
      });

  // Acknowledge only after SQLite commits; interrupted sync can safely replay.
  Future<void> syncNativeEvents() async {
    if (!isAndroid) return;
    final active = _syncing;
    if (active != null) return active;
    final operation = _syncEvents();
    _syncing = operation;
    try { await operation; } finally { _syncing = null; }
  }

  Future<void> _syncEvents() async {
    await _native.invokeMethod<void>('restore');
    final json = await _native.invokeMethod<String>('events') ?? '[]';
    for (final event in jsonDecode(json) as List<dynamic>) {
      final task = await DatabaseHelper.instance.getTaskById(event['taskId'] as String);
      if (task != null) {
        final snoozed = event['status'] == 'snoozed';
        final at = DateTime.fromMillisecondsSinceEpoch(event['at'] as int);
        await DatabaseHelper.instance.updateTask(task.copyWith(
          status: event['status'] as String,
          date: snoozed ? '${at.year.toString().padLeft(4, '0')}-${at.month.toString().padLeft(2, '0')}-${at.day.toString().padLeft(2, '0')}' : null,
          time: snoozed ? '${at.hour.toString().padLeft(2, '0')}:${at.minute.toString().padLeft(2, '0')}' : null,
          updatedAt: DateTime.now().toIso8601String(),
        ));
      }
      await _native.invokeMethod<void>('ack', event['eventId']);
    }
  }

  Future<void> _migrateAndroidAlarms() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('native_alarm_migrated') == true) return;
    final access = await permissions();
    if (access['exact'] != true) return;
    final db = await DatabaseHelper.instance.database;
    final rows = await db.query('tasks',
      where: 'reminderEnabled = 1 AND status IN (?, ?)',
      whereArgs: ['scheduled', 'snoozed']);
    for (final row in rows) {
      final task = Task.fromMap(row);
      final at = _buildDateTime(task.date, task.time);
      if (at.isAfter(DateTime.now())) {
        await _scheduleNative(task, at, snoozed: task.status == 'snoozed');
      } else {
        await DatabaseHelper.instance.updateTask(task.copyWith(status: 'missed'));
      }
    }
    await _plugin.cancelAll(); // Retire legacy schedules only after migration.
    await prefs.setBool('native_alarm_migrated', true);
  }

  Future<void> refresh() async {
    final active = _refreshing;
    if (active != null) return active;
    final operation = _refresh();
    _refreshing = operation;
    try { await operation; } finally { _refreshing = null; }
  }

  Future<void> _refresh() async {
    await syncNativeEvents();
    if (isAndroid) await _migrateAndroidAlarms();
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _soundEnabled = prefs.getBool('alarm_sound_enabled') ?? true;
    tzdata.initializeTimeZones();
    try {
      final String currentTimeZone = await FlutterTimezone.getLocalTimezone();
      tz.setLocalLocation(tz.getLocation(currentTimeZone));
    } catch (_) {
      tz.setLocalLocation(tz.getLocation('UTC'));
    }

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const initSettings =
        InitializationSettings(android: androidSettings, iOS: iosSettings);

    await _plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationResponse,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundNotificationResponse,
    );

    if (isAndroid) {
      await setSoundEnabled(_soundEnabled);
      await refresh();
      return;
    }

    final channel = AndroidNotificationChannel(
      _channelId,
      'Dev Reminder Alerts',
      description: 'Task reminder alarms',
      importance: Importance.max,
      playSound: _soundEnabled,
      sound: _soundEnabled
          ? const RawResourceAndroidNotificationSound('alarm')
          : null,
    );

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    final launchDetails = await _plugin.getNotificationAppLaunchDetails();
    final response = launchDetails?.notificationResponse;
    if (launchDetails?.didNotificationLaunchApp == true && response != null) {
      pendingTaskId.value = response.payload;
    }
  }

  Future<void> requestPermissions() async {
    final androidImpl = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.requestNotificationsPermission();
    // Special access is requested explicitly from the Settings screen.
    // Avoid launching multiple system settings screens over one another.
  }

  NotificationDetails _buildDetails() {
    final androidDetails = AndroidNotificationDetails(
      _channelId,
      'Dev Reminder Alerts',
      channelDescription: 'Task reminder alarms',
      importance: Importance.max,
      priority: Priority.high,
      playSound: _soundEnabled,
      sound: _soundEnabled
          ? const RawResourceAndroidNotificationSound('alarm')
          : null,
      fullScreenIntent: true,
      category: AndroidNotificationCategory.alarm,
      actions: [
        const AndroidNotificationAction(snoozeActionId, 'Snooze'),
        const AndroidNotificationAction(turnOffActionId, 'Turn Off'),
      ],
    );
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentSound: true,
      presentBadge: true,
    );
    return NotificationDetails(android: androidDetails, iOS: iosDetails);
  }

  DateTime _buildDateTime(String date, String time) {
    final d = date.split('-');
    final t = time.split(':');
    return DateTime(int.parse(d[0]), int.parse(d[1]), int.parse(d[2]),
        int.parse(t[0]), int.parse(t[1]));
  }

  Future<void> scheduleTaskNotification(Task task) async {
    if (!task.reminderEnabled || task.status == 'completed') {
      await cancelNotification(task.notificationId);
      return;
    }
    final scheduledDate = _buildDateTime(task.date, task.time);
    if (!scheduledDate.isAfter(DateTime.now())) {
      throw StateError('Choose a future reminder time.');
    }
    if (isAndroid) {
      await _scheduleNative(task, scheduledDate);
      return;
    }

    await _plugin.zonedSchedule(
      task.notificationId,
      'DEV REMINDER',
      task.title,
      tz.TZDateTime.from(scheduledDate, tz.local),
      _buildDetails(),
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: task.id,
    );
  }

  Future<void> cancelNotification(int notificationId) async {
    if (isAndroid) {
      await _native.invokeMethod<void>('cancel', notificationId);
      return;
    }
    await _plugin.cancel(notificationId);
  }

  Future<void> snoozeNotification(Task task, int minutes) async {
    final newTime = DateTime.now().add(Duration(minutes: minutes));
    if (isAndroid) {
      await _scheduleNative(task, newTime, snoozed: true);
      return;
    }
    await _plugin.zonedSchedule(
      task.notificationId,
      'Alarm snoozed',
      'Your alarm for "${task.title}" has been snoozed.',
      tz.TZDateTime.from(newTime, tz.local),
      _buildDetails(),
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: task.id,
    );
  }

  static void _onNotificationResponse(NotificationResponse response) {
    if ((response.actionId ?? '').isEmpty && response.payload != null) {
      instance.pendingTaskId.value = response.payload;
      return;
    }
    _handleAction(response);
  }

  @pragma('vm:entry-point')
  static void _onBackgroundNotificationResponse(NotificationResponse response) {
    _handleAction(response);
  }

  static Future<void> _handleAction(NotificationResponse response) async {
    final taskId = response.payload;
    if (taskId == null) return;

    final db = DatabaseHelper.instance;
    final task = await db.getTaskById(taskId);
    if (task == null) return;

    if (response.actionId == snoozeActionId) {
      final updated = task.copyWith(
        status: 'snoozed',
        updatedAt: DateTime.now().toIso8601String(),
      );
      await db.updateTask(updated);
      await NotificationService.instance
          .cancelNotification(task.notificationId);
      await NotificationService.instance
          .snoozeNotification(updated, updated.snoozeDuration);
    } else if (response.actionId == turnOffActionId) {
      await db.updateTask(task.copyWith(status: 'dismissed', updatedAt: DateTime.now().toIso8601String()));
      await NotificationService.instance.cancelNotification(task.notificationId);
    }
  }
}