import React, { useState, useEffect } from 'react';
import { QuizData, QuizQuestion, QuizRecord, StudentProfile } from '../types';
import { generateQuiz } from '../services/api';
import { saveQuizRecord } from '../utils/storage';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Sparkles,
  Award,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';

interface QuizGeneratorProps {
  profile: StudentProfile;
  initialTopic?: string;
  initialSourceText?: string;
  onQuizCompleted: (record: QuizRecord) => void;
}

const TOPIC_PRESETS = [
  'Cellular Respiration & ATP',
  'Newtonian Mechanics & Gravity',
  'Calculus: Derivatives & Integrals',
  'Organic Chemistry: Reaction Mechanisms',
  'World War II: Causes & Turning Points',
  'Data Structures: Binary Trees & Graphs',
];

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  profile,
  initialTopic = '',
  initialSourceText = '',
  onQuizCompleted,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [sourceText, setSourceText] = useState(initialSourceText);
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Sync props if changed
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSourceText) setSourceText(initialSourceText);
  }, [initialTopic, initialSourceText]);

  const handleGenerate = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t && !sourceText.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setSelectedAnswers({});
    setRevealedExplanations({});
    setShowHint({});
    setIsCompleted(false);
    setCurrentQuestionIndex(0);

    try {
      const data = await generateQuiz({
        topic: t,
        sourceText: sourceText.trim() || undefined,
        questionCount,
        difficulty,
      });

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions generated. Please try a different topic.');
      }

      setQuizData(data);
      if (customTopic) setTopic(customTopic);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!quizData) return;
    if (selectedAnswers[currentQuestionIndex] !== undefined) return; // already answered

    const newAnswers = { ...selectedAnswers, [currentQuestionIndex]: optionIndex };
    setSelectedAnswers(newAnswers);
    setRevealedExplanations({ ...revealedExplanations, [currentQuestionIndex]: true });

    // Check if this was the last question
    if (Object.keys(newAnswers).length === quizData.questions.length) {
      calculateFinalScore(newAnswers);
    }
  };

  const calculateFinalScore = (answers: Record<number, number>) => {
    if (!quizData) return;
    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setIsCompleted(true);

    // Trigger celebratory confetti if passed
    if (correctCount >= Math.ceil(quizData.questions.length * 0.6)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Save record into progress tracker
    const record: QuizRecord = {
      id: `quiz-${Date.now()}`,
      title: quizData.quizTitle || topic || 'Practice Quiz',
      topic: quizData.topic || topic || 'General Knowledge',
      difficulty: quizData.difficulty || difficulty,
      score: correctCount,
      totalQuestions: quizData.questions.length,
      date: new Date().toISOString(),
      questions: quizData.questions,
      userAnswers: answers,
    };
    saveQuizRecord(record);
    onQuizCompleted(record);
  };

  const currentQ: QuizQuestion | undefined = quizData?.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const chosenIndex = selectedAnswers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Generator Form (When not active or when modifying) */}
      {!quizData && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>Automated Practice & Assessment</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Quiz & Practice Question Generator
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Instantly create pedagogical multiple-choice quizzes tailored to any topic or extracted directly from your study material.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topic or Academic Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Chemical Bonding, Shakespeare's Hamlet, Linear Algebra, Cold War..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-slate-50/50"
              />
            </div>

            {/* Optional Source Text input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Optional: Base Quiz Directly on Study Material (Leave blank to generate from topic)
              </label>
              <textarea
                rows={3}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste notes or text excerpt if you want the quiz to test this exact material..."
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 resize-none"
              />
            </div>

            {/* Options: Question count & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Questions
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        questionCount === num
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'easy', label: 'Easy' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'hard', label: 'Hard' },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficulty(diff.id)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${
                        difficulty === diff.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Action */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || (!topic.trim() && !sourceText.trim())}
                className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Practice Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Quiz Now</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Topic Presets */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick practice subjects:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TOPIC_PRESETS.map((pTopic, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(pTopic);
                      setSourceText('');
                      handleGenerate(pTopic);
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
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Active Interactive Quiz Card */}
      {quizData && currentQ && !isCompleted && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
                {quizData.quizTitle}
              </span>
              <span className="text-xs text-slate-500">
                Question {currentQuestionIndex + 1} of {quizData.questions.length} · Difficulty: {quizData.difficulty}
              </span>
            </div>
            <button
              onClick={() => setQuizData(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
            >
              Exit Quiz
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>

            {/* Hint toggle */}
            {currentQ.hint && (
              <div>
                {!showHint[currentQuestionIndex] ? (
                  <button
                    onClick={() => setShowHint({ ...showHint, [currentQuestionIndex]: true })}
                    className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 mt-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Need a pedagogical hint?</span>
                  </button>
                ) : (
                  <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 italic">
                    Hint: {currentQ.hint}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ.options.map((optionText, optIdx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = chosenIndex === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;

              let btnStyle = 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 ring-1 ring-rose-500';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-70';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${btnStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected && !isCorrect
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {letters[optIdx]}
                  </span>
                  <div className="flex-1 text-sm sm:text-base font-medium leading-relaxed">
                    {optionText}
                  </div>
                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Visible once answered) */}
          {isAnswered && (
            <div
              className={`p-5 rounded-xl border space-y-2 animate-in fade-in duration-200 ${
                chosenIndex === currentQ.correctIndex
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                {chosenIndex === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800">Correct! Nice work</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-800">Not quite</span>
                  </>
                )}
              </div>
              <p className="text-sm leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={!isAnswered}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => calculateFinalScore(selectedAnswers)}
                disabled={!isAnswered}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Complete Quiz & View Score</span>
                <Award className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Quiz Scoreboard */}
      {isCompleted && quizData && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Score Header */}
          <div className="text-center py-4 space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Quiz Complete!</h2>
            <p className="text-xs text-slate-500">
              Your results have been automatically recorded to your Progress Tracker.
            </p>

            <div className="pt-3">
              <div className="text-4xl font-extrabold text-indigo-600 font-display tabular-nums">
                {score} / {quizData.questions.length}
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {Math.round((score / quizData.questions.length) * 100)}% Accuracy
                {score === quizData.questions.length
                  ? ' · Perfect Mastery! 🌟'
                  : score >= quizData.questions.length * 0.7
                  ? ' · Great Understanding! 👍'
                  : ' · Good Effort! Review mistakes below.'}
              </p>
            </div>
          </div>

          {/* Question Review Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Comprehensive Question Review
            </h3>
            <div className="space-y-3">
              {quizData.questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const wasCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      wasCorrect
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 tabular-nums">
                          Q{idx + 1}.
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{q.question}</h4>
                      </div>
                      {wasCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 shrink-0 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Missed
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pl-4">
                      <div>
                        <span className="font-semibold text-slate-700">Correct Answer: </span>
                        <span className="text-emerald-800 font-medium">
                          {q.options[q.correctIndex]}
                        </span>
                      </div>
                      {!wasCorrect && userAns !== undefined && (
                        <div>
                          <span className="font-semibold text-slate-700">Your Choice: </span>
                          <span className="text-rose-800 font-medium">{q.options[userAns]}</span>
                        </div>
                      )}
                      <p className="text-slate-600 mt-2 text-xs italic bg-white/60 p-2.5 rounded-lg border border-slate-100">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setQuizData(null);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Create Another Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
