// components/ProductCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SP } from '../theme';
import { Product } from '../lib/product.api';

type Props = {
  item: Product;
  onPress: () => void;
  style?: ViewStyle;
};

export default function ProductCard({ item, onPress, style }: Props) {
  // Logic hiển thị giá
  const priceDisplay = item.gia && item.gia > 0
    ? item.gia.toLocaleString('vi-VN') + ' đ'
    : 'Liên hệ';

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* Ảnh sản phẩm */}
      <View style={styles.imgWrap}>
        {item.hinhAnhUrl ? (
          <Image source={{ uri: item.hinhAnhUrl }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.img, { backgroundColor: '#F3F4F6', alignItems:'center', justifyContent:'center' }]}>
             <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Tên sản phẩm */}
      <Text numberOfLines={2} style={styles.title}>{item.ten}</Text>
      
      {/* Rating giả lập (nếu API chưa có thì để cứng) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <Ionicons name="star" size={14} color="#F59E0B" />
        <Text style={{ color: COLORS.subtext, fontSize: 12 }}>4.5</Text> 
      </View>
      
      {/* GIÁ SẢN PHẨM (Nổi bật) */}
      <Text style={styles.price}>{priceDisplay}</Text>
      
      {/* Badge Verified */}
      {item.tieuChuanApDung && (
        <View style={styles.verified}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 11, marginLeft: 4, fontWeight:'600' }}>
            {item.tieuChuanApDung}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%', 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.md, 
    padding: SP.sm,
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginBottom: 12,
  },
  imgWrap: {
    width: '100%', 
    height: 120, 
    borderRadius: RADIUS.md, 
    overflow: 'hidden',
    marginBottom: 8
  },
  img: { width: '100%', height: '100%' },
  title: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.text, 
    minHeight: 40, 
    marginBottom: 4 
  },
  price: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#DC2626', // Màu đỏ cho giá nổi bật
    marginBottom: 4
  },
  verified: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EFF6FF', 
    alignSelf:'flex-start', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
});