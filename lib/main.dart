import 'package:flutter/material.dart';
import 'constants/app_colors.dart';
import 'services/notification_service.dart';
import 'screens/home_screen.dart';
import 'screens/alarm_screen.dart';
import 'db/database_helper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.init();
  runApp(const DevReminderApp());
}

class DevReminderApp extends StatefulWidget {
  const DevReminderApp({super.key});

  @override
  State<DevReminderApp> createState() => _DevReminderAppState();
}

class _DevReminderAppState extends State<DevReminderApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();
  bool _openingAlarm = false;
  @override
  void initState() {
    super.initState();
    NotificationService.instance.pendingTaskId.addListener(_openPendingAlarm);
    WidgetsBinding.instance.addPostFrameCallback((_) => _openPendingAlarm());
  }

  @override
  void dispose() {
    NotificationService.instance.pendingTaskId.removeListener(_openPendingAlarm);
    super.dispose();
  }

  Future<void> _openPendingAlarm() async {
    final taskId = NotificationService.instance.pendingTaskId.value;
    if (taskId == null || !mounted || _openingAlarm) return;
    _openingAlarm = true;
    NotificationService.instance.pendingTaskId.value = null;
    try {
      final task = await DatabaseHelper.instance.getTaskById(taskId);
      if (!mounted || task == null) return;
      await _navigatorKey.currentState?.push(
        MaterialPageRoute<void>(builder: (_) => AlarmScreen(task: task)),
      );
    } finally {
      _openingAlarm = false;
      if (mounted && NotificationService.instance.pendingTaskId.value != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _openPendingAlarm());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'Dev Reminder',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: AppColors.primary,
        scaffoldBackgroundColor: AppColors.background,
      ),
      home: const HomeScreen(),
    );
  }
}