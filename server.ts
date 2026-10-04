import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST endpoint to generate Olympiad questions using Gemini AI
app.post('/api/generate-questions', async (req, res) => {
  const { subject, grade, topic, difficulty, count = 3 } = req.body;

  if (!aiClient) {
    return res.status(200).json({
      success: false,
      fallbackNeeded: true,
      message: 'GEMINI_API_KEY not configured on server, client will use curated question bank.',
      questions: [],
    });
  }

  try {
    const prompt = `You are a world-class Olympiad examination creator for primary school students.
Create ${count} original multiple-choice questions for:
Subject: ${subject} (${subject === 'IMO' ? 'International Mathematics Olympiad' : subject === 'ISO' ? 'International Science Olympiad' : 'International Computer Science Olympiad'})
Grade: ${grade} (Ages ${grade === 'Grade 3' ? '8-9' : grade === 'Grade 4' ? '9-10' : '10-11'})
Topic: ${topic}
Difficulty: ${difficulty} (Easy = fundamental concept, Medium = concept + application, Hard = multi-step reasoning, Olympiad Challenge = tricky reasoning, pattern logic or non-obvious deduction)

CRITICAL QUALITY RULES:
1. Make sure questions test real conceptual understanding, logical deduction, and problem-solving appropriate for ${grade}.
2. Provide exactly 4 distinct options (A, B, C, D) with exactly one unambiguous correct answer.
3. Distractors must be plausible common misconceptions, NOT nonsense.
4. For Math: Programmatically verify all numbers, calculations, and formulas before returning.
5. For Science & Computer Science: Validate factual accuracy for modern elementary education.
6. The explanation MUST be clear, friendly, and step-by-step for a ${grade} child.
7. Label sourceType as "generated".
`;

    let response;
    try {
      response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are an expert Olympiad question designer for children. Always output valid JSON strictly matching the requested schema. Ensure zero ambiguity, exactly one correct option, exactly 4 options labeled A, B, C, D, and simple kid-friendly explanations.`,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Exactly 4 choices',
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: 'The exact string matching one of the options or letter A/B/C/D',
                },
                correctOptionIndex: {
                  type: Type.INTEGER,
                  description: '0 for A, 1 for B, 2 for C, 3 for D',
                },
                explanation: { type: Type.STRING },
                subject: { type: Type.STRING },
                grade: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                sourceType: { type: Type.STRING },
              },
              required: [
                'question',
                'options',
                'correctAnswer',
                'correctOptionIndex',
                'explanation',
                'subject',
                'grade',
                'topic',
                'difficulty',
              ],
            },
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model error, attempting flash-lite fallback:', primaryErr?.message);
      response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction: `You are an expert Olympiad question designer for children. Always output valid JSON strictly matching the requested schema. Ensure zero ambiguity, exactly one correct option, exactly 4 options labeled A, B, C, D, and simple kid-friendly explanations.`,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                subject: { type: Type.STRING },
                grade: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                sourceType: { type: Type.STRING },
              },
              required: [
                'question',
                'options',
                'correctAnswer',
                'correctOptionIndex',
                'explanation',
                'subject',
                'grade',
                'topic',
                'difficulty',
              ],
            },
          },
        },
      });
    }

    const jsonText = response.text?.trim() || '[]';
    let rawQuestions = [];
    try {
      rawQuestions = JSON.parse(jsonText);
    } catch {
      rawQuestions = [];
    }

    return res.json({
      success: true,
      questions: rawQuestions,
    });
  } catch (error: any) {
    console.error('Gemini generation error:', error?.message || error);
    return res.status(200).json({
      success: false,
      fallbackNeeded: true,
      error: error?.message || 'Failed to generate with AI',
      questions: [],
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Olympiad Buddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
