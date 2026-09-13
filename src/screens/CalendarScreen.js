import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import colors from '../constants/colors';
import {dateKeyFromDate} from '../utils/dateUtils';

const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getMonthGrid = (anchorDate) => {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

  const cells = [];
  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startDay + 1;
    const date = new Date(year, month, dayNumber);
    cells.push(date);
  }

  return cells;
};

export default function CalendarScreen({navigation, route}) {
  const tasks = route.params?.tasks || [];
  const onTasksChange = route.params?.onTasksChange || (() => {});
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'}).format(anchorDate),
    [anchorDate],
  );

  const monthGrid = useMemo(() => getMonthGrid(anchorDate), [anchorDate]);

  const selectedDateKey = dateKeyFromDate(selectedDate);
  const dateTasks = tasks.filter((task) => task.date === selectedDateKey);

  const handleTaskUpdate = (modifiedTask) => {
    onTasksChange((current) => {
      const exists = current.some((task) => task.id === modifiedTask.id);
      if (exists) {
        return current.map((task) => (task.id === modifiedTask.id ? modifiedTask : task));
      }
      return [...current, modifiedTask];
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1))}>
          <Text style={styles.navText}>Prev</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={() => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1))}>
          <Text style={styles.navText}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekdayNames.map((dayName) => (
          <Text key={dayName} style={styles.weekday}>{dayName}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthGrid.map((day, index) => {
          const isCurrentMonth = day.getMonth() === anchorDate.getMonth();
          const isSelected = dateKeyFromDate(day) === selectedDateKey;
          const hasTask = tasks.some((task) => task.date === dateKeyFromDate(day));

          return (
            <Pressable
              key={`${day.toISOString()}-${index}`}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.mutedDay,
                isSelected && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(day)}>
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day.getDate()}</Text>
              {hasTask && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectedHeaderRow}>
        <Text style={styles.selectedDateText}>{selectedDate.toDateString()}</Text>
        <Pressable
          style={styles.addTaskButton}
          onPress={() =>
            navigation.navigate('TaskEditor', {
              selectedDate: selectedDate,
              onTaskSaved: (newTask) => {
                handleTaskUpdate(newTask);
              },
            })
          }>
          <Text style={styles.addTaskText}>+ Add Task</Text>
        </Pressable>
      </View>

      <FlatList
        data={dateTasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks for this day.</Text>}
        renderItem={({item}) => (
          <View style={styles.taskItem}>
            <View style={styles.taskMeta}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('TaskEditor', {
                  task: item,
                  onTaskSaved: (updatedTask) => {
                    handleTaskUpdate(updatedTask);
                  },
                })
              }>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 6,
    position: 'relative',
  },
  mutedDay: {
    opacity: 0.4,
  },
  selectedDay: {
    backgroundColor: colors.accent,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  dayText: {
    color: colors.text,
    fontSize: 15,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    position: 'absolute',
    bottom: 6,
  },
  selectedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  addTaskButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addTaskText: {
    color: colors.accent,
    fontWeight: '700',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  taskMeta: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskTime: {
    color: colors.muted,
    fontSize: 12,
  },
  editText: {
    color: colors.accent,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    marginTop: 8,
  },
});
