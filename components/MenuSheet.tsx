// components/MenuSheet.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../theme';
import { getAuthUser, subscribeAuth, clearAuth, type AuthUser } from '../lib/auth';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MenuSheet({ open, onClose }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(open);
  const progress = useRef(new Animated.Value(1)).current; // 1=đóng, 0=mở

  // === Auth state ===
  const [user, setUser] = useState<AuthUser | null>(null);
  const isLogged = !!user;

  useEffect(() => {
    let mounted = true;
    getAuthUser().then(u => mounted && setUser(u));
    const unsub = subscribeAuth(u => mounted && setUser(u));
    return () => { mounted = false; unsub(); };
  }, []);

  // === open/close animation ===
  useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 1,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setVisible(false);
      });
    }
  }, [open]);

  if (!visible) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 420], // chiều cao sheet trượt xuống khi đóng
  });

  const handleLogout = async () => {
    await clearAuth();
    onClose();
  };

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* nền mờ */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* header */}
        <View style={styles.top}>
          <View style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 16 }}>
              {isLogged ? (user?.hoTen || 'Người dùng') : 'Người lạ'}
            </Text>

            {!isLogged ? (
              <Text style={{ color: '#6B7280' }}>
                Vui lòng{' '}
                <Text
                  style={{ color: COLORS.primary, fontWeight: '700' }}
                  onPress={() => { onClose(); router.push('/auth/register'); }}
                >
                  Đăng ký
                </Text>{' '}
                hoặc{' '}
                <Text
                  style={{ color: COLORS.primary, fontWeight: '700' }}
                  onPress={() => { onClose(); router.push('/auth/login'); }}
                >
                  Đăng nhập
                </Text>
              </Text>
            ) : (
              <Text style={{ color: '#6B7280' }}>
                {user?.email || 'Đã đăng nhập'}
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* grid item */}
        <View style={styles.grid}>
          <MenuItem icon="cellphone" label="Lịch sử nạp thẻ & Dịch vụ" />
          <MenuItem icon="heart-outline" label="Sản phẩm yêu thích" />
          <MenuItem icon="qrcode" label="Tạo QR Code" />
          <MenuItem icon="file-document-outline" label="Quản lý trang" />
          <MenuItem icon="gift-outline" label="Quà của tôi" />
          <MenuItem icon="cog-outline" label="Cấu hình" />
        </View>

        {/* Đăng xuất (chỉ hiện khi đã đăng nhập) */}
        {isLogged && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.9}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Đăng xuất</Text>
          </TouchableOpacity>
        )}

        {/* trợ giúp */}
        <TouchableOpacity style={styles.help}>
          <Ionicons name="help-circle" size={18} color="#1F4BB0" />
          <Text style={{ color: '#1F4BB0', marginLeft: 8, fontWeight: '600' }}>
            Trợ giúp và hỗ trợ
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

function MenuItem({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.itemText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  item: {
    width: '50%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemText: { flex: 1, color: '#111827', fontWeight: '600' },

  // Logout button
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    height: 46,
    borderRadius: RADIUS.lg,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  help: {
    marginTop: 4,
    marginHorizontal: 16,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
