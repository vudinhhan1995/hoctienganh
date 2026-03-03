import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all lessons
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level, category } = req.query;
    
    const where: any = {};
    if (level) where.level = level as string;
    if (category) where.category = category as string;

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to get lessons' });
  }
});

// Get single lesson
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
});

// Create lesson (for seeding)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, level, category, description, content } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        level,
        category,
        description,
        content,
      },
    });

    res.json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Mark lesson as complete
router.post('/:id/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { score } = req.body;

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: req.userId!,
          lessonId: req.params.id,
        },
      },
      update: {
        completed: true,
        score: score || 100,
        completedAt: new Date(),
      },
      create: {
        userId: req.userId!,
        lessonId: req.params.id,
        completed: true,
        score: score || 100,
        completedAt: new Date(),
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

export default router;
