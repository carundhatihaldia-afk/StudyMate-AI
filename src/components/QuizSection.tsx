import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Award,
  BookOpen,
  Trash2,
  ListFilter,
  ClipboardPaste
} from 'lucide-react';
import { QuizQuestion, QuizResult, QuizConfig, MissedQuestionInfo } from '../types.ts';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes.ts';

interface QuizSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
  notesTitle?: string;
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  isGenerating: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  onGenerateQuiz: (config: QuizConfig, notesText: string) => Promise<void>;
  onQuizCompleted: (result: QuizResult) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  notes,
  setNotes,
  notesTitle,
  questions,
  setQuestions,
  isGenerating,
  errorMessage,
  onClearError,
  onGenerateQuiz,
  onQuizCompleted,
}) => {
  // Local notes state for the quiz configuration
  const [quizNotes, setQuizNotes] = useState<string>(notes || '');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Keep local notes in sync if parent notes were populated elsewhere
  useEffect(() => {
    if (notes && !quizNotes) {
      setQuizNotes(notes);
    }
  }, [notes]);

  // Quiz Setup Configuration
  const [config, setConfig] = useState<QuizConfig>({
    questionCount: 5,
    difficulty: 'Moderate',
  });

  // Active Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [resultsFilter, setResultsFilter] = useState<'all' | 'missed'>('all');
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pasteNotification, setPasteNotification] = useState<string | null>(null);

  const wordCount = quizNotes.trim().length > 0 ? quizNotes.trim().split(/\s+/).length : 0;
  const charCount = quizNotes.length;

  const handleSelectSample = (sample: SampleNote) => {
    setSelectedSampleId(sample.id);
    setQuizNotes(sample.content);
    setNotes(sample.content);
    if (onClearError) onClearError();
  };

  const handleClearNotes = () => {
    setSelectedSampleId(null);
    setQuizNotes('');
    setNotes('');
    if (onClearError) onClearError();
    setPasteNotification('Notes cleared. Ready for your notes!');
    setTimeout(() => setPasteNotification(null), 2500);
    textareaRef.current?.focus();
  };

  // Refresh and re-paste note in AI Quiz
  const handleRefreshAndRepaste = async () => {
    if (onClearError) onClearError();

    // 1. Try reading clipboard text
    try {
      if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim().length > 0) {
          setQuizNotes(clipboardText);
          setNotes(clipboardText);
          setSelectedSampleId(null);
          setPasteNotification('Refreshed & re-pasted notes from clipboard!');
          setTimeout(() => setPasteNotification(null), 3000);
          textareaRef.current?.focus();
          return;
        }
      }
    } catch (e) {
      console.log('Clipboard read permission denied or unavailable:', e);
    }

    // 2. Fallback: Re-paste saved notes from localStorage or parent notes
    const savedNotes = localStorage.getItem('studymate_saved_notes_v1') || notes;
    if (savedNotes && savedNotes.trim().length > 0) {
      setQuizNotes(savedNotes);
      setNotes(savedNotes);
      setSelectedSampleId(null);
      setPasteNotification('Refreshed & re-pasted notes from study session!');
      setTimeout(() => setPasteNotification(null), 3000);
      textareaRef.current?.focus();
      return;
    }

    // 3. Fallback: Clear and focus so user can immediately paste
    setQuizNotes('');
    setNotes('');
    setSelectedSampleId(null);
    setPasteNotification('Refreshed! Press Ctrl+V / Cmd+V to paste your notes.');
    setTimeout(() => setPasteNotification(null), 3000);
    textareaRef.current?.focus();
  };

  const handleRepasteFromSaved = () => {
    const savedNotes = localStorage.getItem('studymate_saved_notes_v1') || notes;
    if (savedNotes && savedNotes.trim().length > 0) {
      setQuizNotes(savedNotes);
      setNotes(savedNotes);
      setSelectedSampleId(null);
      if (onClearError) onClearError();
      setPasteNotification('Re-pasted notes from Study Notes!');
      setTimeout(() => setPasteNotification(null), 2500);
      textareaRef.current?.focus();
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return; // Answer choices locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
    setSubmitWarning(null);
  };

  const handleSubmitQuiz = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const total = questions.length;

    if (answeredCount < total) {
      setSubmitWarning(`You answered ${answeredCount} of ${total} questions. Would you like to review or submit now?`);
      return;
    }

    finalizeSubmission();
  };

  const finalizeSubmission = async () => {
    let correctCount = 0;
    const missedList: MissedQuestionInfo[] = [];

    questions.forEach((q, idx) => {
      const studentAns = selectedAnswers[idx];
      if (studentAns === q.correctAnswer) {
        correctCount++;
      } else {
        missedList.push({
          questionIndex: idx,
          question: q.question,
          studentAnswer: studentAns !== undefined ? q.options[studentAns] : 'Not answered',
          correctAnswer: q.options[q.correctAnswer],
          explanation: q.explanation,
          topic: q.topic || 'General Topic',
        });
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    const result: QuizResult = {
      totalQuestions: questions.length,
      score: correctCount,
      percentage,
      answers: { ...selectedAnswers },
      missedQuestions: missedList,
      completedAt: new Date().toISOString(),
    };

    setIsSubmitted(true);
    setQuizResult(result);
    onQuizCompleted(result);

    // Call server to generate diagnostic feedback
    try {
      const response = await fetch('/api/analyze-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: correctCount,
          total: questions.length,
          missedQuestions: missedList,
          topicSummary: notesTitle || 'Study Session',
        }),
      });
      if (response.ok) {
        const analysis = await response.json();
        setQuizResult((prev) => prev ? { ...prev, analysis } : prev);
      }
    } catch (e) {
      console.error('Error fetching quiz feedback analysis:', e);
    }
  };

  // Reset quiz attempt with same questions
  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setSubmitWarning(null);
  };

  // Start fresh and go back to notes & setup card
  const handleStartNewQuiz = () => {
    handleRetake();
    setQuestions([]);
    if (onClearError) onClearError();
  };

  // ==========================================
  // VIEW 1: QUIZ SETUP & NOTES INPUT
  // ==========================================
  if (questions.length === 0 || isGenerating) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 transition-all max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-200 shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 mb-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                AI Quiz Creator
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Create Your AI Practice Quiz
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Provide the study notes you want to be quizzed on, choose your quiz settings, and let AI build your test.
          </p>
        </div>

        {/* SECTION 1: NOTES PROMPT */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800">
                1. What notes should we quiz you on?
              </label>
              <p className="text-xs text-slate-500">
                Paste your notes, lecture transcript, or textbook summary below.
              </p>
            </div>

            {/* Refresh and Re-paste Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRefreshAndRepaste}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/90 shadow-2xs transition-all cursor-pointer"
                title="Refresh note field and re-paste latest notes from clipboard or saved session"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Refresh &amp; Re-paste Note</span>
              </button>

              <button
                type="button"
                onClick={handleClearNotes}
                disabled={isGenerating || !quizNotes}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Clear and reset the notes textarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Quick presets and re-paste shortcut bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium">Quick load:</span>
              {SAMPLE_NOTES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  disabled={isGenerating}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    selectedSampleId === sample.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                  }`}
                >
                  {sample.badge}
                </button>
              ))}
            </div>

            {notes && quizNotes !== notes && (
              <button
                type="button"
                onClick={handleRepasteFromSaved}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                title="Re-paste the notes from your main Study Notes tab"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Re-paste from Study Notes tab</span>
              </button>
            )}
          </div>

          {/* Toast / Notification when refreshed or re-pasted */}
          {pasteNotification && (
            <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pasteNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setPasteNotification(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Textarea container */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={quizNotes}
              onChange={(e) => {
                setQuizNotes(e.target.value);
                setNotes(e.target.value);
                setSelectedSampleId(null);
                if (onClearError) onClearError();
              }}
              disabled={isGenerating}
              rows={8}
              placeholder="Paste your study notes here... (e.g., biology cellular respiration, world history revolutions, organic chemistry, programming algorithms)"
              className="w-full p-4 text-sm sm:text-base text-slate-800 bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-y leading-relaxed"
            />

            {/* Quick floating action buttons inside textarea */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRefreshAndRepaste}
                disabled={isGenerating}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                title="Refresh & Re-paste note"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {quizNotes.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearNotes}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title="Clear notes"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>{wordCount} words ({charCount} characters)</span>
            {quizNotes.trim().length >= 10 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Notes ready for quiz generation
              </span>
            ) : (
              <span className="text-amber-600">Please provide at least 10 characters</span>
            )}
          </div>
        </div>

        {/* SECTION 2 & 3: QUIZ CONFIGURATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Question Count Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              2. Number of Questions:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {([5, 10, 15] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConfig({ ...config, questionCount: num })}
                  disabled={isGenerating}
                  className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    config.questionCount === num
                      ? 'bg-indigo-50/90 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-xl block">{num}</span>
                  <span className="text-xs text-slate-500">Questions</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              3. Difficulty Level:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Easy', 'Moderate', 'Hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfig({ ...config, difficulty: level })}
                  disabled={isGenerating}
                  className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    config.difficulty === level
                      ? 'bg-purple-50/90 border-purple-500 text-purple-700 font-bold ring-2 ring-purple-500/20'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-base block font-bold">{level}</span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    {level === 'Easy' && 'Recall & Terms'}
                    {level === 'Moderate' && 'Concepts & Logic'}
                    {level === 'Hard' && 'Deep Synthesis'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: ACTION BUTTON & ERROR BANNER */}
        <div className="pt-2 space-y-4">
          <button
            type="button"
            onClick={() => {
              if (onClearError) onClearError();
              onGenerateQuiz(config, quizNotes);
            }}
            disabled={isGenerating || quizNotes.trim().length < 10}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all shadow-md flex items-center justify-center gap-3 ${
              quizNotes.trim().length >= 10 && !isGenerating
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white hover:shadow-indigo-300 hover:translate-y-[-1px] cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Notes &amp; Generating {config.questionCount} {config.difficulty} Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-purple-200" />
                <span>Generate {config.questionCount} {config.difficulty} Questions</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Error Message with Try Again */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-sm animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-950">Quiz generation notice:</span>
                  <span className="text-amber-800">{errorMessage}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onClearError) onClearError();
                  onGenerateQuiz(config, quizNotes);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-all shrink-0 cursor-pointer self-start sm:self-center"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: QUIZ RESULTS (AFTER SUBMISSION)
  // ==========================================
  if (isSubmitted && quizResult) {
    const isPassing = quizResult.percentage >= 70;
    const missedTopics = Array.from(new Set(quizResult.missedQuestions.map((m) => m.topic).filter(Boolean)));

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Results Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 relative z-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                <Award className="w-3.5 h-3.5" />
                Quiz Completed
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                Your Assessment Results
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {quizResult.analysis?.performanceAssessment || 
                  (isPassing
                    ? 'Superb performance! You demonstrated solid comprehension of this topic.'
                    : 'Good effort! Review the explanations for each missed question below to master the concepts.')}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100/80 min-w-[180px] shadow-xs">
              <span className={`text-4xl sm:text-5xl font-extrabold ${isPassing ? 'text-indigo-600' : 'text-amber-600'}`}>
                {quizResult.percentage}%
              </span>
              <span className="text-xs font-semibold text-slate-500 mt-1">
                {quizResult.score} of {quizResult.totalQuestions} Correct
              </span>
            </div>
          </div>

          {/* Quick Metrics Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center">
              <span className="text-xs font-semibold text-slate-500 block">Total Questions</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 block">
                {quizResult.totalQuestions}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center">
              <span className="text-xs font-semibold text-emerald-700 block">Correct Answers</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1 block">
                {quizResult.score}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 text-center">
              <span className="text-xs font-semibold text-red-700 block">Incorrect Answers</span>
              <span className="text-xl sm:text-2xl font-bold text-red-800 mt-1 block">
                {quizResult.totalQuestions - quizResult.score}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-center">
              <span className="text-xs font-semibold text-purple-700 block">Difficulty</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-800 mt-1 block">
                {config.difficulty}
              </span>
            </div>
          </div>

          {/* Topics to Revise Section */}
          {(quizResult.analysis?.revisionTopics?.length || missedTopics.length > 0) ? (
            <div className="mt-6 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-amber-900 text-sm">
                  Recommended Topics to Revise
                </h4>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Based on the questions you missed, focus your next revision on these specific concepts:
              </p>
              <div className="flex flex-wrap gap-2">
                {(quizResult.analysis?.revisionTopics || missedTopics).map((topic, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white text-amber-900 border border-amber-300 shadow-2xs"
                  >
                    • {topic}
                  </span>
                ))}
              </div>

              {quizResult.analysis?.studyTips && quizResult.analysis.studyTips.length > 0 && (
                <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold block mb-1">AI Coach Study Tips:</span>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    {quizResult.analysis.studyTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Flawless Score!</strong> You answered every question correctly with zero missed concepts. Ready to try a higher difficulty level?
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake This Quiz</span>
            </button>

            <button
              type="button"
              onClick={handleStartNewQuiz}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Quiz / Change Notes</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Detailed Answers &amp; Explanations
              </h3>
              <p className="text-xs text-slate-500">
                Review the rationales for every question to lock in your understanding.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setResultsFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  resultsFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter('missed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  resultsFilter === 'missed'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Missed Only ({quizResult.missedQuestions.length})
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {questions.map((q, idx) => {
              const studentAnsIdx = quizResult.answers[idx];
              const isCorrect = studentAnsIdx === q.correctAnswer;

              if (resultsFilter === 'missed' && isCorrect) {
                return null;
              }

              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-slate-50/60 border-slate-200/90'
                      : 'bg-red-50/30 border-red-200/80 ring-1 ring-red-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        Q{idx + 1}
                      </span>
                      {q.topic && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                          {q.topic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" /> Incorrect (0)
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-800 text-base mb-4">
                    {q.question}
                  </h4>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = studentAnsIdx === optIdx;
                      const isOptionCorrect = optIdx === q.correctAnswer;

                      let style = 'bg-white border-slate-200 text-slate-700';
                      if (isOptionCorrect) {
                        style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-200';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = 'bg-red-50 border-red-300 text-red-900 line-through opacity-85';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-sm flex items-center justify-between ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isOptionCorrect && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              Correct Choice
                            </span>
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <span className="text-xs font-bold text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs sm:text-sm text-slate-700">
                    <span className="font-bold text-indigo-900 block mb-1">
                      Why this answer is correct:
                    </span>
                    <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ACTIVE QUIZ TAKING INTERFACE
  // ==========================================
  const currentQ = questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Brain className="w-3.5 h-3.5" />
              Active Practice Quiz
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              {notesTitle || 'Study Assessment'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your answers carefully. Correct answers will be revealed after submission.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('stepper')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'stepper' ? 'bg-white text-indigo-700 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                1 Question at a Time
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                All Questions List
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar (in stepper mode) */}
        {viewMode === 'stepper' && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{totalAnswered} of {questions.length} Answered ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* STEPPER MODE: Display 1 Question at a time */}
      {viewMode === 'stepper' && currentQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 transition-all">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              Question #{currentQuestionIndex + 1}
            </span>
            {currentQ.topic && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                Topic: {currentQ.topic}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-6">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-sm sm:text-base font-medium leading-relaxed">
                      {option}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nav Stepper Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentQuestionIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Quick jump pills */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto px-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentQuestionIndex === i
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                      : selectedAnswers[i] !== undefined
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md hover:shadow-emerald-200 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ALL QUESTIONS MODE: Clean list */}
      {viewMode === 'all' && (
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={q.id || qIdx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  Question #{qIdx + 1}
                </span>
                {selectedAnswers[qIdx] !== undefined ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Answered
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Unanswered</span>
                )}
              </div>

              <h4 className="font-bold text-slate-800 text-base mb-4">{q.question}</h4>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`p-3.5 rounded-xl border text-sm flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold ring-1 ring-indigo-200'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning message if submitting with unanswered questions */}
      {submitWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{submitWarning}</span>
          </div>
          <button
            type="button"
            onClick={finalizeSubmission}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-all text-xs cursor-pointer"
          >
            Submit Anyway
          </button>
        </div>
      )}

      {/* Bottom Submit Sticky Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Answered: <strong className="text-indigo-600">{totalAnswered}</strong> of {questions.length} questions
        </div>

        <button
          type="button"
          onClick={handleSubmitQuiz}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md hover:shadow-indigo-200 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Submit Quiz</span>
        </button>
      </div>
    </div>
  );
};
