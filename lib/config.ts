// lib/config.ts
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://172.17.163.80:5081').replace(/\/$/, '');
