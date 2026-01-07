// app/(user)/history.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable,
  RefreshControl, Platform, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SP } from '../../theme';
import Header from '../../components/Header';

const { width: W } = Dimensions.get('window');

// ====== API CONFIG ======
const LAN_IP = '172.17.163.80:5081'; // Thay bằng IP máy bạn
const BASE = Platform.OS === 'android' ? `http://${LAN_IP}` : 'http://localhost:5081';

// ====== TYPE DEFINITIONS ======
// Dựa trên ảnh JSON phản hồi chi tiết: image_18aed1.png
type HistoryItemDetail = {
  id: string;
  maQR: string;
  thoiGian: string;       // ISO String
  ketQua: string;         // 'Success' | 'Fail' | ...
  
  // Thông tin thiết bị & Vị trí
  thietBi?: string;
  heDieuHanh?: string;
  viDo?: number;
  kinhDo?: number;
  diaChiGanDung?: string;
  
  // Thông tin sản phẩm & Doanh nghiệp
  tenSanPham?: string;
  maSanPham?: string;
  maLo?: string;
  ngaySanXuat?: string;   // YYYY-MM-DD
  hanSuDung?: string;     // YYYY-MM-DD
  tenDoanhNghiep?: string;
  emailDoanhNghiep?: string;
  dienThoaiDoanhNghiep?: string;
};

// Props cho Filter Drawer
interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  options: string[];
  selected: string[];
  onToggle: (label: string) => void;
  onApply: () => void;
}

