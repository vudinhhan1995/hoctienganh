import axios from 'axios';
import type { User, Conversation, Lesson, UserProgress, Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, name: string, level?: string) => {
  const response = await api.post('/auth/register', { email, password, name, level });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Conversations
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getConversation = async (id: string): Promise<Conversation> => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};

export const createConversation = async (topic: string): Promise<Conversation> => {
  const response = await api.post('/conversations', { topic });
  return response.data;
};

export const deleteConversation = async (id: string) => {
  const response = await api.delete(`/conversations/${id}`);
  return response.data;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

// Lessons
export const getLessons = async (level?: string, category?: string): Promise<Lesson[]> => {
  const params = new URLSearchParams();
  if (level) params.append('level', level);
  if (category) params.append('category', category);
  const response = await api.get(`/lessons?${params.toString()}`);
  return response.data;
};

export const getLesson = async (id: string): Promise<Lesson> => {
  const response = await api.get(`/lessons/${id}`);
  return response.data;
};

export const completeLesson = async (id: string, score: number) => {
  const response = await api.post(`/lessons/${id}/complete`, { score });
  return response.data;
};

// Progress
export const getProgress = async (): Promise<UserProgress[]> => {
  const response = await api.get('/progress');
  return response.data;
};

export const updateProgress = async (lessonId: string, completed: boolean, score: number) => {
  const response = await api.post('/progress', { lessonId, completed, score });
  return response.data;
};

export default api;
