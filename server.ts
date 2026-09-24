import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
];

async function generateWithFallback(options: {
  contents: string | any[];
  config?: any;
}) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      return await ai.models.generateContent({
        model,
        ...options,
      });
    } catch (err: any) {
      lastError = err;
      const errStr = JSON.stringify(err) + (err?.message || '');
      console.warn(`[EduGenie] Model ${model} encountered error: ${errStr.slice(0, 120)}... Retrying with next model.`);
      // Wait 300ms before trying the next model
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastError;
}

// Helper to check Gemini key
function checkApiKey(res: Response): boolean {
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
    });
    return false;
  }
  return true;
}

// ----------------------------------------------------
// 1. /qa Endpoint (Academic & General Q&A)
// ----------------------------------------------------
async function handleQA(req: Request, res: Response) {
  if (!checkApiKey(res)) return;
  try {
    const { question, language = 'English' } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await generateWithFallback({
      contents: `Student Question: "${question}"\nTarget Language: ${language}`,
      config: {
        systemInstruction: `You are EduGenie Q&A Assistant.
Answer the question accurately, concisely, and clearly.
Respond in ${language}.
Format as JSON matching the schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING, description: 'Clear, direct, and concise explanation with markdown formatting.' },
            key_takeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 core takeaway bullet points.',
            },
            related_topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 related concepts to study next.',
            },
          },
          required: ['answer', 'key_takeaways', 'related_topics'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.question = question;
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /qa:', err);
    res.status(500).json({ error: err.message || 'Failed to answer question.' });
  }
}

app.post('/qa', handleQA);
app.post('/api/qa', handleQA);
app.post('/api/ask', handleQA); // backward compatibility

// ----------------------------------------------------
// 2. /explain Endpoint (Concept Explanation with Lightweight Model Mode)
// ----------------------------------------------------
async function handleExplain(req: Request, res: Response) {
  if (!checkApiKey(res)) return;
  try {
    const { topic, use_lightweight = true, language = 'English', level = 'simple' } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const modelDescription = use_lightweight
      ? 'LaMini-Flan-T5 (Lightweight Local Mode): Use very simple, beginner-friendly vocabulary, minimal jargon, and playful everyday comparisons.'
      : 'Comprehensive Google Gemini 3.8 Flash Mode: In-depth academic rigor with foundational and modern principles.';

    const response = await generateWithFallback({
      contents: `Explain this concept: "${topic}"\nMode: ${modelDescription}\nLanguage: ${language}`,
      config: {
        systemInstruction: `You are EduGenie's Concept Simplifier.
Explain difficult topics in simple, beginner-friendly language.
Include a memorable everyday analogy.
Target language: ${language}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            explanation: { type: Type.STRING, description: 'Clear, intuitive beginner explanation (150-250 words).' },
            simple_analogy: { type: Type.STRING, description: 'An intuitive real-world analogy.' },
            model_used: { type: Type.STRING },
            key_concepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 bullet concepts.',
            },
          },
          required: ['topic', 'explanation', 'simple_analogy', 'model_used', 'key_concepts'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.model_used = use_lightweight
      ? 'LaMini-Flan-T5 (Lightweight Mode)'
      : 'Google Gemini 3.8 Flash';
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /explain:', err);
    res.status(500).json({ error: err.message || 'Failed to explain concept.' });
  }
}

app.post('/explain', handleExplain);
app.post('/api/explain', handleExplain);

// ----------------------------------------------------
// 3. /quiz Endpoint (Creates 3 MCQs with 4 options each)
// ----------------------------------------------------
async function handleQuiz(req: Request, res: Response) {
  if (!checkApiKey(res)) return;
  try {
    const { topic = '', passage = '', language = 'English', num_questions = 3 } = req.body;
    if (!topic && !passage) {
      return res.status(400).json({ error: 'Either topic or passage must be provided' });
    }

    const source = passage
      ? `Passage: """\n${passage.slice(0, 12000)}\n"""\nTopic hint: ${topic || 'Material'}`
      : `Topic: "${topic}"`;

    const response = await generateWithFallback({
      contents: `Generate a multiple choice quiz from the following:\n${source}\nLanguage: ${language}`,
      config: {
        systemInstruction: `You are EduGenie Quiz Master.
Generate EXACTLY 3 multiple-choice questions.
Each question MUST have exactly 4 plausible options.
Identify the correct answer using 0-based "correct_option_index" (0, 1, 2, or 3).
Provide a clear pedagogical explanation for the correct answer.
Respond strictly in ${language}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Array of exactly 4 choices.',
                  },
                  correct_option_index: {
                    type: Type.INTEGER,
                    description: 'Index of correct answer (0, 1, 2, or 3).',
                  },
                  explanation: { type: Type.STRING, description: 'Explanation of why this answer is correct.' },
                },
                required: ['id', 'question', 'options', 'correct_option_index', 'explanation'],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /quiz:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
}

app.post('/quiz', handleQuiz);
app.post('/api/quiz', handleQuiz);

// ----------------------------------------------------
// 4. /summarize Endpoint (Concise Educational Summaries)
// ----------------------------------------------------
async function handleSummarize(req: Request, res: Response) {
  if (!checkApiKey(res)) return;
  try {
    const { text, language = 'English' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const response = await generateWithFallback({
      contents: `Text to summarize:\n"""\n${text.slice(0, 15000)}\n"""\nLanguage: ${language}`,
      config: {
        systemInstruction: `You are EduGenie Text Summarizer.
Summarize long educational passages while retaining crucial academic information.
Present it in an easy-to-understand format.
Respond in ${language}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Concise title for the material.' },
            summary: { type: Type.STRING, description: 'Concise, clear overview synthesis.' },
            key_points: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 to 6 core takeaways.',
            },
            quick_takeaway: { type: Type.STRING, description: 'One-sentence final takeaway / exam recall point.' },
          },
          required: ['title', 'summary', 'key_points', 'quick_takeaway'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /summarize:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize text.' });
  }
}

app.post('/summarize', handleSummarize);
app.post('/api/summarize', handleSummarize);

// ----------------------------------------------------
// 5. /learn/recommendations Endpoint (Beginner to Advanced Roadmap)
// ----------------------------------------------------
async function handleLearningRecommendations(req: Request, res: Response) {
  if (!checkApiKey(res)) return;
  try {
    const { topic, language = 'English' } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const response = await generateWithFallback({
      contents: `Generate a 3-tier learning path for: "${topic}".\nLanguage: ${language}`,
      config: {
        systemInstruction: `You are EduGenie Curriculum Architect.
Generate a structured learning path progressing from Beginner to Intermediate to Advanced levels.
Include suggested timelines, subtopics, resources, and practical milestones.
Respond in ${language}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            overview: { type: Type.STRING, description: 'Roadmap overview and learning objectives.' },
            tiers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING, description: 'Beginner, Intermediate, or Advanced' },
                  duration: { type: Type.STRING, description: 'Estimated time/weeks' },
                  subtopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['title', 'type', 'description'],
                    },
                  },
                  milestone: { type: Type.STRING, description: 'Practical checkpoint project or test' },
                },
                required: ['level', 'duration', 'subtopics', 'resources', 'milestone'],
              },
            },
          },
          required: ['topic', 'overview', 'tiers'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /learn/recommendations:', err);
    res.status(500).json({ error: err.message || 'Failed to generate learning recommendations.' });
  }
}

app.post('/learn/recommendations', handleLearningRecommendations);
app.post('/api/learn/recommendations', handleLearningRecommendations);
app.post('/api/recommendations', handleLearningRecommendations);

// Endpoint to view the backend Python files
app.get('/api/python-code/:file', (req: Request, res: Response) => {
  const allowed = [
    'main.py',
    'qna.py',
    'explanation_module.py',
    'quiz_module.py',
    'summary_module.py',
    'learning_path.py',
    'requirements.txt',
    'README.md',
  ];
  const file = req.params.file;
  if (!allowed.includes(file)) {
    return res.status(404).json({ error: 'File not found' });
  }
  const filePath = path.resolve(__dirname, 'backend', file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ filename: file, content });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`EduGenie server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
