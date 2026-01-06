// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, FlatList, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; // Import axios để gọi API tin tức
import { COLORS, RADIUS } from '../../theme';

import Header from '../../components/Header';
import Section from '../../components/Section';
import ProductCard from '../../components/ProductCard';
import GreetingQuickCard from '../../components/GreetingQuickCard';
import ShortcutRow from '../../components/ShortcutRow';
import MenuSheet from '../../components/MenuSheet';

// Chatbot
import ChatFab from '../../components/ChatFab';
import ChatbotSheet from '../../components/ChatbotSheet';

// API & Types
import { Product, ProductApi } from '../../lib/product.api';

// --- CẤU HÌNH API TIN TỨC ---
const LAN_IP = '192.168.1.160:5081'; // Thay bằng IP máy bạn
const BASE = Platform.OS === 'android' ? `http://${LAN_IP}` : 'http://localhost:5081';

type NewsItem = {
  id: string;
  tieuDe: string;
  hinhAnhUrl?: string;
  createdAt: string;
};

export default function Home() {
  const router = useRouter();
  
  // State quản lý UI
  const [openMenu, setOpenMenu] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  // State dữ liệu
  const [products, setProducts] = useState<Product[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]); // State tin tức
  
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  // Gọi API khi vào màn hình
  useEffect(() => {
    fetchProducts();
    fetchNews();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await ProductApi.getAll();
      setProducts(res.data.data);
    } catch (error) {
      console.log('Lỗi tải sản phẩm:', error);
    } finally {
      setLoadingProduct(false);
    }
  };

  // Hàm gọi API Tin tức
  const fetchNews = async () => {
    try {
      const url = `${BASE}/api/Trangchu/tin_tuc_trang_chu`;
      console.log('Fetching Home News:', url);
      const res = await axios.get(url);
      setNewsList(res.data || []);
    } catch (error) {
      console.log('Lỗi tải tin tức:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  // Render item tin tức (Card ngang)
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={styles.newsCard}
      onPress={() => router.push(`/news/${item.id}` as any)}
    >
      <Image 
        source={item.hinhAnhUrl ? { uri: item.hinhAnhUrl } : { uri: 'https://via.placeholder.com/300x150' }} 
        style={styles.newsImage} 
        resizeMode="cover"
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.tieuDe}</Text>
        {/* Nếu muốn hiển thị ngày tháng */}
        {/* <Text style={styles.newsDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text> */}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        <Header onMenu={() => setOpenMenu(true)} />

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.subtext} />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.fakeInput}
            onPress={() => router.push('/search')}
          >
            <Text style={{ color: COLORS.subtext }}>Tìm sản phẩm, mã vạch, QR...</Text>
          </TouchableOpacity>
          <Ionicons name="barcode-outline" size={20} color={COLORS.subtext} />
        </View>

        {/* Thẻ chào + hành động nhanh */}
        <GreetingQuickCard />
        <ShortcutRow />

        {/* --- PHẦN MỚI: TIN HAY NGÀY MỚI --- */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tin hay ngày mới</Text>
            <TouchableOpacity onPress={() => router.push('/news' as any)}> 
               {/* Điều hướng sang trang news.tsx (Danh sách đầy đủ) */}
              <Text style={styles.sectionAction}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
          
          {loadingNews ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={newsList}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderNewsItem}
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 10 }}
              ListEmptyComponent={<Text style={{ marginLeft: 18, color: '#999' }}>Chưa có tin tức mới</Text>}
            />
          )}
        </View>
        {/* ---------------------------------- */}

        {/* Grid sản phẩm */}
        <Section title="Sản phẩm nổi bật" rightText="Xem thêm">
          {loadingProduct ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.grid}>
              {products.length > 0 ? (
                products.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    item={p} 
                    onPress={() => router.push(`/product/${p.id}` as any)} 
                  />
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: '#999', width: '100%', marginTop: 20 }}>
                  Chưa có sản phẩm nào
                </Text>
              )}
            </View>
          )}
        </Section>
      </ScrollView>

      {/* Menu Sheet */}
      <MenuSheet open={openMenu} onClose={() => setOpenMenu(false)} />

      {/* Chatbot */}
      <ChatFab onPress={() => setOpenChat(true)} />
      <ChatbotSheet open={openChat} onClose={() => setOpenChat(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: RADIUS.lg,
  },
  fakeInput: { flex: 1, height: 44, justifyContent: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    gap: 12,
  },
  
  // Style cho phần Tin tức
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary, // Màu xanh giống ảnh
  },
  sectionAction: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  newsCard: {
    width: 240, // Chiều rộng cố định cho card ngang
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12, // Khoảng cách giữa các card
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2, // Bóng đổ Android
    shadowColor: '#000', // Bóng đổ iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newsImage: {
    width: '100%',
    height: 130, // Chiều cao ảnh
  },
  newsContent: {
    padding: 10,
  },
  newsTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  newsDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  }
});