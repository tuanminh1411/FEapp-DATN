// app/(user)/history.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable,
  Animated, Easing, Dimensions, RefreshControl, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SP } from '../../theme';
import Header from '../../components/Header';

const { width: W } = Dimensions.get('window');

// ====== API config ======
const LAN_IP = '192.168.1.154:5081'; // <-- đổi theo IPv4 PC của bạn
const BASE =
  Platform.OS === 'android'
    ? `http://${LAN_IP}`
    : 'http://localhost:5081';

type HistoryItem = {
  id: string;
  maQR: string;
  thoiGian: string; // ISO
  ketQua: string;
};

export default function HistoryScreen() {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState<'new' | 'old'>('new');

  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const options = useMemo(
    () => [
      'Mã vạch sản phẩm', 'Sự kiện', 'Mã Wifi', 'Danh bạ', 'Vị trí',
      'Số điện thoại', 'Email', 'Tin nhắn', 'URL', 'Văn bản', 'QR Code Sản phẩm',
    ],
    []
  );

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const sortData = useCallback(
    (data: HistoryItem[], mode: 'new' | 'old') =>
      [...data].sort((a, b) => {
        const ta = new Date(a.thoiGian).getTime();
        const tb = new Date(b.thoiGian).getTime();
        return mode === 'new' ? tb - ta : ta - tb;
      }),
    []
  );

  const fetchHistory = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const rawUser = await AsyncStorage.getItem('auth_user');
      const userId = rawUser ? JSON.parse(rawUser)?.id : null;

      if (!userId) {
        setItems([]);
        setError('Bạn chưa đăng nhập.');
        return;
      }

      const token = await AsyncStorage.getItem('auth_token');
      const url = `${BASE}/api/LichSuQuet/nguoi-tieu-dung/${encodeURIComponent(userId)}`;

      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const arr: HistoryItem[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data) ? res.data.data : [];

      setItems(sortData(arr, sortValue));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Không thể tải lịch sử quét.');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortData, sortValue]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // đổi thứ tự khi chọn sort
  React.useEffect(() => {
    setItems(prev => sortData(prev, sortValue));
  }, [sortValue, sortData]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} />
        }
      >
        {/* Tiêu đề trang + action phải */}
        <View style={styles.topRow}>
          <View style={{ width: 24 }} />
          <Text style={styles.topTitle}>Lịch sử quét</Text>
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.actionIcon} activeOpacity={0.8}>
              <Ionicons name="search" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} activeOpacity={0.8}>
              <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thanh sort + filter */}
        <View style={styles.sortBar}>
          <TouchableOpacity style={styles.sortLeft} onPress={() => setSortOpen(true)} activeOpacity={0.8}>
            <Ionicons name="time-outline" size={18} color={COLORS.text} />
            <Text style={styles.sortText}>
              Sắp xếp: <Text style={{ fontWeight: '700' }}>{sortValue === 'new' ? 'Mới nhất' : 'Cũ nhất'}</Text>
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => setFilterOpen(true)}>
            <MaterialCommunityIcons name="filter-variant" size={18} color={COLORS.text} />
            <Text style={styles.filterText}>Lọc theo</Text>
          </TouchableOpacity>
        </View>

        {/* Gợi ý cửa hàng (demo) */}
        <TouchableOpacity style={styles.suggestion} activeOpacity={0.9}>
          <MaterialCommunityIcons name="star-outline" size={18} color={COLORS.primary} />
          <Text style={styles.suggestionText}>Gợi ý cửa hàng dành cho bạn</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Nội dung danh sách */}
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#EF4444" />
            <Text style={[styles.emptyTitle, { color: '#EF4444' }]}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="file-search-outline" size={120} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Bạn chưa có lịch sử quét mã vạch.</Text>
            <Text style={styles.emptySub}>Vui lòng quay lại sau</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: SP.lg, gap: 10, marginTop: 8 }}>
            {items.map((it) => (
              <HistoryRow key={it.id} item={it} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ===== SORT DROPDOWN ===== */}
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.backdropLight} onPress={() => setSortOpen(false)} />
        <View style={styles.sortDropdown}>
          {[
            { key: 'new', label: 'Mới nhất' },
            { key: 'old', label: 'Cũ nhất' },
          ].map((o) => (
            <TouchableOpacity
              key={o.key}
              activeOpacity={0.8}
              style={styles.sortItem}
              onPress={() => {
                setSortValue(o.key as 'new' | 'old');
                setSortOpen(false);
              }}
            >
              <Text style={styles.sortItemText}>{o.label}</Text>
              {sortValue === o.key && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ===== FILTER DRAWER (right) ===== */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        options={options}
        selected={selected}
        onToggle={(label) =>
          setSelected((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
        }
        onApply={() => setFilterOpen(false)}
      />
    </View>
  );
}

/** Một hàng lịch sử hiển thị đúng 4 trường */
function HistoryRow({ item }: { item: HistoryItem }) {
  const timeStr = new Date(item.thoiGian).toLocaleString('vi-VN');
  return (
    <View style={rowStyles.wrap}>
      <View style={rowStyles.icon}>
        <MaterialCommunityIcons name="qrcode-scan" size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={rowStyles.title}>{item.ketQua || '(Không có kết quả)'}</Text>
        <Text numberOfLines={1} style={rowStyles.sub}>{item.maQR} • {timeStr}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </View>
  );
}

/** Drawer trượt từ phải sang cho phần Lọc (demo) */
function FilterDrawer({
  open,
  onClose,
  options,
  selected,
  onToggle,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  options: string[];
  selected: string[];
  onToggle: (label: string) => void;
  onApply: () => void;
}) {
  const width = Math.min(W * 0.84, 340);
  const progress = React.useRef(new Animated.Value(1)).current; // 1=đóng, 0=mở
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.timing(progress, {
        toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 1, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }).start(({ finished }) => { if (finished) setVisible(false); });
    }
  }, [open]);

  if (!visible) return null;

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, width] });

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdropDark} onPress={onClose} />
      <Animated.View style={[styles.drawer, { width, transform: [{ translateX }] }]}>
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.drawerTitle}>Bộ lọc</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Text style={{ color: '#9CA3AF', fontWeight: '700' }}>Bỏ chọn</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}>
          <Text style={styles.sectionTitle}>Lọc mã quét</Text>
          <View style={styles.chipGrid}>
            {options.map((label) => {
              const active = selected.includes(label);
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => onToggle(label)}
                  activeOpacity={0.9}
                  style={[styles.chip, active && { backgroundColor: '#E8F7EE', borderColor: COLORS.primary }]}
                >
                  <Text style={[styles.chipText, active && { color: COLORS.primary, fontWeight: '700' }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ padding: 12 }}>
          <TouchableOpacity onPress={onApply} activeOpacity={0.9} style={styles.applyBtn}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  topRow: { paddingHorizontal: SP.lg, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: COLORS.primary },
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIcon: { padding: 6, borderRadius: 999, backgroundColor: '#F0FDF4' },

  sortBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SP.lg, paddingVertical: 10 },
  sortLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { color: COLORS.text },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterText: { color: COLORS.text },

  suggestion: {
    marginHorizontal: SP.lg, borderRadius: RADIUS.lg, paddingHorizontal: 12, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB',
  },
  suggestionText: { flex: 1, color: COLORS.primary, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 56 },
  emptyTitle: { marginTop: 8, color: '#111827', fontWeight: '700', textAlign: 'center' },
  emptySub: { color: '#6B7280', marginTop: 4, textAlign: 'center' },

  // Sort dropdown
  backdropLight: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  sortDropdown: {
    position: 'absolute', top: 110, left: 0, right: 0, backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', paddingVertical: 10,
  },
  sortItem: {
    paddingHorizontal: SP.lg, paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  sortItemText: { color: COLORS.text, fontSize: 16 },

  // Drawer filter
  backdropDark: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: {
    position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#fff',
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
  },
  drawerHeader: {
    paddingTop: 12, paddingBottom: 8, paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  drawerTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  sectionTitle: { color: COLORS.primary, fontWeight: '800', marginTop: 12, marginBottom: 8, paddingHorizontal: 4 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 4 },
  chip: {
    paddingHorizontal: 14, height: 42, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: { color: '#111827' },

  applyBtn: { height: 46, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});

const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10,
    borderRadius: 12, backgroundColor: '#FAFAFA', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB',
  },
  icon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  title: { color: '#111827', fontWeight: '700' },
  sub: { color: '#6B7280', marginTop: 2 },
});
