import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, TextInput, Image, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Header from '../../components/Header'; 
import { COLORS, RADIUS } from '../../theme'; 

// Config API
const LAN_IP = '192.168.1.160:5081'; // Thay bằng IP máy bạn
const BASE = Platform.OS === 'android' ? `http://${LAN_IP}` : 'http://localhost:5081';

// Kiểu dữ liệu trả về từ API List
type NewsItemAPI = {
  id: string;
  tieuDe: string;
  tomTat: string;
  hinhAnhUrl?: string;
  createdAt: string;
};

export default function NewsScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState('Tất cả');
  
  // State API
  const [items, setItems] = useState<NewsItemAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Danh sách Tag (Hardcode vì API không trả về category)
  const tags = useMemo(() => ['Tất cả', 'Chính sách', 'Doanh nghiệp'], []);

  // 1. GỌI API LẤY DANH SÁCH TIN TỨC
  const fetchNews = async () => {
    try {
      setLoading(true);
      const url = `${BASE}/api/Trangchu/tin_tuc_trang_chu`;
      console.log('Fetching news list:', url);
      
      const res = await axios.get(url);
      // API trả về mảng trực tiếp [{}, {}]
      setItems(res.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh sách tin tức:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, []);

  // 2. LỌC DỮ LIỆU LOCAL (Search + Filter)
  const filteredData = useMemo(() => {
    let result = items;

    // Lọc theo từ khóa tìm kiếm
    if (q.trim()) {
      const k = q.toLowerCase();
      result = result.filter(x => 
        (x.tieuDe || '').toLowerCase().includes(k) || 
        (x.tomTat || '').toLowerCase().includes(k)
      );
    }

    // Lọc theo tag (Vì API không có tag, nên ở đây logic đang để tượng trưng. 
    // Nếu bạn muốn lọc thật thì cần thêm trường category vào API)
    if (active !== 'Tất cả') {
       // Code demo: nếu chọn tag khác 'Tất cả' thì tạm thời trả về rỗng hoặc logic tùy ý
       // result = result.filter(...) 
    }

    return result;
  }, [q, active, items]);

  // Format thời gian hiển thị (VD: 2 giờ trước, hoặc ngày tháng)
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  };

  const renderItem = ({ item }: { item: NewsItemAPI }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      // 3. CHUYỂN HƯỚNG SANG TRANG CHI TIẾT
      onPress={() => router.push(`../news/${item.id}`)}
    >
      {item.hinhAnhUrl ? (
         <Image source={{ uri: item.hinhAnhUrl }} style={styles.cover} />
      ) : (
         // Ảnh placeholder nếu không có ảnh
         <View style={[styles.cover, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="newspaper-outline" size={40} color="#ccc" />
         </View>
      )}
      
      <View style={{ padding: 12 }}>
        <View style={styles.row}>
          {/* Tag giả định */}
          <Text style={styles.tag}>Tin tức</Text> 
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.tieuDe}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>{item.tomTat}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.subtext || '#888'} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Tìm tin tức..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {/* Chips Filter */}
      <View style={styles.chips}>
        {tags.map(t => {
          const activeChip = active === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.chip, activeChip && { backgroundColor: (COLORS.primary || '#007AFF') + '20', borderColor: COLORS.primary || '#007AFF' }]}
              onPress={() => setActive(t)}
              activeOpacity={0.9}
            >
              <Text style={[styles.chipText, activeChip && { color: COLORS.primary || '#007AFF', fontWeight: '700' }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List Data */}
      {loading ? (
        <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
            data={filteredData}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ color: '#888' }}>Không có tin tức nào.</Text>
                </View>
            }
        />
      )}
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
  searchInput: { flex: 1, color: '#333' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14, height: 36, borderRadius: 18,
    backgroundColor: '#F6F7FB', borderWidth: 1, borderColor: '#ECEFF3',
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: { color: '#333' },

  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg || 12,
    borderWidth: 1, borderColor: '#EAEAEA',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cover: { width: '100%', height: 160, resizeMode: 'cover' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tag: { color: COLORS.primary || '#007AFF', fontWeight: '700', fontSize: 12 },
  time: { color: '#888', fontSize: 12 },
  title: { color: '#111', fontWeight: '800', fontSize: 16, marginBottom: 4 },
  excerpt: { color: '#666', marginTop: 2, fontSize: 14 },
});