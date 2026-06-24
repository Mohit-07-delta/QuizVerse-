import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URL: process.env.MONGODB_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "quizverse-super-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

export default config;
