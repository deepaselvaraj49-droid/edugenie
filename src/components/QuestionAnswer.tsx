import React, { useState } from 'react';
import { QnAResponse, StudentProfile } from '../types';
import { askQuestion } from '../services/api';
import { FormattedContent } from './FormattedContent';
import {
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  Lightbulb,
  BookMarked,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface QuestionAnswerProps {
  profile: StudentProfile;
  onJumpToQuiz?: (topic: string) => void;
  onJumpToExplain?: (topic: string) => void;
}

const SAMPLE_QUESTIONS = [
  {
    subject: 'Physics',
    q: 'Why does light bend when entering water, and how does Snell’s Law describe it?',
  },
  {
    subject: 'Biology',
    q: 'What is the exact difference between Mitosis and Meiosis in cellular reproduction?',
  },
  {
    subject: 'Mathematics',
    q: 'Why is the derivative of e^x equal to itself, intuitively?',
  },
  {
    subject: 'Computer Science',
    q: 'How does quicksort achieve O(n log n) average time complexity, and what is its worst case?',
  },
];

const SUBJECTS = [
  'General Academic',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Literature',
  'Economics',
];

export const QuestionAnswer: React.FC<QuestionAnswerProps> = ({
  profile,
  onJumpToQuiz,
  onJumpToExplain,
}) => {
  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('General Academic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QnAResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = (customQ || question).trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    stopSpeech();

    try {
      const data = await askQuestion({
        question: query,
        subject: selectedSubject,
        gradeLevel: profile.gradeLevel,
      });
      setResult(data);
      if (customQ) setQuestion(customQ);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to retrieve answer. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `Question: ${question}\n\nAnswer:\n${result.answer}\n\nKey Takeaways:\n${result.keyTakeaways.map((k: string) => `• ${k}`).join('\n')}\n\nAnalogy:\n${result.analogy}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!result || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const cleanText = result.answer.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>Google Gemini 3.8 Flash</span>
              <span aria-hidden="true">·</span>
              <span>Personalized for {profile.gradeLevel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              AI Academic Question & Answer
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Get clear, step-by-step academic answers with intuitive analogies, key formulas, and pedagogical breakdowns.
            </p>
          </div>

          {/* Subject selector */}
          <div className="shrink-0">
            <label className="block text-xs font-medium text-slate-500 mb-1">Academic Field</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="relative rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-slate-50/50">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask any academic or homework question (e.g., 'Explain the Heisenberg Uncertainty Principle and its physical significance')..."
              className="w-full px-4 py-3.5 text-sm sm:text-base text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-t border-slate-100 rounded-b-xl">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[11px]">Enter</kbd> to ask
              </span>
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Ask EduGenie</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Starters */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or try an example question:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(sample.subject);
                    handleSubmit(undefined, sample.q);
                  }}
                  className="text-left text-xs bg-white hover:bg-indigo-50/60 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  <span className="font-semibold text-indigo-600 mr-1.5">[{sample.subject}]</span>
                  {sample.q}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to process question</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-full" />
            <div className="h-3.5 bg-slate-100 rounded w-5/6" />
            <div className="h-3.5 bg-slate-100 rounded w-4/6" />
          </div>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-24 bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-24 bg-slate-50 rounded-xl border border-slate-100" />
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-medium text-slate-700">Topic: {selectedSubject}</span>
              <span>·</span>
              <span>Level: {profile.gradeLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-indigo-600 rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
                title={isSpeaking ? 'Stop Audio' : 'Listen to Answer'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </>
                )}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-indigo-600 rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Answer Content */}
          <div className="prose-sm max-w-none">
            <FormattedContent content={result.answer} />
          </div>

          {/* Key Takeaways */}
          {result.keyTakeaways && result.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Core Academic Takeaways</span>
              </h3>
              <ul className="space-y-2">
                {result.keyTakeaways.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Real-World Analogy */}
          {result.analogy && (
            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>The Intuitive Analogy</span>
              </h3>
              <p className="text-sm text-amber-950 leading-relaxed italic">
                "{result.analogy}"
              </p>
            </div>
          )}

          {/* Deepen Comprehension / Follow-up Questions */}
          {result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-600 mb-2.5">
                Deepen Your Understanding — Ask Next:
              </h4>
              <div className="space-y-2">
                {result.followUpQuestions.map((qText: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(undefined, qText)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between text-xs sm:text-sm text-slate-800 group"
                  >
                    <span>{qText}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Bridge Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {onJumpToQuiz && (
              <button
                onClick={() => onJumpToQuiz(question)}
                className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Generate practice quiz on this</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onJumpToExplain && (
              <button
                onClick={() => onJumpToExplain(question)}
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Explain with deeper thematic breakdown
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
