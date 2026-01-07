// app/(tabs)/reviews.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  TouchableOpacity,
  FlatList,
  RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '../../components/Header';
import Section from '../../components/Section';
import ProductCard from '../../components/ProductCard';
import { COLORS, RADIUS } from '../../theme';

// Import Component Modal Viết Review (Mới tạo ở Bước 2)
import WriteReviewModal from '../../components/WriteReviewModal';

// Import API (Đã sửa ở Bước 1)
import { Product, ProductApi } from '../../lib/product.api';
import { Review, ReviewApi } from '../../lib/review.api';

export default function ReviewsScreen() {
  const router = useRouter();
  
  // State Data
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State Modal Viết Review
  const [modalVisible, setModalVisible] = useState(false);

  // Hàm tải dữ liệu
  const fetchData = async () => {
    try {
      // 1. Lấy danh sách sản phẩm
      const productRes = await ProductApi.getAll();
      const productList = productRes.data.data || [];
      setProducts(productList);

      // 2. Lấy đánh giá (Kết nối API thực tế)
      if (productList.length > 0) {
        // Chỉ lấy review của 3 sản phẩm đầu tiên để làm feed mẫu
        const topProducts = productList.slice(0, 3); 
        
        const reviewPromises = topProducts.map(p => {
          // Lấy ID sản phẩm
          const productId = p.id; 

          return ReviewApi.getByProductId(productId)
            .then(res => {
                // Xử lý tên sản phẩm an toàn
                const tenSanPham = (p as any).ten || (p as any).name || (p as any).title || "Sản phẩm";
                
                // Map thêm tên sản phẩm vào từng review để hiển thị ở Feed
                return res.data.data.map((r: any) => ({
                    ...r, 
                    sanPhamTen: tenSanPham 
                }));
            })
            .catch(() => []);
        });

        const results = await Promise.all(reviewPromises);
        // Gộp tất cả đánh giá lại thành 1 mảng (flat)
        const combinedReviews = results.flat().filter(Boolean);
        setReviews(combinedReviews);
      }

    } catch (error) {
      console.log('Lỗi tải dữ liệu Review:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Render Item Sản phẩm HOT
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={{ width: 260, marginRight: 12 }}> 
      <ProductCard 
        item={item} 
        onPress={() => router.push(`/product/${item.id}` as any)}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header App */}
      <Header />
      
      <ScrollView 
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.titleCenter}>Cộng đồng đánh giá</Text>

        {/* Ô tìm kiếm */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.subtext} />
          <TextInput
            placeholder="Tìm kiếm bài review..."
            placeholderTextColor={COLORS.subtext}
            style={styles.searchInput}
          />
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={{flex: 1}}>
             <Text style={styles.bannerTitle}>QUÉT MÃ QR</Text>
             <Text style={{color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4}}>
               Tra cứu & Đánh giá sản phẩm
             </Text>
          </View>
          <MaterialCommunityIcons name="qrcode-scan" size={48} color="#fff" style={{opacity: 0.9}} />
        </View>

        {/* Danh mục nổi bật */}
        <Section title="Danh mục nổi bật" rightText="Xem tất cả">
          <View style={styles.categoryRow}>
            <CategoryCard icon="bicycle" title="Xe cộ" count="130" />
            <CategoryCard icon="home-outline" title="Gia dụng" count="47" />
            <CategoryCard icon="construct-outline" title="Công nghiệp" count="183" />
          </View>
        </Section>

        {/* Sản phẩm HOT */}
        <Section title="Sản phẩm HOT" rightText="Xem tất cả">
          {loading ? (
             <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              data={products.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              renderItem={renderProductItem}
              contentContainerStyle={{ paddingHorizontal: 18 }} 
            />
          )}
        </Section>

        {/* Review Feed - Lấy từ API */}
        <Section title="Review mới nhất">
          {loading ? (
             <ActivityIndicator size="small" color={COLORS.primary} />
          ) : reviews.length === 0 ? (
             <Text style={styles.emptyText}>Chưa có đánh giá nào gần đây.</Text>
          ) : (
            <View style={{ gap: 16, paddingHorizontal: 18 }}>
              {reviews.map((rev, index) => (
                <ReviewCard 
                    key={rev.id || index}
                    data={rev}
                />
              ))}
            </View>
          )}
        </Section>
      </ScrollView>

      {/* Floating Button - Viết Review */}
      <TouchableOpacity 
        style={styles.floatingBtn} 
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)} // Mở Modal
      >
        <Ionicons name="create" size={24} color="#fff" />
        <Text style={styles.floatingBtnText}>Viết Review</Text>
      </TouchableOpacity>

      {/* Modal Viết Đánh Giá */}
      <WriteReviewModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        products={products} // Truyền danh sách sản phẩm để user chọn
        onSuccess={() => {
          // Tải lại dữ liệu khi gửi thành công
          setRefreshing(true);
          fetchData(); 
        }}
      />
    </View>
  );
}

