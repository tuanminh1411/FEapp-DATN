import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Nhánh người dùng */}
      <Stack.Screen name="(user)" options={{ headerShown: false }} />

      {/* Nhánh auth (login/register/forgot) */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />

      {/* Màn quét QR mở toàn màn hình dạng modal */}
      <Stack.Screen
        name="scan"
        options={{ presentation: 'fullScreenModal', headerShown: false }}
      />

      {/* Màn tìm kiếm dạng card (slide-in), ẩn header để tự custom */}
      <Stack.Screen
        name="search"
        options={{ presentation: 'card', headerShown: false }}
      />
    </Stack>
  );
}
