import React, { useState } from 'react';
import { 
  BookMarked, 
  Lightbulb, 
  ListChecks, 
  Sparkles, 
  Brain, 
  Copy, 
  Check, 
  Layers, 
  ArrowRight,
  HelpCircle,
  Bookmark
} from 'lucide-react';
import { StudyMaterial } from '../types.ts';

interface StudyMaterialViewProps {
  material: StudyMaterial;
  onLaunchQuiz: () => void;
}

export const StudyMaterialView: React.FC<StudyMaterialViewProps> = ({
  material,
  onLaunchQuiz,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'keyPoints' | 'terms' | 'plainEnglish'>('summary');
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedPoints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyMaterial = () => {
    const textToCopy = `=== ${material.title} ===

SUMMARY:
${material.summary}

KEY TAKEAWAYS:
${material.keyPoints.map((pt, i) => `${i + 1}. ${pt}`).join('\n')}

KEY TERMS & DEFINITIONS:
${material.keyTerms.map((t) => `• ${t.term}: ${t.definition} ${t.context ? `(${t.context})` : ''}`).join('\n')}

PLAIN ENGLISH EXPLANATION:
${material.plainEnglishExplanation}

TOPICS TO REVISE:
${material.revisionTopics.map((top) => `- ${top}`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 transition-all">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Study Synthesis Ready
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {material.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Structured study guide synthesized from your notes. Review each section before taking the quiz!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyMaterial}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 hover:text-slate-800 transition-all cursor-pointer"
            title="Copy entire study material to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Guide'}</span>
          </button>

          <button
            type="button"
            onClick={onLaunchQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs shadow-indigo-200 cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Create AI Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'summary'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Core Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('keyPoints')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'keyPoints'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Key Points ({material.keyPoints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'terms'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Key Terms &amp; Concepts ({material.keyTerms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plainEnglish')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'plainEnglish'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Plain English Explainer</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* TAB 1: SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fade-in">
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
              {material.summary.split('\n\n').map((para, i) => (
                <p key={i} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {para}
                </p>
              ))}
            </div>

            {/* Quick topics to revise chip list */}
            {material.revisionTopics && material.revisionTopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block mb-2">
                  Key Topics Identified for Revision:
                </span>
                <div className="flex flex-wrap gap-2">
                  {material.revisionTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white text-indigo-800 border border-indigo-200/80 shadow-2xs"
                    >
                      <Bookmark className="w-3 h-3 text-indigo-500" />
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KEY POINTS */}
        {activeTab === 'keyPoints' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs text-slate-500 mb-2">
              Tip: Click any checkmark as you study to test your active recall!
            </p>
            {material.keyPoints.map((point, idx) => {
              const isChecked = Boolean(checkedPoints[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-indigo-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 text-transparent hover:border-indigo-400'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-sm sm:text-base leading-relaxed">
                    <span className={isChecked ? 'line-through text-emerald-800/80' : ''}>
                      {point}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: KEY TERMS & CONCEPTS */}
        {activeTab === 'terms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {material.keyTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-base text-indigo-900 tracking-tight">
                      {item.term}
                    </h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      Term #{idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.definition}
                  </p>
                </div>

                {item.context && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 italic">
                    <span className="font-semibold not-italic text-slate-600">Why it matters:</span>{' '}
                    {item.context}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PLAIN ENGLISH EXPLANATION */}
        {activeTab === 'plainEnglish' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/80 via-purple-50/40 to-indigo-50/60 border border-amber-200/80 text-slate-800 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-200">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  In Plain English (The Analogy)
                </h3>
                <p className="text-xs text-slate-500">
                  Simplified explanation designed for instant student intuition
                </p>
              </div>
            </div>

            <div className="text-sm sm:text-base leading-relaxed text-slate-800 bg-white/90 p-5 sm:p-6 rounded-2xl border border-amber-100/80 shadow-2xs">
              {material.plainEnglishExplanation}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500">
                Ready to test your comprehension of this topic?
              </p>
              <button
                type="button"
                onClick={onLaunchQuiz}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Test this in AI Quiz</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
