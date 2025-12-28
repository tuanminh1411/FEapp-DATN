import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SP } from '../theme';

export default function Section({ title, rightText, children }: any) {
  return (
    <View style={{ marginTop: SP.xl }}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {rightText ? <Text style={styles.more}>{rightText}</Text> : null}
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  more: { color: COLORS.primary, fontWeight: '600' },
});
