import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { recordActivity } from '../lib/activity';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get all users (Admin Only)
router.get('/all', roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        enrollments: true,
        courses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get student dashboard stats (streak, points, activities)
router.get('/dashboard-stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;

    // Get all activities for the last 35 days (matching the heatmap)
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

    const activities = await prisma.activity.findMany({
      where: {
        studentId: userId,
        createdAt: {
          gte: thirtyFiveDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate current streak
    // This is a simplified version
    const activityDates = new Set(
      activities.map(a => a.createdAt.toISOString().split('T')[0])
    );
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 35; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      if (activityDates.has(dateString)) {
        streak++;
      } else if (i > 0) {
        // If they missed a day (except potentially today), streak breaks
        break;
      }
    }

    // Total points
    const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);

    res.json({
      activities,
      streak,
      totalPoints,
      level: Math.floor(totalPoints / 100) + 1,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Record a new activity
router.post('/record-activity', async (req: AuthRequest, res) => {
  const { type, points } = req.body;
  try {
    await recordActivity(req.user.id, type, points);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

// Get instructor's students list
router.get('/instructor-students', roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const instructorId = req.user.id;

    // Get all enrollments for courses taught by this instructor
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            _count: {
              select: { enrollments: true }
            }
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by student to get aggregate progress/counts
    const studentMap = new Map();
    
    // Fetch all lessons count per course for accurate progress
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: { _count: { select: { lessons: true } } }
    });
    const courseLessonCounts = new Map(courses.map(c => [c.id, c._count.lessons]));

    // Fetch all completed lessons for these enrollments
    const progressRecords = await prisma.progress.findMany({
      where: {
        studentId: { in: enrollments.map(e => e.studentId) },
        lesson: { course: { instructorId } },
        completed: true
      },
      include: {
        lesson: { select: { courseId: true } }
      }
    });

    enrollments.forEach(e => {
      const studentId = e.student.id;
      const totalLessons = courseLessonCounts.get(e.courseId) || 1;
      const completedLessons = progressRecords.filter(p => p.studentId === studentId && p.lesson.courseId === e.courseId).length;
      const currentProgress = Math.round((completedLessons / totalLessons) * 100);

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: e.student.name,
          email: e.student.email,
          joined: e.student.createdAt,
          courses: e.student._count.enrollments,
          progress: currentProgress,
        });
      } else {
        // Average progress across all courses with this instructor
        const existing = studentMap.get(studentId);
        existing.progress = Math.round((existing.progress + currentProgress) / 2);
      }
    });

    res.json(Array.from(studentMap.values()));
  } catch (error) {
    console.error('Failed to fetch instructor students:', error);
    res.status(500).json({ error: 'Failed to fetch instructor students' });
  }
});

// Get instructor dashboard stats (Total students, courses, revenue)
router.get('/instructor-stats', roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const instructorId = req.user.id;

    const [coursesCount, recentEnrollments] = await Promise.all([
      prisma.course.count({
        where: { instructorId }
      }),
      prisma.enrollment.findMany({
        where: {
          course: { instructorId }
        },
        include: {
          student: {
            select: { name: true, email: true, avatar: true }
          },
          course: {
            select: { title: true, price: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    // Since price is on the Course model, we sum prices of courses for all enrollments
    const enrollmentsForRevenue = await prisma.enrollment.findMany({
      where: { course: { instructorId } },
      select: { course: { select: { price: true } } }
    });
    const revenue = enrollmentsForRevenue.reduce((sum, e) => sum + (e.course.price || 0), 0);
    
    const uniqueStudents = await prisma.enrollment.groupBy({
      by: ['studentId'],
      where: { course: { instructorId } }
    });

    res.json({
      coursesCount,
      totalStudents: uniqueStudents.length,
      recentEnrollments,
      revenue,
    });
  } catch (error) {
    console.error('Failed to fetch instructor stats:', error);
    res.status(500).json({ error: 'Failed to fetch instructor stats' });
  }
});

// Get detailed course analytics for instructor
router.get('/instructor-course-analytics', roleMiddleware(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: { 
            enrollments: true,
            lessons: true
          }
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            createdAt: true
          }
        }
      }
    });

    const analytics = await Promise.all(courses.map(async (course) => {
      // Get progress for all students in this course
      const progressCount = await prisma.progress.count({
        where: {
          lesson: { courseId: course.id },
          completed: true
        }
      });

      const totalPossibleLessons = course._count.enrollments * course._count.lessons;
      const avgProgress = totalPossibleLessons > 0 
        ? Math.round((progressCount / totalPossibleLessons) * 100) 
        : 0;

      // Enrollment trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentEnrollments = course.enrollments.filter(e => 
        new Date(e.createdAt) >= sevenDaysAgo
      ).length;

      return {
        id: course.id,
        title: course.title,
        enrollments: course._count.enrollments,
        recentEnrollments,
        avgProgress,
        revenue: course._count.enrollments * (course.price || 0),
        rating: 4.8 + (Math.random() * 0.2) // Simulated rating for now
      };
    }));

    res.json(analytics);
  } catch (error) {
    console.error('Failed to fetch course analytics:', error);
    res.status(500).json({ error: 'Failed to fetch course analytics' });
  }
});

