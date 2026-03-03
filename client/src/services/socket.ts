import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(conversationId: string, content: string) {
    this.socket?.emit('send_message', { conversationId, content });
  }

  sendVoice(conversationId: string, transcript: string) {
    this.socket?.emit('send_voice', { conversationId, transcript });
  }

  onMessage(callback: (message: Message) => void) {
    this.socket?.on('message', callback);
  }

  onTyping(callback: (data: { isTyping: boolean }) => void) {
    this.socket?.on('typing', callback);
  }

  onVoiceResponse(callback: (data: { text: string; messageId: string }) => void) {
    this.socket?.on('voice_response', callback);
  }

  offMessage() {
    this.socket?.off('message');
  }

  offTyping() {
    this.socket?.off('typing');
  }

  offVoiceResponse() {
    this.socket?.off('voice_response');
  }
}

export const socketService = new SocketService();
