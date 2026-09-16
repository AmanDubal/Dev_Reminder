import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/notification_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen>
    with WidgetsBindingObserver {
  int _defaultSnooze = 10;
  bool _alarmSoundEnabled = true;
  Map<String, bool> _permissions = {};
  final List<int> _options = [5, 10, 15, 30, 60];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadSettings();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final service = NotificationService.instance;
    await service.refresh();
    final permissions = await service.permissions();
    if (!mounted) return;
    setState(() {
      _defaultSnooze = prefs.getInt('default_snooze') ?? 10;
      _alarmSoundEnabled = prefs.getBool('alarm_sound_enabled') ?? true;
      _permissions = permissions;
    });
  }

  Future<void> _updateSnooze(int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('default_snooze', value);
    if (mounted) setState(() => _defaultSnooze = value);
  }

  Future<void> _updateAlarmSound(bool value) async {
    await NotificationService.instance.setSoundEnabled(value);
    if (mounted) setState(() => _alarmSoundEnabled = value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(children: [
        if (NotificationService.instance.isAndroid) ...[
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Lock-screen reminders',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          for (final entry in const {
            'notifications': 'Allow notifications',
            'exact': 'Alarms & reminders',
            'fullScreen': 'Full-screen reminders',
            'channel': 'High-priority alarm notifications',
          }.entries)
            ListTile(
              title: Text(entry.value),
              subtitle: Text(_permissions[entry.key] == true
                  ? 'Enabled' : 'Tap to enable in Android settings'),
              trailing: Icon(_permissions[entry.key] == true
                  ? Icons.check_circle : Icons.settings_outlined),
              onTap: () => NotificationService.instance
                  .openPermissionSettings(entry.key),
            ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text('Reminders can wake a sleeping or locked phone. '
                'The phone must be powered on. Android may show a banner while '
                'you are using it. After force-stopping the app, reopen it to '
                'restore future reminders. Some phones also require allowing '
                'background activity in their battery settings.'),
          ),
          const Divider(),
        ],
        const Padding(
          padding: EdgeInsets.all(16),
          child: Text('Default snooze duration',
              style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        ..._options.map((minutes) => RadioListTile<int>(
              title: Text('$minutes minutes'),
              value: minutes,
              groupValue: _defaultSnooze,
              onChanged: (value) { if (value != null) _updateSnooze(value); },
            )),
        const Divider(),
        SwitchListTile(
          secondary: const Icon(Icons.volume_up_outlined),
          title: const Text('Alarm sound'),
          subtitle: Text(_alarmSoundEnabled
              ? 'Looping alarm • Uses your phone’s alarm volume' : 'Silent'),
          value: _alarmSoundEnabled,
          onChanged: _updateAlarmSound,
        ),
        const ListTile(
          title: Text('Power button mutes'),
          subtitle: Text('Turning the screen off silences the current alarm. '
              'It remains available to snooze or dismiss. '
              'Unanswered reminders are marked missed after 5 minutes.'),
        ),
        const Divider(),
        const ListTile(
          title: Text('About'),
          subtitle: Text('Dev Reminder — offline task alarms. '
              'Tasks stay on your device. Dismissing an alarm keeps the task.'),
        ),
      ]),
    );
  }
}
