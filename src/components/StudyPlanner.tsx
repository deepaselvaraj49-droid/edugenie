import React, { useState, useEffect } from 'react';
import { StudyPlanData, SavedStudyPlan, StudentProfile } from '../types';
import { generateStudyPlan } from '../services/api';
import {
  getStoredStudyPlans,
  saveStudyPlan,
  toggleMilestoneCompletion,
} from '../utils/storage';
import {
  Calendar,
  Sparkles,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Bookmark,
} from 'lucide-react';

interface StudyPlannerProps {
  profile: StudentProfile;
  initialTopic?: string;
  onJumpToQuiz: (topic: string) => void;
}

const TIMEFRAME_OPTIONS = [
  '3 Days (Intensive Cram)',
  '7 Days (1 Week Sprint)',
  '14 Days (2 Weeks Balanced)',
  '30 Days (1 Month In-Depth)',
];

const GOAL_OPTIONS = [
  'Exam & Test Preparation',
  'Master Fundamental Concepts',
  'Practical Problem Solving & Application',
  'Quick Review & Knowledge Refresh',
];

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  profile,
  initialTopic = '',
  onJumpToQuiz,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [timeframe, setTimeframe] = useState('7 Days (1 Week Sprint)');
  const [dailyHours, setDailyHours] = useState(2);
  const [goal, setGoal] = useState('Exam & Test Preparation');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active plans list & selected plan
  const [savedPlans, setSavedPlans] = useState<SavedStudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SavedStudyPlan | null>(null);

  useEffect(() => {
    const plans = getStoredStudyPlans();
    setSavedPlans(plans);
    if (plans.length > 0 && !activePlan) {
      setActivePlan(plans[0]);
    }
  }, []);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleGenerate = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await generateStudyPlan({
        topic: t,
        timeframe,
        dailyHours,
        goal,
        studentLevel: profile.gradeLevel,
      });

      const newPlan: SavedStudyPlan = {
        ...data,
        id: `plan-${Date.now()}`,
        topic: t,
        createdAt: new Date().toISOString(),
        completedMilestones: [],
      };

      const updated = saveStudyPlan(newPlan);
      setSavedPlans(updated);
      setActivePlan(newPlan);
      if (customTopic) setTopic(customTopic);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!activePlan) return;
    const updated = toggleMilestoneCompletion(activePlan.id, milestoneId);
    setSavedPlans(updated);
    const refreshed = updated.find((p) => p.id === activePlan.id) || null;
    setActivePlan(refreshed);
  };

  // Calculate completion percentage
  const totalMilestones =
    activePlan?.phases.reduce((acc, phase) => acc + phase.milestones.length, 0) || 0;
  const completedCount = activePlan?.completedMilestones.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span>Structured Path & Curriculum</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Study Plan & Structured Learning Roadmap
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Transform any broad academic syllabus or complex topic into an organized, step-by-step milestone schedule with spaced practice tasks.
          </p>
        </div>

        {/* Plan Generator Form */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject or Topic to Master
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AP Calculus AB, Organic Chemistry Reactions, Machine Learning Basics, AP European History..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Timeframe */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TIMEFRAME_OPTIONS.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Commitment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Daily Study Hours
              </label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1 Hour / day</option>
                <option value={2}>2 Hours / day (Standard)</option>
                <option value={3}>3 Hours / day</option>
                <option value={4}>4+ Hours / day (Intensive)</option>
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Learning Objective
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !topic.trim()}
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Structured Path...</span>
              </>
            ) : (
              <>
                <span>Generate Learning Roadmap</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Saved plans tab selector if multiple */}
      {savedPlans.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Your Plans:</span>
          {savedPlans.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlan(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border shrink-0 transition-colors ${
                activePlan?.id === p.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {p.topic}
            </button>
          ))}
        </div>
      )}

      {/* Active Roadmap View */}
      {activePlan && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Roadmap Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                <span className="font-semibold text-indigo-600">{activePlan.targetGoal}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{activePlan.totalEstimatedHours} Total Hours
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                {activePlan.title}
              </h2>
            </div>

            {/* Progress tracker pill */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shrink-0 flex items-center gap-3">
              <div>
                <div className="text-xs text-slate-500">Milestones Done</div>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {completedCount} of {totalMilestones} ({progressPercent}%)
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-600 tabular-nums">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Strategy Overview */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-indigo-950 leading-relaxed">
            <span className="font-bold text-indigo-900 block mb-1">Pedagogical Strategy:</span>
            {activePlan.strategyOverview}
          </div>

          {/* Phases and Milestones */}
          <div className="space-y-6">
            {activePlan.phases.map((phase) => (
              <div key={phase.phaseNumber} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-xs">
                      Phase {phase.phaseNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{phase.phaseName}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{phase.duration}</span>
                </div>

                <div className="space-y-2.5">
                  {phase.milestones.map((m) => {
                    const isDone = activePlan.completedMilestones.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-slate-50/70 border-slate-200 opacity-80'
                            : 'bg-white border-slate-200 hover:border-indigo-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(m.id)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                            title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4
                                className={`text-sm font-bold ${
                                  isDone ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                {m.title}
                              </h4>
                              <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                                ~{m.estimatedMinutes} mins
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {m.description}
                            </p>
                            <div className="pt-1.5 flex items-start gap-1.5 text-xs text-indigo-900 font-medium bg-indigo-50/40 p-2 rounded-lg border border-indigo-100/60">
                              <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <span>Practice Task: {m.practiceTask}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Retention & Spaced Repetition Advice */}
          {activePlan.retentionTips && activePlan.retentionTips.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Memory Retention & Study Tips</span>
              </div>
              <ul className="space-y-1.5">
                {activePlan.retentionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-amber-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Bridge action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onJumpToQuiz(activePlan.topic)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Test Knowledge on {activePlan.topic}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
