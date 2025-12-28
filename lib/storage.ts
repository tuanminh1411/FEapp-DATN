import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'qrcheck.user';      // lưu full object user
const USER_ID_KEY = 'qrcheck.userId'; // lưu riêng id cho tiện

export async function saveUser(user: any) {
  await AsyncStorage.multiSet([
    [USER_KEY, JSON.stringify(user)],
    [USER_ID_KEY, String(user?.id ?? '')],
  ]);
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function getUserId() {
  return AsyncStorage.getItem(USER_ID_KEY);
}

export async function clearUser() {
  await AsyncStorage.multiRemove([USER_KEY, USER_ID_KEY]);
}
