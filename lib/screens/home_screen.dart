import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../db/database_helper.dart';
import '../models/task.dart';
import '../services/notification_service.dart';
import '../utils/date_utils.dart';
import '../widgets/add_task_sheet.dart';
import '../widgets/task_tile.dart';
import '../widgets/empty_state.dart';
import 'calendar_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  List<Task> _tasks = [];
  bool _loading = true;
  late String _todayStr;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _todayStr = AppDateUtils.formatDateKey(DateTime.now());
    _requestPermissions();
    _loadTasks();
  }

  Future<void> _requestPermissions() async {
    await NotificationService.instance.requestPermissions();
    final access = await NotificationService.instance.permissions();
    if (mounted && access.values.any((allowed) => !allowed)) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Enable alarm permissions in Settings for lock-screen reminders.'),
        duration: const Duration(seconds: 10),
        action: SnackBarAction(label: 'Settings', onPressed: () => Navigator.push(
          context, MaterialPageRoute<void>(builder: (_) => const SettingsScreen()))),
      ));
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _loadTasks();
  }

  Future<void> _saveTask(Task task, {bool insert = false}) async {
    try {
      // Schedule first so permission denial does not silently save a broken reminder.
      await NotificationService.instance.scheduleTaskNotification(task);
      if (insert) {
        await DatabaseHelper.instance.insertTask(task);
      } else {
        await DatabaseHelper.instance.updateTask(task);
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Task was not saved: $error'),
          duration: const Duration(seconds: 8),
        ));
      }
    }
  }

  Future<void> _loadTasks() async {
    await NotificationService.instance.refresh();
    if (!mounted) return;
    _todayStr = AppDateUtils.formatDateKey(DateTime.now());
    setState(() => _loading = true);
    final tasks = await DatabaseHelper.instance.getTasksForDate(_todayStr);
    tasks.sort((a, b) => a.time.compareTo(b.time));
    if (!mounted) return;
    setState(() {
      _tasks = tasks;
      _loading = false;
    });
  }

  Future<void> _addTask() async {
    final result = await showModalBottomSheet<Task>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => AddEditTaskSheet(date: _todayStr),
    );
    if (result != null) {
      await _saveTask(result, insert: true);
      _loadTasks();
    }
  }

  Future<void> _editTask(Task task) async {
    final result = await showModalBottomSheet<Task>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => AddEditTaskSheet(date: task.date, existingTask: task),
    );
    if (result != null) {
      await _saveTask(result);
      _loadTasks();
    }
  }

  Future<void> _deleteTask(Task task) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete this task?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed == true) {
      await NotificationService.instance.cancelNotification(task.notificationId);
      await DatabaseHelper.instance.deleteTask(task.id);
      _loadTasks();
    }
  }

  Future<void> _toggleComplete(Task task) async {
    final updated = task.copyWith(
      status: task.status == 'completed' ? 'scheduled' : 'completed',
      updatedAt: DateTime.now().toIso8601String(),
    );
    await _saveTask(updated);
    _loadTasks();
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = DateFormat('EEEE, MMMM d').format(DateTime.now());

    return Scaffold(
      appBar: AppBar(
        title: const Text('DEV REMINDER',
            style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.push(
                context, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadTasks,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    child: Text(dateLabel, style: Theme.of(context).textTheme.titleMedium),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text("Today's Tasks",
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.bold)),
                  ),
                  Expanded(
                    child: _tasks.isEmpty
                        ? const EmptyState()
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _tasks.length,
                            itemBuilder: (context, index) {
                              final task = _tasks[index];
                              return TaskTile(
                                task: task,
                                onTap: () => _editTask(task),
                                onDelete: () => _deleteTask(task),
                                onToggleComplete: () => _toggleComplete(task),
                              );
                            },
                          ),
                  ),
                ],
              ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          FloatingActionButton.extended(
            heroTag: 'calendar',
            onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const CalendarScreen()))
                .then((_) => _loadTasks()),
            label: const Text('Calendar'),
            icon: const Icon(Icons.calendar_month),
            backgroundColor: Colors.grey[700],
          ),
          const SizedBox(height: 12),
          FloatingActionButton.extended(
            heroTag: 'add',
            onPressed: _addTask,
            label: const Text('Add Task'),
            icon: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }
}