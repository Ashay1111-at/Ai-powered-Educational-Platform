import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { recordActivity } from '../lib/activity';
import { generateLessonContent } from '../lib/ai';
import { auth } from '../lib/firebaseAdmin';

const router = Router();
const prisma = new PrismaClient();

// Create a new course (AI outline or Manual setup) (Only Instructors)
router.post('/', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  const { title, description, weeks } = req.body;
  const instructorId = req.user.id;

  try {
    const lessonData = [];
    const lessonsToGenerate: { id: string; title: string }[] = [];
    let order = 0;

    for (const week of weeks) {
      for (const lessonItem of week.lessons) {
        // Support both string (title only) and object ({ title, content, generateAI }) format
        const isObject = typeof lessonItem === 'object' && lessonItem !== null;
        const lessonTitle = isObject ? lessonItem.title : lessonItem;
        const userContent = isObject ? lessonItem.content : null;
        const generateAI = isObject ? !!lessonItem.generateAI : true;

        lessonData.push({
          title: lessonTitle,
          content: userContent || (generateAI ? "Generating AI content, please check back in a few minutes..." : "No content provided yet."),
          order: order++
        });
      }
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId,
        lessons: {
          create: lessonData
        }
      },
      include: {
        lessons: true
      }
    });

    res.status(201).json(course);

    // Identify which lessons we need to generate AI content for
    const createdLessons = course.lessons;
    for (const week of weeks) {
      for (const lessonItem of week.lessons) {
        const isObject = typeof lessonItem === 'object' && lessonItem !== null;
        const lessonTitle = isObject ? lessonItem.title : lessonItem;
        const userContent = isObject ? lessonItem.content : null;
        const generateAI = isObject ? !!lessonItem.generateAI : true;

        if (generateAI && !userContent) {
          // Find the corresponding database lesson by order and title
          const matchingDbLesson = createdLessons.find(l => l.title === lessonTitle);
          if (matchingDbLesson) {
            lessonsToGenerate.push({ id: matchingDbLesson.id, title: lessonTitle });
          }
        }
      }
    }

    // Generate content in the background only for lessons that need it
    if (lessonsToGenerate.length > 0) {
      (async () => {
        console.log(`Starting background content generation for course: ${course.id}`);
        for (const lesson of lessonsToGenerate) {
          try {
            console.log(`Generating background content for lesson: ${lesson.title}`);
            const content = await generateLessonContent(title, lesson.title);
            await prisma.lesson.update({
              where: { id: lesson.id },
              data: { content }
            });
          } catch (err) {
            console.error(`Failed to generate content for lesson "${lesson.title}":`, err);
          }
        }
        console.log(`Finished background generation flow for course: ${course.id}`);
      })();
    }
  } catch (error) {
    console.error('Failed to create course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get enrolled courses for the logged-in student (with real progress)
router.get('/enrolled', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const studentId = req.user.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            lessons: { select: { id: true } },
            enrollments: { select: { id: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch all completed progress records for this student in one query
    const completedProgress = await prisma.progress.findMany({
      where: { studentId, completed: true },
      select: { lessonId: true, lesson: { select: { courseId: true } } }
    });

    // Build a map: courseId -> set of completed lessonIds
    const completedByCourseid = new Map<string, Set<string>>();
    for (const p of completedProgress) {
      const cid = p.lesson.courseId;
      if (!completedByCourseid.has(cid)) completedByCourseid.set(cid, new Set());
      completedByCourseid.get(cid)!.add(p.lessonId);
    }

    const courses = enrollments.map(e => {
      const course = e.course;
      const totalLessons = course.lessons.length;
      const completedLessons = completedByCourseid.get(course.id)?.size ?? 0;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return { ...course, progressPercent };
    });

    res.json(courses);
  } catch (error) {
    console.error('Failed to fetch enrolled courses:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

// Get courses taught by the logged-in instructor
router.get('/instructor', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      include: {
        lessons: { select: { id: true } },
        enrollments: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (error) {
    console.error('Failed to fetch instructor courses:', error);
    res.status(500).json({ error: 'Failed to fetch instructor courses' });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            name: true
          }
        }
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    let studentId: string | null = null;

    if (token) {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        const user = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid }
        });
        if (user) {
          studentId = user.id;
        }
      } catch (err) {
        // Suppress auth error since this is a public route
      }
    }

    const course = await prisma.course.findUnique({
      where: { id: req.params.id as string },
      include: {
        lessons: true,
        instructor: {
          select: {
            name: true
          }
        },
        enrollments: {
          where: studentId ? { studentId } : { id: 'none' }
        }
      }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Enroll in a course
router.post('/:id/enroll', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const courseId = req.params.id as string;
    const studentId = req.user.id;

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
      },
    });

    // Record activity
    await recordActivity(studentId, 'COURSE_ENROLLED', 50);

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Failed to enroll in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// Add a new lesson manually (Only Instructors)
router.post('/:id/lessons', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { title, content, order } = req.body;
    const courseId = req.params.id as string;

    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to add lessons to this course' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        order: order || 0,
        courseId
      }
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Failed to add lesson:', error);
    res.status(500).json({ error: 'Failed to add lesson' });
  }
});

// Update a course
router.patch('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { title, description, published } = req.body;
    const courseId = req.params.id as string;

    const course = await prisma.course.update({
      where: { 
        id: courseId,
        instructorId: req.user.id // Ensure they own it
      },
      data: {
        title,
        description,
        published
      }
    });

    res.json(course);
  } catch (error) {
    console.error('Failed to update course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete a course
router.delete('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const courseId = req.params.id as string;

    // Verify ownership or ADMIN status
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    // Delete all related enrollments and lessons first
    await prisma.$transaction([
      prisma.progress.deleteMany({ where: { lesson: { courseId } } }),
      prisma.lesson.deleteMany({ where: { courseId } }),
      prisma.enrollment.deleteMany({ where: { courseId } }),
      prisma.course.delete({ 
        where: { id: courseId } 
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Update a lesson
router.patch('/lessons/:id', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;
    const lessonId = req.params.id as string;

    // Verify ownership via course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });

    if (!lesson || (lesson as any).course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this lesson' });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { title, content }
    });

    res.json(updatedLesson);
  } catch (error) {
    console.error('Failed to update lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete a lesson
router.delete('/lessons/:id', authMiddleware, roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const lessonId = req.params.id as string;

    // Verify ownership via course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });

    if (!lesson || (lesson as any).course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this lesson' });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Mark a lesson as completed
router.post('/lessons/:id/complete', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const lessonId = req.params.id as string;
    const studentId = req.user.id;

    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId
        }
      },
      update: {
        completed: true,
        updatedAt: new Date()
      },
      create: {
        studentId,
        lessonId,
        completed: true
      }
    });

    // Update enrollment's updatedAt to reflect recent activity for "Continue Learning"
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true }
    });

    if (lesson) {
      await prisma.enrollment.update({
        where: {
          studentId_courseId: {
            studentId,
            courseId: lesson.courseId
          }
        },
        data: { updatedAt: new Date() }
      });
    }

    // Record activity
    await recordActivity(studentId, 'LESSON_COMPLETED', 20);

    res.json(progress);
  } catch (error) {
    console.error('Failed to complete lesson:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

export default router;

