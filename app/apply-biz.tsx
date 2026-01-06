import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ToastAndroid, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { COLORS, RADIUS, SP } from '../theme';

// ⚠️ ĐỔI BASE theo IP/port của bạn
const BASE = 'http://192.168.1.160:5081';
const APPLY_URL = `${BASE}/api/YeuCauDangKyDn`;

export default function ApplyBiz() {
  const router = useRouter();

  const [tenDoanhNghiep, setTenDoanhNghiep] = useState('');
  const [maSoThue, setMaSoThue] = useState('');
  const [email, setEmail] = useState('');
  const [dienThoai, setDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [loading, setLoading] = useState(false);

  const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = !dienThoai || /^[0-9]{8,15}$/.test(dienThoai);
  const canSubmit =
    !!tenDoanhNghiep.trim() &&
    (!!email.trim() || !!dienThoai.trim()) &&
    emailOk && phoneOk &&
    !!diaChi.trim();

  const submit = async () => {
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      const payload = { tenDoanhNghiep, maSoThue, email, dienThoai, diaChi };
      const res = await axios.post(APPLY_URL, payload);

      const ok = res?.data?.success !== false; // nhiều API trả success/không
      const msg = res?.data?.message || 'Gửi yêu cầu thành công. Hệ thống sẽ xét duyệt sớm!';
      if (ok) {
        if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.LONG);
        else Alert.alert('Thành công', msg);

        setTimeout(() => router.back(), 1500);
      } else {
        if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
        else Alert.alert('Thông báo', msg);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
      else Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký trở thành Doanh nghiệp</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg, paddingBottom: 36 }}>
        <Text style={styles.help}>
          Điền thông tin bên dưới. Tối thiểu cần <Text style={{ fontWeight: '800' }}>Tên doanh nghiệp</Text> và{' '}
          <Text style={{ fontWeight: '800' }}>Email hoặc SĐT</Text>.
        </Text>

        <Field label="Tên doanh nghiệp *">
          <TextInput
            value={tenDoanhNghiep}
            onChangeText={setTenDoanhNghiep}
            style={styles.input}
            placeholder="Công ty TNHH ABC"
            placeholderTextColor="#9CA3AF"
          />
        </Field>

        <Field label="Mã số thuế">
          <TextInput
            value={maSoThue}
            onChangeText={setMaSoThue}
            style={styles.input}
            placeholder="0100xxxxxxx"
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
        </Field>

        <Field label="Email">
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={[styles.input, !emailOk && styles.inputError]}
            placeholder="contact@company.vn"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
          {!emailOk && <Text style={styles.err}>Email không hợp lệ</Text>}
        </Field>

        <Field label="Điện thoại">
          <TextInput
            value={dienThoai}
            onChangeText={(t) => setDienThoai(t.replace(/[^\d]/g, ''))}
            style={[styles.input, !phoneOk && styles.inputError]}
            placeholder="0912345678"
            keyboardType="number-pad"
            placeholderTextColor="#9CA3AF"
          />
          {!phoneOk && <Text style={styles.err}>Số điện thoại không hợp lệ</Text>}
        </Field>

        <Field label="Địa chỉ *">
          <TextInput
            value={diaChi}
            onChangeText={setDiaChi}
            style={styles.input}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            placeholderTextColor="#9CA3AF"
          />
        </Field>

        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit || loading}
          style={[
            styles.primaryBtn,
            (!canSubmit || loading) && { backgroundColor: '#D1D5DB' },
          ]}
          activeOpacity={0.9}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {loading ? 'Đang gửi…' : 'Gửi yêu cầu'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 18, paddingBottom: 14, paddingHorizontal: SP.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '800', fontSize: 16 },
  label: { color: COLORS.text, marginBottom: 6, fontWeight: '700' },
  input: {
    height: 48, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: RADIUS.lg,
    paddingHorizontal: 12, color: COLORS.text, backgroundColor: '#fff',
  },
  inputError: { borderColor: '#ef4444' },
  err: { marginTop: 4, color: '#ef4444' },
  help: { color: '#6B7280', marginBottom: 12 },
  primaryBtn: {
    height: 48, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
});
