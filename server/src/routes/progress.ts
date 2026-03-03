import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user progress
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.userId },
      include: {
        lesson: true,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update progress
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, completed, score } = req.body;

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: req.userId!,
          lessonId,
        },
      },
      update: {
        completed,
        score,
        completedAt: completed ? new Date() : undefined,
      },
      create: {
        userId: req.userId!,
        lessonId,
        completed: completed || false,
        score: score || 0,
      },
      include: {
        lesson: true,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
