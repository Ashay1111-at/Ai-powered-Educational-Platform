import { generateQuiz, summarizeContent, tutorResponse, generateCourseOutline, generateLessonContent } from '../src/lib/ai';
import dotenv from 'dotenv';

dotenv.config();

async function testAI() {
  console.log("🚀 Testing AI Functions...");
  try {
    console.log("\n--- Testing Quiz Generator ---");
    const quiz = await generateQuiz("Photosynthesis");
    console.log("Quiz Output:", JSON.stringify(quiz, null, 2).substring(0, 200) + "...\n");

    console.log("\n--- Testing Content Summarizer ---");
    const summary = await summarizeContent("Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP).");
    console.log("Summary Output:", summary.substring(0, 100) + "...\n");

    console.log("\n--- Testing AI Tutor ---");
    const tutorMsg = await tutorResponse("What is a derivative in calculus?", []);
    console.log("Tutor Output:", tutorMsg.substring(0, 200) + "...\n");

    console.log("\n--- Testing Course Outline Generator ---");
    const outline = await generateCourseOutline("Advanced React Hooks", "Intermediate Developers", 2);
    console.log("Outline Output:", JSON.stringify(outline, null, 2).substring(0, 200) + "...\n");

    console.log("\n--- Testing Lesson Content Generator ---");
    const lesson = await generateLessonContent("Web Dev 101", "HTML Basics");
    console.log("Lesson Output:", lesson.substring(0, 200) + "...\n");

    console.log("\n✅ All AI tests passed successfully!");
  } catch (error) {
    console.error("❌ AI Test Failed:", error);
  }
}

testAI();