/* ---------- Components cục bộ ---------- */

function CategoryCard({ icon, title, count }: { icon: any; title: string; count: string }) {
  return (
    <TouchableOpacity style={styles.catCard} activeOpacity={0.7}>
      <View style={styles.catCircle}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.catTitle}>{title}</Text>
      <Text style={styles.catStat}>{count} bài</Text>
    </TouchableOpacity>
  );
}

// Review Card Component
function ReviewCard({ data }: { data: Review }) {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    setLiked(!liked);
    try {
      await ReviewApi.likeReview(data.id);
    } catch (e) {
      console.log('Lỗi like:', e);
    }
  };

  return (
    <View style={styles.reviewCard}>
      {/* Header: Avatar + Tên + Sao */}
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
           <Text style={{color: '#6B7280', fontWeight: 'bold'}}>
             {data.nguoiDungTen ? data.nguoiDungTen.charAt(0).toUpperCase() : 'U'}
           </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.headerTop}>
             <Text style={styles.authorName}>{data.nguoiDungTen || 'Người dùng ẩn danh'}</Text>
             <Text style={styles.authorDate}>
               {data.ngayTao ? new Date(data.ngayTao).toLocaleDateString('vi-VN') : 'Vừa xong'}
             </Text>
          </View>
          <View style={{flexDirection: 'row', marginTop: 4}}>
            {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={12} color={i < data.soSao ? "#F59E0B" : "#E5E7EB"} />
            ))}
          </View>
        </View>
      </View>

      {/* Nội dung Review */}
      <Text style={styles.reviewText} numberOfLines={3}>
        {data.noiDung}
      </Text>

      {/* Sản phẩm liên quan */}
      {data.sanPhamTen && (
        <TouchableOpacity style={styles.productStrip} activeOpacity={0.7}>
          <View style={styles.productThumb}>
              <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName} numberOfLines={1}>{data.sanPhamTen}</Text>
            <Text style={styles.productBrand}>Sản phẩm đã mua</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Nút Like/Comment */}
      <View style={styles.cardFooter}>
         <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "red" : COLORS.text} />
            <Text style={[styles.actionText, liked && {color: 'red'}]}>Thích</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={19} color={COLORS.text} />
            <Text style={styles.actionText}>Bình luận</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  titleCenter: {
    textAlign: 'center', color: COLORS.primary,
    fontWeight: '700', fontSize: 18,
    marginBottom: 12, marginTop: 4,
  },
  searchWrap: {
    marginHorizontal: 18, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 14, height: 46,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, color: COLORS.text, height: '100%' },
  banner: {
    marginHorizontal: 18, marginBottom: 20,
    height: 100, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}
  },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 20 },
  categoryRow: { paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catCard: {
    width: '31%', backgroundColor: '#fff', borderRadius: RADIUS.md,
    alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 6,
    borderWidth: 1, borderColor: '#F3F4F6', elevation: 1
  },
  catCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
  catTitle: { textAlign: 'center', color: COLORS.text, fontWeight: '600', fontSize: 12 },
  catStat: { color: '#9CA3AF', fontSize: 11 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  reviewHeader: { flexDirection: 'row', marginBottom: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB',
    marginRight: 10, alignItems: 'center', justifyContent: 'center'
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorName: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  authorDate: { color: '#9CA3AF', fontSize: 11 },
  reviewText: { color: '#4B5563', lineHeight: 20, marginBottom: 12, fontSize: 13 },
  productStrip: {
    backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  productThumb: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  productName: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  productBrand: { color: '#9CA3AF', fontSize: 11 },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 10, fontStyle: 'italic' },
  floatingBtn: {
    position: 'absolute', 
    bottom: 130, 
    right: 20,
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4.65, shadowOffset: { width: 0, height: 4 },
  },
  floatingBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 8 }
});