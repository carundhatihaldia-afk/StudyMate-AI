import { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { NotesInput } from './components/NotesInput.tsx';
import { StudyMaterialView } from './components/StudyMaterialView.tsx';
import { QuizSection } from './components/QuizSection.tsx';
import { StudyDashboard } from './components/StudyDashboard.tsx';
import { 
  StudyMaterial, 
  QuizQuestion, 
  QuizConfig, 
  QuizResult, 
  DashboardStats 
} from './types.ts';
import { 
  Sparkles
} from 'lucide-react';

const LOCAL_STORAGE_STATS_KEY = 'studymate_dashboard_stats_v1';
const LOCAL_STORAGE_NOTES_KEY = 'studymate_saved_notes_v1';
const LOCAL_STORAGE_MATERIAL_KEY = 'studymate_saved_material_v1';

const INITIAL_STATS: DashboardStats = {
  totalQuizzesTaken: 0,
  totalQuestionsAttempted: 0,
  totalCorrectAnswers: 0,
  averageScore: 0,
  topicsToRevise: [],
  recentSessions: [],
};

export default function App() {
  // Main Navigation Tab (Study Notes, AI Quiz, Dashboard)
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'dashboard'>('notes');

  // Notes & Study Material State
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_NOTES_KEY) || '';
  });

  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MATERIAL_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Dashboard Stats State (persisted)
  const [stats, setStats] = useState<DashboardStats>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, notes);
  }, [notes]);

  // Save material to localStorage
  useEffect(() => {
    if (studyMaterial) {
      localStorage.setItem(LOCAL_STORAGE_MATERIAL_KEY, JSON.stringify(studyMaterial));
    }
  }, [studyMaterial]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  // 1. Generate Study Material Handler
  const handleGenerateMaterial = async () => {
    if (!notes.trim() || notes.trim().length < 10) {
      setMaterialError('Please paste or type study notes with at least 10 characters.');
      return;
    }

    setMaterialError(null);
    setIsGeneratingMaterial(true);

    try {
      const response = await fetch('/api/study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate study material.');
      }

      const data: StudyMaterial = await response.json();
      setStudyMaterial(data);

      // Pre-seed any revision topics into dashboard if not already tracked
      if (data.revisionTopics && data.revisionTopics.length > 0) {
        setStats((prev) => {
          const existingTopics = new Set(prev.topicsToRevise.map((t) => t.topic));
          const newItems = data.revisionTopics
            .filter((t) => !existingTopics.has(t))
            .map((t) => ({ topic: t, missedCount: 0, mastered: false }));

          return {
            ...prev,
            topicsToRevise: [...prev.topicsToRevise, ...newItems],
          };
        });
      }
    } catch (err: any) {
      console.error('Error generating material:', err);
      setMaterialError(err.message || 'Something went wrong while connecting to the AI tutor.');
    } finally {
      setIsGeneratingMaterial(false);
    }
  };

  // 2. Generate Interactive Quiz Handler (can be called with notes directly from AI Quiz section)
  const handleGenerateQuiz = async (config: QuizConfig, notesText?: string) => {
    const textToQuiz = (notesText !== undefined ? notesText : notes).trim();
    if (!textToQuiz || textToQuiz.length < 10) {
      setQuizError('Please provide study notes with at least 10 characters before generating a quiz.');
      return;
    }

    // Keep parent notes state synchronized
    if (textToQuiz !== notes) {
      setNotes(textToQuiz);
    }

    setIsGeneratingQuiz(true);
    setQuizError(null);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: textToQuiz,
          questionCount: config.questionCount,
          difficulty: config.difficulty,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate quiz.');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setQuizError(null);
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setQuizError(err.message || 'The AI model is experiencing high demand. Please click "Try Again" in a moment.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // 3. Quiz Completion Callback
  const handleQuizCompleted = (result: QuizResult) => {
    setStats((prev) => {
      const newTotalAttempted = prev.totalQuestionsAttempted + result.totalQuestions;
      const newTotalCorrect = prev.totalCorrectAnswers + result.score;
      const newAvgScore = newTotalAttempted > 0 ? Math.round((newTotalCorrect / newTotalAttempted) * 100) : 0;

      // Update topics to revise
      const topicMap = new Map<string, { missedCount: number; mastered: boolean }>();
      prev.topicsToRevise.forEach((t) => {
        topicMap.set(t.topic, { missedCount: t.missedCount, mastered: t.mastered });
      });

      result.missedQuestions.forEach((mq) => {
        const current = topicMap.get(mq.topic);
        if (current) {
          topicMap.set(mq.topic, {
            missedCount: current.missedCount + 1,
            mastered: false, // reset mastered if missed again
          });
        } else {
          topicMap.set(mq.topic, {
            missedCount: 1,
            mastered: false,
          });
        }
      });

      const updatedTopics = Array.from(topicMap.entries()).map(([topic, val]) => ({
        topic,
        missedCount: val.missedCount,
        mastered: val.mastered,
      }));

      // Add session log
      const newSession = {
        id: `sess_${Date.now()}`,
        title: studyMaterial?.title || 'Study Quiz Session',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        score: result.score,
        total: result.totalQuestions,
        difficulty: result.totalQuestions > 10 ? 'Comprehensive' : 'Standard',
      };

      return {
        totalQuizzesTaken: prev.totalQuizzesTaken + 1,
        totalQuestionsAttempted: newTotalAttempted,
        totalCorrectAnswers: newTotalCorrect,
        averageScore: newAvgScore,
        topicsToRevise: updatedTopics,
        recentSessions: [newSession, ...prev.recentSessions].slice(0, 15),
      };
    });
  };

  // 4. Toggle Topic Mastery
  const handleToggleTopicMastery = (topicName: string) => {
    setStats((prev) => ({
      ...prev,
      topicsToRevise: prev.topicsToRevise.map((t) =>
        t.topic === topicName ? { ...t, mastered: !t.mastered } : t
      ),
    }));
  };

  // 5. Clear Stats
  const handleClearStats = () => {
    if (window.confirm('Are you sure you want to reset your study analytics and test history?')) {
      setStats(INITIAL_STATS);
      localStorage.removeItem(LOCAL_STORAGE_STATS_KEY);
    }
  };

  // 6. Navigation Shortcuts
  const handleLaunchQuiz = () => {
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-slate-50 flex flex-col font-sans">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasMaterial={Boolean(studyMaterial)}
        hasQuiz={questions.length > 0}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero Banner (visible on Notes tab when fresh) */}
        {activeTab === 'notes' && !studyMaterial && (
          <div className="mb-8 text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-800 mb-4 border border-indigo-200/60 shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI-Powered Active Recall &amp; Quiz Mastery</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Turn Any Study Notes Into an{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Interactive Study Session
              </span>
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Synthesize key points, test yourself with realistic multi-choice quizzes, get instant rationales, and track your revision progress.
            </p>
          </div>
        )}

        {/* TAB 1: NOTES & STUDY MATERIAL */}
        {activeTab === 'notes' && (
          <div className="space-y-8 animate-fade-in">
            {/* Notes Input Area */}
            <NotesInput
              notes={notes}
              setNotes={setNotes}
              onGenerate={handleGenerateMaterial}
              isLoading={isGeneratingMaterial}
              errorMessage={materialError}
              hasExistingMaterial={Boolean(studyMaterial)}
            />

            {/* Generated Study Guide View */}
            {studyMaterial && (
              <StudyMaterialView
                material={studyMaterial}
                onLaunchQuiz={handleLaunchQuiz}
              />
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE AI QUIZ */}
        {activeTab === 'quiz' && (
          <div className="animate-fade-in">
            <QuizSection
              notes={notes}
              setNotes={setNotes}
              notesTitle={studyMaterial?.title}
              questions={questions}
              setQuestions={setQuestions}
              isGenerating={isGeneratingQuiz}
              errorMessage={quizError}
              onClearError={() => setQuizError(null)}
              onGenerateQuiz={handleGenerateQuiz}
              onQuizCompleted={handleQuizCompleted}
            />
          </div>
        )}

        {/* TAB 3: STUDY DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <StudyDashboard
              stats={stats}
              onToggleTopicMastery={handleToggleTopicMastery}
              onClearStats={handleClearStats}
              onStartQuiz={() => setActiveTab('quiz')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-700">StudyMate AI</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Built for InfinityX Hackathon</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Google Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Zero hard-coded data</span>
            <span>•</span>
            <span>Full-stack Node.js + Express</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
