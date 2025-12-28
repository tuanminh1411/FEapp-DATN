// components/ProductCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SP } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../lib/product.api'; // Import type vừa tạo

type Props = {
  item: Product;
  onPress: () => void;
};

export default function ProductCard({ item, onPress }: Props) {
  // Giá mặc định nếu API không trả về
  const priceDisplay = item.gia 
    ? item.gia.toLocaleString('vi-VN') + ' đ' 
    : 'Liên hệ';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* Hiển thị ảnh từ URL */}
      {item.hinhAnhUrl ? (
        <Image 
          source={{ uri: item.hinhAnhUrl }} 
          style={styles.img} 
          resizeMode="cover" 
        />
      ) : (
        <View style={[styles.img, { backgroundColor: '#E5E7EB' }]} />
      )}

      <Text numberOfLines={2} style={styles.title}>{item.ten}</Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="star" size={14} color="#F59E0B" />
        <Text style={{ color: COLORS.subtext, fontSize: 12 }}>4.5</Text> 
      </View>
      
      <Text style={styles.price}>{priceDisplay}</Text>
      
      {/* Hiển thị tiêu chuẩn nếu có (VD: VietGAP) */}
      {item.tieuChuanApDung && (
        <View style={styles.verified}>
          <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 12, marginLeft: 4 }}>
            {item.tieuChuanApDung}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%', backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SP.sm,
    borderWidth: 1, borderColor: COLORS.border, gap: 6, marginBottom: 12
  },
  img: { width: '100%', height: 110, borderRadius: RADIUS.md },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.text, minHeight: 36 },
  price: { color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  verified: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
});