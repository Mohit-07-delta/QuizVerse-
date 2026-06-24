# QuizVerse AI — Deployment & Production Guide

This guide covers deploying the monorepo application to production.

---

## Technical Stack Architecture

- **Frontend**: Next.js 15 (React 19, Tailwind CSS v4, Zustand, Framer Motion)
- **Backend**: Express.js, TypeScript, Socket.IO
- **Database**: MongoDB Atlas via Prisma ORM

---

## 1. Database Setup (MongoDB Atlas)

1. Sign up/Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (M0) and choose a region.
3. In **Database Access**, create a user with read/write privileges. Note the password.
4. In **Network Access**, add IP Address `0.0.0.0/0` (allow access from anywhere) or restrict to your hosting server IPs.
5. Get your connection string:
   - Click **Connect** → **Drivers**
   - Copy the URI template. It looks like:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/quizverse?retryWrites=true&w=majority`
   - Swap `<username>` and `<password>` with your database user credentials.

---

## 2. Backend Deployment (Render / Heroku)

Deploy the backend Express + Socket.IO server:

1. Connect your Github Repository to [Render](https://render.com/).
2. Create a new **Web Service**.
3. Set the following settings:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   - `PORT`: `5000` or Render default
   - `MONGODB_URL`: Your MongoDB Atlas URI connection string
   - `JWT_SECRET`: A long secure string
   - `OPENAI_API_KEY`: Your OpenAI Secret key (starts with `sk-`)
   - `CORS_ORIGIN`: URL of your frontend deployment (e.g. `https://quizverse-ai.vercel.app`)
5. Deploy.

---

## 3. Frontend Deployment (Vercel)

Deploy the Next.js frontend:

1. Sign up/Log in to [Vercel](https://vercel.com).
2. Import your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `client`
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend Web Service URL (e.g. `https://quizverse-server.onrender.com/api/v1`)
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend base URL (e.g. `https://quizverse-server.onrender.com`)
5. Click **Deploy**.

---

## 4. Run Locally (Development)

1. Set up your `.env` file in the root workspace copying `.env.example`.
2. Run Prisma database initialization:
   ```bash
   cd server
   npx prisma db push
   npx prisma generate
   ```
3. Run development servers:
   ```bash
   cd ..
   npm run dev
   ```
   - Frontend starts on `http://localhost:3000`
   - Backend starts on `http://localhost:5000`
