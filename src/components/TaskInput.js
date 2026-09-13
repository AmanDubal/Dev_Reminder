import React from 'react';
import {Button, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';

export default function TaskInput({
  title,
  setTitle,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  onSave,
}) {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Task name"
        style={styles.input}
      />

      <View style={styles.rowButtons}>
        <Button title="Date" onPress={() => setShowDatePicker(true)} />
        <Button title="Time" onPress={() => setShowTimePicker(true)} />
      </View>

      <Text style={styles.selectionText}>
        {selectedDate.toISOString().slice(0, 10)} • {selectedTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
      </Text>

      <Button title="Add Task" onPress={onSave} />

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
  container: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  selectionText: {
    color: '#374151',
    marginBottom: 12,
  },
});
