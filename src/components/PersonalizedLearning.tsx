import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  QuizRecord,
  RecommendationsResponse,
  FocusRecommendation,
} from '../types';
import { getRecommendations } from '../services/api';
import {
  Compass,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Loader2,
  Target,
  RefreshCw,
} from 'lucide-react';

interface PersonalizedLearningProps {
  profile: StudentProfile;
  quizHistory: QuizRecord[];
  onOpenProfile: () => void;
  onJumpToExplain: (topic: string) => void;
  onJumpToQuiz: (topic: string) => void;
  onJumpToPlan: (topic: string) => void;
}

export const PersonalizedLearning: React.FC<PersonalizedLearningProps> = ({
  profile,
  quizHistory,
  onOpenProfile,
  onJumpToExplain,
  onJumpToQuiz,
  onJumpToPlan,
}) => {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getRecommendations({
        gradeLevel: profile.gradeLevel,
        weakSubjects: profile.weakSubjects,
        strongSubjects: profile.strongSubjects,
        quizHistory: quizHistory,
        interests: [profile.primarySubject, profile.targetGoal],
      });
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile.weakSubjects, profile.strongSubjects, profile.gradeLevel]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>Personalized Diagnostic Engine</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Personalized Learning & Recommendations
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tailored study prescriptions and "What to study next" guided by your performance gaps and learning profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Snapshot Summary */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Level & Goal
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{profile.gradeLevel}</p>
            <p className="text-xs text-slate-600 mt-1 truncate">{profile.targetGoal}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Identified Focus Gaps
            </span>
            <p className="text-xs font-bold text-rose-950 mt-0.5">
              {profile.weakSubjects.length > 0
                ? profile.weakSubjects.join(', ')
                : 'None marked yet'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Comfortable Strengths
            </span>
            <p className="text-xs font-bold text-emerald-950 mt-0.5">
              {profile.strongSubjects.length > 0
                ? profile.strongSubjects.join(', ')
                : 'None marked yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
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
          <div className="grid grid-cols-1 gap-3 pt-4">
            <div className="h-24 bg-slate-50 rounded-xl" />
            <div className="h-24 bg-slate-50 rounded-xl" />
          </div>
        </div>
      )}

      {/* Results View */}
      {data && !isLoading && (
        <div className="space-y-6">
          {/* Motivational Diagnostic */}
          <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-800 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                Academic Advisor Insights
              </span>
              <p className="text-sm leading-relaxed text-indigo-50">
                {data.motivationalAnalysis}
              </p>
            </div>
          </div>

          {/* High Impact Focus Areas */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>Prioritized Academic Focus Areas</span>
            </h2>

            <div className="space-y-3">
              {data.focusRecommendations.map((rec, idx) => {
                const isHigh = rec.priority?.toLowerCase() === 'high';
                const isMedium = rec.priority?.toLowerCase() === 'medium';
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 bg-white shadow-2xs transition-all space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800'
                              : isMedium
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{rec.subject}</span>
                        <span className="text-slate-300">·</span>
                        <h3 className="text-sm font-bold text-slate-900">{rec.topic}</h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onJumpToExplain(rec.topic)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          Explain
                        </button>
                        <button
                          onClick={() => onJumpToQuiz(rec.topic)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                        >
                          Take Quiz
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Diagnosis: </span>
                      {rec.reason}
                    </p>

                    <div className="text-xs text-emerald-900 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/60 font-medium">
                      <span className="font-bold text-emerald-950">Recommended Action: </span>
                      {rec.actionableStep}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What to study next cards */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <span>Recommended Next Topics</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.suggestedNextTopics.map((topicStr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{topicStr}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => onJumpToExplain(topicStr)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Explain</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      onClick={() => onJumpToPlan(topicStr)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Plan Road
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      onClick={() => onJumpToQuiz(topicStr)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Study Habit Tip */}
          {data.dailyHabitTip && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block mb-0.5">
                  Daily High-Performance Study Habit
                </span>
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  {data.dailyHabitTip}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
