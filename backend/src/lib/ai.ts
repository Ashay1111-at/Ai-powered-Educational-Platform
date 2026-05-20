import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from 'dotenv';

dotenv.config();

const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
const useDeepSeek = !!process.env.DEEPSEEK_API_KEY;
const useGemini = !!process.env.GOOGLE_API_KEY;

const model = useOpenRouter
  ? new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      modelName: "openrouter/free",
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Comback EduAI",
        }
      },
      maxRetries: 0,
    })
  : useDeepSeek
  ? new ChatOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      modelName: "deepseek-chat",
      configuration: {
        baseURL: "https://api.deepseek.com",
      },
      maxRetries: 0,
    })
  : useGemini 
  ? new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.0-flash-lite",
      maxOutputTokens: 2048,
      maxRetries: 0,
    })
  : new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      maxRetries: 0,
    });

const cleanAndParseJSON = (text: string): any => {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(json)?\s*/i, "");
    cleanText = cleanText.replace(/\s*```$/, "");
  }
  cleanText = cleanText.trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (_) {}
    }
    const objectMatch = cleanText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (_) {}
    }
    throw err;
  }
};

export const generateQuiz = async (topic: string, context?: string) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educator. Generate a high-quality quiz on the topic: {topic}.
      {context_text}
      The quiz should include 5 multiple-choice questions.
      Return the response as a JSON array of objects, each with:
      - question: string
      - options: string[] (4 options)
      - correctAnswer: string (one of the options)
      - explanation: string
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      topic,
      context_text: context ? `Context provided: ${context}` : ""
    });

    return cleanAndParseJSON(response);
  } catch (error) {
    console.error("AI quiz generation failed, using mock quiz fallback:", error);
    return [
      {
        question: `What is the primary concept behind ${topic}?`,
        options: [
          "Understanding the foundational definitions",
          "Ignoring best practices",
          "Avoiding dynamic updates",
          "Applying styling without structure"
        ],
        correctAnswer: "Understanding the foundational definitions",
        explanation: `In ${topic}, starting with solid foundational definitions is the most important step towards mastery.`
      },
      {
        question: `Which of the following is a recommended approach for implementing ${topic}?`,
        options: [
          "Hardcoding all values",
          "Applying robust, scalable design patterns",
          "Skipping user verification steps",
          "Using deprecated APIs without checks"
        ],
        correctAnswer: "Applying robust, scalable design patterns",
        explanation: `Robust design patterns ensure long-term stability and maintainability for ${topic}.`
      },
      {
        question: `How should errors be handled when dealing with ${topic}?`,
        options: [
          "Silently ignoring all exceptions",
          "Throwing raw errors directly to the end user",
          "Gracefully catching errors and using reliable fallbacks",
          "Terminating the server immediately"
        ],
        correctAnswer: "Gracefully catching errors and using reliable fallbacks",
        explanation: "Graceful error handling ensures high availability and a better user experience."
      },
      {
        question: `What is a common pitfall when working with ${topic}?`,
        options: [
          "Testing with realistic scenarios",
          "Over-relying on external APIs without local safeguards",
          "Keeping code clean and commented",
          "Following official framework guidelines"
        ],
        correctAnswer: "Over-relying on external APIs without local safeguards",
        explanation: "Rate limits and network dropouts can break functionality if safeguards are absent."
      },
      {
        question: `How can one optimize performance in ${topic}?`,
        options: [
          "Adding unnecessary background loops",
          "Caching results and avoiding redundant computations",
          "Increasing file payload size",
          "Using heavy, non-optimized resources"
        ],
        correctAnswer: "Caching results and avoiding redundant computations",
        explanation: "Reducing redundant operations is key to optimizing performance."
      }
    ];
  }
};

export const summarizeContent = async (text: string) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Summarize the following educational content into clear, actionable bullet points.
      Highlight key concepts and definitions.
      
      Content: {text}
      
      Summary:
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ text });
  } catch (error) {
    console.error("AI summarization failed, using local summarization fallback:", error);
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const lines = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    
    if (lines.length === 0) {
      return `### Summary Overview\n- The provided content is too short to generate a meaningful summary.\n- Please provide longer text content to summarize.`;
    }

    const bulletPoints = lines.slice(0, 4).map(line => `- **Core Concept**: ${line}.`).join('\n');
    return `### 📝 Key Summary Bullet Points\n${bulletPoints}\n\n*Note: This summary was generated locally via text analysis.*`;
  }
};

