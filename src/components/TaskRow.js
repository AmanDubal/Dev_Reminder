import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import colors from '../constants/colors';

export default function TaskRow({task, onToggleComplete, onDelete}) {
  return (
    <View style={styles.taskRow}>
      <Pressable onPress={() => onToggleComplete(task.id)} style={styles.checkboxWrap}>
        <Text style={styles.checkbox}>{task.status === 'completed' ? '✓' : '○'}</Text>
      </Pressable>

      <View style={styles.taskTextWrap}>
        <Text style={[styles.taskTitle, task.status === 'completed' && styles.completedText]}>
          {task.title}
        </Text>
        <Text style={styles.taskTime}>{task.time}</Text>
      </View>

      <Pressable onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  checkboxWrap: {
    width: 28,
    alignItems: 'center',
  },
  checkbox: {
    fontSize: 24,
    color: colors.text,
  },
  taskTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  taskTitle: {
    fontSize: 16,
    color: colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  taskTime: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  deleteButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
