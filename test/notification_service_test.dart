import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dev_reminder/models/task.dart';
import 'package:dev_reminder/services/notification_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const channel = MethodChannel('dev_reminder/alarms');
  final calls = <MethodCall>[];
  final service = NotificationService.instance;

  Task task({bool enabled = true, String status = 'scheduled', DateTime? at}) {
    final date = at ?? DateTime.now().add(const Duration(days: 1));
    return Task(
      id: 'task-1', title: 'Review production',
      date: '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
      time: '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}',
      reminderEnabled: enabled, status: status, notificationId: 42,
      snoozeDuration: 10, createdAt: date.toIso8601String(),
      updatedAt: date.toIso8601String(),
    );
  }

  setUp(() {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    calls.clear();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (call) async {
      calls.add(call);
      return null;
    });
  });

  tearDown(() {
    debugDefaultTargetPlatformOverride = null;
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, null);
  });

  test('Future reminder passes task, local instant and snooze to native scheduler', () async {
    final reminder = task();
    await service.scheduleTaskNotification(reminder);
    expect(calls.single.method, 'schedule');
    final args = calls.single.arguments as Map;
    expect(args['taskId'], reminder.id);
    expect(args['title'], reminder.title);
    expect(args['snooze'], 10);
    expect(args['snoozed'], false);
    expect(args['at'], DateTime.parse('${reminder.date}T${reminder.time}').millisecondsSinceEpoch);
  });

  test('Disabling an existing reminder cancels its scheduled alarm', () async {
    await service.scheduleTaskNotification(task(enabled: false));
    expect(calls.single.method, 'cancel');
    expect(calls.single.arguments, 42);
  });

  test('Completing a task cancels the alarm instead of rearming it', () async {
    await service.scheduleTaskNotification(task(status: 'completed'));
    expect(calls.single.method, 'cancel');
  });

  test('Past reminders fail visibly rather than being silently discarded', () async {
    await expectLater(service.scheduleTaskNotification(
      task(at: DateTime.now().subtract(const Duration(days: 1)))), throwsStateError);
    expect(calls, isEmpty);
  });

  test('Snooze schedules relative to now, not the original task date', () async {
    final before = DateTime.now().add(const Duration(minutes: 10)).millisecondsSinceEpoch;
    await service.snoozeNotification(task(at: DateTime(2020)), 10);
    final after = DateTime.now().add(const Duration(minutes: 10)).millisecondsSinceEpoch;
    final args = calls.single.arguments as Map;
    expect(args['snoozed'], true);
    expect(args['at'], inInclusiveRange(before, after));
    expect(args['taskId'], 'task-1');
  });

  test('Permission denial propagates so the UI cannot report a successful save', () async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (_) async {
      throw PlatformException(code: 'ALARM_ERROR', message: 'Enable Alarms & reminders');
    });
    await expectLater(service.scheduleTaskNotification(task()),
        throwsA(isA<PlatformException>()));
  });
}
