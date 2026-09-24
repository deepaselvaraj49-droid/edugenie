import React, { useState } from 'react';
import { QuizRecord, StudentProfile } from '../types';
import {
  BarChart3,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  RotateCcw,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProgressTrackerProps {
  profile: StudentProfile;
  quizHistory: QuizRecord[];
  onClearHistory?: () => void;
  onJumpToQuiz: (topic: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  profile,
  quizHistory,
  onClearHistory,
  onJumpToQuiz,
}) => {
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Compute analytics
  const totalQuizzes = quizHistory.length;
  const totalQuestionsAnswered = quizHistory.reduce((acc, q) => acc + q.totalQuestions, 0);
  const totalCorrect = quizHistory.reduce((acc, q) => acc + q.score, 0);
  const overallAccuracy =
    totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;

  // Compute subject breakdown
  const subjectMap: Record<string, { total: number; correct: number; count: number }> = {};
  quizHistory.forEach((q) => {
    const topicKey = q.topic || 'General';
    if (!subjectMap[topicKey]) {
      subjectMap[topicKey] = { total: 0, correct: 0, count: 0 };
    }
    subjectMap[topicKey].total += q.totalQuestions;
    subjectMap[topicKey].correct += q.score;
    subjectMap[topicKey].count += 1;
  });

  const subjectList = Object.entries(subjectMap).map(([topic, data]) => ({
    topic,
    accuracy: Math.round((data.correct / data.total) * 100),
    quizzesCount: data.count,
  }));

  const toggleExpand = (id: string) => {
    setExpandedQuizId(expandedQuizId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>Performance Analytics & Mastery</span>
              <span aria-hidden="true">·</span>
              <span>EduGenie Learning Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Learning Progress & Performance Tracking
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitor your retention, quiz accuracy trends, study streaks, and topic-by-topic mastery levels.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
              <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-950 font-display tabular-nums">
              {profile.streakDays} Days
            </div>
            <span className="text-[11px] text-amber-700">Daily consistency</span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
            <div className="flex items-center justify-between text-indigo-800 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Quizzes</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-950 font-display tabular-nums">
              {totalQuizzes}
            </div>
            <span className="text-[11px] text-indigo-700">Completed tests</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-950 font-display tabular-nums">
              {overallAccuracy}%
            </div>
            <span className="text-[11px] text-emerald-700">{totalCorrect} / {totalQuestionsAnswered} correct</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Questions</span>
              <BookOpen className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tabular-nums">
              {totalQuestionsAnswered}
            </div>
            <span className="text-[11px] text-slate-500">Practice items solved</span>
          </div>
        </div>
      </div>

      {/* Topic Mastery breakdown */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Topic Mastery Ratings</span>
        </h2>

        {subjectList.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No quiz records yet. Take a quiz to populate your topic mastery ratings!
          </p>
        ) : (
          <div className="space-y-3">
            {subjectList.map((sub, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold">{sub.topic}</span>
                    <span className="text-slate-400 font-normal">
                      · {sub.quizzesCount} {sub.quizzesCount === 1 ? 'quiz' : 'quizzes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold tabular-nums">{sub.accuracy}%</span>
                    <button
                      onClick={() => onJumpToQuiz(sub.topic)}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline ml-2"
                    >
                      Practice more
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sub.accuracy >= 80
                        ? 'bg-emerald-500'
                        : sub.accuracy >= 60
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${sub.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz History Log */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Past Quiz Assessments</span>
          </h2>
          {quizHistory.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {quizHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            You haven't completed any quizzes yet. Head over to the{' '}
            <button
              onClick={() => onJumpToQuiz('General Knowledge')}
              className="text-indigo-600 font-semibold underline"
            >
              Quiz Generator
            </button>{' '}
            to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {quizHistory.map((q) => {
              const isExpanded = expandedQuizId === q.id;
              const percent = Math.round((q.score / q.totalQuestions) * 100);
              const formattedDate = new Date(q.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{q.topic}</span>
                        <span>·</span>
                        <span className="capitalize">{q.difficulty}</span>
                        <span>·</span>
                        <span>{formattedDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {q.score} / {q.totalQuestions}
                        </div>
                        <div
                          className={`text-xs font-semibold tabular-nums ${
                            percent >= 80
                              ? 'text-emerald-600'
                              : percent >= 60
                              ? 'text-indigo-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {percent}%
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail with question-by-question review */}
                  {isExpanded && q.questions && q.questions.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Question Breakdown & Explanations:
                      </h4>
                      {q.questions.map((item, idx) => {
                        const userChoice = q.userAnswers?.[idx];
                        const wasCorrect = userChoice === item.correctIndex;
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs ${
                              wasCorrect
                                ? 'bg-white border-emerald-200'
                                : 'bg-white border-rose-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-semibold text-slate-900">
                                {idx + 1}. {item.question}
                              </span>
                              {wasCorrect ? (
                                <span className="font-bold text-emerald-700 shrink-0 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                </span>
                              ) : (
                                <span className="font-bold text-rose-700 shrink-0 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Missed
                                </span>
                              )}
                            </div>
                            <div className="text-slate-600 space-y-0.5">
                              <div>
                                Correct: <strong className="text-emerald-800">{item.options[item.correctIndex]}</strong>
                              </div>
                              {!wasCorrect && userChoice !== undefined && (
                                <div>
                                  Your answer: <strong className="text-rose-800">{item.options[userChoice]}</strong>
                                </div>
                              )}
                              <div className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded">
                                {item.explanation}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
