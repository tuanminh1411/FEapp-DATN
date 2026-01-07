// app/(user)/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';
import { getAuthUser, subscribeAuth, clearAuth, type AuthUser } from '../../lib/auth';

// ====== CẤU HÌNH API ======
const LAN_IP = '172.17.163.80:5081'; // Đổi theo IP máy bạn
const BASE = Platform.OS === 'android' ? `http://${LAN_IP}` : 'http://localhost:5081';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  // --- State cho Modal Sửa thông tin ---
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);

  // --- State cho Modal Đổi mật khẩu ---
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAuthUser().then(u => {
      if (mounted && u) {
        setUser(u);
        // Pre-fill dữ liệu vào form sửa
        setEditName(u.hoTen || '');
        setEditEmail(u.email || '');
        setEditPhone(u.dienThoai || '');
      }
    });
    const unsub = subscribeAuth(u => {
      if (mounted) {
        setUser(u);
        if (u) {
            setEditName(u.hoTen || '');
            setEditEmail(u.email || '');
            setEditPhone(u.dienThoai || '');
        }
      }
    });
    return () => { mounted = false; unsub(); };
  }, []);

  const logout = async () => {
    await clearAuth();
    router.replace('/');
  };

  // --- XỬ LÝ: ĐỔI THÔNG TIN ---
  const handleUpdateInfo = async () => {
    if (!user) return;
    try {
      setLoadingInfo(true);
      const token = await AsyncStorage.getItem('auth_token');
      
      // API: PUT /api/Auth/doi_thong_tin/{id}
      const url = `${BASE}/api/Auth/doi_thong_tin/${user.id}`;
      
      await axios.put(url, {
        hoTen: editName,
        email: editEmail,
        dienThoai: editPhone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Cập nhật lại AuthUser trong AsyncStorage để App tự refresh
      const updatedUser = { ...user, hoTen: editName, email: editEmail, dienThoai: editPhone };
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser); // Cập nhật state cục bộ

      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      setInfoModalVisible(false);
    } catch (e: any) {
      console.log(e);
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoadingInfo(false);
    }
  };

  // --- XỬ LÝ: ĐỔI MẬT KHẨU ---
  const handleChangePassword = async () => {
    if (!user) return;
    if (newPass !== confirmPass) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPass.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu mới phải từ 6 ký tự trở lên');
        return;
    }

    try {
      setLoadingPass(true);
      const token = await AsyncStorage.getItem('auth_token');

      // API: PUT /api/Auth/doi_mat_khau/{id}
      const url = `${BASE}/api/Auth/doi_mat_khau/${user.id}`;
      
      await axios.put(url, {
        matKhauCu: oldPass,
        matKhauMoi: newPass
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      setPassModalVisible(false);
      // Reset form
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } catch (e: any) {
        // Log lỗi chi tiết
      console.log(e.response?.data);
      Alert.alert('Thất bại', typeof e.response?.data === 'string' ? e.response?.data : 'Mật khẩu cũ không đúng hoặc có lỗi xảy ra.');
    } finally {
      setLoadingPass(false);
    }
  };

  // --- Giao diện chưa đăng nhập ---
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
  const accountCode = `IC - ${user.id?.slice(0, 8).toUpperCase()}`;

  return (
    <View style={styles.wrap}>
      {/* HEADER */}
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
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#B8C0CC" />
            {/* Nút chỉnh sửa avatar nhỏ (demo UI) */}
            <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={12} color="white" />
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>

          <View style={styles.pillRow}>
            <TouchableOpacity style={styles.pillPrimary} onPress={() => setInfoModalVisible(true)}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.pillTextPrimary}>Sửa hồ sơ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pillGhost} onPress={() => setPassModalVisible(true)}>
              <Ionicons name="key-outline" size={16} color={COLORS.primary} />
              <Text style={styles.pillTextGhost}>Đổi mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
          <Row icon="person-outline" label="Mã TK" value={accountCode} />
          <Row icon="mail-outline" label="Email" value={user.email || 'Chưa cập nhật'} />
          <Row icon="call-outline" label="Điện thoại" value={user.dienThoai || 'Chưa cập nhật'} />
          <Row icon="location-outline" label="Địa chỉ" value="Việt Nam" />
        </View>

        {/* LOGOUT */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 16 }}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER CALLOUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đóng góp ý kiến</Text>
          <View style={styles.postBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color="#9CA3AF" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ color: '#4B5563', fontSize: 14 }}>Bạn thấy ứng dụng thế nào?</Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>Hãy gửi phản hồi để chúng tôi cải thiện.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>

      {/* ===== MODAL 1: SỬA THÔNG TIN ===== */}
      <Modal visible={infoModalVisible} transparent animationType="slide" onRequestClose={() => setInfoModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cập nhật thông tin</Text>
                
                <Text style={styles.labelInput}>Họ và tên</Text>
                <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Nhập họ tên" />

                <Text style={styles.labelInput}>Email</Text>
                <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="Nhập email" keyboardType="email-address" />

                <Text style={styles.labelInput}>Số điện thoại</Text>
                <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="Nhập số điện thoại" keyboardType="phone-pad" />

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.btnCancel} onPress={() => setInfoModalVisible(false)}>
                        <Text style={{ color: '#555', fontWeight: '600' }}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSave} onPress={handleUpdateInfo} disabled={loadingInfo}>
                        {loadingInfo ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Lưu thay đổi</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== MODAL 2: ĐỔI MẬT KHẨU ===== */}
      <Modal visible={passModalVisible} transparent animationType="slide" onRequestClose={() => setPassModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                
                <Text style={styles.labelInput}>Mật khẩu cũ</Text>
                <TextInput style={styles.input} value={oldPass} onChangeText={setOldPass} placeholder="********" secureTextEntry />

                <Text style={styles.labelInput}>Mật khẩu mới</Text>
                <TextInput style={styles.input} value={newPass} onChangeText={setNewPass} placeholder="********" secureTextEntry />

                <Text style={styles.labelInput}>Xác nhận mật khẩu mới</Text>
                <TextInput style={styles.input} value={confirmPass} onChangeText={setConfirmPass} placeholder="********" secureTextEntry />

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.btnCancel} onPress={() => setPassModalVisible(false)}>
                        <Text style={{ color: '#555', fontWeight: '600' }}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSave} onPress={handleChangePassword} disabled={loadingPass}>
                        {loadingPass ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Cập nhật</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

// --- SUB COMPONENTS ---
function Row({ icon, label, value }: { icon: any; label: string; value?: string | number }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={COLORS.subtext} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value ?? '-'}</Text>
    </View>
  );
}

