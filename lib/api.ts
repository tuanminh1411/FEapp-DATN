import axios from 'axios';

export const API_BASE = 'http://192.168.1.160:5081';
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export default api;
