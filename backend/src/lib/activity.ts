import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const recordActivity = async (studentId: string, type: string, points: number = 10) => {
  try {
    await prisma.activity.create({
      data: {
        studentId,
        type,
        points,
      },
    });
  } catch (error) {
    console.error('Failed to record activity:', error);
  }
};
