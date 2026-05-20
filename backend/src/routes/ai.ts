import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { generateQuiz, summarizeContent, tutorResponse, generateCourseOutline, analyzeImage } from '../lib/ai';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { recordActivity } from '../lib/activity';

const prisma = new PrismaClient();

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/generate-quiz', async (req: AuthRequest, res) => {
  const { topic, context } = req.body;
  try {
    const quizData = await generateQuiz(topic, context);
    
    // Auto-persist personal quiz for students
    const quiz = await prisma.personalQuiz.create({
      data: {
        topic,
        studentId: req.user.id,
        questions: quizData as any,
      }
    });

    await recordActivity(req.user.id, 'QUIZ_GENERATED', 5);
    res.json(quiz);
  } catch (error: any) {
    console.error('generate-quiz error:', error?.message || error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

router.get('/personal-quizzes', async (req: AuthRequest, res) => {
  try {
    const quizzes = await prisma.personalQuiz.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.post('/personal-quizzes/:id/score', async (req: AuthRequest, res) => {
  const { score } = req.body;
  try {
    const quiz = await prisma.personalQuiz.update({
      where: { id: req.params.id as string, studentId: req.user.id },
      data: { score }
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update score' });
  }
});

router.post('/generate-study-plan', async (req: AuthRequest, res) => {
  const { topic } = req.body;
  try {
    // We can reuse generateCourseOutline but customize for a student's study plan
    const outline = await generateCourseOutline(topic, 'Self-paced learner', 4);
    
    const studyPlan = await prisma.studyPlan.create({
      data: {
        topic,
        studentId: req.user.id,
        content: outline as any
      }
    });

    await recordActivity(req.user.id, 'STUDY_PLAN_GENERATED', 10);
    res.json(studyPlan);
  } catch (error: any) {
    console.error('generate-study-plan error:', error?.message || error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

router.get('/study-plans', async (req: AuthRequest, res) => {
  try {
    const plans = await prisma.studyPlan.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study plans' });
  }
});

router.post('/summarize', async (req: AuthRequest, res) => {
  const { text, title } = req.body;
  try {
    const summary = await summarizeContent(text);
    
    // Save note if title is provided
    if (title) {
      await prisma.note.create({
        data: {
          studentId: req.user.id,
          title,
          content: summary
        }
      });
    }

    await recordActivity(req.user.id, 'SMART_NOTES', 5);
    res.json({ summary });
  } catch (error: any) {
    console.error('summarize error:', error?.message || error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to summarize' });
  }
});

router.get('/notes', async (req: AuthRequest, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.delete('/notes/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.note.delete({
      where: { id: req.params.id as string, studentId: req.user.id }
    });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

router.post('/tutor', async (req: AuthRequest, res) => {
  const { question, history, conversationId } = req.body;
  try {
    const answer = await tutorResponse(question, history || []);
    
    // Save to conversation if ID provided
    if (conversationId) {
      // Save User Message
      await prisma.chatMessage.create({
        data: {
          conversationId,
          role: 'user',
          content: question
        }
      });
      // Save Assistant Message
      await prisma.chatMessage.create({
        data: {
          conversationId,
          role: 'assistant',
          content: answer
        }
      });
    }

    await recordActivity(req.user.id, 'CHAT_TUTOR', 2);
    res.json({ answer });
  } catch (error: any) {
    console.error('tutor error:', error?.message || error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to get tutor response' });
  }
});

router.get('/conversations', async (req: AuthRequest, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { studentId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      }
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post('/conversations', async (req: AuthRequest, res) => {
  const { title } = req.body;
  try {
    const conversation = await prisma.conversation.create({
      data: {
        studentId: req.user.id,
        title: title || 'New Chat'
      }
    });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/conversations/:id', async (req: AuthRequest, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id as string, studentId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

router.delete('/conversations/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.conversation.delete({
      where: { id: req.params.id as string, studentId: req.user.id }
    });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

router.post('/course-outline', async (req, res) => {
  const { topic, targetAudience, durationWeeks } = req.body;
  try {
    const outline = await generateCourseOutline(topic, targetAudience, durationWeeks);
    res.json(outline);
  } catch (error: any) {
    console.error('Course outline error:', error?.message || error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to generate course outline' });
  }
});

router.post('/analyze-image', upload.single('image'), async (req: AuthRequest, res) => {
  const { question } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const answer = await analyzeImage(file.buffer, file.mimetype, question);
    
    // Save the doubt for history
    const doubt = await prisma.doubt.create({
      data: {
        studentId: req.user.id,
        question: question || "Image-based query",
        answer: answer,
        // In a real app, we'd upload the image to S3/Cloudinary and save the URL
        // For now we just track that an image was used
        image: "Image query" 
      }
    });

    await recordActivity(req.user.id, 'DOUBT_SOLVED', 5);
    res.json(doubt);
  } catch (error: any) {
    console.error('Failed to analyze image:', error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

router.get('/doubts', async (req: AuthRequest, res) => {
  try {
    const doubts = await prisma.doubt.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doubts' });
  }
});

export default router;
