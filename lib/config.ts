// lib/config.ts
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.160:5081').replace(/\/$/, '');
