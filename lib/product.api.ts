// lib/product.api.ts
import { http } from './http';

// 1. Định nghĩa kiểu dữ liệu dựa trên ảnh JSON bạn gửi
export interface Product {
  id: string;
  ten: string;              
  maSanPham: string;        
  moTa?: string;            
  hinhAnhUrl?: string;      
  tieuChuanApDung?: string; 
  gia?: number;             
  tenDoanhNghiep?: string; 
  doanhNghiepId?: string; 
}

// Định nghĩa response bọc ngoài của API
interface ApiResponse {
  success: boolean;
  message: string;
  data: Product[]; // Mảng sản phẩm nằm ở đây
}

export const ProductApi = {
  getAll: async () => {
    // Gọi API
    const res = await http.get<ApiResponse>('/api/Trangchu/list_all_san_pham');
    // Quan trọng: Trả về res.data (Axios response body)
    // Lúc dùng ở index.tsx sẽ cần chọc thêm 1 lớp .data nữa hoặc xử lý tại đây
    return res; 
  },
  
  getDetail: (id: string) => {
    return http.get<Product>(`/api/SanPhams/${id}`);
  }
};