// lib/http.ts
import axios from 'axios';
import { API_URL } from './config';

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// (tuỳ chọn) gắn token nếu có
http.interceptors.request.use(async (config) => {
  // const token = await SecureStore.getItemAsync('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Chuẩn hoá lỗi để dễ hiện ra UI
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    let message =
      (typeof data === 'string' && data) ||
      data?.message ||
      error?.message ||
      `HTTP ${status || ''}`;

    return Promise.reject(new Error(message));
  }
);