export const tutorResponse = async (question: string, history: any[]) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      You are a friendly and encouraging AI Tutor. 
      Explain concepts step-by-step. If a student is stuck, provide a hint instead of the full answer.
      
      Student Question: {question}
      Chat History: {history}
      
      Tutor:
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ question, history: JSON.stringify(history) });
  } catch (error) {
    console.error("AI Tutor failed, using local offline fallback:", error);
    
    const normalizedQuestion = question.toLowerCase();
    let responseText = `That is an interesting question! I am here to help you study.

To understand this topic better, consider breaking it down into:
1. **Core Elements**: What are the main components that make it work?
2. **Context**: In what scenarios is this most commonly applied?

Could you specify what aspect you find most challenging?`;

    if (normalizedQuestion.includes("help") || normalizedQuestion.includes("how to")) {
      responseText = `I'd be glad to guide you! Let's approach this step-by-step:
1. Define the goal: What are you trying to accomplish?
2. Break it down into the smallest possible tasks.
3. Address each sub-task one at a time.

Tell me a bit more about your current implementation so we can solve it together!`;
    } else if (normalizedQuestion.includes("what is") || normalizedQuestion.includes("explain")) {
      responseText = `Great question! The topic you mentioned relates to key concepts in modern software development.

Here is a quick hint to get you thinking:
* Think about the problem it solves.
* How does it compare to alternative approaches you already know?

Let me know if you would like me to detail a specific example!`;
    }

    return responseText + "\n\n*(AI Tutor Offline Mode: This response was generated locally)*";
  }
};

export const generateCourseOutline = async (topic: string, targetAudience: string, durationWeeks: number) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert curriculum designer. Create a detailed course outline for the topic: {topic}.
      Target Audience: {targetAudience}
      Duration: {durationWeeks} weeks
      
      Return the response as a JSON object with this structure:
      {{
        "title": "Suggested Course Title",
        "description": "Short description of the course",
        "weeks": [
          {{
            "weekNumber": 1,
            "title": "Week Topic",
            "lessons": ["Lesson 1 Title", "Lesson 2 Title"]
          }}
        ]
      }}
      
      Ensure the output is valid JSON without any markdown code blocks.
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({ topic, targetAudience, durationWeeks });

    return cleanAndParseJSON(response);
  } catch (error) {
    console.error("AI course outline generation failed, using local outline fallback:", error);
    
    const weeksList = [];
    const weeksCount = durationWeeks || 4;
    for (let i = 1; i <= weeksCount; i++) {
      weeksList.push({
        weekNumber: i,
        title: `Module ${i}: Foundations of ${topic}`,
        lessons: [
          `Introduction to ${topic} - Part A`,
          `Core Principles of ${topic} - Part B`,
          `Practical implementation of ${topic} - Case Study`
        ]
      });
    }

    return {
      title: `Mastering ${topic}`,
      description: `A comprehensive, ${weeksCount}-week curriculum tailored for ${targetAudience} to gain practical and conceptual expertise.`,
      weeks: weeksList
    };
  }
};

export const analyzeImage = async (imageBuffer: Buffer, mimeType: string, question: string) => {
  try {
    if (useOpenRouter) {
      const visionModel = new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        modelName: "nvidia/nemotron-nano-12b-v2-vl:free",
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Comback EduAI",
          }
        },
        maxRetries: 0,
      });

      const response = await visionModel.invoke([
        {
          role: "user",
          content: [
            { type: "text", text: question || "Identify and solve the problem in this image." },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBuffer.toString("base64")}`,
              },
            },
          ],
        },
      ]);

      return typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
    }

    if (process.env.GOOGLE_API_KEY) {
      const visionModel = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-2.0-flash-lite",
        maxRetries: 0,
      });

      const response = await visionModel.invoke([
        {
          role: "user",
          content: [
            { type: "text", text: question || "Identify and solve the problem in this image." },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBuffer.toString("base64")}`
              },
            },
          ],
        },
      ]);

      return typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
    }

    throw new Error("No API key available for image analysis. Please configure OPENROUTER_API_KEY or GOOGLE_API_KEY.");
  } catch (error) {
    console.error("AI image analysis failed, using local offline fallback:", error);
    return `### 📷 Image Analysis Report
I received your uploaded image (Type: ${mimeType}).

**Your Question:** ${question || "Analyze this image."}

**Doubt Assistant Response:**
- In order to solve this equation or explain this diagram, remember that the key is identifying the variables and constraints depicted.
- *Tip*: Try breaking down the visual elements into text form or writing out the specific step you are stuck on.

*(AI Doubt Solver Offline Mode: Please check your API key settings to enable full image recognition capability.)*`;
  }
};

