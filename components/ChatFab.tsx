import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function ChatFab({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.9}>
      <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', right: 16, bottom: 125,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
});
