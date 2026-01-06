// components/ProductDetailBody.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SP } from '../theme';
import { Product } from '../lib/product.api';

// Props nhận vào dữ liệu sản phẩm
type Props = {
  product: Product;
};

export default function ProductDetailBody({ product }: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* 1. Ảnh lớn */}
      <View style={styles.imageContainer}>
        {product.hinhAnhUrl ? (
          <Image source={{ uri: product.hinhAnhUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image" size={64} color="#E5E7EB" />
          </View>
        )}
      </View>

      {/* 2. Nội dung chính */}
      <View style={styles.body}>
        <Text style={styles.name}>{product.ten}</Text>
        <Text style={styles.price}>
          {product.gia ? product.gia.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
        </Text>

        {/* Badge & Mã SP */}
        <View style={styles.tagsRow}>
          {product.tieuChuanApDung && (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.badgeText}>{product.tieuChuanApDung}</Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: '#F3F4F6' }]}>
            <MaterialCommunityIcons name="barcode" size={14} color="#4B5563" />
            <Text style={[styles.badgeText, { color: '#4B5563' }]}>Mã: {product.maSanPham}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.desc}>
          {product.moTa || 'Chưa có mô tả chi tiết.'}
        </Text>

        {/* Đã loại bỏ NSX và HSD theo yêu cầu */}

        <View style={styles.divider} />

        {/* Doanh nghiệp */}
        <View style={styles.bizBlock}>
          <View style={styles.bizIcon}>
            <Ionicons name="business" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: COLORS.subtext }}>Doanh nghiệp phân phối</Text>
            <Text style={{ fontWeight: '700', color: COLORS.text }}>
              {product.tenDoanhNghiep || 'Đang cập nhật'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width: '100%', height: 300, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  body: {
    flex: 1, marginTop: -20, backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingVertical: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5
  },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', color: '#DC2626', marginBottom: 12 },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 8 },
  desc: { fontSize: 15, color: '#4B5563', lineHeight: 24, textAlign: 'justify' },
  bizBlock: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12 },
  bizIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});