# 🎓 EduAI — AI-Powered Smart Learning Platform

EduAI is a next-generation EdTech platform built with **Next.js**, **Express**, and **Neon PostgreSQL**. It utilizes **Firebase Authentication** and advanced LLMs (via **LangChain** with **Gemini / OpenRouter**) to deliver adaptive, interactive, and offline-resilient learning experiences for students, instructors, and administrators.

---

## 📂 Project Architecture

The project is structured as a monorepo containing decoupled frontend and backend applications:

```
├── backend/                  # Express REST API (TypeScript)
│   ├── prisma/               # Database schemas & Prisma Client configuration
│   └── src/
│       ├── lib/              # Core utilities (AI fallbacks, Firebase Admin, logger)
│       ├── middleware/       # RBAC & Firebase token verification
│       └── routes/           # Express endpoints (AI, courses, users, community)
│
├── frontend/                 # Web Application (Next.js App Router)
│   ├── public/               # Static assets, icons, and diagrams
│   └── src/
│       ├── app/              # Client-side views (Dashboards, Course workspaces)
│       ├── components/       # Reusable layout and interactive UI components
│       ├── context/          # State providers (Firebase Auth Context)
│       └── lib/              # API Client & Axios interceptors
```

---

## ✨ Features Breakdown

### 👨‍🎓 Student Workspace
* 💬 **Interactive AI Tutor**: A 24/7 chat-based learning companion providing step-by-step explanations, custom hints, and concept breakdowns.
* 🔍 **Visual Doubt Solver**: A vision-enabled problem solver. Students can upload screenshots of math, science, or programming questions and get instant OCR-parsed answers.
* 📝 **AI Quiz Generator**: Generates customized 5-question multiple-choice quizzes for any lesson, complete with explanations and points reward.
* ⚡ **Streak & Gamification**: Interactive activity tracker and heatmaps that count learning points, levels, and consecutive login streaks.
* 📚 **Responsive Course Viewer**: Track enrollment, monitor progress bars, and read lessons rendered in rich, styled Markdown.
* 📓 **Smart Summarizer**: Instantly turns long texts or external study notes into clear, bullet-pointed summaries.

### 👨‍🏫 Instructor Workspace
* 🪄 **AI Course Wizard**: Just type a topic, target audience, and duration, and the AI automatically designs a complete multi-week course syllabus and generates the lesson content.
* 🛠️ **Manual Course Builder**: A dynamic outline manager to build courses manually by adding weeks, naming lessons, and writing custom educational content directly in the browser.
* 🎭 **Hybrid Content Sourcing**: Check a box to let the AI auto-generate lesson content, or write your own custom material using the built-in Markdown editor.
* 📊 **Instructor Analytics**: Visual dashboards summarizing total enrolled students, course-specific progress averages, and total revenue metrics.

### 👑 Administrator Console
* 👥 **User Management**: A master directory of all registered users on the platform, showing their names, emails, signup dates, and current roles.
* 🔑 **Role Manager (RBAC)**: Upgrade or downgrade user credentials between `STUDENT`, `INSTRUCTOR`, and `ADMIN` with security safeguards to prevent self-demotion.
* 📈 **System Overview Stats**: High-level telemetry displaying total active sessions, user counts, course catalogs, and enrollment metrics.
* 🏥 **System Health Check**: Verifies live database connections, storage availability, and AI API response times from the admin panel.

---

## 🛡️ Offline & Rate-Limit Resilience
To ensure zero service downtime during network drops or API rate-limit errors (e.g. `HTTP 429 Too Many Requests`), the platform features **hybrid local fallbacks** for all core AI services:
* **Lesson Content Fallback**: Automatically creates structured, highly informative mock lessons based on the requested titles.
* **Quiz Fallback**: Serves a structured 5-question foundational MCQ layout for the requested topic.
* **Notes/Tutor Fallbacks**: Executes local syntactic analysis to create summaries or guide student questions.
* **Vision Fallback**: Inspects file buffers to output structured visual doubt advice.

---

## ⚙️ Step-by-Step Installation Guide (Beginner Friendly)

Follow these instructions to get the project running on your local machine.

