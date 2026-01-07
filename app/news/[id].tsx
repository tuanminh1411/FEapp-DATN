import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, 
  TouchableOpacity, Platform, useWindowDimensions // Thêm useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import RenderHtml from 'react-native-render-html'; // Import thư viện này
import { COLORS } from '../../theme'; 

// Config API
const LAN_IP = '172.17.163.80:5081'; 
const BASE = Platform.OS === 'android' ? `http://${LAN_IP}` : 'http://localhost:5081';

type NewsDetail = {
  id: string;
  tieuDe: string;
  tomTat: string;
  noiDung: string;
  hinhAnhUrl?: string;
  createdAt: string;
};

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Lấy chiều rộng màn hình để RenderHtml tính toán layout
  const { width } = useWindowDimensions(); 

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const url = `${BASE}/api/Trangchu/chi_tiet_tin_tuc/${id}`;
        console.log('Fetching news detail:', url);
        const res = await axios.get(url);
        setNews(res.data);
      } catch (error) {
        console.error('Lỗi tải chi tiết tin tức:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // Format ngày
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch { return dateString; }
  };

  // Định nghĩa Style cho các thẻ HTML
  const tagsStyles = {
    p: {
      fontSize: 16,
      lineHeight: 26,
      color: '#333',
      marginBottom: 10,
      textAlign: 'justify' as const
    },
    strong: {
      fontWeight: 'bold' as const,
      color: '#000'
    },
    h1: { fontSize: 24, fontWeight: 'bold' as const },
    h2: { fontSize: 22, fontWeight: 'bold' as const },
    ul: { marginLeft: 10 },
    li: { fontSize: 16, lineHeight: 26, marginBottom: 5 }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy bài viết</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết tin tức</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ảnh bìa */}
        {news.hinhAnhUrl ? (
           <Image source={{ uri: news.hinhAnhUrl }} style={styles.cover} />
        ) : (
           <View style={[styles.cover, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
           </View>
        )}

        <View style={styles.body}>
          <Text style={styles.date}>{formatDate(news.createdAt)}</Text>
          <Text style={styles.title}>{news.tieuDe}</Text>
          
          <View style={styles.divider} />
          
          {/* Tóm tắt in đậm */}
          <Text style={styles.summary}>{news.tomTat}</Text>

          {/* --- PHẦN QUAN TRỌNG: Hiển thị Nội dung HTML --- */}
          <RenderHtml
            contentWidth={width - 32} // Trừ đi padding 2 bên (16*2)
            source={{ html: news.noiDung }}
            tagsStyles={tagsStyles}
            systemFonts={['System', 'Roboto', 'Arial']} // Font dự phòng
          />
          {/* ----------------------------------------------- */}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: Platform.OS === 'android' ? 30 : 0,
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  content: { paddingBottom: 40 },
  cover: { width: '100%', height: 220, resizeMode: 'cover' },
  body: { padding: 16 },
  date: { color: '#888', fontSize: 13, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111', lineHeight: 30, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  summary: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 16, lineHeight: 24, fontStyle: 'italic' },
});