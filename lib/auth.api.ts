// lib/auth.api.ts
import { http } from './http';

export type RegisterDto = {
  hoTen: string;
  email: string;
  dienThoai: string;
  matKhau: string;
  xacNhanMatKhau: string;
};

export const AuthApi = {
  register(body: RegisterDto) {
    return http.post('/api/Auth/register-consumer', body);
  },
  // login(body: { tenDangNhapHoacEmail: string; matKhau: string }) {
  //   return http.post('/api/Auth/login', body);
  // },
};
