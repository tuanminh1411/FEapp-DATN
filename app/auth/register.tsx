// app/auth/register.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../theme';
import { AuthApi } from '../../lib/auth.api';

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [p1, setP1]             = useState('');
  const [p2, setP2]             = useState('');
  const [show1, setShow1]       = useState(false);
  const [show2, setShow2]       = useState(false);
  const [loading, setLoading]   = useState(false);

  // toast
  const [toast, setToast] = useState<{type:'success'|'error'; message:string} | null>(null);
  const fade = useState(new Animated.Value(0))[0];

  const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const canNext = useMemo(
    () => fullName.trim().length >= 2 && isEmail(email) && phone.length >= 9 && p1.length >= 4 && p1 === p2,
    [fullName, email, phone, p1, p2]
  );

  const showToast = (type:'success'|'error', message:string, ms=3000, onHide?: ()=>void) => {
    setToast({ type, message });
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setToast(null);
        onHide?.();
      });
    }, ms);
  };

  const onSubmit = async () => {
    if (!canNext || loading) return;
    setLoading(true);
    try {
      const { data } = await AuthApi.register({
        hoTen: fullName.trim(),
        email: email.trim(),
        dienThoai: phone.trim(),
        matKhau: p1,
        xacNhanMatKhau: p2,
      });

      // lấy message từ API (nếu có)
      const msg = (typeof data === 'object' && (data?.message || data?.Message)) || 'Đăng ký thành công.';
      showToast('success', msg, 3000, () => router.replace('/auth/login'));
    } catch (err: any) {
      showToast('error', err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.brand}>QRCheck</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={styles.tabInactive}>Đăng nhập</Text>
          </TouchableOpacity>
          <Text style={styles.tabActive}>Đăng ký</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <TextInput
          style={styles.inputLine}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ tên"
          placeholderTextColor="#B3B8C2"
        />

        <TextInput
          style={styles.inputLine}
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập email"
          placeholderTextColor="#B3B8C2"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.countryRow}>
          <Text style={{ color: '#6B7280' }}>Việt Nam</Text>
          <Ionicons name="chevron-forward" size={18} color="#9AA3AF" />
        </TouchableOpacity>

        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+84</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="number-pad"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^\d]/g, ''))}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#B3B8C2"
            maxLength={11}
          />
        </View>

        <View style={{ position: 'relative' }}>
          <TextInput
            style={[styles.input, styles.inputUnderline, { paddingRight: 44 }]}
            value={p1}
            onChangeText={setP1}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#B3B8C2"
            secureTextEntry={!show1}
          />
          <TouchableOpacity onPress={() => setShow1(s => !s)} style={styles.eyeBtn}>
            <Ionicons name={show1 ? 'eye' : 'eye-off'} size={22} color="#9AA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ position: 'relative' }}>
          <TextInput
            style={[styles.input, styles.inputUnderline, { paddingRight: 44 }]}
            value={p2}
            onChangeText={setP2}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#B3B8C2"
            secureTextEntry={!show2}
          />
          <TouchableOpacity onPress={() => setShow2(s => !s)} style={styles.eyeBtn}>
            <Ionicons name={show2 ? 'eye' : 'eye-off'} size={22} color="#9AA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={!canNext || loading}
          onPress={onSubmit}
          style={[styles.primaryBtn, (!canNext || loading) && { backgroundColor: '#D1D5DB' }]}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Tiếp tục</Text>}
        </TouchableOpacity>
      </View>

      {/* Toast */}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange:[0,1], outputRange:[-10,0] }) }] }
          ]}
        >
          <Ionicons
            name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#fff', fontWeight: '700' }}>{toast.message}</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const R = 16;
const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.primary, paddingTop: 20, paddingBottom: 30, borderBottomLeftRadius: R, borderBottomRightRadius: R },
  headerIcon: { position: 'absolute', top: 20, left: 14, padding: 6, zIndex: 2 },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 50 },
  tabRow: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' },
  tabActive: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tabInactive: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '700' },

  card: { marginTop: 12, borderTopLeftRadius: R, borderTopRightRadius: R, backgroundColor: '#fff', padding: 20, flex: 1 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 12, color: '#111827' },

  inputLine: { height: 52, fontSize: 16, color: '#111827', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  countryRow: { height: 48, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 52, marginBottom: 8 },
  prefix: { width: 48, color: '#6B7280' },

  input: { height: 52, fontSize: 16, color: '#111827' },
  inputUnderline: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  eyeBtn: { position: 'absolute', right: 4, top: 12, padding: 8 },

  primaryBtn: { height: 48, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  toast: { position: 'absolute', top: 44, left: 18, right: 18, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  toastSuccess: { backgroundColor: '#16a34a' },
  toastError: { backgroundColor: '#dc2626' },
});
