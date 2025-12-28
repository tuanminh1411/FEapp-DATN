import { useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function FABScan() {
  const router = useRouter();
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/scan')} style={styles.fab} activeOpacity={0.9}>
        <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center' },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 8 },
});