### 1. Prerequisites (Setup Your Tools)
* **Node.js**: Download and install Node.js (v18 or higher) from [nodejs.org](https://nodejs.org/). This installs both `node` and `npm`.
* **Database**: Sign up for a free PostgreSQL database at [neon.tech](https://neon.tech/) and copy your database connection string.
* **Firebase**: 
  1. Create a free project in the [Firebase Console](https://console.firebase.google.com/).
  2. Go to **Build** > **Authentication**, enable the Email/Password and Google sign-in methods.
  3. Go to **Project Settings** > **Service Accounts** and click **Generate new private key**. Keep this downloaded `.json` file safe.
* **Stripe**: Sign up for a free account at [dashboard.stripe.com](https://dashboard.stripe.com/). Navigate to **Developers** > **API keys** to get your publishable and secret keys. Also create a webhook endpoint (for local dev, use the Stripe CLI) pointing to `{BACKEND_URL}/api/payments/webhook` to collect the `checkout.session.completed` event.

---

### 2. Backend Setup
1. **Open your Terminal/Command Prompt** and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a new file named `.env` in the `backend/` folder and paste the following template:
   ```env
    # PostgreSQL database connection string (obtained from Neon)
    DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
    
    # Server Port
    PORT=5000
    
    # Mode (development or production)
    NODE_ENV=development
    
    # AI Configuration (Obtain from Google AI Studio)
    GOOGLE_API_KEY="your-gemini-api-key"
    
    # OpenRouter (alternative AI provider, optional)
    OPENROUTER_API_KEY="your-openrouter-api-key"
    
    # Firebase Admin Configuration (Copy values from your downloaded Firebase .json key file)
    FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id","private_key":"-----BEGIN PRIVATE KEY-----\n..."}'
    
    # Stripe Payments (Obtain from https://dashboard.stripe.com/apikeys)
    STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
    STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
    
    # Frontend URL (for Stripe redirect URLs)
    FRONTEND_URL="http://localhost:3000"
    ```
4. **Initialize the Database**:
   Run the following commands to push your schema definitions to Neon and generate the Prisma Client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. **Start the API Server**:
   ```bash
   npm run dev
   ```
   You should see: `🚀 Server running on port 5000 [development]`.

---

### 3. Frontend Setup
1. **Open a new terminal window**, navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a new file named `.env.local` in the `frontend/` folder and paste the following template:
   ```env
    # API Server Endpoint URL
    NEXT_PUBLIC_API_URL="http://localhost:5000/api"
    
    # Firebase Web App Config (Obtained from Firebase Console > Project Settings > General > Your Apps)
    NEXT_PUBLIC_FIREBASE_API_KEY="your-web-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    
    # Stripe Publishable Key (Obtain from https://dashboard.stripe.com/apikeys)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
    ```
4. **Start the Next.js Dev Server**:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to start exploring the app!

---

## 🚀 Production Deployment Guide

### 1. Deploy the Backend on Render
1. Register on [render.com](https://render.com/).
2. Click **New +** > **Web Service** and connect your GitHub repository.
3. Apply these settings:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npx prisma generate && npm run build`
   * **Start Command**: `npm start`
4. Under the **Environment** tab, add your backend `.env` variables (`DATABASE_URL`, `GOOGLE_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, etc.). Make sure **`PORT`** is set to `10000` and **`NODE_ENV`** is set to `production`.

---

### 2. Deploy the Frontend on Vercel
1. Register on [vercel.com](https://vercel.com/) and connect your GitHub account.
2. Click **Add New** > **Project** and import your repository.
3. Configure the settings:
   * **Root Directory**: Select the `frontend` folder.
   * **Framework Preset**: `Next.js`.
4. Add all variables from your `frontend/.env.local` to Vercel's **Environment Variables** list.
   * ⚠️ **IMPORTANT**: Set **`NEXT_PUBLIC_API_URL`** to your deployed Render URL ending with `/api` (e.g. `https://your-backend.onrender.com/api`).
5. Click **Deploy**.

---

### 3. Add Authorized Domains in Firebase
To allow sign-ins from your new production Vercel domain:
1. Go to your **Firebase Console** > **Authentication** > **Settings** tab.
2. Select **Authorized domains** on the left.
3. Click **Add Domain** and enter your Vercel frontend URL (e.g. `your-app-name.vercel.app`). Do not include `https://` or trailing slashes.

---

## 🔭 Future Scope & Roadmap

We plan to expand the capabilities of the EduAI platform with the following roadmap features:

* 📹 **Live Classrooms**: Peer-to-peer real-time video conferencing for online lectures, complete with live AI transcription and note-taking.
* 🧠 **RAG-Powered Deep Search**: Let students query all course documents, files, and lectures using a unified Semantic/Vector search engine.
* 📱 **Mobile Application**: Port the student workspace into native iOS and Android apps using React Native.
* 💬 **Multiplayer Study Lounges**: Virtual co-working rooms where students can join group quizzes and collaborate on programming labs in real-time.
* 🏆 **Automated AI Code Evaluation**: A sandboxed execution environment where coding lessons automatically compile and evaluate student solutions.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///d:/web%20Development/Comback/Ai%20powered%20educational%20platform/LICENSE) file for details.
