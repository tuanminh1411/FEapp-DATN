// lib/review.api.ts
import { instance } from "./http";

// --- THÊM PHẦN NÀY ---
export interface Review {
  id: string; // Hoặc number tùy DB của bạn
  sanPhamId: string;
  nguoiDungId: string;
  nguoiDungTen?: string; // Tên người dùng (nếu API trả về)
  soSao: number;
  noiDung: string;
  ngayTao: string;
  sanPhamTen?: string; // Tên sản phẩm (nếu API trả về hoặc map thêm ở FE)
}

export interface ReviewPayload {
  sanPhamId: string;
  nguoiDungId: string;
  soSao: number;
  noiDung: string;
}

export const ReviewApi = {
  // GET: Lấy danh sách đánh giá
  getByProductId: (productId: number | string) => {
    return instance.get(`/api/DanhGiaSanPham/list Danh gia/${productId}`);
  },

  // POST: Gửi đánh giá
  createReview: (payload: ReviewPayload) => {
    return instance.post('/api/DanhGiaSanPham/danh gia', payload);
  },

  // POST: Like đánh giá
  likeReview: (reviewId: string | number) => {
    return instance.post(`/api/DanhGiaSanPham/${reviewId}/like`);
  }
};