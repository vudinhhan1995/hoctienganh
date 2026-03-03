export interface User {
  id: string;
  email: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  topic: string;
  duration: number;
  createdAt: string;
  messages: Message[];
}

export interface Lesson {
  id: string;
  title: string;
  level: string;
  category: string;
  description?: string;
  content: LessonContent[];
}

export interface LessonContent {
  type: 'text' | 'exercise' | 'vocabulary';
  content: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt?: string;
  lesson?: Lesson;
}
