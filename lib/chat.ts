// lib/chat.ts
import axios from 'axios';

export const BASE = 'http://172.17.163.80:5081'; // thay bằng IPv4 máy bạn
export const CHAT_URL = `${BASE}/api/Chat/ask`;

export type ChatMsg = { role: 'user'|'assistant'|'system'; content: string };

export async function askBot(messages: ChatMsg[]) {
  const res = await axios.post(CHAT_URL, { messages });
  // BE trả về { reply: string }
  return String(res.data?.reply ?? '');
}
