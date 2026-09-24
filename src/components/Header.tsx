import React from 'react';
import { BookOpen, Sparkles, Brain, Award, BarChart3, GraduationCap } from 'lucide-react';
import { DashboardStats } from '../types.ts';

interface HeaderProps {
  activeTab: 'notes' | 'quiz' | 'dashboard';
  setActiveTab: (tab: 'notes' | 'quiz' | 'dashboard') => void;
  hasMaterial: boolean;
  hasQuiz: boolean;
  stats: DashboardStats;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasMaterial,
  hasQuiz,
  stats,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-indigo-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('notes')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 bg-clip-text text-transparent">
                  StudyMate AI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  InfinityX
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Smart Study &amp; Quiz Assistant</p>
            </div>
          </div>

          {/* Quick Header Stats */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 font-medium">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Score:</span>
              <span className="font-bold text-indigo-600">{stats.averageScore}%</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 font-medium">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Questions:</span>
              <span className="font-bold text-purple-700">{stats.totalQuestionsAttempted}</span>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Notes</span>
              {hasMaterial && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'notes' ? 'bg-white' : 'bg-indigo-500'}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Quiz</span>
              {hasQuiz && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'quiz' ? 'bg-white' : 'bg-purple-500'}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
