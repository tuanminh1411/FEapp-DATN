// lib/review.api.ts
import { instance } from "./http"; 

export interface Review {
  id: number;
  noiDung: string;
  soSao: number;
  ngayTao: string;
  nguoiDungTen: string; // Tên người review
  sanPhamId: number;
  sanPhamTen?: string; // Có thể cần map thêm tên sản phẩm nếu API không trả về
}

export const ReviewApi = {
  // GET: /api/DanhGiaSanPham/list Danh gia/{sanPhamId}
  getByProductId: (productId: number) => {
    return instance.get(`/DanhGiaSanPham/list Danh gia/${productId}`);
  },

  // POST: /api/DanhGiaSanPham/danh gia
  createReview: (data: { sanPhamId: number; noiDung: string; soSao: number }) => {
    return instance.post('/DanhGiaSanPham/danh gia', data);
  },

  // POST: /api/DanhGiaSanPham/{id}/like
  likeReview: (reviewId: number) => {
    return instance.post(`/DanhGiaSanPham/${reviewId}/like`);
  }
};