// app/search.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from '../theme';

const POPULAR = [
  'mỹ phẩm', 'mỹ phẫm', 'kem dưỡng da', 'đồ gia dụng',
  'quần áo', 'Nước giải khát', 'son',
];

export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const inputRef = useRef<TextInput>(null);

  const onPick = (kw: string) => {
    setQ(kw);
    // TODO: thực hiện search theo kw
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Thanh search + nút Hủy */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.subtext} />
          <TextInput
            ref={inputRef}
            placeholder="Tìm kiếm..."
            placeholderTextColor={COLORS.subtext}
            style={styles.input}
            value={q}
            onChangeText={setQ}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.cancel}>Hủy</Text>
        </TouchableOpacity>
      </View>

      {/* Khối “Tìm kiếm phổ biến” */}
      <View style={styles.sectionHeader}>
        <Ionicons name="chevron-down-circle-outline" size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
      </View>

      <FlatList
        data={POPULAR}
        keyExtractor={(s, i) => s + i}
        contentContainerStyle={styles.tagWrap}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chip} onPress={() => onPick(item)}>
            <Text style={styles.chipTxt}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
    backgroundColor: '#fff',
  },
  searchBox: {
    marginTop:30,
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, color: COLORS.text, paddingVertical: 0 },
  cancel: { marginTop: 30, marginLeft: 12, color: '#EF4444', fontWeight: '700', fontSize: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  sectionTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  tagWrap: { paddingHorizontal: 16, rowGap: 12, columnGap: 12, paddingBottom: 24 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginRight: 12, marginBottom: 12,
  },
  chipTxt: { color: COLORS.text },
});
