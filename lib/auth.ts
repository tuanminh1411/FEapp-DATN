// lib/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthUser = {
  id: string;
  hoTen: string;
  email?: string;
  dienThoai?: string;
  createdAt?: string;
};

type AuthBundle = { token?: string | null; user: AuthUser | null };

const KEY = 'qrcheck.auth';   // { token, user }
const KEY_USER = 'auth_user'; // user/plain — để tương thích code cũ

// --- Tiny emitter (thay cho Node 'events')
type Listener = (user: AuthUser | null) => void;
const listeners = new Set<Listener>();
const notify = (user: AuthUser | null) => {
  listeners.forEach(fn => fn(user));
};

// Subscribe / Unsubscribe
export function subscribeAuth(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Lấy user hiện tại
export async function getAuthUser(): Promise<AuthUser | null> {
  // ưu tiên KEY_USER
  const rawUser = await AsyncStorage.getItem(KEY_USER);
  if (rawUser) {
    try { return JSON.parse(rawUser) as AuthUser; } catch {}
  }
  // fallback KEY
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const b = JSON.parse(raw) as AuthBundle;
    return b?.user ?? null;
  } catch {
    return null;
  }
}

// Lưu trạng thái đăng nhập (từ response login)
export async function setAuth(user: AuthUser, token?: string | null) {
  const bundle: AuthBundle = { token: token ?? null, user };
  await AsyncStorage.setItem(KEY, JSON.stringify(bundle));
  await AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
  notify(user);
}

// Xoá đăng nhập
export async function clearAuth() {
  await AsyncStorage.multiRemove([KEY, KEY_USER]);
  notify(null);
}

// Helper tiện lợi
export async function isLoggedIn(): Promise<boolean> {
  return (await getAuthUser()) != null;
}
