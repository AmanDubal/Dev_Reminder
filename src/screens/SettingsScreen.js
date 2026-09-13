import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '../constants/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.text}>Notifications</Text>
      <Text style={styles.text}>Default snooze: 10 minutes</Text>
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text,
  },
  text: {
    color: colors.muted,
    marginBottom: 8,
    fontSize: 16,
  },
});
