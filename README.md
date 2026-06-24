# 🚀 QuizVerse AI

**QuizVerse AI** is a next-generation, AI-powered real-time multiplayer quiz platform inspired by Kahoot, Quizizz, and Blooket. Build, host, and play live quizzes with dynamic AI features, real-time multiplayer gameplay, global leaderboards, streaks, achievements, and beautiful glassmorphism UI.

---

## 🌟 Core Features

### 🔐 Authentication
- **Google Login & Email/Password** support.
- **Guest Mode** for quick play.
- **User Profiles** with custom Avatar selection and stats.

### 🧠 AI-Powered Quiz Generation
- Generate entire quizzes from a **Topic**, **Wikipedia Article URL**, **PDF File**, or **Pasted Text**.
- Auto-create Easy, Medium, and Hard difficulty questions.
- **AI-powered hints** during gameplay.
- **AI explanations** after each answer to enhance learning.

### 🎮 Live Multiplayer Gameplay
- **Real-time game lobbies** using WebSockets (Socket.IO).
- Interactive gameplay with timers, live score updates, streaks, and combo multipliers.
- Podium screens and detailed post-game analytics.

### 📝 Comprehensive Quiz Creation
- Create, Edit, and Delete public/private quizzes.
- Support for Multiple Choice, True/False, Image-based, and Audio-based questions.
- Customizable timers and categories.

### 🏆 Gamification
- **Global Leaderboards** and player ranking.
- **Achievements & Badges** system for milestones.
- **Level Progression** (XP based on performance).

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS v4 (Glassmorphism, Neon Accents, Dark Mode)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Real-time:** Socket.IO Client

### Backend (Server)
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB
- **ORM:** Prisma
- **Real-time Engine:** Socket.IO
- **AI Integration:** OpenAI API
- **Validation:** Zod

---

## 📂 Project Structure

This project is set up as an npm workspace monorepo.

```text
QuizVerse-AI/
├── client/         # Next.js frontend application
├── server/         # Express.js & Socket.IO backend API
├── package.json    # Monorepo root workspaces config
└── DEPLOYMENT.md   # Deployment instructions
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance or MongoDB Atlas)
- **OpenAI API Key** (for AI Quiz Generation)

### 1. Clone the repository
```bash
git clone https://github.com/Mohit-07-delta/QuizVerse-.git
cd QuizVerse-
```

### 2. Install dependencies
Install dependencies for both the frontend and backend from the root directory:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory and configure the required variables (see `server/.env.example`).
```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```
You may also need a `.env.local` in the `client` directory for Next.js public variables (like your API URL).

### 4. Database Setup
Push the Prisma schema to your MongoDB database:
```bash
cd server
npx prisma db push
```

### 5. Run the Application
Start both the client and server concurrently from the root directory:
```bash
npm run dev
```

- **Frontend Client:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`

---

## 🎨 Design System
QuizVerse uses a premium, modern design aesthetic featuring dark mode by default, vibrant neon gradients, smooth micro-interactions via Framer Motion, and layered glassmorphism components.

---

## 📜 License
This project is licensed under the MIT License.
