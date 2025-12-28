import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, TextInput, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { COLORS, RADIUS, SP } from '../theme';

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  cover?: string;
  tag: string;
  time: string; // ví dụ: '2 giờ trước'
};

const mockData: NewsItem[] = [
  {
    id: '1',
    title: 'Bộ Công Thương tăng cường kiểm soát tem chống giả cho hàng tiêu dùng',
    excerpt: 'Các doanh nghiệp khuyến nghị sử dụng QR để minh bạch nguồn gốc…',
    cover: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop',
    tag: 'Chính sách',
    time: '2 giờ trước',
  },
  {
    id: '2',
    title: '5 lợi ích khi dán QR cho từng lô hàng nông sản',
    excerpt: 'Giảm rủi ro giả mạo, truy xuất nhanh, tăng niềm tin người mua…',
    cover: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
    tag: 'Gợi ý',
    time: 'Hôm nay',
  },
  {
    id: '3',
    title: 'Case study: Xưởng cà phê áp dụng QR và tăng 23% doanh thu',
    excerpt: 'Tối ưu chuỗi cung ứng và theo dõi hạn sử dụng theo lô…',
    cover: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop',
    tag: 'Câu chuyện',
    time: 'Hôm qua',
  },
];

export default function NewsScreen() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);

  const tags = useMemo(() => ['Tất cả', 'Chính sách', 'Gợi ý', 'Câu chuyện'], []);
  const data = useMemo(() => {
    const list = active === 'Tất cả' ? mockData : mockData.filter(x => x.tag === active);
    if (!q.trim()) return list;
    const k = q.toLowerCase();
    return list.filter(x => x.title.toLowerCase().includes(k) || x.excerpt.toLowerCase().includes(k));
  }, [q, active]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      {!!item.cover && <Image source={{ uri: item.cover }} style={styles.cover} />}
      <View style={{ padding: 12 }}>
        <View style={styles.row}>
          <Text style={styles.tag}>{item.tag}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.excerpt}>{item.excerpt}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      {/* search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.subtext} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Tìm tin tức…"
          placeholderTextColor={COLORS.subtext}
          style={styles.searchInput}
        />
      </View>

      {/* chips */}
      <View style={styles.chips}>
        {tags.map(t => {
          const activeChip = active === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.chip, activeChip && { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary }]}
              onPress={() => setActive(t)}
              activeOpacity={0.9}
            >
              <Text style={[styles.chipText, activeChip && { color: COLORS.primary, fontWeight: '700' }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, color: COLORS.text },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14, height: 36, borderRadius: 18,
    backgroundColor: '#F6F7FB', borderWidth: 1, borderColor: '#ECEFF3',
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: { color: COLORS.text },

  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: '#EAEAEA',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cover: { width: '100%', height: 160 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tag: { color: COLORS.primary, fontWeight: '700' },
  time: { color: COLORS.subtext },
  title: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  excerpt: { color: COLORS.subtext, marginTop: 6 },
});
