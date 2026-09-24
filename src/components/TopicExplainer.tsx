import React, { useState } from 'react';
import { ExplanationResponse, StudentProfile } from '../types';
import { explainTopic } from '../services/api';
import { FormattedContent } from './FormattedContent';
import {
  Lightbulb,
  Sparkles,
  Layers,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

interface TopicExplainerProps {
  profile: StudentProfile;
  initialTopic?: string;
  onJumpToQuiz: (topic: string) => void;
  onJumpToPlan: (topic: string) => void;
}

const PRESET_TOPICS = [
  'Quantum Entanglement',
  'Photosynthesis & Light Reactions',
  'Neural Networks & Backpropagation',
  'Inflation & Central Bank Interest Rates',
  'Theory of General Relativity',
  'DNA Replication & Polymerase',
];

const COMPREHENSION_LEVELS = [
  { id: 'simple', label: 'Simple (ELI5)', desc: 'Clear everyday language, intuitive storytelling' },
  { id: 'highschool', label: 'High School', desc: 'Standard curriculum rigor, key definitions' },
  { id: 'college', label: 'College Rigor', desc: 'Detailed mathematical & causal mechanics' },
  { id: 'expert', label: 'Expert Deep Dive', desc: 'Advanced nuances, edge cases & modern research' },
];

export const TopicExplainer: React.FC<TopicExplainerProps> = ({
  profile,
  initialTopic = '',
  onJumpToQuiz,
  onJumpToPlan,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState('highschool');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplanationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExplain = async (customTopic?: string, customLevel?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await explainTopic({
        topic: t,
        level: customLevel || level,
        subject: profile.primarySubject,
      });
      setResult(data);
      if (customTopic) setTopic(customTopic);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to explain topic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyExplanation = () => {
    if (!result) return;
    const text = `${result.title}\n\nOverview:\n${result.overview}\n\nBreakdown:\n${result.breakdown.map((b) => `## ${b.heading}\n${b.content}`).join('\n\n')}\n\nAnalogy:\n${result.analogy}\n\nCommon Misconceptions:\n${result.misconceptions.map((m) => `• ${m}`).join('\n')}\n\nSummary:\n${result.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span>Adaptive Conceptual Clarity</span>
            <span aria-hidden="true">·</span>
            <span>Powered by Gemini</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Topic Explainer & Demystifier
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Demystifies complex concepts at your exact comprehension level, busts common test misconceptions, and builds intuitive mental models.
          </p>
        </div>

        {/* Form controls */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topic or Complex Concept to Understand
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                placeholder="e.g. CRISPR gene editing, Fourier Transform, Black-Scholes model, Krebs cycle..."
                className="flex-1 px-4 py-2.5 text-sm sm:text-base rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
              <button
                onClick={() => handleExplain()}
                disabled={isLoading || !topic.trim()}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Explaining...</span>
                  </>
                ) : (
                  <>
                    <span>Explain Topic</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Target Comprehension Depth
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMPREHENSION_LEVELS.map((lvl) => {
                const isSelected = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setLevel(lvl.id);
                      if (result && topic) {
                        handleExplain(topic, lvl.id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{lvl.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore curated complex topics:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map((pTopic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(pTopic);
                    handleExplain(pTopic);
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {pTopic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
          <div className="space-y-3 pt-4">
            <div className="h-16 bg-slate-50 rounded-xl" />
            <div className="h-16 bg-slate-50 rounded-xl" />
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Topic Breakdown
              </span>
              <h2 className="text-2xl font-bold text-slate-900 font-display mt-0.5">
                {result.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyExplanation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Notes'}</span>
              </button>
            </div>
          </div>

          {/* Intuitive Overview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-base leading-relaxed">
            <FormattedContent content={result.overview} />
          </div>

          {/* The Aha! Analogy */}
          {result.analogy && (
            <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200/70">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>The Everyday Analogy</span>
              </div>
              <p className="text-sm text-amber-950 leading-relaxed font-medium italic">
                "{result.analogy}"
              </p>
            </div>
          )}

          {/* Step-by-Step Thematic Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Core Mechanism Breakdown</span>
            </h3>
            <div className="grid gap-3">
              {result.breakdown.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center tabular-nums">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{sec.heading}</h4>
                  </div>
                  <div className="text-sm text-slate-700 pl-7 leading-relaxed">
                    <FormattedContent content={sec.content} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Misconceptions */}
          {result.misconceptions && result.misconceptions.length > 0 && (
            <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-200/70">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Common Student Misconceptions (Watch Out on Tests!)</span>
              </div>
              <ul className="space-y-2">
                {result.misconceptions.map((misc, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>{misc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* One-Sentence Mental Model Summary */}
          {result.summary && (
            <div className="p-4 rounded-xl bg-indigo-900 text-white flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block mb-0.5">
                  The Takeaway Mental Model
                </span>
                <p className="text-sm font-medium leading-relaxed">{result.summary}</p>
              </div>
            </div>
          )}

          {/* Bridging to Quiz and Study Plan */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              onClick={() => onJumpToQuiz(result.title || topic)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Test yourself with a Quiz on this</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onJumpToPlan(result.title || topic)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Build a structured study plan for this topic</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
