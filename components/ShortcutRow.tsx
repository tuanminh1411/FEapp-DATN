// components/ShortcutRow.tsx
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function ShortcutRow() {
  const data = ['Tạo mã QR miễn phí', 'Trang cá nhân', 'Tất cả'];
  return (
    <View style={styles.row}>
      {data.map((t) => (
        <View key={t} style={styles.item}>
          <View style={styles.circle} />
          <Text style={styles.label} numberOfLines={2}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: 18, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  item: { width: '24%', alignItems: 'center' },
  circle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primarySoft, opacity: 0.6, marginBottom: 6 },
  label: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});
