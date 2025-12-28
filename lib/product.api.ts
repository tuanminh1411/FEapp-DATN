// lib/product.api.ts
import { http } from './http';

// 1. Định nghĩa kiểu dữ liệu dựa trên ảnh JSON bạn gửi
export interface Product {
  id: string;
  ten: string;              // "Trà bí đao"
  maSanPham: string;        // "001"
  moTa?: string;            // "1111..."
  hinhAnhUrl?: string;      // Link ảnh Firebase
  tieuChuanApDung?: string; // "VietGAP"
  gia?: number;             // Trong ảnh JSON chưa thấy giá, tôi để tạm optional
}

export const ProductApi = {
  // Lấy danh sách sản phẩm
  getAll: () => {
    return http.get<Product[]>('/api/SanPhams');
  },

  // Lấy chi tiết (Dự đoán endpoint dựa trên chuẩn REST)
  getDetail: (id: string) => {
    return http.get<Product>(`/api/SanPhams/${id}`);
  }
};