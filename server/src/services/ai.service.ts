import OpenAI from "openai";
import config from "../config/index.js";
import type { IQuestion } from "../types/index.js";
import { fetchArticle } from "./wikipedia.service.js";

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a quiz question generator for an educational quiz platform called QuizVerse AI. 
You generate high-quality, accurate, and engaging quiz questions.
Always return valid JSON. Never include markdown code fences in your response.
Each question must have exactly 4 options for MCQ or 2 options (True/False) for TRUE_FALSE type.
The correctAnswer field is a 0-based index of the correct option.
Provide helpful hints and clear explanations.`;

function buildGenerationPrompt(
  source: string,
  count: number,
  difficulty: string
): string {
  return `Generate ${count} quiz questions from the following ${source}.

Difficulty level: ${difficulty}

Return a JSON array of objects with this exact structure:
[
  {
    "text": "The question text",
    "type": "MCQ",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficulty": "${difficulty === "MIXED" ? "EASY" : difficulty}",
    "hints": ["A helpful hint"],
    "explanation": "Why this answer is correct"
  }
]

Rules:
- For MCQ questions, always provide exactly 4 options
- For TRUE_FALSE questions, provide exactly ["True", "False"] as options
- correctAnswer is the 0-based index of the correct option
- Vary question difficulty if MIXED is specified
- Make questions educational and interesting
- Ensure all facts are accurate
- Hints should guide without giving away the answer
- Explanations should be informative and educational`;
}

function parseAIResponse(content: string): IQuestion[] {
  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);
  const questions: IQuestion[] = [];

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  for (const q of parsed) {
    const question: IQuestion = {
      text: String(q.text || ""),
      type: q.type === "TRUE_FALSE" ? "TRUE_FALSE" : "MCQ",
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
      timer: typeof q.timer === "number" ? q.timer : 30,
      difficulty:
        q.difficulty === "EASY" || q.difficulty === "MEDIUM" || q.difficulty === "HARD"
          ? q.difficulty
          : "MEDIUM",
      hints: Array.isArray(q.hints) ? q.hints.map(String) : [],
      explanation: q.explanation ? String(q.explanation) : null,
      imageUrl: q.imageUrl ? String(q.imageUrl) : null,
    };

    // Validate option count
    if (question.type === "MCQ" && question.options.length < 2) {
      question.options = ["Option A", "Option B", "Option C", "Option D"];
      question.correctAnswer = 0;
    }
    if (question.type === "TRUE_FALSE" && question.options.length !== 2) {
      question.options = ["True", "False"];
    }

    // Clamp correctAnswer
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      question.correctAnswer = 0;
    }

    questions.push(question);
  }

  return questions;
}

export async function generateFromTopic(
  topic: string,
  count: number = 5,
  difficulty: string = "MIXED"
): Promise<IQuestion[]> {
  const prompt = buildGenerationPrompt("topic", count, difficulty);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${prompt}\n\nTopic: ${topic}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model.");
  }

  return parseAIResponse(content);
}

export async function generateFromText(
  text: string,
  count: number = 5,
  difficulty: string = "MIXED"
): Promise<IQuestion[]> {
  const prompt = buildGenerationPrompt("text content", count, difficulty);

  // Truncate text if too long (leave room for prompt)
  const truncatedText = text.length > 8000 ? text.substring(0, 8000) + "..." : text;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${prompt}\n\nText Content:\n${truncatedText}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model.");
  }

  return parseAIResponse(content);
}

export async function generateFromWikipedia(
  url: string,
  count: number = 5,
  difficulty: string = "MIXED"
): Promise<{ questions: IQuestion[]; articleTitle: string; articleSummary: string }> {
  const article = await fetchArticle(url);

  if (!article.summary && !article.fullText) {
    throw new Error("Could not fetch Wikipedia article content.");
  }

  const textContent = article.fullText || article.summary;
  const questions = await generateFromText(textContent, count, difficulty);

  return {
    questions,
    articleTitle: article.title,
    articleSummary: article.summary,
  };
}

export async function generateHint(
  question: string,
  existingHints: string[]
): Promise<string> {
  const existingText =
    existingHints.length > 0
      ? `\nExisting hints (do NOT repeat these):\n${existingHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
      : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful quiz assistant. Generate a single helpful hint for the given question. The hint should guide the player toward the answer without giving it away directly. Return only the hint text, no formatting or quotation marks.",
      },
      {
        role: "user",
        content: `Question: ${question}${existingText}\n\nGenerate one new, unique hint:`,
      },
    ],
    temperature: 0.8,
    max_tokens: 150,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model.");
  }

  return content.trim();
}

export async function generateExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful educational assistant. Explain why the correct answer is right and, if the user's answer was wrong, why it's incorrect. Be concise, informative, and encouraging. Return only the explanation text.",
      },
      {
        role: "user",
        content: `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}\n\nProvide a clear explanation:`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model.");
  }

  return content.trim();
}
