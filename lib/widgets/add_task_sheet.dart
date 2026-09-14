import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/task.dart';

class AddEditTaskSheet extends StatefulWidget {
  final String date; // YYYY-MM-DD
  final Task? existingTask;

  const AddEditTaskSheet({super.key, required this.date, this.existingTask});

  @override
  State<AddEditTaskSheet> createState() => _AddEditTaskSheetState();
}

class _AddEditTaskSheetState extends State<AddEditTaskSheet> {
  final TextEditingController _titleController = TextEditingController();
  TimeOfDay? _selectedTime;
  bool _reminderEnabled = true;
  String? _errorText;
  int _defaultSnooze = 10;

  @override
  void initState() {
    super.initState();
    _loadDefaultSnooze();
    if (widget.existingTask != null) {
      _titleController.text = widget.existingTask!.title;
      final parts = widget.existingTask!.time.split(':');
      _selectedTime =
          TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
      _reminderEnabled = widget.existingTask!.reminderEnabled;
    }
  }

  Future<void> _loadDefaultSnooze() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => _defaultSnooze = prefs.getInt('default_snooze') ?? 10);
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? TimeOfDay.now(),
    );
    if (time != null) setState(() => _selectedTime = time);
  }

  void _save() {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _errorText = 'Please enter a task name.');
      return;
    }
    if (_selectedTime == null) {
      setState(() => _errorText = 'Please select a time.');
      return;
    }

    final now = DateTime.now();
    final todayStr =
        '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    if (widget.date == todayStr && widget.existingTask == null) {
      final selectedDateTime = DateTime(
          now.year, now.month, now.day, _selectedTime!.hour, _selectedTime!.minute);
      if (selectedDateTime.isBefore(now)) {
        setState(() =>
            _errorText = 'This time has already passed today. Choose a future time.');
        return;
      }
    }

    final timeStr =
        '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';
    final nowIso = DateTime.now().toIso8601String();

    final task = Task(
      id: widget.existingTask?.id ?? const Uuid().v4(),
      title: title,
      date: widget.date,
      time: timeStr,
      status: widget.existingTask?.status ?? 'scheduled',
      reminderEnabled: _reminderEnabled,
      snoozeDuration: widget.existingTask?.snoozeDuration ?? _defaultSnooze,
      notificationId: widget.existingTask?.notificationId ??
          DateTime.now().millisecondsSinceEpoch.remainder(1000000000),
      createdAt: widget.existingTask?.createdAt ?? nowIso,
      updatedAt: nowIso,
    );

    Navigator.pop(context, task);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(widget.existingTask == null ? 'Add Task' : 'Edit Task',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(
                labelText: 'Task Name', border: OutlineInputBorder()),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 16),
          InkWell(
            onTap: _pickTime,
            child: InputDecorator(
              decoration:
                  const InputDecoration(labelText: 'Time', border: OutlineInputBorder()),
              child:
                  Text(_selectedTime == null ? 'Select time' : _selectedTime!.format(context)),
            ),
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Reminder'),
            value: _reminderEnabled,
            onChanged: (v) => setState(() => _reminderEnabled = v),
          ),
          if (_errorText != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_errorText!, style: const TextStyle(color: Colors.red)),
            ),
          ElevatedButton(onPressed: _save, child: const Text('Save Task')),
        ],
      ),
    );
  }
}