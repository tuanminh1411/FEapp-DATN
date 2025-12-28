import React, { useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme';
import { askBot, ChatMsg } from '../lib/chat';

type Props = { open: boolean; onClose: () => void };

export default function ChatbotSheet({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'system',
      content:
        'Bạn là trợ lý cho ứng dụng QRCheck, trả lời ngắn gọn, tiếng Việt, về quét QR, truy xuất nguồn gốc, lịch sử quét, đăng ký doanh nghiệp…',
    },
    { role: 'assistant', content: 'Xin chào! Mình có thể giúp gì cho bạn về QRCheck?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text } as ChatMsg];
    setMessages(next);
    setLoading(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const reply = await askBot(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e: any) {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Xin lỗi, mình đang gặp sự cố kết nối. Bạn thử lại giúp mình nhé!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMsg }) => {
    if (item.role === 'system') return null;
    const mine = item.role === 'user';
    return (
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={{ color: mine ? '#fff' : COLORS.text }}>{item.content}</Text>
      </View>
    );
  };

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trợ lý QRCheck</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
          data={messages.filter(m => m.role !== 'system')}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {!!loading && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
            <ActivityIndicator />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Nhập câu hỏi của bạn…"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={send} style={styles.sendBtn} activeOpacity={0.9}>
            <Ionicons name="paper-plane" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary, paddingTop: 46, paddingBottom: 12, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  title: { color: '#fff', fontWeight: '800', fontSize: 18 },
  bubble: {
    maxWidth: '80%', borderRadius: RADIUS.lg, paddingHorizontal: 12, paddingVertical: 8, marginVertical: 6,
    alignSelf: 'flex-start',
  },
  mine: { backgroundColor: COLORS.primary, alignSelf: 'flex-end' },
  theirs: { backgroundColor: '#F3F4F6' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB',
  },
  input: { flex: 1, minHeight: 42, maxHeight: 120, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 12, color: COLORS.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});
