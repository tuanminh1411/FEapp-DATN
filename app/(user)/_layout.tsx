import { Tabs } from 'expo-router';
import BottomBar from '../../components/BottomBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => <BottomBar />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="reviews" options={{ title: 'Đánh giá' }} />
      <Tabs.Screen name="history" options={{ title: 'Lịch sử' }} />
      <Tabs.Screen name="messages" options={{ title: 'Tin nhắn' }} />
    </Tabs>
  );
}
