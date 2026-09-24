import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini SDK
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables or AI Studio Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Robust fallback runner across available models with instant switching on 429 quota and retries for 503 capacity spikes
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

async function generateContentWithFallback(ai: GoogleGenAI, params: {
  contents: any;
  config?: any;
}) {
  let lastError: any = null;

  for (let mIdx = 0; mIdx < CANDIDATE_MODELS.length; mIdx++) {
    const model = CANDIDATE_MODELS[mIdx];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isRateLimit =
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 429 ||
        err?.code === 429;
      const isHighDemand =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        err?.status === 503 ||
        err?.code === 503 ||
        err?.status === 'UNAVAILABLE';

      console.warn(`[Gemini API] Model ${model} failed (${isRateLimit ? '429 RateLimit/Quota' : isHighDemand ? '503 HighDemand' : 'Error'}): ${errMsg.slice(0, 120)}...`);

      // On 503 capacity spike, give a quick 800ms retry before switching
      if (isHighDemand) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const retryResponse = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          return retryResponse;
        } catch {
          // Proceed to fallback model
        }
      }

      // If it is a 429 quota limit or 503, immediately proceed to the next model in the candidate pool
      continue;
    }
  }

  throw lastError;
}

function extractErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  let msg = error.message || String(error);
  try {
    const parsed = typeof msg === 'string' && msg.trim().startsWith('{') ? JSON.parse(msg) : null;
    if (parsed?.error?.message) {
      msg = parsed.error.message;
    }
  } catch {}

  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    return 'The AI service is momentarily experiencing high demand. Please try again in a few moments.';
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'The AI request rate limit was temporarily reached. Please wait a brief moment and retry.';
  }
  return msg;
}

