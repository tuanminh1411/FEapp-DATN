// app/(tabs)/reviews.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '../../components/Header';
import Section from '../../components/Section';
import ProductCard from '../../components/ProductCard';
import { COLORS, RADIUS } from '../../theme';

// Import API & Types
import { Product, ProductApi } from '../../lib/product.api';

export default function ReviewsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu sản phẩm thật
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await ProductApi.getAll();
        setProducts(res.data);
      } catch (error) {
        console.log('Lỗi tải sản phẩm Review:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        {/* Header có tiêu đề ở giữa */}
        <Header />
        <Text style={styles.titleCenter}>Đánh giá</Text>

        {/* ô tìm kiếm */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.subtext} />
          <TextInput
            placeholder="Tìm kiếm đánh giá"
            placeholderTextColor={COLORS.subtext}
            style={styles.searchInput}
          />
        </View>

        {/* banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>QUÉT MÃ{'\n'}NHANH CHÓNG</Text>
          <View style={styles.bannerIcons}>
            <MaterialCommunityIcons name="qrcode" size={24} color="#fff" />
            <MaterialCommunityIcons name="barcode" size={24} color="#fff" />
          </View>
        </View>

        {/* Danh mục nổi bật */}
        <Section title="Danh mục nổi bật" rightText="Xem tất cả">
          <View style={styles.categoryRow}>
            <CategoryCard
              icon={<Ionicons name="bicycle" size={22} color={COLORS.primary} />}
              title="Ô tô, xe máy, xe đạp"
              stat="130 đánh giá"
            />
            <CategoryCard
              icon={<Ionicons name="home-outline" size={22} color={COLORS.primary} />}
              title="Đồ dùng sinh hoạt"
              stat="47 đánh giá"
            />
            <CategoryCard
              icon={<Ionicons name="construct-outline" size={22} color={COLORS.primary} />}
              title="Công nghiệp, Xây dựng"
              stat="183 đánh giá"
            />
          </View>
        </Section>

        {/* Sản phẩm HOT (Lấy từ API) */}
        <Section title="Sản phẩm HOT" rightText="Xem tất cả">
          {loading ? (
             <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
            >
              {products.slice(0, 6).map((p) => (
                // Wrapper View để ép size cho ProductCard khi scroll ngang
                <View key={p.id} style={{ width: 160 }}> 
                  <ProductCard 
                    item={p} 
                    onPress={() => router.push(`/product/${p.id}` as any)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </Section>

        {/* Hot Reviewer nói gì? */}
        <Section title="Hot Reviewer nói gì?">
          <ReviewCard />
        </Section>
      </ScrollView>
    </View>
  );
}

/* ---------- components cục bộ cho màn ---------- */

function CategoryCard({
  icon,
  title,
  stat,
}: {
  icon: React.ReactNode;
  title: string;
  stat: string;
}) {
  return (
    <View style={styles.catCard}>
      <View style={styles.catCircle}>{icon}</View>
      <Text style={styles.catTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.catStat}>{stat}</Text>
    </View>
  );
}

function ReviewCard() {
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewTitle}>Hot Reviewer nói gì?</Text>

      {/* author */}
      <View style={styles.authorRow}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>Mỹ Duyên</Text>
          <Text style={styles.authorDate}>01/11/2022</Text>
        </View>
      </View>

      {/* content */}
      <Text style={styles.reviewText} numberOfLines={3}>
        dầu gội tui sử dụng giảm hẳn tình trạng bị rụng tóc nha , tui để ý là tui sử dụng em này là tóc
        rụng rất ít khi gội đầu luôn á. Tóc cũng có vẻ suôn mượt hơn ấy. Mùi thì th…{' '}
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Xem thêm</Text>
      </Text>

      {/* ảnh review (placeholder) */}
      <View style={styles.reviewImage}>
        <Text style={{ color: '#9CA3AF' }}>Ảnh sản phẩm</Text>
        <View style={styles.badgeRate}>
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 4, fontWeight: '700' }}>Đánh giá</Text>
        </View>
      </View>

      {/* strip info sản phẩm */}
      <View style={styles.productStrip}>
        <View style={styles.productThumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productName} numberOfLines={1}>
            Dầu Gội Dove Phục Hồi Hư Tổn Chiết …
          </Text>
          <Text style={styles.productBrand} numberOfLines={1}>
            ユニリーバ・ジャパン（株）
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  titleCenter: {
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },

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
  searchInput: { flex: 1, color: COLORS.text },

  banner: {
    marginHorizontal: 18,
    height: 140,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 24,
  },
  bannerIcons: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    gap: 10,
  },

  categoryRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitle: { textAlign: 'center', color: COLORS.text, fontWeight: '600', fontSize: 12 },
  catStat: { color: '#9CA3AF', marginTop: 2, fontSize: 10 },

  reviewCard: {
    marginHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingTop: 10,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  authorName: { fontWeight: '700', color: COLORS.text },
  authorDate: { color: '#9CA3AF', marginTop: 2, fontSize: 12 },

  reviewText: { color: COLORS.text, paddingHorizontal: 14, marginBottom: 8 },

  reviewImage: {
    height: 200,
    marginHorizontal: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: '#F0F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeRate: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  productStrip: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E7EB' },
  productName: { color: COLORS.text, fontWeight: '700' },
  productBrand: { color: '#9CA3AF', marginTop: 2 },
});