export const generateLocalFallbackContent = (courseTitle: string, lessonTitle: string): string => {
  const normalizedTitle = lessonTitle.toLowerCase();
  
  let coreSection = `## 💡 Core Concepts
Here are the primary concepts you need to understand:

1. **Foundational Definition**: Understanding the core terminology and basic mechanisms.
2. **Key Principles**: The rules, structures, and guidelines that govern this topic.
3. **Best Practices**: Industry-standard patterns and methods for implementing these concepts effectively.`;

  let codeSection = `## 🛠️ Practical Example
Let's look at a practical application:

\`\`\`javascript
// Step-by-step implementation of the core concept
function initializeProcess(options) {
  console.log("Initializing ${lessonTitle}...");
  const status = true;
  
  if (status) {
    console.log("Initialization successful!");
    return { success: true, timestamp: Date.now() };
  }
  return { success: false };
}

// Execute function
const result = initializeProcess({ verbose: true });
console.log("Result:", result);
\`\`\``;

  if (normalizedTitle.includes("react") || normalizedTitle.includes("component") || normalizedTitle.includes("hook") || normalizedTitle.includes("frontend")) {
    coreSection = `## 💡 Core React Concepts
To master this React lesson, focus on these key concepts:

1. **Component-Driven Architecture**: Breaking down interfaces into isolated, reusable blocks of code.
2. **State & Lifecycle Management**: Using Modern Hooks like \`useState\` and \`useEffect\` to manage local component state and side effects.
3. **Performance Optimization**: Understanding rendering mechanics, visual state synchronization, and utilizing hooks like \`useMemo\` and \`useCallback\`.`;

    codeSection = `## ⚛️ Code Example
Here is a practical React implementation illustrating these concepts:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

export default function ${lessonTitle.replace(/[^a-zA-Z0-9]/g, '') || 'InteractiveLesson'}() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component mounted. Current count:", count);
    return () => console.log("Cleaning up resources...");
  }, [count]);

  return (
    <div className="p-6 rounded-2xl bg-muted/40 border border-border">
      <h3 className="text-lg font-bold mb-2">Interactive Counter</h3>
      <p className="text-muted-foreground mb-4">Click below to update the component state dynamically.</p>
      
      <button 
        onClick={() => setCount(prev => prev + 1)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/95 transition-colors"
      >
        Clicks: {count}
      </button>
    </div>
  );
}
\`\`\``;
  } else if (normalizedTitle.includes("neural") || normalizedTitle.includes("machine learning") || normalizedTitle.includes("clustering") || normalizedTitle.includes("algorithm") || normalizedTitle.includes("regression") || normalizedTitle.includes("classification") || normalizedTitle.includes("ai")) {
    coreSection = `## 🧠 Core Machine Learning & AI Concepts
Here are the primary algorithmic concepts to focus on:

1. **Mathematical Optimization**: How models adjust weights to minimize a loss function (e.g., Gradient Descent).
2. **Supervised vs. Unsupervised Learning**:
   * *Supervised*: Learning mapping from inputs to labeled outputs (e.g., Regression, Classification).
   * *Unsupervised*: Finding hidden structures and patterns in unlabeled data (e.g., K-Means Clustering).
3. **Overfitting & Generalization**: Structuring evaluation metrics using train/test splits and regularization techniques.`;

    codeSection = `## 🐍 Python / NumPy Example
Here is a conceptual NumPy implementation illustrating the basic algorithms:

\`\`\`python
import numpy as np

# Simple regression optimization using Gradient Descent
def fit_linear_regression(X, y, lr=0.01, epochs=1000):
    m = 0.0  # Slope
    c = 0.0  # Intercept
    n = len(X)
    
    for epoch in range(epochs):
        # Current predictions
        y_pred = m * X + c
        
        # Calculate gradients
        dm = (-2/n) * sum(X * (y - y_pred))
        dc = (-2/n) * sum(y - y_pred)
        
        # Update weights
        m -= lr * dm
        c -= lr * dc
        
    return m, c

# Sample inputs
X = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])

slope, intercept = fit_linear_regression(X, y)
print(f"Trained model: y = {slope:.2f}*x + {intercept:.2f}")
\`\`\``;
  }

  return `# ${lessonTitle}

## 🎯 Introduction
Welcome to **${lessonTitle}**, a core topic in our course **${courseTitle}**. In this lesson, we will explore the foundational concepts, practical implementations, and real-world use cases of this topic.

${coreSection}

${codeSection}

## 📝 Key Takeaways
* **Foundations First**: Mastery of the core definitions allows you to tackle advanced topics more easily.
* **Hands-on Experimentation**: Test the provided examples in your local development environment to gain practical intuition.
* **Keep Learning**: Build on top of these concepts by tackling complex problems and building custom projects.

---
*Note: This rich lesson content was automatically generated locally as a reliable fallback.*`;
};

export const generateLessonContent = async (courseTitle: string, lessonTitle: string): Promise<string> => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educator. Create a detailed and engaging educational lesson for:
      Course: {courseTitle}
      Lesson: {lessonTitle}

      The lesson should include:
      1. A brief introduction.
      2. Detailed explanation of core concepts.
      3. Examples and use cases.
      4. A summary of key takeaways.

      Format the output in clear Markdown. Use headings, bullet points, and code blocks where appropriate.
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ courseTitle, lessonTitle });
  } catch (error) {
    console.error(`AI Lesson generation failed for "${lessonTitle}". Falling back to rich local content generation.`, error);
    return generateLocalFallbackContent(courseTitle, lessonTitle);
  }
};