// 1. Generate Study Material (Summary, Key Points, Key Terms, Plain English Explainer)
app.post('/api/study-material', async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    if (!notes || typeof notes !== 'string' || notes.trim().length < 10) {
      res.status(400).json({ error: 'Please provide valid study notes (at least 10 characters).' });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `You are StudyMate AI, an expert academic tutor. Analyze the following student study notes and provide a structured study package.

STUDY NOTES:
${notes.trim()}

Extract and synthesize:
1. A concise, engaging title for the topic.
2. A clear, comprehensive summary (2 to 3 paragraphs).
3. 5 to 8 essential key points.
4. Important terms / concepts with student-friendly definitions and context.
5. A "Plain English" / intuitive explanation using a simple real-world analogy to make the topic easy to grasp.
6. A list of 3 to 6 major topics/subtopics covered that students should revise.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite academic tutor who helps students comprehend and retain complex study material. Return only valid JSON according to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Concise topic title' },
            summary: { type: Type.STRING, description: 'Comprehensive 2-3 paragraph summary' },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key takeaways and essential facts'
            },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  context: { type: Type.STRING, description: 'Why it matters or an example' }
                },
                required: ['term', 'definition']
              },
              description: 'Important terms and definitions'
            },
            plainEnglishExplanation: {
              type: Type.STRING,
              description: 'Simple explanation with a clear, memorable real-life analogy'
            },
            revisionTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key topics to revise'
            }
          },
          required: ['title', 'summary', 'keyPoints', 'keyTerms', 'plainEnglishExplanation', 'revisionTopics']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('AI returned an empty response.');
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating study material:', error);
    res.status(500).json({
      error: extractErrorMessage(error)
    });
  }
});

// 2. Generate Interactive Quiz
app.post('/api/generate-quiz', async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes, questionCount = 5, difficulty = 'Moderate' } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length < 10) {
      res.status(400).json({ error: 'Please provide valid study notes before generating a quiz.' });
      return;
    }

    const count = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;
    const diff = ['Easy', 'Moderate', 'Hard'].includes(difficulty) ? difficulty : 'Moderate';

    const ai = getGeminiClient();
    const prompt = `You are StudyMate AI, an expert exam creator.
Generate exactly ${count} multiple-choice questions based strictly on the provided study notes.
Difficulty Level: ${diff}.

STUDY NOTES:
${notes.trim()}

Requirements:
- Each question must be clear, unambiguous, and directly test understanding from the notes.
- Each question must have EXACTLY four plausible answer choices (options: [option 0, option 1, option 2, option 3]).
- Exactly ONE answer must be correct.
- 'correctAnswer' must be the 0-based integer index (0, 1, 2, or 3) indicating the correct option.
- Include a helpful, educational explanation of why the correct option is right and why other options are incorrect.
- Include a specific subtopic tag for each question (e.g. "Photosynthesis - Light Reactions", "Newton's Laws - Inertia").`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert assessment designer creating rigorous, high-yield multiple-choice quizzes with detailed explanations.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER, description: 'Index from 0 to 3' },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctAnswer', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('AI returned an empty response.');
    }

    const parsed = JSON.parse(text);

    // Strict validation
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid quiz format received from AI model.');
    }

    // Clean and validate questions
    const validatedQuestions = parsed.questions.map((q: any, idx: number) => {
      let options = Array.isArray(q.options) ? q.options.map(String) : [];
      while (options.length < 4) {
        options.push(`Alternative choice ${options.length + 1}`);
      }
      if (options.length > 4) {
        options = options.slice(0, 4);
      }

      let correctIdx = Number(q.correctAnswer);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
        correctIdx = 0;
      }

      return {
        id: `q_${idx + 1}_${Date.now()}`,
        question: String(q.question || `Question ${idx + 1}`),
        options,
        correctAnswer: correctIdx,
        explanation: String(q.explanation || 'No explanation provided.'),
        topic: String(q.topic || 'General Topic')
      };
    });

    res.json({ questions: validatedQuestions });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      error: extractErrorMessage(error)
    });
  }
});

// 3. Ask StudyMate (Contextualized Q&A)
app.post('/api/ask-studymate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes, question, history = [] } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({ error: 'Please enter a question to ask StudyMate.' });
      return;
    }

    const ai = getGeminiClient();

    // Construct conversation context
    const conversationPrompt = `STUDENT STUDY NOTES CONTEXT:
${notes && notes.trim().length > 0 ? notes.trim() : '(No specific notes provided; answer using general academic principles)'}

CONVERSATION HISTORY:
${history.map((h: any) => `${h.role === 'user' ? 'Student' : 'StudyMate'}: ${h.content}`).join('\n')}

STUDENT'S NEW QUESTION:
${question.trim()}

Instructions:
- Provide a clear, supportive, student-friendly answer.
- Ground your answer in the study notes whenever relevant.
- If the student asks for mnemonics, analogies, or step-by-step simplification, provide them enthusiastically.
- Use clean Markdown with bolding and bullet points for readability.`;

    const response = await generateContentWithFallback(ai, {
      contents: conversationPrompt,
      config: {
        systemInstruction: 'You are StudyMate AI, a patient, brilliant, and encouraging student tutor. Your goal is to guide students to deep understanding with relatable explanations, analogies, and quick checks.',
      }
    });

    const reply = response.text || 'I could not generate an answer right now. Please rephrase your question.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in Ask StudyMate:', error);
    res.status(500).json({
      error: extractErrorMessage(error)
    });
  }
});

// 4. Analyze Quiz Results & Provide Revision Plan
app.post('/api/analyze-results', async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, total, missedQuestions = [], topicSummary = '' } = req.body;

    const ai = getGeminiClient();
    const prompt = `The student completed a quiz with a score of ${score} out of ${total} (${Math.round((score / total) * 100)}%).

Missed Questions:
${missedQuestions.length > 0 ? JSON.stringify(missedQuestions, null, 2) : 'None! The student got 100% correct!'}

General Topic context:
${topicSummary || 'General'}

Provide:
1. An encouraging, constructive performance assessment summary.
2. A prioritized list of topics/concepts the student MUST revise to fill their knowledge gaps.
3. 3 actionable, specific study tips tailored to the areas they struggled with.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic coach analyzing student quiz performance. Return JSON according to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            performanceAssessment: { type: Type.STRING, description: 'Constructive summary of performance' },
            revisionTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Topics that need review'
            },
            studyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable revision advice'
            }
          },
          required: ['performanceAssessment', 'revisionTopics', 'studyTips']
        }
      }
    });

    const text = response.text;
    const parsed = text ? JSON.parse(text) : {
      performanceAssessment: score === total ? 'Outstanding job! Full marks!' : 'Good effort! Review the missed questions below to solidify your understanding.',
      revisionTopics: missedQuestions.map((m: any) => m.topic).filter(Boolean),
      studyTips: ['Review key term definitions', 'Practice active recall with flashcards', 'Retake the quiz to check retention']
    };

    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing results:', error);
    // Provide a graceful fallback
    const { score, total, missedQuestions = [] } = req.body;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const missedTopics = Array.from(new Set(missedQuestions.map((m: any) => m.topic).filter(Boolean)));
    res.json({
      performanceAssessment: `You scored ${score}/${total} (${percentage}%). ${percentage >= 80 ? 'Great mastery!' : 'Keep practicing to master these concepts!'}`,
      revisionTopics: missedTopics.length > 0 ? missedTopics : ['Key definitions and core principles'],
      studyTips: [
        'Review the explanations for each missed question.',
        'Use Ask StudyMate to clarify tricky concepts.',
        'Retake this quiz to test your memory consolidation.'
      ]
    });
  }
});

// Setup Vite in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
