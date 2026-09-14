import 'package:flutter/material.dart';
import '../models/task.dart';
import '../utils/date_utils.dart';
import '../constants/app_colors.dart';

class TaskTile extends StatelessWidget {
  final Task task;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final VoidCallback onToggleComplete;

  const TaskTile({
    super.key,
    required this.task,
    required this.onTap,
    required this.onDelete,
    required this.onToggleComplete,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = task.status == 'completed';
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: GestureDetector(
          onTap: onToggleComplete,
          child: Icon(
            isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
            color: isCompleted ? AppColors.success : Colors.grey,
          ),
        ),
        title: Text(
          task.title,
          style: TextStyle(
            decoration: isCompleted ? TextDecoration.lineThrough : null,
            color: isCompleted ? Colors.grey : AppColors.textDark,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(AppDateUtils.formatTime12h(task.time)),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.danger),
          onPressed: onDelete,
        ),
      ),
    );
  }
}