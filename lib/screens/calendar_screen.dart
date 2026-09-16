import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../db/database_helper.dart';
import '../models/task.dart';
import '../services/notification_service.dart';
import '../utils/date_utils.dart';
import '../widgets/add_task_sheet.dart';
import '../widgets/task_tile.dart';
import '../widgets/empty_state.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});
  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> with WidgetsBindingObserver {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  List<Task> _tasksForDay = [];
  Set<String> _datesWithTasks = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadDatesWithTasks();
    _loadTasksForDay();
  }

  Future<void> _loadDatesWithTasks() async {
    final dates = await DatabaseHelper.instance.getDatesWithTasks();
    if (!mounted) return;
    setState(() => _datesWithTasks = dates);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _loadTasksForDay();
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

  Future<void> _loadTasksForDay() async {
    await NotificationService.instance.refresh();
    if (!mounted) return;
    final tasks = await DatabaseHelper.instance
        .getTasksForDate(AppDateUtils.formatDateKey(_selectedDay));
    tasks.sort((a, b) => a.time.compareTo(b.time));
    if (!mounted) return;
    setState(() => _tasksForDay = tasks);
  }

  Future<void> _addTask() async {
    final result = await showModalBottomSheet<Task>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => AddEditTaskSheet(date: AppDateUtils.formatDateKey(_selectedDay)),
    );
    if (result != null) {
      await _saveTask(result, insert: true);
      _loadTasksForDay();
      _loadDatesWithTasks();
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
      _loadTasksForDay();
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
      _loadTasksForDay();
      _loadDatesWithTasks();
    }
  }

  Future<void> _toggleComplete(Task task) async {
    final updated = task.copyWith(
      status: task.status == 'completed' ? 'scheduled' : 'completed',
      updatedAt: DateTime.now().toIso8601String(),
    );
    await _saveTask(updated);
    _loadTasksForDay();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Calendar')),
      body: Column(
        children: [
          TableCalendar(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2035, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
              _loadTasksForDay();
            },
            onPageChanged: (focusedDay) => _focusedDay = focusedDay,
            calendarStyle: CalendarStyle(
              todayDecoration:
                  BoxDecoration(color: Colors.indigo.withOpacity(0.4), shape: BoxShape.circle),
              selectedDecoration:
                  const BoxDecoration(color: Colors.indigo, shape: BoxShape.circle),
              markerDecoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
            ),
            eventLoader: (day) =>
                _datesWithTasks.contains(AppDateUtils.formatDateKey(day)) ? [1] : [],
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                DateFormat('EEEE, MMMM d, yyyy').format(_selectedDay),
                style:
                    Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
            ),
          ),
          Expanded(
            child: _tasksForDay.isEmpty
                ? const EmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _tasksForDay.length,
                    itemBuilder: (context, index) {
                      final task = _tasksForDay[index];
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addTask,
        label: const Text('Add Task'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}