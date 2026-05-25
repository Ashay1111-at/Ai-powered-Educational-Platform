import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all discussions
router.get('/discussions', async (req, res) => {
  try {
    const discussions = await prisma.discussion.findMany({
      include: {
        author: {
          select: { name: true, avatar: true }
        },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Create a new discussion
router.post('/discussions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, category } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        category,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { name: true, avatar: true }
        },
        _count: {
          select: { replies: true }
        }
      }
    });

    res.status(201).json(discussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Get a single discussion by ID
router.get('/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.update({
      where: { id },
      data: {
        views: { increment: 1 }
      },
      include: {
        author: {
          select: { name: true, avatar: true }
        },
        replies: {
          include: {
            author: {
              select: { name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Add a reply to a discussion
router.post('/discussions/:id/replies', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        discussionId: id as string,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { name: true, avatar: true }
        }
      }
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Get community stats (total users, discussions, replies)
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalDiscussions, totalReplies] = await Promise.all([
      prisma.user.count(),
      prisma.discussion.count(),
      prisma.reply.count()
    ]);

    res.json({ totalUsers, totalDiscussions, totalReplies });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get top contributors by activity
router.get('/top-contributors', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: {
            discussions: true,
            replies: true
          }
        }
      },
      orderBy: {
        replies: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const contributors = users
      .map((user) => ({
        id: user.id,
        name: user.name || 'Anonymous',
        avatar: user.avatar,
        points: (user._count.discussions * 10) + (user._count.replies * 5),
        discussions: user._count.discussions,
        replies: user._count.replies,
      }))
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    res.json(contributors);
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    res.status(500).json({ error: 'Failed to fetch top contributors' });
  }
});

export default router;
