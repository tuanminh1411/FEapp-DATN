// app/(user)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../theme';
import { getAuthUser, subscribeAuth, clearAuth, type AuthUser } from '../../lib/auth';

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | number }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={COLORS.subtext} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value ?? '-'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let mounted = true;
    getAuthUser().then(u => mounted && setUser(u));
    const unsub = subscribeAuth(u => mounted && setUser(u));
    return () => { mounted = false; unsub(); };
  }, []);

  const logout = async () => {
    await clearAuth();
    router.replace('/');
  };

  if (!user) {
    return (
      <View style={styles.wrap}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.cardCenter}>
          <Ionicons name="person-circle-outline" size={92} color="#D1D5DB" />
          <Text style={styles.title}>Bạn chưa đăng nhập</Text>
          <Text style={styles.sub}>Đăng nhập để xem và chỉnh sửa hồ sơ của bạn.</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/auth/register')}>
              <Text style={[styles.btnText, { color: COLORS.primary }]}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filledBtn} onPress={() => router.push('/auth/login')}>
              <Text style={[styles.btnText, { color: '#fff' }]}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const name = user.hoTen?.trim() || 'Người dùng';
  const accountCode = `IC - ${user.id?.slice(0, 12).replace(/-/g, '').toUpperCase()}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <TouchableOpacity onPress={() => {}} style={[styles.headerBtn, { opacity: 0.95 }]}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#B8C0CC" />
          </View>
          <Text style={styles.name}>{name}</Text>

          <View style={styles.pillRow}>
            <TouchableOpacity style={styles.pillPrimary}>
              <Ionicons name="star-outline" size={16} color="#fff" />
              <Text style={styles.pillTextPrimary}>Đánh giá sản phẩm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pillGhost}>
              <Ionicons name="settings-outline" size={16} color={COLORS.primary} />
              <Text style={styles.pillTextGhost}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin</Text>
          <Row icon="location-outline" label="Sống tại" value="-" />
          <Row icon="person-outline" label="Tài khoản" value={accountCode} />
          <Row icon="mail-outline" label="Email" value={user.email || '-'} />
          <Row icon="call-outline" label="Số điện thoại" value={user.dienThoai || '-'} />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đăng bài mới</Text>
          <View style={styles.postBox}>
            <Ionicons name="person-circle-outline" size={36} color="#D1D5DB" />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: '#6B7280' }}>Bạn đã sử dụng sản phẩm nào?</Text>
              <Text style={{ color: '#6B7280' }}>Hãy chia sẻ cảm nhận nhé!</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const HEADER_H = 84;

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: HEADER_H,
    backgroundColor: COLORS.primary,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  hero: { alignItems: 'center', marginTop: 16, paddingHorizontal: 16 },
  avatar: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff', elevation: 2,
  },
  name: { marginTop: 12, fontSize: 20, fontWeight: '800', color: '#111827' },

  pillRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pillPrimary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: 12, height: 36, borderRadius: 999,
  },
  pillTextPrimary: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  pillGhost: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 12, height: 36, borderRadius: 999,
  },
  pillTextGhost: { color: COLORS.primary, fontWeight: '700', marginLeft: 6 },

  section: { marginTop: 18, paddingHorizontal: 16 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 8 },

  row: {
    height: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { marginLeft: 10, color: '#6B7280' },
  rowValue: { color: '#111827', fontWeight: '600' },

  logoutBtn: {
    height: 44, borderRadius: 10, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },

  // khối chưa đăng nhập
  cardCenter: { marginTop: 42, alignItems: 'center', paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 8 },
  sub: { color: '#6B7280', textAlign: 'center', marginTop: 6 },
  outlineBtn: {
    minWidth: 120, height: 44, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  filledBtn: {
    minWidth: 120, height: 44, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontWeight: '800' },

  // ⬇️ BỔ SUNG: style còn thiếu
  postBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
});
