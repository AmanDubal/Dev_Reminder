import React, {useMemo, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';
import {dateKeyFromDate} from '../utils/dateUtils';

export default function TaskEditorScreen({navigation, route}) {
  const existingTask = route.params?.task || null;
  const selectedDateSeed = route.params?.selectedDate || new Date();
  const onTaskSaved = route.params?.onTaskSaved || (() => {});

  const [title, setTitle] = useState(existingTask?.title || '');
  const [date, setDate] = useState(
    existingTask ? new Date(`${existingTask.date}T12:00:00`) : selectedDateSeed,
  );
  const [time, setTime] = useState(
    existingTask
      ? new Date(`2000-01-01T${existingTask.time}:00`)
      : new Date(`2000-01-01T09:00:00`),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(existingTask?.reminderEnabled ?? true);

  const subtitle = useMemo(
    () =>
      existingTask
        ? 'Update task details and save changes.'
        : 'Create a reminder for your day or a future date.',
    [existingTask],
  );

  const saveTask = () => {
    const safeTitle = title.trim();
    if (!safeTitle) {
      Alert.alert('Please enter a task name.');
      return;
    }

    const savedTask = {
      id: existingTask?.id || String(Date.now() + Math.random()),
      title: safeTitle,
      date: dateKeyFromDate(date),
      time: time.toTimeString().slice(0, 5),
      status: existingTask?.status || 'scheduled',
      reminderEnabled,
    };

    onTaskSaved(savedTask);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{existingTask ? 'Edit task' : 'Add task'}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Text style={styles.label}>Task name</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Finish project" />

      <View style={styles.row}>
        <Pressable style={styles.optionButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.optionLabel}>Date</Text>
          <Text style={styles.optionValue}>{dateKeyFromDate(date)}</Text>
        </Pressable>

        <Pressable style={styles.optionButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.optionLabel}>Time</Text>
          <Text style={styles.optionValue}>{time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
        </Pressable>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Reminder enabled</Text>
        <Pressable
          onPress={() => setReminderEnabled((value) => !value)}
          style={[styles.toggle, reminderEnabled && styles.toggleActive]}>
          <View style={[styles.toggleThumb, reminderEnabled && styles.toggleThumbActive]} />
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={saveTask}>
        <Text style={styles.primaryText}>Save Task</Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(_, nextDate) => {
            setShowDatePicker(false);
            if (nextDate) setDate(nextDate);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          onChange={(_, nextTime) => {
            setShowTimePicker(false);
            if (nextTime) setTime(nextTime);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 18,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 15,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },
  optionLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  optionValue: {
    color: colors.text,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    marginLeft: 0,
  },
  toggleThumbActive: {
    marginLeft: 22,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