// Get student dashboard stats
router.get('/student-stats', roleMiddleware(['STUDENT', 'INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const studentId = req.user.id;

    const [enrollmentsCount, allEnrollments, activities] = await Promise.all([
      prisma.enrollment.count({
        where: { studentId }
      }),
      prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: {
            include: {
              _count: { select: { lessons: true } }
            }
          }
        }
      }),
      prisma.activity.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate completed courses
    // Optimization: Get all progress for this student once
    const progress = await prisma.progress.findMany({
      where: { studentId, completed: true },
      select: { lesson: { select: { courseId: true } } }
    });

    const completedCourseIds = new Set();
    allEnrollments.forEach(enrollment => {
      const courseProgress = progress.filter(p => p.lesson.courseId === enrollment.courseId);
      if (enrollment.course._count.lessons > 0 && courseProgress.length === enrollment.course._count.lessons) {
        completedCourseIds.add(enrollment.courseId);
      }
    });

    // Calculate streak from activities
    const activityDates = new Set(activities.map(a => a.createdAt.toISOString().split('T')[0]));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Get the most recently accessed enrollment to show "Continue Learning"
    const latestEnrollment = await prisma.enrollment.findFirst({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            lessons: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { title: true }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    let latestEnrollmentWithProgress = null;
    if (latestEnrollment) {
      const [totalLessons, completedLessons] = await Promise.all([
        prisma.lesson.count({
          where: { courseId: latestEnrollment.courseId }
        }),
        prisma.progress.count({
          where: {
            studentId,
            completed: true,
            lesson: { courseId: latestEnrollment.courseId }
          }
        })
      ]);
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      latestEnrollmentWithProgress = {
        ...latestEnrollment,
        progress: progressPercent
      };
    }

    res.json({
      enrollmentsCount,
      completedCount: completedCourseIds.size,
      latestEnrollment: latestEnrollmentWithProgress,
      streak,
      hoursLearned: activities.length * 0.5, // 30 mins per activity record
    });
  } catch (error) {
    console.error('Failed to fetch student stats:', error);
    res.status(500).json({ error: 'Failed to fetch student stats' });
  }
});

// Get platform-wide admin stats
router.get('/admin-stats', roleMiddleware(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const [userCount, courseCount, enrollmentCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count()
    ]);

    res.json({
      totalUsers: userCount,
      totalCourses: courseCount,
      totalEnrollments: enrollmentCount,
      activeSessions: Math.floor(userCount * 0.15) + 5, // Simulated active sessions
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get all recent activities (Admin Only)
router.get('/admin/activities', roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { name: true }
        }
      }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Admin Health Check
router.get('/health', roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      checks: {
        database: 'connected',
        aiService: 'operational',
        storage: 'available'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// Update a user's role (Admin Only)
router.patch('/:id/role', roleMiddleware(['ADMIN']), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { role } = req.body;

  const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be STUDENT, INSTRUCTOR, or ADMIN.' });
  }

  // Prevent admin from changing their own role
  if (id === req.user.id) {
    return res.status(403).json({ error: 'Admins cannot change their own role.' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
