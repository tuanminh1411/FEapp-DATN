// lib/scan.api.ts
import { Platform } from 'react-native';
// Lưu ý: Đảm bảo bạn import đúng biến instance đã cấu hình ở file http.ts
// Nếu file http.ts của bạn export const http = ... thì đổi instance thành http
import { instance } from './http'; 
import { getAuthUser } from './auth'; 

export interface ScanPayload {
  maQr: string;
  nguoiDungId?: string | null;
  thietBi?: string;
  heDieuHanh?: string;
  viDo?: number;
  kinhDo?: number;
  diaChiGanDung?: string;
}

// Interface cho dữ liệu truyền từ màn hình Scan (khớp với scan.tsx)
export interface ScanMetadata {
  thietBi?: string;
  heDieuHanh?: string;
  viDo?: number;
  kinhDo?: number;
  diaChiGanDung?: string;
}

export const ScanApi = {
  /**
   * Gọi API kiểm tra mã QR
   * @param qrCode Mã QR vừa quét được
   * @param metadata (Tuỳ chọn) Thông tin thiết bị và vị trí từ màn hình Scan
   */
  checkQr: async (qrCode: string, metadata?: ScanMetadata) => {
    // 1. Lấy thông tin user hiện tại (nếu có)
    const user = await getAuthUser();

    // 2. Các giá trị mặc định nếu metadata không truyền vào
    const defaultDevice = `${Platform.OS} ${Platform.Version}`;
    const defaultOS = Platform.OS === 'ios' ? 'iOS' : 'Android';

    // 3. Chuẩn bị dữ liệu (Body)
    const payload: ScanPayload = {
      maQr: qrCode,
      nguoiDungId: user?.id || null, 
      
      // Ưu tiên lấy từ metadata truyền vào, nếu không có thì lấy mặc định
      thietBi: metadata?.thietBi || defaultDevice, 
      heDieuHanh: metadata?.heDieuHanh || defaultOS,
      viDo: metadata?.viDo || 0,
      kinhDo: metadata?.kinhDo || 0,
      diaChiGanDung: metadata?.diaChiGanDung || ''
    };

    console.log('📡 Sending Scan Payload:', payload);

    // 4. Gọi POST
    // Lưu ý: Endpoint này phải khớp với Controller trên Server (ví dụ: /api/LichSuQuet/scan hoặc /api/QrScan)
    return instance.post('/api/QrScan', payload);
  }
};