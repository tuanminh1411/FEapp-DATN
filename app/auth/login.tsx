// app/auth/login.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ToastAndroid, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

// ĐỔI IP NÀY THEO MẠNG CỦA BẠN
const BASE = 'http://192.168.1.154:5081';
const LOGIN_URL = `${BASE}/api/Auth/login`;

export default function Login() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [emailOrPhone, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const canLogin = emailOrPhone.trim().length > 0 && pass.length >= 4;

  const notify = (msg: string, long = false) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, long ? ToastAndroid.LONG : ToastAndroid.SHORT);
    } else {
      Alert.alert('', msg);
    }
  };

  const handleLogin = async () => {
    if (!canLogin || loading) return;

    try {
      setLoading(true);

      const res = await axios.post(
        LOGIN_URL,
        { emailOrPhone: emailOrPhone.trim(), matKhau: pass },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const ok = res?.data?.success ?? false;

      if (!ok) {
        notify(res?.data?.message || 'Đăng nhập thất bại.');
        return;
      }


      const box = res.data.data ?? res.data;
      const user = box.user ?? {};
      const token = box.token ?? null;
      const userId = user.id ?? user.userId ?? null;
      const expiresAt = box.expiresAt ?? '';

      const roles: string[] = user.roles ?? [];


      // Lưu trữ
      await AsyncStorage.multiSet([
        ['auth_user', JSON.stringify(user)],
        ['auth_roles', JSON.stringify(roles)],
        ['auth_token', token ? String(token) : ''],
        ['auth_userId', userId ? String(userId) : ''],
        ['auth_expires', String(expiresAt || '')],
      ]);

      // Thông báo 3s rồi về Trang chủ
      notify(res.data.message || 'Đăng nhập thành công.', true);
      setTimeout(() => {
        router.replace('/');
      }, 1000);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Không thể đăng nhập. Vui lòng thử lại.';
      notify(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Green header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.brand}>QRCheck</Text>

        <View style={styles.tabRow}>
          <Text style={[styles.tabActive]}>Đăng nhập</Text>
          <TouchableOpacity onPress={() => router.replace('/auth/register')}>
            <Text style={styles.tabInactive}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* White card */}
      <View style={styles.card}>
        {/* Email */}
        <TextInput
          value={emailOrPhone}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Nhập email"
          placeholderTextColor="#B3B8C2"
          style={styles.input}
        />

        {/* Password */}
        <View style={{ position: 'relative' }}>
          <TextInput
            value={pass}
            onChangeText={setPass}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#B3B8C2"
            secureTextEntry={!showPass}
            style={[styles.input, { paddingRight: 44 }]}
          />
          <TouchableOpacity onPress={() => setShowPass(s => !s)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye' : 'eye-off'} size={22} color="#9AA3AF" />
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          disabled={!canLogin || loading}
          onPress={handleLogin}
          style={[
            styles.primaryBtn,
            (!canLogin || loading) && { backgroundColor: '#D1D5DB' },
          ]}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>

        {/* Links */}
        <View style={styles.linksRow}>
          <Text style={styles.linkText}>Quên mật khẩu</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.linkText}>Bạn gặp vấn đề về đăng nhập?</Text>
        </View>

        {/* OTP (mock) */}
        <TouchableOpacity style={styles.ghostBtn}>
          <Text style={[styles.primaryBtnText, { color: COLORS.primary }]}>
            Đăng nhập bằng OTP
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.hrWrap}>
          <View style={styles.hr} />
          <Text style={styles.hrText}>Hoặc đăng nhập bằng</Text>
          <View style={styles.hr} />
        </View>

        {/* Facebook button (mock) */}
        <TouchableOpacity style={styles.fbBtn}>
          <Ionicons name="logo-facebook" size={20} color="#000" />
          <Text style={{ marginLeft: 8, fontWeight: '600' }}>Facebook</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const R = 20;
const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: R,
  },
  headerIcon: { position: 'absolute', top: 20, left: 14, padding: 6, zIndex: 2 },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 50 },
  tabRow: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' },
  tabActive: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tabInactive: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '700' },

  card: { marginTop: 12, borderTopLeftRadius: R, borderTopRightRadius: R, backgroundColor: '#fff', padding: 20, flex: 1 },
  input: { height: 52, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 22, fontSize: 16, color: '#111827' },
  eyeBtn: { position: 'absolute', right: 4, top: 12, padding: 8 },

  primaryBtn: { height: 48, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 14 },
  linkText: { color: '#9AA3AF' },
  dot: { marginHorizontal: 8, color: '#9AA3AF' },

  ghostBtn: { height: 46, borderWidth: 1.2, borderColor: COLORS.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  hrWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  hr: { height: 1, backgroundColor: '#E5E7EB', flex: 1 },
  hrText: { marginHorizontal: 8, color: '#9AA3AF' },

  fbBtn: {
    alignSelf: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
