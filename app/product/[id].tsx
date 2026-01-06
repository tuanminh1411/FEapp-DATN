// app/product/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { Product, ProductApi } from '../../lib/product.api';
import ProductDetailBody from '../../components/ProductDetailBody'; // <-- Import file vừa tạo

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail(String(id));
  }, [id]);

  const fetchDetail = async (productId: string) => {
    try {
      const res = await ProductApi.getDetail(productId);
      setProduct(res.data);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  
  if (!product) return (
    <View style={styles.center}>
      <Text>Không tìm thấy sản phẩm</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={{color: COLORS.primary}}>Quay lại</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Nút Back nằm đè lên trên */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Gọi Component hiển thị nội dung */}
      <ProductDetailBody product={product} />

      {/* Footer cố định (Nút mua hàng) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.outlineBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fillBtn}>
          <Text style={styles.fillBtnText}>Liên hệ mua hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 44, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center', elevation: 3
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#eee',
    flexDirection: 'row', gap: 12
  },
  outlineBtn: { width: 50, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  fillBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  fillBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});