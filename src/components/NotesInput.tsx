import React, { useState } from 'react';
import { Sparkles, Trash2, ArrowRight, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes.ts';

interface NotesInputProps {
  notes: string;
  setNotes: (val: string) => void;
  onGenerate: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  hasExistingMaterial: boolean;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  notes,
  setNotes,
  onGenerate,
  isLoading,
  errorMessage,
  hasExistingMaterial,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const wordCount = notes.trim().length > 0 ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSelectSample = (sample: SampleNote) => {
    setSelectedSampleId(sample.id);
    setNotes(sample.content);
  };

  const handleClear = () => {
    setSelectedSampleId(null);
    setNotes('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 transition-all hover:border-indigo-200">
      {/* Header section with badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Step 1: Your Study Material
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Paste or Enter Your Study Notes
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Turn your lecture notes, textbook chapters, or summary sheets into an interactive study masterclass.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <span className="text-xs font-medium text-slate-400">Quick load sample topics:</span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_NOTES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                disabled={isLoading}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  selectedSampleId === sample.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                }`}
              >
                {sample.badge}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="mt-6 relative">
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSelectedSampleId(null);
          }}
          disabled={isLoading}
          rows={11}
          placeholder="Paste your study notes, lecture transcript, revision bullets, or textbook excerpts here... (e.g. biology definitions, historical events, chemical equations, or algorithm concepts)"
          className="w-full p-4 sm:p-5 text-sm sm:text-base text-slate-800 bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-y leading-relaxed font-normal"
        />

        {/* Clear Button */}
        {notes.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Clear notes"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Meta indicators & Actions */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} ({charCount} chars)
          </span>
          {wordCount > 0 && (
            <span className="text-slate-400">• ~{estimatedReadTime} min read</span>
          )}
          {hasExistingMaterial && (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Study Guide Generated
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || notes.trim().length < 10}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
              notes.trim().length >= 10 && !isLoading
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white hover:shadow-md hover:shadow-indigo-200 hover:translate-y-[-1px] active:translate-y-0 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Notes with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{hasExistingMaterial ? 'Regenerate Study Material' : 'Generate Study Material'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-sm animate-fade-in">
          <div className="flex items-start gap-2.5 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-950">Notice while generating study material:</span>
              <span className="text-amber-800">{errorMessage}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || notes.trim().length < 10}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-all shrink-0 cursor-pointer self-start sm:self-center"
          >
            Retry Generation
          </button>
        </div>
      )}
    </div>
  );
};
