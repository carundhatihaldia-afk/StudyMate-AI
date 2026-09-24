import React from 'react';
import { 
  BarChart3, 
  Award, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Bookmark, 
  Check, 
  Trash2, 
  Target, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { DashboardStats, TopicRevisionItem } from '../types.ts';

interface StudyDashboardProps {
  stats: DashboardStats;
  onToggleTopicMastery: (topicName: string) => void;
  onClearStats: () => void;
  onStartQuiz: () => void;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({
  stats,
  onToggleTopicMastery,
  onClearStats,
  onStartQuiz,
}) => {
  const incorrectCount = stats.totalQuestionsAttempted - stats.totalCorrectAnswers;
  const activeRevisionCount = stats.topicsToRevise.filter((t) => !t.mastered).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Dashboard Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Learning Analytics
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Study Session Performance Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your quiz progress, identify persistent knowledge gaps, and check off revision topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.totalQuizzesTaken > 0 && (
            <button
              type="button"
              onClick={onClearStats}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all cursor-pointer"
              title="Reset dashboard analytics"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Stats</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Practice Quiz</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Questions Attempted */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attempted
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats.totalQuestionsAttempted}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            Across {stats.totalQuizzesTaken} quiz session{stats.totalQuizzesTaken === 1 ? '' : 's'}
          </p>
        </div>

        {/* Card 2: Correct Answers */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Correct
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {stats.totalCorrectAnswers}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {incorrectCount > 0 ? `${incorrectCount} mistakes to review` : 'Zero errors so far!'}
          </p>
        </div>

        {/* Card 3: Current Score */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Accuracy
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-700">
            {stats.averageScore}%
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            Overall mastery rate
          </p>
        </div>

        {/* Card 4: Topics to Revise */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Topics To Revise
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-700">
            {activeRevisionCount}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.topicsToRevise.filter((t) => t.mastered).length} mastered
          </p>
        </div>
      </div>

      {/* Two-Column Section: Topics to Revise & Recent Quiz Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topics to Revise Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-600" />
                Topics &amp; Concepts to Revise
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically logged whenever you miss a question during a quiz session.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
              {stats.topicsToRevise.length} Tracked
            </span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {stats.topicsToRevise.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No revision topics yet!</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Take a quiz from your notes. Any questions you miss will be added here automatically as high-yield revision items.
                </p>
              </div>
            ) : (
              stats.topicsToRevise.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onToggleTopicMastery(item.topic)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    item.mastered
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:border-indigo-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs transition-all ${
                        item.mastered
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 bg-white text-transparent hover:border-indigo-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-sm font-semibold block ${item.mastered ? 'line-through text-emerald-800/70' : ''}`}>
                        {item.topic}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Missed in {item.missedCount} question{item.missedCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      item.mastered
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100/70 text-amber-800'
                    }`}
                  >
                    {item.mastered ? 'Mastered' : 'Needs Review'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quiz Sessions Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Quiz Attempts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                History of quizzes taken in this study session.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
              {stats.recentSessions.length} Logs
            </span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {stats.recentSessions.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No quiz attempts yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Generate a quiz from your notes and submit your answers to see your test logs recorded here.
                </p>
              </div>
            ) : (
              stats.recentSessions.map((session) => {
                const pct = Math.round((session.score / session.total) * 100);
                const isPassing = pct >= 70;
                return (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 truncate max-w-xs">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span className="font-medium text-purple-600">{session.difficulty}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-600">
                        {session.score}/{session.total}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
