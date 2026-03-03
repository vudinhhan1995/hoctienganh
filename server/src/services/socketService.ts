import { Server, Socket } from 'socket.io';
import OpenAI from 'openai';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join conversation room
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        // Verify ownership
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId: socket.userId,
          },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle text message
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        // Save user message
        const userMessage = await prisma.message.create({
          data: {
            conversationId,
            role: 'user',
            content,
          },
        });

        // Emit user message to room
        io.to(conversationId).emit('message', userMessage);

        // Get conversation and user info
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
              take: 20,
            },
          },
        });

        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
        });

        // Notify typing
        io.to(conversationId).emit('typing', { isTyping: true });

        // Generate AI response using OpenAI
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Build conversation context
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          {
            role: 'system',
            content: `You are a friendly English tutor helping a ${user?.level || 'beginner'} level student practice English conversation. 
            
Guidelines:
- Speak in English primarily, use Vietnamese only when explaining difficult concepts
- Be patient and encouraging
- Gently correct grammar mistakes
- Ask follow-up questions to keep conversation flowing
- Topic: ${conversation?.topic || 'General conversation'}
- Keep responses concise and easy to understand`,
          },
          ...conversation!.messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content },
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          max_tokens: 500,
        });

        const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I did not understand that.';

        // Save AI response
        const assistantMessage = await prisma.message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: aiResponse,
          },
        });

        // Emit AI response
        io.to(conversationId).emit('typing', { isTyping: false });
        io.to(conversationId).emit('message', assistantMessage);

        // If using TTS, emit audio
        io.to(conversationId).emit('voice_response', { 
          text: aiResponse,
          messageId: assistantMessage.id 
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
        io.to(data.conversationId).emit('typing', { isTyping: false });
      }
    });

    // Handle voice message (text input from speech recognition)
    socket.on('send_voice', async (data: { conversationId: string; transcript: string }) => {
      // Handle same as text message
      socket.emit('send_message', {
        conversationId: data.conversationId,
        content: data.transcript,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
}
