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
  double _travel = 100;
  bool _busy = false;

  Future<void> _snooze() async {
    if (_busy) return;
    setState(() => _busy = true);
    final updated = widget.task.copyWith(
      status: 'snoozed',
      date: AppDateUtils.formatDateKey(DateTime.now().add(Duration(minutes: widget.task.snoozeDuration))),
      time: () {
        final at = DateTime.now().add(Duration(minutes: widget.task.snoozeDuration));
        return '${at.hour.toString().padLeft(2, '0')}:${at.minute.toString().padLeft(2, '0')}';
      }(),
      updatedAt: DateTime.now().toIso8601String(),
    );
    await DatabaseHelper.instance.updateTask(updated);
    await NotificationService.instance
        .cancelNotification(widget.task.notificationId);
    await NotificationService.instance
        .snoozeNotification(updated, updated.snoozeDuration);
    if (mounted) Navigator.pop(context);
  }

  Future<void> _turnOff() async {
    if (_busy) return;
    setState(() => _busy = true);
    await DatabaseHelper.instance.updateTask(widget.task.copyWith(
      status: 'dismissed', updatedAt: DateTime.now().toIso8601String(),
    ));
    await NotificationService.instance
        .cancelNotification(widget.task.notificationId);
    if (mounted) Navigator.pop(context);
  }

  void _onDragEnd() {
    if (_dragOffset < -_travel * .72) {
      _snooze();
    } else if (_dragOffset > _travel * .72) {
      _turnOff();
    } else {
      setState(() => _dragOffset = 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    _travel = ((MediaQuery.of(context).size.width - 56 - 64) / 2).clamp(32.0, 160.0);
    final progress = (_dragOffset.abs() / _travel).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: const Color(0xFF1E2159),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Column(
            children: [
              const Spacer(),
              const Text(
                'Time for your task',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                AppDateUtils.formatTime12h(widget.task.time),
                textAlign: TextAlign.center,
                style: theme.textTheme.displaySmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                widget.task.title,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              SizedBox(
                height: 240,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 210, height: 210,
                      decoration: const BoxDecoration(
                        color: Color(0xFF33366A), shape: BoxShape.circle,
                      ),
                    ),
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
                          label: 'Dismiss',
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ],
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 120),
                      transform: Matrix4.translationValues(_dragOffset, 0, 0),
                      child: GestureDetector(
                        onHorizontalDragUpdate: (details) {
                          if (_busy) return;
                          setState(() => _dragOffset = (_dragOffset + details.delta.dx).clamp(-_travel, _travel));
                        },
                        onHorizontalDragCancel: () => setState(() => _dragOffset = 0),
                        onHorizontalDragEnd: (_) => _onDragEnd(),
                        child: Container(
                          width: 60,
                          height: 60,
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
                            size: 30,
                            color: Color.lerp(
                              const Color(0xFF1E2159),
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
                'Slide left to snooze  •  Slide right to dismiss',
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
