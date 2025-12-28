// components/GreetingQuickCard.tsx
import React, { useState, useCallback, ReactNode } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SP } from '../theme';

function Action({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={styles.actionItem}>
      <View style={styles.iconWrap}>
        <View style={[styles.dot, { top: -4, left: -6 }]} />
        <View style={[styles.dot, { bottom: -5, right: -8, width: 14, height: 14, opacity: 0.18 }]} />
        {icon}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

type Props = { onLogin?: () => void; onSignup?: () => void };

export default function GreetingQuickCard({ onLogin, onSignup }: Props) {
  const router = useRouter();
  const [showPoint, setShowPoint] = useState(false);
  const [askAuth, setAskAuth] = useState(false);
  const [displayName, setDisplayName] = useState('Người lạ');
  const [isLogged, setIsLogged] = useState(false);

  const loadName = useCallback(async () => {
    try {
      const rawUser = await AsyncStorage.getItem('auth_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        setDisplayName(u?.hoTen?.trim?.() || 'Người dùng');
        setIsLogged(true);
        return;
      }
      const rawAuth = await AsyncStorage.getItem('qrcheck.auth'); // fallback {token,user}
      if (rawAuth) {
        const a = JSON.parse(rawAuth);
        const u = a?.user;
        if (u) {
          setDisplayName(u?.hoTen?.trim?.() || 'Người dùng');
          setIsLogged(true);
          return;
        }
      }
      setDisplayName('Người lạ');
      setIsLogged(false);
    } catch {
      setDisplayName('Người lạ');
      setIsLogged(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadName(); }, [loadName]));

  const points = 12345;
  const fmt = (n: number) => n.toLocaleString('vi-VN');

  const goLogin = () => (onLogin ? onLogin() : router.push('/auth/login'));
  const goSignup = () => (onSignup ? onSignup() : router.push('/auth/register'));
  const goScan = () => router.push('/scan');            // ⟵ NỐI “Quét mã” qua màn scan
  const goApplyBiz = () => router.push('/apply-biz');   // ⟵ Trang đăng ký DN (tùy bạn)

  const onPressAvatar = () => {
    if (isLogged) router.push('/(user)/profile');
    else setAskAuth(true);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          {/* Avatar + tên */}
          <View style={styles.userBlock}>
            <TouchableOpacity style={styles.avatar} onPress={onPressAvatar} activeOpacity={0.85}>
              <Ionicons name="person" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.subtle}>Xin chào,</Text>
              <Text style={styles.name}>{displayName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 3 quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => (isLogged ? router.push('/news') : setAskAuth(true))}
  >
    <Action
      icon={<Ionicons name="bulb-outline" size={22} color={COLORS.primary} />}
      label="Tin tức"
    />
  </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} onPress={goScan}>
            <Action icon={<MaterialCommunityIcons name="qrcode-scan" size={22} color={COLORS.primary} />} label="Quét mã" />
          </TouchableOpacity>

          <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => (isLogged ? router.push('/apply-biz') : setAskAuth(true))}
  >
    <Action
      icon={<Ionicons name="business-outline" size={22} color={COLORS.primary} />}
      label="Đăng ký DN"
    />
  </TouchableOpacity>
        </View>
      </View>

      {/* Popup đăng nhập/đăng ký — chỉ hiện khi chưa login */}
      <Modal visible={askAuth && !isLogged} transparent animationType="fade" onRequestClose={() => setAskAuth(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAskAuth(false)} />
        <View style={styles.modalRoot}>
          <View style={styles.sheet}>
            <View style={styles.illus}><Ionicons name="qr-code-outline" size={48} color="#6B7280" /></View>
            <Text style={styles.sheetTitle}>Bạn chưa có tài khoản QRCheck rồi</Text>
            <Text style={styles.sheetSub}>Đăng nhập để tận hưởng mọi tính năng của QRCheck nhé!</Text>
            <View style={styles.rowBtn}>
              <TouchableOpacity activeOpacity={0.9} style={styles.outlineBtn} onPress={goSignup}>
                <Text style={[styles.btnText, { color: COLORS.primary }]}>Đăng ký</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} style={styles.filledBtn} onPress={goLogin}>
                <Text style={[styles.btnText, { color: '#fff' }]}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.closeFab} onPress={() => setAskAuth(false)} activeOpacity={0.85}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  subtle: { color: COLORS.subtext },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secretText: { fontWeight: '800', color: '#1D4ED8' },

  divider: { height: 1, backgroundColor: '#EDEDED' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  actionItem: { alignItems: 'center', gap: 6 },
  iconWrap: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
  },
  dot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary, opacity: 0.12 },
  actionLabel: { fontSize: 12, color: COLORS.text },

  // modal
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalRoot: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  sheet: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, paddingBottom: 28, alignItems: 'center' },
  illus: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sheetSub: { color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  rowBtn: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  outlineBtn: { flex: 1, height: 46, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  filledBtn: { flex: 1, height: 46, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '800' },
  closeFab: { marginTop: 12, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
});
