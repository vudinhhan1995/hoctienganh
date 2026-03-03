import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all conversations for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get single conversation
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Create new conversation
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { topic } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.userId!,
        topic: topic || 'General Conversation',
      },
      include: {
        messages: true,
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Delete conversation
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.conversation.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Add message to conversation
router.post('/:id/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { role, content, audioUrl } = req.body;

    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        role,
        content,
        audioUrl,
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get messages for conversation
router.get('/:id/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { timestamp: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
