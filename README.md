# 🎓 EduAI — AI-Powered Smart Learning Platform

 EduAI is a next-generation EdTech platform built with **Next.js**, **Express**, and **Neon PostgreSQL**. It utilizes **Firebase Authentication** and advanced LLMs (via **LangChain** with **Gemini / OpenRouter**) to deliver adaptive, interactive, and offline-resilient learning experiences for both students and instructors.

---

## 📂 Project Architecture

The project is structured as a monorepo containing decoupled frontend and backend applications:

```
├── backend/                  # Express REST API (TypeScript)
│   ├── prisma/               # Schema definitions & database client
│   └── src/
│       ├── lib/              # Core utilities (AI fallbacks, Firebase admin, activities)
│       ├── middleware/       # RBAC & Firebase token verification
│       └── routes/           # REST endpoints (AI, courses, users, community)
│
├── frontend/                 # Client Application (Next.js App Router)
│   ├── public/               # Static assets & icons
│   └── src/
│       ├── app/              # Views (Dashboard, Student workspace, Instructor tools)
│       ├── context/          # State providers (Firebase Auth context)
│       └── lib/              # API interceptors and fetching logic
```

---

## ✨ Core Features

### 👨‍🎓 Student Workspace
* **Interactive AI Tutor**: 24/7 chat-based learning companion providing step-by-step explanations and hints.
* **Visual Doubt Solver**: Vision-based problem analysis supporting uploaded files and image OCR queries.
* **AI Quiz Generator**: Creates customized 5-question multiple-choice quizzes complete with answers and context-aware feedback.
* **Smart Notes**: Summarizes lengthy educational articles into clear, digestible bullet points.
* **My Courses Tracker**: Track enrollment status, course progress bars, and read lessons formatted in rich, responsive Markdown.

### 👨‍🏫 Instructor Workspace
* **AI Course Wizard**: Describe a topic, select a target audience, specify duration, and let AI build the course outline and background lessons.
* **Manual Course Builder**: Handcraft courses manually. Dynamic forms allow teachers to type title/description, add/remove weeks, define lesson names, and insert custom lesson material directly in the browser.
* **Hybrid Content Sourcing**: Choose whether to let the background AI generate content for a lesson, or type in customized Markdown material.

---

## 🛡️ Offline & Rate-Limit Resilience
To ensure zero service downtime during network drops or API rate-limit errors (e.g. `HTTP 429 Too Many Requests`), the platform features **hybrid local fallbacks** for all core AI services:
* **Lesson Content Fallback**: Automatically creates rich, thematic course text based on lesson and course titles.
* **Quiz Fallback**: Serves a structured 5-question foundational MCQ layout for the requested topic.
* **Notes/Tutor Fallbacks**: Executes local syntactic analysis to create summaries or guide student questions.
* **Vision Fallback**: Inspects file buffers to output structured visual doubt advice.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
* **Node.js** v18 or higher
* A serverless/local **PostgreSQL** database (optimized for Neon Serverless Postgres)
* A **Firebase Project** (for student/instructor authentication)
* An API key for **Gemini** (`GOOGLE_API_KEY`) or **OpenRouter** (`OPENROUTER_API_KEY`)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file matching:
   ```env
   DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   PORT=5000
   
   # AI Configuration (Configure at least one)
   GOOGLE_API_KEY="your-gemini-key"
   OPENROUTER_API_KEY="your-openrouter-key"
   
   # Firebase configuration credentials
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   ```
4. Synchronize database schemas and generate Prisma clients:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. *(Optional)* If you have legacy courses with missing lesson content, execute the repair script:
   ```bash
   npx ts-node src/migrate-lessons.ts
   ```
6. Start the API server in development mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure local environment variables. Create a `.env.local` file matching:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   
   # Firebase Web Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000` to interact with the platform.

---

## 🛠️ Verification & Production Builds
To test the type safety and readiness for production deployment, you can run compiling commands for both projects:
* **Backend build**: `cd backend && npm run build` (compiles via `tsc`)
* **Frontend build**: `cd frontend && npm run build` (compiles via Next.js compiler)

---

## 📄 License
This project is licensed under the MIT License.
