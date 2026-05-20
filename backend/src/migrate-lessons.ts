import { PrismaClient } from "@prisma/client";
import { generateLocalFallbackContent } from "./lib/ai";

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting DB migration to repair empty/placeholder lessons...");
  
  try {
    // Fetch all lessons along with their parent courses
    const lessons = await prisma.lesson.findMany({
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`Found a total of ${lessons.length} lessons in database.`);
    let updatedCount = 0;

    for (const lesson of lessons) {
      const isPlaceholder = 
        !lesson.content || 
        lesson.content.trim() === "" || 
        lesson.content.includes("Generating AI content") || 
        lesson.content.includes("Content for lesson");

      if (isPlaceholder) {
        console.log(`Repairing lesson: "${lesson.title}" in course: "${lesson.course.title}"`);
        const fallbackContent = generateLocalFallbackContent(lesson.course.title, lesson.title);
        
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { content: fallbackContent }
        });
        
        updatedCount++;
      }
    }

    console.log(`Migration completed successfully! Repaired ${updatedCount} lessons.`);
  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
