import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  int _defaultSnooze = 10;
  bool _alarmSoundEnabled = true;
  final List<int> _options = [5, 10, 15, 30, 60];

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _defaultSnooze = prefs.getInt('default_snooze') ?? 10;
      _alarmSoundEnabled = prefs.getBool('alarm_sound_enabled') ?? true;
    });
  }

  Future<void> _updateSnooze(int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('default_snooze', value);
    setState(() => _defaultSnooze = value);
  }

  Future<void> _updateAlarmSound(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('alarm_sound_enabled', value);
    if (mounted) setState(() => _alarmSoundEnabled = value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Default Snooze Duration', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          ..._options.map((minutes) => RadioListTile<int>(
                title: Text('$minutes minutes'),
                value: minutes,
                groupValue: _defaultSnooze,
                onChanged: (value) => _updateSnooze(value!),
              )),
          const Divider(),
          SwitchListTile(
            secondary: const Icon(Icons.volume_up_outlined),
            title: const Text('Alarm sound'),
            subtitle: Text(_alarmSoundEnabled ? 'Default notification sound' : 'Silent'),
            value: _alarmSoundEnabled,
            onChanged: _updateAlarmSound,
          ),
          const Divider(),
          const ListTile(
            title: Text('About'),
            subtitle: Text(
              'Dev Reminder — a simple offline task alarm.\n'
              'All data is stored locally on your device using SQLite. '
              'No internet connection is required and no account is needed.',
            ),
          ),
        ],
      ),
    );
  }
}