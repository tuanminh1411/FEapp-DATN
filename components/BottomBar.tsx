// components/BottomBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

const BAR_H = 64;
const FAB = 64;

// Discriminated union giúp TS thu hẹp kiểu chính xác
type TabItem = {
  kind: 'tab';
  key: string;
  routeKey: 'index' | 'reviews' | 'history' | 'messages';
  label: string;
  icon: (c: string) => React.ReactNode;
  path: Href;
};
type SpacerItem = { kind: 'spacer'; key: 'spacer' };
type Item = TabItem | SpacerItem;

const ITEMS: Item[] = [
  {
    kind: 'tab',
    key: 'home',
    routeKey: 'index',
    label: 'Trang chủ',
    icon: (c) => <Ionicons name="home" size={24} color={c} />,
    path: '/(user)' as const,
  },
  {
    kind: 'tab',
    key: 'reviews',
    routeKey: 'reviews',
    label: 'Đánh giá',
    icon: (c) => <Ionicons name="star-outline" size={24} color={c} />,
    path: '/(user)/reviews' as const,
  },
  { kind: 'spacer', key: 'spacer' },
  {
    kind: 'tab',
    key: 'history',
    routeKey: 'history',
    label: 'Lịch sử',
    icon: (c) => <Ionicons name="time-outline" size={24} color={c} />,
    path: '/(user)/history' as const,
  },
  {
    kind: 'tab',
    key: 'messages',
    routeKey: 'messages',
    label: 'Tin nhắn',
    icon: (c) => <MaterialCommunityIcons name="message-outline" size={24} color={c} />,
    path: '/(user)/messages' as const,
  },
];

export default function BottomBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments(); // ví dụ: ['(user)','index'] | ['(tabs)','reviews'] ...

  const activeTab =
    segments[0] === '(user)' ? ((segments[1] as TabItem['routeKey']) ?? 'index') : 'index';

  return (
    <View style={[styles.wrap, { height: BAR_H + insets.bottom }]}>
      <View style={[styles.row, { height: BAR_H }]}>
        {ITEMS.map((item) => {
          if (item.kind === 'spacer') {
            return <View key={item.key} style={styles.item} />;
          }

          const focused = activeTab === item.routeKey;
          const color = focused ? COLORS.primary : '#9CA3AF';

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              activeOpacity={0.8}
              onPress={() => router.replace(item.path)}
            >
              {item.icon(color)}
              <Text
                style={[
                  styles.label,
                  { color, fontWeight: focused ? '700' : '400' },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Nút QR nổi giữa */}
      <TouchableOpacity
        onPress={() => router.push('/scan' as Href)}
        activeOpacity={0.9}
        style={[
          styles.fab,
          {
            left: '50%',
            transform: [{ translateX: -FAB / 2 }],
            bottom: insets.bottom + BAR_H / 2 - FAB / 2,
          },
        ]}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 12 },
  activeDot: {
    position: 'absolute',
    top: 4,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
  },
});
