// app/scan.tsx
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert,
  TextInput, Modal, Animated, Easing, Pressable, Linking, ActivityIndicator, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../theme';
import { ScanApi } from '../lib/scan.api'; 

const { width: W, height: H } = Dimensions.get('window');
const FRAME_W = Math.min(W * 0.84, 0.84 * W);
const FRAME_H = Math.min(FRAME_W * 0.62, H * 0.35);
const SHEET_H = 360;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Permissions ---
  const [permission, requestPermission] = useCameraPermissions();

  // --- State ---
  const [torch, setTorch] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [processing, setProcessing] = useState(false); 

  const lastCode = useRef<string | null>(null);
  const reenableTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Bottom Sheet ---
  const [openManual, setOpenManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const sheetY = useRef(new Animated.Value(SHEET_H)).current;

  // --- 1. HÀM THU THẬP METADATA ---
  const getScanMetadata = async () => {
    return {
      thietBi: Device.modelName || (Platform.OS === 'ios' ? 'iPhone' : 'Android'),
      heDieuHanh: `${Platform.OS} ${Platform.Version}`,
      viDo: 0, 
      kinhDo: 0, 
      diaChiGanDung: ''
    };
  };

  // --- 2. LOGIC XỬ LÝ QUÉT MÃ ---
  const handleCodeProcess = async (code: string) => {
    if (!code) return;
    
    setScanningEnabled(false); 
    setProcessing(true);       

    // Ưu tiên check ID trực tiếp (UUID)
    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
    
    if (isGuid) {
        console.log('🎯 Phát hiện ID sản phẩm trực tiếp:', code);
        router.push(`/product/${code}`);
        
        setTimeout(() => {
           setScanningEnabled(true);
           setProcessing(false);
           lastCode.current = null;
        }, 1500);
        return;
    }

    try {
      const metadata = await getScanMetadata();
      console.log('📡 Đang gửi mã lên Server:', code);
      
      const res = await ScanApi.checkQr(code, metadata); 
      const product = res.data; 

      if (product && product.id) {
        router.push(`/product/${product.id}`);
        
        setTimeout(() => {
           setScanningEnabled(true);
           setProcessing(false);
           lastCode.current = null;
        }, 1500);
      } else {
        throw new Error('Không tìm thấy ID sản phẩm');
      }

    } catch (error: any) {
      console.log('❌ Lỗi:', error);
      setProcessing(false);
      showGenericResult(code);
    }
  };

  const showGenericResult = (code: string) => {
    const isUrl = code.startsWith('http://') || code.startsWith('https://');

    Alert.alert(
      'Kết quả quét', 
      `Mã: ${code}\n\n(Sản phẩm này chưa có trên hệ thống QRCheck)`,
      [
        {
          text: 'Đóng',
          style: 'cancel',
          onPress: () => {
            reenableTimer.current = setTimeout(() => {
               setScanningEnabled(true);
               lastCode.current = null;
            }, 1500);
          }
        },
        isUrl ? {
          text: 'Truy cập Link',
          onPress: () => {
             Linking.openURL(code);
             setScanningEnabled(true);
             lastCode.current = null;
          }
        } : null
      ].filter(Boolean) as any
    );
  };

  // --- Event Handlers ---
  const onScanned = useCallback((res: BarcodeScanningResult) => {
      if (!scanningEnabled || processing) return;
      const value = res?.data;
      if (!value || lastCode.current === value) return;

      lastCode.current = value;
      handleCodeProcess(value); 
    },
    [scanningEnabled, processing]
  );

  const onManualSubmit = () => {
    if (!manualCode) return;
    closeSheet();
    handleCodeProcess(manualCode);
  };

  // --- Animation Sheet ---
  const openSheet = () => {
    setOpenManual(true);
    requestAnimationFrame(() => {
      Animated.timing(sheetY, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };
  const closeSheet = () => {
    Animated.timing(sheetY, { toValue: SHEET_H, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setOpenManual(false); setManualCode('');
    });
  };

  // --- Effects ---
  useEffect(() => { 
      if (permission && !permission.granted) requestPermission(); 
  }, [permission?.granted]);

  useEffect(() => () => { if (reenableTimer.current) clearTimeout(reenableTimer.current); }, []);
  
  const onClose = () => { if (router.canGoBack()) router.back(); else router.replace('/'); };

  const onPickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled) {
        Alert.alert('Thông báo', 'Tính năng đọc QR từ ảnh đang được cập nhật.');
    }
  };

  const mask = useMemo(() => {
    const sideW = (W - FRAME_W) / 2;
    const topH = (H - FRAME_H) / 2;
    return { sideW, topH };
  }, []);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 24 }]}>
        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>Cần quyền camera để quét mã</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}><Text style={{ color: '#fff', fontWeight: '700' }}>Cho phép Camera</Text></TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 16 }} onPress={onClose}><Text style={{ color: COLORS.primary }}>Đóng</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={(scanningEnabled && !processing) ? onScanned : undefined}
      />

      {/* Loading Overlay */}
      {processing && (
        <View style={styles.loadingOverlay}>
           <View style={styles.loadingBox}>
               <ActivityIndicator size="large" color="#fff" />
               <Text style={styles.loadingText}>Đang xử lý...</Text>
           </View>
        </View>
      )}

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.topBtn}>
            <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={openSheet} style={styles.manualBtn} activeOpacity={0.9}>
          <MaterialCommunityIcons name="keyboard-outline" size={18} color="#fff" />
          <Text style={styles.manualTxt}>Nhập mã</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTorch(t => !t)} style={styles.topBtn}>
            <Ionicons name={torch ? 'flash' : 'flash-off'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Camera Mask UI */}
      <View style={[styles.maskRow, { height: mask.topH }]} />
      <View style={styles.scanRow}>
        <View style={[styles.maskSide, { width: mask.sideW }]} />
        <View style={styles.frame}>
          <Ionicons name="scan-outline" size={48} color="rgba(255,255,255,0.3)" />
          {/* Đã sửa lỗi khoảng trắng ở đây bằng cách xuống dòng rõ ràng */}
          <View style={[styles.corner, styles.cTopLeft]} />
          <View style={[styles.corner, styles.cTopRight]} />
          <View style={[styles.corner, styles.cBotLeft]} />
          <View style={[styles.corner, styles.cBotRight]} />
        </View>
        <View style={[styles.maskSide, { width: mask.sideW }]} />
      </View>
      <View style={[styles.maskRow, { flex: 1 }]} />

      {/* Bottom Actions */}
      <View style={[styles.imageBtnWrap, { top: mask.topH + FRAME_H + 20 }]}>
        <Text style={{color: 'rgba(255,255,255,0.8)', marginBottom: 16, fontSize: 13}}>Di chuyển camera đến vùng chứa mã QR</Text>
        <TouchableOpacity onPress={onPickImage} style={styles.outlineBtn} activeOpacity={0.9}>
          <MaterialCommunityIcons name="image-area" size={20} color="#fff" />
          <Text style={styles.outlineTxt}>Tải ảnh từ thư viện</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Input Sheet */}
      <Modal visible={openManual} transparent animationType="none" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet} />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 12, transform: [{ translateY: sheetY }] }]}>
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={closeSheet} style={{ padding: 6 }}>
                <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Nhập mã sản phẩm</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={{ paddingHorizontal: 18, marginTop: 16 }}>
            <TextInput
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Nhập mã in trên bao bì..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              autoFocus={openManual}
              keyboardType="default"
            />
            <TouchableOpacity onPress={onManualSubmit} style={[styles.checkBtn, { backgroundColor: manualCode ? COLORS.primary : '#E5E7EB' }]} disabled={!manualCode}>
              <Text style={{ color: manualCode ? '#fff' : '#9CA3AF', fontWeight: '700', fontSize: 16 }}>Kiểm tra ngay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937' },
  
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  loadingBox: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, borderRadius: 12, alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontWeight:'600', fontSize: 14 },

  topBar: { position: 'absolute', left: 16, right: 16, top: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  
  manualBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  manualTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },

  maskRow: { backgroundColor: 'rgba(0,0,0,0.6)' },
  scanRow: { flexDirection: 'row', alignItems: 'center' },
  maskSide: { height: FRAME_H, backgroundColor: 'rgba(0,0,0,0.6)' },
  
  frame: { width: FRAME_W, height: FRAME_H, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: COLORS.primary },
  cTopLeft: { left: -2, top: -2, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 4 },
  cTopRight:{ right:-2, top:-2, borderRightWidth:4, borderTopWidth:4, borderTopRightRadius: 4 },
  cBotLeft: { left:-2, bottom:-2, borderLeftWidth:4, borderBottomWidth:4, borderBottomLeftRadius: 4 },
  cBotRight:{ right:-2, bottom:-2, borderRightWidth:4, borderBottomWidth:4, borderBottomRightRadius: 4 },

  imageBtnWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 20, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.2)' },
  outlineTxt: { color: '#fff', fontWeight: '600' },
  
  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', justifyContent: 'space-between' },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  
  input: { height: 50, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', fontSize: 18, fontWeight: '600', color: '#111827' },
  checkBtn: { marginTop: 20, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});