const HEADER_H = 84;
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: HEADER_H, backgroundColor: COLORS.primary, paddingTop: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  hero: { alignItems: 'center', marginTop: 20, paddingHorizontal: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff', elevation: 4, position: 'relative'
  },
  editAvatarBadge: {
      position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary,
      width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: '#fff'
  },
  name: { marginTop: 12, fontSize: 22, fontWeight: '800', color: '#111827' },

  pillRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  pillPrimary: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingHorizontal: 16, height: 40, borderRadius: 20, elevation: 2
  },
  pillTextPrimary: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  pillGhost: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary,
    paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: '#fff'
  },
  pillTextGhost: { color: COLORS.primary, fontWeight: '600', marginLeft: 8 },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontWeight: '700', fontSize: 16, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  row: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { marginLeft: 12, color: '#6B7280', fontSize: 15 },
  rowValue: { color: '#111827', fontWeight: '500', fontSize: 15 },

  logoutBtn: {
    height: 50, borderRadius: 12, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    elevation: 2
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  labelInput: { fontWeight: '600', marginBottom: 6, color: '#374151', marginTop: 10 },
  input: {
      borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827'
  },
  modalActions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  btnCancel: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, backgroundColor: '#F3F4F6' },
  btnSave: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.primary },

  // Khối chưa đăng nhập & Footer
  cardCenter: { marginTop: 60, alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 16 },
  sub: { color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  outlineBtn: { minWidth: 130, height: 48, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  filledBtn: { minWidth: 130, height: 48, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '700', fontSize: 16 },
  postBox: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
});