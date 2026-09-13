import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '../constants/colors';

export default function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No tasks scheduled for today.</Text>
      <Text style={styles.emptySubtext}>Plan your day and stay productive.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    color: colors.muted,
    fontSize: 14,
  },
});
