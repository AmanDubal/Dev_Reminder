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
    if (taskId == null || !mounted) return;
    NotificationService.instance.pendingTaskId.value = null;
    final task = await DatabaseHelper.instance.getTaskById(taskId);
    if (!mounted || task == null) return;
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => AlarmScreen(task: task)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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