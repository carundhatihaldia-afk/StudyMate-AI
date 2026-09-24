export interface KeyTerm {
  term: string;
  definition: string;
  context?: string;
}

export interface StudyMaterial {
  title: string;
  summary: string;
  keyPoints: string[];
  keyTerms: KeyTerm[];
  plainEnglishExplanation: string;
  revisionTopics: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic?: string;
}

export interface QuizConfig {
  questionCount: 5 | 10 | 15;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
}

export interface MissedQuestionInfo {
  questionIndex: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export interface QuizAnalysis {
  performanceAssessment: string;
  revisionTopics: string[];
  studyTips: string[];
}

export interface QuizResult {
  totalQuestions: number;
  score: number;
  percentage: number;
  answers: Record<number, number>; // index of question -> chosen option index
  missedQuestions: MissedQuestionInfo[];
  analysis?: QuizAnalysis;
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TopicRevisionItem {
  topic: string;
  missedCount: number;
  mastered: boolean;
}

export interface DashboardStats {
  totalQuizzesTaken: number;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  averageScore: number;
  topicsToRevise: TopicRevisionItem[];
  recentSessions: {
    id: string;
    title: string;
    date: string;
    score: number;
    total: number;
    difficulty: string;
  }[];
}
