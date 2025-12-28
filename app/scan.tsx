import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert,
  TextInput, Modal, Animated, Easing, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../theme';

const { width: W, height: H } = Dimensions.get('window');
const FRAME_W = Math.min(W * 0.84, 0.84 * W);
const FRAME_H = Math.min(FRAME_W * 0.62, H * 0.35);
const SHEET_H = 360; // chiều cao tạm tính cho animation

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Camera
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const lastCode = useRef<string | null>(null);
  const reenableTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bottom sheet: Nhập mã tay
  const [openManual, setOpenManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const sheetY = useRef(new Animated.Value(SHEET_H)).current;

  const openSheet = () => {
    setOpenManual(true);
    requestAnimationFrame(() => {
      Animated.timing(sheetY, {
        toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true
      }).start();
    });
  };
  const closeSheet = () => {
    Animated.timing(sheetY, {
      toValue: SHEET_H, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true
    }).start(() => {
      setOpenManual(false);
      setManualCode('');
    });
  };

  // xin quyền ngay khi vào
  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission?.granted]);

  // clear timer khi rời màn
  useEffect(() => {
    return () => {
      if (reenableTimer.current) clearTimeout(reenableTimer.current);
    };
  }, []);

  const onClose = () => {
    // nếu không có màn để quay lại thì đưa về Home
    // (expo-router có router.canGoBack() từ v3)
    // @ts-ignore
    if (router.canGoBack?.()) router.back();
    else router.replace('/');
  };

  const onPickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) {
      Alert.alert('Ảnh đã chọn', 'Bạn có thể giải mã QR/Barcode từ ảnh này.');
      // TODO: triển khai decode từ ảnh nếu cần
    }
  };

  const onScanned = useCallback(
    (res: BarcodeScanningResult) => {
      if (!scanningEnabled) return;
      const value = res?.data;
      if (!value) return;
      if (lastCode.current === value) return;

      lastCode.current = value;
      setScanningEnabled(false);

      Alert.alert('Đã quét', value, [
        {
          text: 'OK',
          onPress: () => {
            // bật lại sau 1.2s để tránh quét liên tục
            reenableTimer.current && clearTimeout(reenableTimer.current);
            reenableTimer.current = setTimeout(() => setScanningEnabled(true), 1200);
          },
        },
      ]);
    },
    [scanningEnabled]
  );

  const mask = useMemo(() => {
    const sideW = (W - FRAME_W) / 2;
    const topH = (H - FRAME_H) / 2;
    return { sideW, topH };
  }, []);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 24 }]}>
        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>
          Ứng dụng cần quyền camera để quét mã
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Cho phép truy cập camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={onClose}>
          <Text style={{ color: COLORS.primary }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanningEnabled ? onScanned : undefined}
        zoom={0}
      />

      {/* top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.topBtn}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={openSheet} style={styles.manualBtn} activeOpacity={0.9}>
          <MaterialCommunityIcons name="keyboard-outline" size={18} color="#fff" />
          <Text style={styles.manualTxt}>Nhập mã bằng tay</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity onPress={() => Alert.alert('Trợ giúp', 'Hướng dẫn quét mã.')} style={styles.topBtn}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTorch(t => !t)} style={styles.topBtn}>
            <Ionicons name={torch ? 'flash' : 'flash-off'} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mask + Frame */}
      <View style={[styles.maskRow, { height: mask.topH }]} />
      <View style={styles.scanRow}>
        <View style={[styles.maskSide, { width: mask.sideW }]} />
        <View style={styles.frame}>
          <Ionicons name="add" size={48} color="#fff" />
          <View style={[styles.corner, styles.cTopLeft]} />
          <View style={[styles.corner, styles.cTopRight]} />
          <View style={[styles.corner, styles.cBotLeft]} />
          <View style={[styles.corner, styles.cBotRight]} />
        </View>
        <View style={[styles.maskSide, { width: mask.sideW }]} />
      </View>
      <View style={[styles.maskRow, { flex: 1 }]} />

      {/* Nút chọn ảnh ngay dưới khung */}
      <View style={[styles.imageBtnWrap, { top: mask.topH + FRAME_H + 16 }]}>
        <TouchableOpacity onPress={onPickImage} style={styles.outlineBtn} activeOpacity={0.9}>
          <MaterialCommunityIcons name="image-multiple-outline" size={18} color="#fff" />
          <Text style={styles.outlineTxt}>Sử dụng hình ảnh có sẵn</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet: Nhập mã bằng tay */}
      <Modal visible={openManual} transparent animationType="none" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet} />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 12, transform: [{ translateY: sheetY }] },
          ]}
        >
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={closeSheet} style={{ padding: 6 }}>
              <Ionicons name="close" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Nhập mã bằng tay</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={{ paddingHorizontal: 18, marginTop: 8 }}>
            <TextInput
              value={manualCode}
              onChangeText={t => setManualCode(t.replace(/[^\d]/g, ''))} // CHỈ NHẬP SỐ
              keyboardType="number-pad"
              placeholder="Nhập mã sản phẩm"
              placeholderTextColor="#BDBDBD"
              style={styles.input}
              maxLength={40}
            />
            <Text style={styles.tip}>Nhập mã được in trên sản phẩm</Text>

            <TouchableOpacity
              activeOpacity={manualCode ? 0.9 : 1}
              onPress={() => {
                if (!manualCode) return;
                closeSheet();
                Alert.alert('Check mã', manualCode);
              }}
              style={[styles.checkBtn, { backgroundColor: manualCode ? COLORS.primary : '#D1D5DB' }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Check mã</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topBar: {
    position: 'absolute',
    left: 12, right: 12, top: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    zIndex: 50, elevation: 50,
  },
  topBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)' },

  manualBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, height: 44, borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  manualTxt: { color: '#fff', fontWeight: '700' },

  // mask
  maskRow: { backgroundColor: 'rgba(0,0,0,0.45)' },
  scanRow: { flexDirection: 'row', alignItems: 'center' },
  maskSide: { height: FRAME_H, backgroundColor: 'rgba(0,0,0,0.45)' },
  frame: { width: FRAME_W, height: FRAME_H, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#fff' },
  cTopLeft: { left: -2, top: -2, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 6 },
  cTopRight:{ right:-2, top:-2, borderRightWidth:4, borderTopWidth:4, borderTopRightRadius:6 },
  cBotLeft: { left:-2, bottom:-2, borderLeftWidth:4, borderBottomWidth:4, borderBottomLeftRadius:6 },
  cBotRight:{ right:-2, bottom:-2, borderRightWidth:4, borderBottomWidth:4, borderBottomRightRadius:6 },

  imageBtnWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16, height: 44, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  outlineTxt: { color: '#fff', fontWeight: '700' },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16, height: 44, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },

  // sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  sheetTitle: { flex: 1, textAlign: 'center', color: COLORS.primary, fontSize: 18, fontWeight: '700' },

  input: {
    height: 48, borderBottomWidth: 1.5, borderBottomColor: '#D1D5DB',
    fontSize: 20, fontWeight: '700', color: '#111827',
  },
  tip: { color: '#6B7280', marginTop: 12, textAlign: 'center' },
  checkBtn: { marginTop: 16, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
});
