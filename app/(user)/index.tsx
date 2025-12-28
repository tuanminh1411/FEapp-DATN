// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function Home() {
  const router = useRouter();
  
  // State quản lý UI
  const [openMenu, setOpenMenu] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  // State quản lý dữ liệu sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API khi vào màn hình
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await ProductApi.getAll();
      setProducts(res.data);
    } catch (error) {
      console.log('Lỗi tải sản phẩm:', error);
      // Có thể hiển thị toast lỗi nếu cần
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        <Header onMenu={() => setOpenMenu(true)} />

        {/* Search (chuyển sang màn search khi bấm) */}
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

        {/* Grid sản phẩm */}
        <Section title="Sản phẩm có 'Hộ Chiếu Sản Phẩm'" rightText="Xem thêm">
          {loading ? (
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
});