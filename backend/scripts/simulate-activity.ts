import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function simulate() {
  console.log("🛠️ Simulating Platform Activity...");

  try {
    // 1. Ensure we have an Instructor
    let instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } });
    if (!instructor) {
      console.log("   - Creating test instructor...");
      instructor = await prisma.user.create({
        data: {
          email: 'instructor@test.com',
          name: 'Test Instructor',
          role: 'INSTRUCTOR',
          firebaseUid: 'test-instructor-uid',
          avatar: 'https://ui-avatars.com/api/?name=Test+Instructor'
        }
      });
    }

    // 2. Ensure we have a Student
    let student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!student) {
      console.log("   - Creating test student...");
      student = await prisma.user.create({
        data: {
          email: 'student@test.com',
          name: 'Test Student',
          role: 'STUDENT',
          firebaseUid: 'test-student-uid',
          avatar: 'https://ui-avatars.com/api/?name=Test+Student'
        }
      });
    }

    // 3. Create a Course if none exist
    let course = await prisma.course.findFirst({ where: { instructorId: instructor.id } });
    if (!course) {
      console.log("   - Creating test course...");
      course = await prisma.course.create({
        data: {
          title: 'AI Fundamentals',
          description: 'A comprehensive guide to AI.',
          price: 99.99,
          instructorId: instructor.id,
          lessons: {
            create: [
              { title: 'Lesson 1: Introduction', content: 'Content for lesson 1...', order: 1 },
              { title: 'Lesson 2: Neural Networks', content: 'Content for lesson 2...', order: 2 }
            ]
          }
        }
      });
    }

    // 4. Enroll Student in Course
    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id
        }
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: course.id
      }
    });
    console.log("   - Student enrolled in course.");

    // 5. Record Student Activity
    console.log("   - Recording student activity (streak simulation)...");
    const dates = [0, 1, 2]; // Today, Yesterday, Day before yesterday
    for (const d of dates) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      
      await prisma.activity.create({
        data: {
          studentId: student.id,
          type: 'STUDY',
          points: 10,
          createdAt: date
        }
      });
    }

    // 6. Complete a Lesson
    const lesson = await prisma.lesson.findFirst({ where: { courseId: course.id } });
    if (lesson) {
        await prisma.progress.upsert({
            where: {
                studentId_lessonId: {
                    studentId: student.id,
                    lessonId: lesson.id
                }
            },
            update: { completed: true },
            create: {
                studentId: student.id,
                lessonId: lesson.id,
                completed: true
            }
        });
        console.log("   - Student completed a lesson.");
    }

    console.log("✅ Simulation Complete.");
  } catch (error) {
    console.error("❌ Simulation Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulate();
