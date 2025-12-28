import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SP } from '../theme';

type Props = {
  onMenu?: () => void;
};

export default function Header({ onMenu }: Props) {
  return (
    <View style={styles.wrap}>
      {/* Nút menu → gọi onMenu */}
      <TouchableOpacity
        onPress={onMenu}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Mở menu"
      >
        <Ionicons name="menu" size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* Logo tạm bằng chữ — bạn thay ảnh sau */}
      <Text style={styles.brand}>
        <Text style={{ fontWeight: '700' }}>QR</Text>Check
      </Text>

      {/* Nút thông báo (placeholder) */}
      <TouchableOpacity
        onPress={() => {}}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Thông báo"
      >
        <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 12,
    paddingHorizontal: SP.lg,
    paddingVertical: SP.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  brand: { fontSize: 22, fontWeight: '600', color: COLORS.text },
});
