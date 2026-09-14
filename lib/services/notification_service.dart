import 'package:flutter_local_notifications/flutter_local_notifications.dart';
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
  static const String _channelId = 'dev_reminder_channel';

  Future<void> init() async {
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

    const channel = AndroidNotificationChannel(
      _channelId,
      'Dev Reminder Alerts',
      description: 'Task reminder alarms',
      importance: Importance.max,
      playSound: true,
    );

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  Future<void> requestPermissions() async {
    final androidImpl = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.requestNotificationsPermission();
    await androidImpl?.requestExactAlarmsPermission();
  }

  NotificationDetails _buildDetails() {
    const androidDetails = AndroidNotificationDetails(
      _channelId,
      'Dev Reminder Alerts',
      channelDescription: 'Task reminder alarms',
      importance: Importance.max,
      priority: Priority.high,
      fullScreenIntent: true,
      category: AndroidNotificationCategory.alarm,
      actions: const [
        AndroidNotificationAction(snoozeActionId, 'Snooze'),
        AndroidNotificationAction(turnOffActionId, 'Turn Off'),
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
    if (!task.reminderEnabled) return;
    final scheduledDate = _buildDateTime(task.date, task.time);
    if (scheduledDate.isBefore(DateTime.now())) return;

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
    await _plugin.cancel(notificationId);
  }

  Future<void> snoozeNotification(Task task, int minutes) async {
    final newTime = DateTime.now().add(Duration(minutes: minutes));
    await _plugin.zonedSchedule(
      task.notificationId,
      'DEV REMINDER (Snoozed)',
      task.title,
      tz.TZDateTime.from(newTime, tz.local),
      _buildDetails(),
        uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: task.id,
    );
  }

  static void _onNotificationResponse(NotificationResponse response) {
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
          .snoozeNotification(updated, updated.snoozeDuration);
    } else if (response.actionId == turnOffActionId) {
      final updated = task.copyWith(
        status: 'completed',
        updatedAt: DateTime.now().toIso8601String(),
      );
      await db.updateTask(updated);
      await NotificationService.instance.cancelNotification(task.notificationId);
    }
  }
}