export default function HistoryScreen() {
  const router = useRouter();

  // -- State --
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState<'new' | 'old'>('new');
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  
  const [items, setItems] = useState<HistoryItemDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // -- Detail Modal State --
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<HistoryItemDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const filterOptions = useMemo(() => ['Sản phẩm', 'Website', 'Văn bản'], []);

  // Hàm sắp xếp data
  const sortData = useCallback(
    (data: HistoryItemDetail[], mode: 'new' | 'old') =>
      [...data].sort((a, b) => {
        const ta = new Date(a.thoiGian).getTime();
        const tb = new Date(b.thoiGian).getTime();
        return mode === 'new' ? tb - ta : ta - tb;
      }),
    []
  );

  // 1. LẤY DANH SÁCH: GET /api/LichSuQuet/nguoi-tieu-dung/{id}
  const fetchHistory = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const rawUser = await AsyncStorage.getItem('auth_user');
      const userId = rawUser ? JSON.parse(rawUser)?.id : null;

      if (!userId) {
        setItems([]); // Chưa login thì list rỗng
        return;
      }

      const token = await AsyncStorage.getItem('auth_token');
      const url = `${BASE}/api/LichSuQuet/nguoi-tieu-dung/${userId}`;
      
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // API trả về mảng trực tiếp hoặc bọc trong data
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setItems(sortData(dataArr, sortValue));

    } catch (e: any) {
      console.log('Error fetch history:', e);
      setError('Không tải được lịch sử.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortData, sortValue]);

  // 2. LẤY CHI TIẾT: GET /api/LichSuQuet/{id}
  const handlePressItem = async (historyId: string) => {
    try {
      setLoadingDetail(true);
      setDetailModalVisible(true);
      setSelectedDetail(null); // Reset detail cũ

      const token = await AsyncStorage.getItem('auth_token');
      const url = `${BASE}/api/LichSuQuet/${historyId}`;
      
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // Mapping data từ API vào state
      setSelectedDetail(res.data);
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không thể tải chi tiết lần quét này');
      setDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGoToProduct = () => {
    if (selectedDetail && selectedDetail.maQR) {
        setDetailModalVisible(false);
        // Chuyển hướng sang trang chi tiết sản phẩm
        router.push(`/product/${selectedDetail.maQR}`);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  React.useEffect(() => {
    setItems(prev => sortData(prev, sortValue));
  }, [sortValue, sortData]);

  // -- Helpers format --
  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    try {
        // Xử lý trường hợp chuỗi ngày dạng "2026-01-06"
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch { return dateString; }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '---';
    try {
        return new Date(dateString).toLocaleString('vi-VN', { hour12: false });
    } catch { return dateString; }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} />
        }
      >
        <View style={styles.topRow}>
          <View style={{ width: 24 }} />
          <Text style={styles.topTitle}>Lịch sử quét</Text>
          <View style={styles.rightActions} />
        </View>

        {/* Thanh Sort & Filter */}
        <View style={styles.sortBar}>
          <TouchableOpacity style={styles.sortLeft} onPress={() => setSortOpen(true)}>
            <Ionicons name="time-outline" size={18} color={COLORS.text} />
            <Text style={styles.sortText}>
              Sắp xếp: <Text style={{ fontWeight: '700' }}>{sortValue === 'new' ? 'Mới nhất' : 'Cũ nhất'}</Text>
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
            <MaterialCommunityIcons name="filter-variant" size={18} color={COLORS.text} />
            <Text style={styles.filterText}>Lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách */}
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.emptyWrap}>
             <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="qrcode-scan" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>Chưa có lịch sử quét</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: SP.lg, gap: 10, marginTop: 8 }}>
            {items.map((it) => (
              <HistoryRow 
                key={it.id} 
                item={it} 
                onPress={() => handlePressItem(it.id)} 
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ===== MODAL CHI TIẾT ===== */}
      <Modal 
        visible={detailModalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết lần quét</Text>
                    <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {loadingDetail ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
                ) : selectedDetail ? (
                    <ScrollView style={{ maxHeight: '80%' }}>
                        <View style={{ gap: 8 }}>
                            {/* 1. Thông tin quét */}
                            <InfoRow label="Thời gian" value={formatDateTime(selectedDetail.thoiGian)} />
                            <InfoRow label="Mã QR" value={selectedDetail.maQR} />
                            
                            <View style={styles.divider} />
                            
                            {/* 2. Thông tin sản phẩm (Quan trọng) */}
                            <Text style={styles.sectionHeader}>Sản phẩm</Text>
                            {selectedDetail.tenSanPham ? (
                                <>
                                    <Text style={styles.productNameHighlight}>{selectedDetail.tenSanPham}</Text>
                                    <InfoRow label="Mã sản phẩm" value={selectedDetail.maSanPham} />
                                    <InfoRow label="Mã lô" value={selectedDetail.maLo} />
                                    <InfoRow label="NSX" value={formatDate(selectedDetail.ngaySanXuat)} />
                                    <InfoRow label="HSD" value={formatDate(selectedDetail.hanSuDung)} />
                                </>
                            ) : (
                                <Text style={{fontStyle:'italic', color:'#999'}}>Không có thông tin sản phẩm</Text>
                            )}

                            <View style={styles.divider} />

                            {/* 3. Thông tin doanh nghiệp */}
                            <Text style={styles.sectionHeader}>Doanh nghiệp</Text>
                            <InfoRow label="Tên DN" value={selectedDetail.tenDoanhNghiep} />
                            <InfoRow label="Email" value={selectedDetail.emailDoanhNghiep} />
                            <InfoRow label="SĐT" value={selectedDetail.dienThoaiDoanhNghiep} />

                            <View style={styles.divider} />

                            {/* 4. Ngữ cảnh quét (Vị trí & Thiết bị) */}
                            <Text style={styles.sectionHeader}>Thông tin thiết bị</Text>
                            <InfoRow label="Thiết bị" value={selectedDetail.thietBi} />
                            <InfoRow label="Hệ điều hành" value={selectedDetail.heDieuHanh} />
                            <InfoRow label="Vị trí" value={selectedDetail.diaChiGanDung || (selectedDetail.viDo ? `${selectedDetail.viDo}, ${selectedDetail.kinhDo}` : '')} />

                            {/* Button Action */}
                            <TouchableOpacity style={styles.btnAction} onPress={handleGoToProduct}>
                                <Text style={styles.btnActionText}>Xem chi tiết sản phẩm</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" style={{marginLeft: 8}} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                     <Text style={{ textAlign: 'center', color: 'red', padding: 20 }}>Không tìm thấy thông tin</Text>
                )}
            </View>
        </View>
      </Modal>

      {/* ===== SORT MODAL ===== */}
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.backdropLight} onPress={() => setSortOpen(false)} />
        <View style={styles.sortDropdown}>
          <TouchableOpacity style={styles.sortItem} onPress={() => { setSortValue('new'); setSortOpen(false); }}>
              <Text style={styles.sortItemText}>Mới nhất</Text>
              {sortValue === 'new' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortItem} onPress={() => { setSortValue('old'); setSortOpen(false); }}>
              <Text style={styles.sortItemText}>Cũ nhất</Text>
              {sortValue === 'old' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ===== FILTER DRAWER ===== */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        options={filterOptions}
        selected={selectedFilter}
        onToggle={(label) =>
            setSelectedFilter((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
        }
        onApply={() => setFilterOpen(false)}
      />
    </View>
  );
}

// --- SUB COMPONENTS ---

const InfoRow = ({ label, value }: { label: string, value?: string | number }) => {
    if (!value) return null;
    return (
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            <Text style={{ width: 110, fontSize: 13, color: '#6B7280' }}>{label}:</Text>
            <Text style={{ flex: 1, fontSize: 13, color: '#111827', fontWeight: '500' }}>
                {value}
            </Text>
        </View>
    );
};

// Hiển thị dòng Lịch sử: Ưu tiên hiển thị Tên sản phẩm
const HistoryRow = ({ item, onPress }: { item: HistoryItemDetail, onPress: () => void }) => {
  const timeStr = new Date(item.thoiGian).toLocaleString('vi-VN', { 
    hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric' 
  });
  
  // Logic hiển thị tiêu đề: Tên SP -> Tên DN -> Mã QR
  const title = item.tenSanPham ? item.tenSanPham : (item.tenDoanhNghiep || 'Mã QR: ' + item.maQR);
  const isProduct = !!item.tenSanPham;
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={rowStyles.wrap}>
      <View style={[rowStyles.icon, { backgroundColor: isProduct ? '#E0F2FE' : '#F3F4F6' }]}>
        <MaterialCommunityIcons 
            name={isProduct ? "cube-outline" : "qrcode"} 
            size={22} 
            color={isProduct ? COLORS.primary : '#6B7280'} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={rowStyles.title}>{title}</Text>
        <Text numberOfLines={1} style={rowStyles.sub}>
            {isProduct ? item.maQR : 'Đã quét'}
        </Text>
        <Text style={rowStyles.time}>{timeStr}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

function FilterDrawer({ open, onClose, options, selected, onToggle, onApply }: FilterDrawerProps) {
  const width = Math.min(W * 0.8, 300);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) setVisible(true);
    else setTimeout(() => setVisible(false), 200);
  }, [open]);

  if (!open && !visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdropDark}>
         <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
         <View style={[styles.drawer, { width, right: 0 }]}> 
            <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Bộ lọc</Text>
                <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 12 }}>
                <View style={styles.chipGrid}>
                    {options.map((opt) => (
                        <TouchableOpacity 
                            key={opt} 
                            style={[styles.chip, selected.includes(opt) && { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }]}
                            onPress={() => onToggle(opt)}
                        >
                            <Text style={{ color: selected.includes(opt) ? COLORS.primary : '#333' }}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <View style={{ padding: 12 }}>
                <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Áp dụng</Text>
                </TouchableOpacity>
            </View>
         </View>
      </View>
    </Modal>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  topRow: { paddingHorizontal: SP.lg, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
  rightActions: { flexDirection: 'row', alignItems: 'center' },

  sortBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SP.lg, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sortLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { color: '#4B5563', fontSize: 13 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  filterText: { color: '#374151', fontSize: 13, fontWeight: '500' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { marginTop: 12, color: '#9CA3AF', fontSize: 16 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  
  sectionHeader: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8, color: COLORS.primary, textTransform: 'uppercase' },
  productNameHighlight: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  
  btnAction: { marginTop: 24, backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnActionText: { color: 'white', fontWeight: '600', fontSize: 15 },

  // Sort Dropdown
  backdropLight: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  sortDropdown: { position: 'absolute', top: 110, left: 20, width: 140, backgroundColor: '#fff', borderRadius: 8, elevation: 5, padding: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  sortItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 4 },
  sortItemText: { fontSize: 14, color: '#374151' },

  // Drawer
  backdropDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawer: { backgroundColor: '#fff', height: '100%', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  drawerHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee' },
  drawerTitle: { fontSize: 18, fontWeight: 'bold' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  applyBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
});

const rowStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 2 },
  icon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { color: '#111827', fontWeight: '600', fontSize: 15, marginBottom: 2 },
  sub: { color: '#6B7280', fontSize: 13, marginBottom: 2 },
  time: { color: '#9CA3AF', fontSize: 11 },
});