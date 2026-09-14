import 'package:flutter/material.dart';

import '../db/database_helper.dart';
import '../models/task.dart';
import '../services/notification_service.dart';
import '../utils/date_utils.dart';

class AlarmScreen extends StatefulWidget {
  final Task task;

  const AlarmScreen({super.key, required this.task});

  @override
  State<AlarmScreen> createState() => _AlarmScreenState();
}

class _AlarmScreenState extends State<AlarmScreen> {
  double _dragOffset = 0;
  bool _busy = false;

  Future<void> _snooze() async {
    if (_busy) return;
    setState(() => _busy = true);
    final updated = widget.task.copyWith(
      status: 'snoozed',
      updatedAt: DateTime.now().toIso8601String(),
    );
    await DatabaseHelper.instance.updateTask(updated);
    await NotificationService.instance
        .snoozeNotification(updated, updated.snoozeDuration);
    if (mounted) Navigator.pop(context);
  }

  Future<void> _turnOff() async {
    if (_busy) return;
    setState(() => _busy = true);
    await DatabaseHelper.instance.deleteTask(widget.task.id);
    await NotificationService.instance
        .cancelNotification(widget.task.notificationId);
    if (mounted) Navigator.pop(context);
  }

  void _onDragEnd() {
    if (_dragOffset < -110) {
      _snooze();
    } else if (_dragOffset > 110) {
      _turnOff();
    } else {
      setState(() => _dragOffset = 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = (_dragOffset.abs() / 110).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: const Color(0xFF252D91),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Column(
            children: [
              const Spacer(),
              const Text(
                'Alarm',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.task.title,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                AppDateUtils.formatTime12h(widget.task.time),
                style: theme.textTheme.displaySmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
              const Spacer(),
              SizedBox(
                height: 128,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _ActionHint(
                          icon: Icons.snooze,
                          label: 'Snooze',
                          color: Colors.white.withOpacity(0.8),
                        ),
                        _ActionHint(
                          icon: Icons.notifications_off_outlined,
                          label: 'Turn off',
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ],
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 120),
                      transform: Matrix4.translationValues(_dragOffset, 0, 0),
                      child: GestureDetector(
                        onHorizontalDragUpdate: (details) {
                          setState(() => _dragOffset += details.delta.dx);
                        },
                        onHorizontalDragEnd: (_) => _onDragEnd(),
                        child: Container(
                          width: 92,
                          height: 92,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.18),
                                blurRadius: 16,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.alarm,
                            size: 48,
                            color: Color.lerp(
                              const Color(0xFF252D91),
                              Colors.deepOrange,
                              progress,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Slide left to snooze  •  Slide right to turn off',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionHint extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ActionHint({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(height: 6),
        Text(label, style: TextStyle(color: color)),
      ],
    );
  }
}
