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
  Image,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import axios from 'axios';
import { COLORS } from '../theme';

// --- CẤU HÌNH API ---
// Lưu ý: Đổi IP này thành IP máy tính chạy backend của bạn
const LAN_IP = '192.168.1.160:5081'; 
const BASE = Platform.OS === 'android' ? `http://${LAN_IP}` : 'http://localhost:5081';

// --- KIỂU DỮ LIỆU ---
// Cập nhật chính xác theo hình ảnh JSON bạn gửi
type SearchProduct = {
  id: string;            // Ví dụ: "98670e2f..."
  tenSanPham: string;    // Ví dụ: "bột gừng khô"
  gia: number;           // Ví dụ: 7300000
  soLuong: number;       // Ví dụ: 34
  hinhAnhUrl: string;    // Link ảnh Firebase
  tenDoanhNghiep: string;// Ví dụ: "Công ty TNHH Thành Hưng"
};

const POPULAR = [
  'mỹ phẩm', 'sữa rửa mặt', 'kem dưỡng da', 'đồ gia dụng',
  'quần áo', 'Nước giải khát', 'son',
];

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  // State
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Hàm format tiền tệ VNĐ (Ví dụ: 7.300.000đ)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // --- GỌI API TÌM KIẾM ---
  const performSearch = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true); 

    try {
      const url = `${BASE}/api/Trangchu/tim-kiem`;
      console.log('Searching:', url, 'keyword:', keyword);
      
      const res = await axios.get(url, {
        params: { keyword: keyword }
      });
      
      // Gán dữ liệu trả về vào state
      setResults(res.data || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onPick = (kw: string) => {
    setQ(kw);
    performSearch(kw);
  };

  // Render từng sản phẩm (Giống thiết kế ảnh mẫu)
  const renderProductItem = ({ item }: { item: SearchProduct }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item.id}` as any)}
    >
      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
         <Image 
            source={item.hinhAnhUrl ? { uri: item.hinhAnhUrl } : { uri: 'https://via.placeholder.com/150' }} 
            style={styles.productImage} 
            resizeMode="cover"
        />
      </View>
      
      {/* Thông tin chi tiết */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.tenSanPham?.toUpperCase() || 'TÊN SẢN PHẨM'}
        </Text>
        
        <Text style={styles.productPrice}>{formatCurrency(item.gia)}</Text>
        
        <View style={styles.originRow}>
            {/* Icon Verified màu đỏ/vàng như trong ảnh mẫu */}
            <MaterialIcons name="verified" size={14} color="#D32F2F" style={{ marginRight: 4 }} />
            <Text style={styles.originText} numberOfLines={1}>
                {item.tenDoanhNghiep || 'Việt Nam'}
            </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER SEARCH --- */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={q}
            onChangeText={setQ}
            autoFocus={!hasSearched}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(q)}
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => { setQ(''); setHasSearched(false); inputRef.current?.focus(); }}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.cancel}>Hủy</Text>
        </TouchableOpacity>
      </View>

      {/* --- NỘI DUNG --- */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: '#888' }}>Đang tìm kiếm...</Text>
        </View>
      ) : !hasSearched ? (
        // === MÀN HÌNH GỢI Ý ===
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
          </View>
          <View style={styles.tagWrap}>
             {POPULAR.map((item, index) => (
                <TouchableOpacity key={index} style={styles.chip} onPress={() => onPick(item)}>
                  <Text style={styles.chipTxt}>{item}</Text>
                </TouchableOpacity>
             ))}
          </View>
        </ScrollView>
      ) : (
        // === MÀN HÌNH KẾT QUẢ ===
        <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
            <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Sản phẩm ({results.length})</Text>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderProductItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Ionicons name="search-outline" size={60} color="#ddd" />
                        <Text style={{ color: '#888', marginTop: 10 }}>Không tìm thấy sản phẩm nào</Text>
                    </View>
                }
                // Footer: Nút Xem thêm màu xanh
                ListFooterComponent={
                    results.length > 0 ? (
                        <TouchableOpacity style={styles.viewMoreBtn}>
                            <Text style={styles.viewMoreText}>Xem thêm</Text>
                            <Ionicons name="chevron-forward" size={16} color="#22C55E" />
                        </TouchableOpacity>
                    ) : null
                }
            />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Header
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  searchBox: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, color: '#111827', fontSize: 16, paddingVertical: 0, height: '100%' },
  cancel: { marginLeft: 12, color: '#333', fontSize: 16 },

  // Gợi ý
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 15 },
  sectionTitle: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F3F4F6', borderRadius: 20,
  },
  chipTxt: { color: '#333', fontSize: 14 },

  // Kết quả List
  resultHeader: { padding: 16, backgroundColor: '#fff', marginBottom: 1 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#22C55E' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

  // CARD SẢN PHẨM
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 1, // Khoảng trắng nhỏ giữa các item
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: { 
    width: 90, 
    height: 90, 
  },
  productInfo: { 
    flex: 1, 
    marginLeft: 12, 
    justifyContent: 'flex-start' 
  },
  productName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333', 
    lineHeight: 20,
    marginBottom: 4 
  },
  productPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#12cbe3ff', 
    marginBottom: 6 
  },
  originRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  originText: { 
    fontSize: 12, 
    color: '#666', 
    maxWidth: '90%'
  },
  
  // Nút xem thêm
  viewMoreBtn: {
      backgroundColor: '#fff',
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 1
  },
  viewMoreText: {
      color: '#22C55E',
      fontWeight: '600',
      marginRight: 4
  }
});