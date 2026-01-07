// components/WriteReviewModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator, ScrollView, Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme';
import { ReviewApi } from '../lib/review.api';
import { Product } from '../lib/product.api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  products: Product[]; // Danh sách sản phẩm để chọn
}

export default function WriteReviewModal({ visible, onClose, onSuccess, products }: Props) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (visible) {
      setRating(5);
      setContent('');
      // Mặc định chọn sản phẩm đầu tiên nếu chưa chọn
      if (products.length > 0 && !selectedProductId) {
        setSelectedProductId(String(products[0].id));
      }
    }
  }, [visible, products]);

  const handleSubmit = async () => {
    if (!selectedProductId) {
      Alert.alert('Lỗi', 'Vui lòng chọn sản phẩm để đánh giá');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setLoading(true);
      // Lấy ID người dùng từ Storage
      const rawUser = await AsyncStorage.getItem('auth_user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      
      if (!user || !user.id) {
        Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để viết đánh giá.');
        return;
      }

      // Gọi API tạo đánh giá
      await ReviewApi.createReview({
        sanPhamId: selectedProductId,
        nguoiDungId: user.id,
        soSao: rating,
        noiDung: content
      });

      Alert.alert('Thành công', 'Cảm ơn bạn đã gửi đánh giá!');
      onSuccess(); // Reload lại danh sách bên ngoài
      onClose();
    } catch (error) {
      console.log(error);
      Alert.alert('Thất bại', 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Viết đánh giá</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* 1. Chọn sản phẩm */}
          <Text style={styles.label}>Chọn sản phẩm đã mua:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {products.map((p) => {
              const isSelected = String(p.id) === selectedProductId;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.productChip, isSelected && styles.productChipSelected]}
                  onPress={() => setSelectedProductId(String(p.id))}
                >
                  <Text style={[styles.productName, isSelected && { color: COLORS.primary }]}>
                    {p.ten || 'Sản phẩm ' + p.id}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* 2. Chọn sao */}
          <Text style={styles.label}>Đánh giá chất lượng:</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color="#F59E0B" 
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 20 }}>
            {rating}/5 Tuyệt vời
          </Text>

          {/* 3. Nhập nội dung */}
          <Text style={styles.label}>Nội dung đánh giá:</Text>
          <TextInput
            style={styles.input}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          {/* Button Submit */}
          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    height: '80%', 
    position: 'absolute', bottom: 0, left: 0, right: 0 
  },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' 
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  
  productChip: { 
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, 
    borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, backgroundColor: '#F9FAFB'
  },
  productChipSelected: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  productName: { fontSize: 13, color: '#4B5563' },

  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  input: { 
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, 
    padding: 12, fontSize: 16, minHeight: 120, marginBottom: 20, 
    backgroundColor: '#F9FAFB' 
  },
  submitBtn: { 
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, 
    alignItems: 'center', marginBottom: 30 
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});