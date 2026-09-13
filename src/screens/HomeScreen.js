import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';
import {formatDisplayDate, dateKeyFromDate, toDateFromTask} from '../utils/dateUtils';
import {loadTasks, saveTasks} from '../services/storageService';

const makeDemoTasks = () => {
  const today = dateKeyFromDate(new Date());
  return [
    {id: '1', title: 'Complete project documentation', date: today, time: '10:30', status: 'scheduled', reminderEnabled: true},
    {id: '2', title: 'Study React Native', date: today, time: '14:00', status: 'scheduled', reminderEnabled: true},
  ];
};

export default function HomeScreen({navigation}) {
  const [tasks, setTasks] = useState(makeDemoTasks());
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        const stored = await loadTasks();
        if (stored && stored.length > 0) {
          setTasks(stored);
        }
      } catch (error) {
        Alert.alert('Storage error', 'Unable to read saved tasks.');
      } finally {
        setHasLoaded(true);
      }
    };

    boot();
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    saveTasks(tasks).catch(() => Alert.alert('Storage error', 'Unable to save tasks.'));
  }, [tasks, hasLoaded]);

  const todayTasks = useMemo(() => {
    const todayKey = dateKeyFromDate(new Date());
    return tasks
      .filter((task) => task.date === todayKey)
      .sort((a, b) => toDateFromTask(a.date, a.time) - toDateFromTask(b.date, b.time));
  }, [tasks]);

  const handleAddTask = () => {
    const safeTitle = title.trim();
    if (!safeTitle) {
      Alert.alert('Please enter a task name.');
      return;
    }

    const newTask = {
      id: String(Date.now() + Math.random()),
      title: safeTitle,
      date: dateKeyFromDate(selectedDate),
      time: selectedTime.toTimeString().slice(0, 5),
      status: 'scheduled',
      reminderEnabled: true,
    };

    setTasks((current) => [...current, newTask]);
    setTitle('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const handleToggleTask = (taskId) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {...task, status: task.status === 'completed' ? 'scheduled' : 'completed'}
          : task,
      ),
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  const handleOpenEditor = (task) => {
    navigation.navigate('TaskEditor', {
      task,
      onTaskSaved: (updatedTask) => {
        setTasks((current) => {
          const exists = current.some((item) => item.id === updatedTask.id);
          if (exists) {
            return current.map((item) => (item.id === updatedTask.id ? updatedTask : item));
          }
          return [...current, updatedTask];
        });
      },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.logo}>DEV REMINDER</Text>
        <Pressable onPress={() => navigation.navigate('Calendar', {tasks, onTasksChange: setTasks})}>
          <Text style={styles.calendarButton}>Calendar</Text>
        </Pressable>
      </View>

      <Text style={styles.dateText}>{formatDisplayDate(new Date())}</Text>
      <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>

      <FlatList
        style={styles.list}
        data={todayTasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks scheduled for today.</Text>
            <Text style={styles.emptyInfo}>Plan your day and stay productive.</Text>
          </View>
        }
        renderItem={({item}) => (
          <Pressable onPress={() => handleOpenEditor(item)} style={styles.taskRow}>
            <Pressable onPress={() => handleToggleTask(item.id)} hitSlop={8}>
              <Text style={styles.checkbox}>{item.status === 'completed' ? '✓' : '○'}</Text>
            </Pressable>

            <View style={styles.taskBody}>
              <Text style={[styles.taskTitle, item.status === 'completed' && styles.completedText]}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>

            <Pressable onPress={() => handleDeleteTask(item.id)} hitSlop={8}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <View style={styles.formBox}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Task name"
          style={styles.input}
        />

        <View style={styles.rowButtons}>
          <Pressable style={styles.pillButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pillText}>Date</Text>
          </Pressable>
          <Pressable style={styles.pillButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.pillText}>Time</Text>
          </Pressable>
        </View>

        <Text style={styles.selectionText}>
          {dateKeyFromDate(selectedDate)} • {selectedTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
        </Text>

        <Pressable style={styles.primaryButton} onPress={handleAddTask}>
          <Text style={styles.primaryText}>Add Task</Text>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          onChange={(_, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 54,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.text,
  },
  calendarButton: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text,
  },
  list: {
    flexGrow: 0,
    maxHeight: 300,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  checkbox: {
    fontSize: 24,
    color: colors.text,
    marginRight: 8,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  taskTime: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyInfo: {
    color: colors.muted,
    fontSize: 14,
  },
  formBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pillButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    color: colors.text,
    fontWeight: '700',
  },
  selectionText: {
    color: colors.muted,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
