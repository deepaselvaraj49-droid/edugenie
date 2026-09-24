import React, { useState, useEffect, useRef } from 'react';
import {
  EduTaskType,
  TaskResult,
  QAResult,
  ExplainResult,
  QuizResult,
  SummarizeResult,
  LearningPathResult,
  QuizRecord,
} from '../types';
import {
  fetchQA,
  fetchExplain,
  fetchQuiz,
  fetchSummarize,
  fetchLearningRecommendations,
} from '../services/api';
import { FormattedContent } from './FormattedContent';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Cpu,
  Globe2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';

interface TaskWorkspaceProps {
  onQuizScoreRecorded: (record: QuizRecord) => void;
  onSelectTopicForPlanner?: (topic: string) => void;
}

const TASKS: {
  id: EduTaskType;
  name: string;
  endpoint: string;
  icon: string;
  placeholder: string;
  samplePrompts: string[];
}[] = [
  {
    id: 'qa',
    name: 'Question & Answer (/qa)',
    endpoint: '/qa',
    icon: '❓',
    placeholder: 'Ask any academic or general knowledge question (e.g. "What causes ocean tides?" or "Explain Euler’s formula")...',
    samplePrompts: [
      'What causes ocean tides on Earth?',
      'Why is the speed of light a cosmic speed limit?',
      'How does mRNA vaccine technology work?',
      'What was the significance of the Magna Carta in 1215?',
    ],
  },
  {
    id: 'explain',
    name: 'Concept Explanation (/explain)',
    endpoint: '/explain',
    icon: '💡',
    placeholder: 'Enter a difficult concept to simplify (e.g. "Quantum Superposition", "Transformer Neural Networks", "CRISPR-Cas9")...',
    samplePrompts: [
      'Quantum Superposition & Schrödinger’s Cat',
      'Transformer Neural Networks in AI',
      'Plate Tectonics & Continental Drift',
      'Supply and Demand Elasticity',
    ],
  },
  {
    id: 'quiz',
    name: 'Quiz Generation (/quiz)',
    endpoint: '/quiz',
    icon: '📝',
    placeholder: 'Enter a topic or paste an educational passage to generate 3 MCQs with 4 options each...',
    samplePrompts: [
      'Photosynthesis and Cellular Respiration',
      'Newton’s Three Laws of Motion',
      'World War I Alliances and Causes',
      'Object-Oriented Programming Principles',
    ],
  },
  {
    id: 'summarize',
    name: 'Summarization (/summarize)',
    endpoint: '/summarize',
    icon: '📄',
    placeholder: 'Paste lengthy educational content or textbook notes here to extract a concise, structured summary...',
    samplePrompts: [
      'The human cardiovascular system consists of the heart, blood vessels, and approximately 5 liters of blood. The heart has four chambers: the left and right atria receiving chambers, and the left and right ventricles pumping chambers. Deoxygenated blood enters the right atrium via the vena cava, moves to the right ventricle, and is pumped to the lungs for gas exchange. Oxygen-rich blood returns to the left atrium, passes to the left ventricle, and is propelled through the aorta to systemic circulation under systolic and diastolic pressure.',
      'The Renaissance was a fervent period of European cultural, artistic, political and economic rebirth following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature and art. Some of the greatest thinkers, authors, statesmen, scientists and artists in human history thrived during this era, while global exploration opened up new lands and cultures to European commerce.',
    ],
  },
  {
    id: 'recommendations',
    name: 'Learning Recommendations (/learn/recommendations)',
    endpoint: '/learn/recommendations',
    icon: '🧭',
    placeholder: 'Enter a skill or subject to generate a 3-tier Beginner to Advanced learning path...',
    samplePrompts: [
      'Full-Stack Web Development',
      'Machine Learning & Deep Learning',
      'Organic Chemistry',
      'Data Structures and Algorithms',
    ],
  },
];

const LANGUAGES = [
  'English',
  'Spanish (Español)',
  'French (Français)',
  'German (Deutsch)',
  'Hindi (हिन्दी)',
  'Mandarin (中文)',
  'Japanese (日本語)',
  'Portuguese (Português)',
];

export const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({
  onQuizScoreRecorded,
}) => {
  const [selectedTask, setSelectedTask] = useState<EduTaskType>('qa');
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('English');
  const [useLightweight, setUseLightweight] = useState(true);

  // States for Execution
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskResult | null>(null);

  // Voice Interaction (Speech-to-Text & Text-to-Speech)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Quiz interactive testing state (when task is quiz)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentTaskMeta = TASKS.find((t) => t.id === selectedTask)!;

  // Initialize Web Speech API for voice input if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const toggleSpeechOutput = (textToRead: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const clean = textToRead.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = (overrideText || inputText).trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      if (selectedTask === 'qa') {
        const data = await fetchQA(query, language);
        setResult({ type: 'qa', data });
      } else if (selectedTask === 'explain') {
        const data = await fetchExplain(query, useLightweight, language);
        setResult({ type: 'explain', data });
      } else if (selectedTask === 'quiz') {
        // Distinguish if query is a short topic or long passage
        const isPassage = query.length > 150 || query.includes('\n');
        const data = await fetchQuiz(
          isPassage ? '' : query,
          isPassage ? query : '',
          language
        );
        setResult({ type: 'quiz', data });
      } else if (selectedTask === 'summarize') {
        const data = await fetchSummarize(query, language);
        setResult({ type: 'summarize', data });
      } else if (selectedTask === 'recommendations') {
        const data = await fetchLearningRecommendations(query, language);
        setResult({ type: 'recommendations', data });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Execution error. Please check your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleEvaluateQuiz = () => {
    if (!result || result.type !== 'quiz') return;
    setQuizSubmitted(true);

    let score = 0;
    result.data.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_option_index) {
        score += 1;
      }
    });

    if (score >= 2) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    // Save record to parent progress tracker
    const record: QuizRecord = {
      id: `quiz-${Date.now()}`,
      title: result.data.topic || 'EduGenie Quiz',
      topic: result.data.topic || 'General',
      difficulty: 'Standard',
      score,
      totalQuestions: result.data.questions.length,
      date: new Date().toISOString(),
      questions: result.data.questions,
      userAnswers: quizAnswers,
    };
    onQuizScoreRecorded(record);
  };

  const copyResultText = () => {
    if (!result) return;
    let text = '';
    if (result.type === 'qa') {
      text = `Question: ${result.data.question}\n\nAnswer:\n${result.data.answer}\n\nTakeaways:\n${result.data.key_takeaways.join('\n')}`;
    } else if (result.type === 'explain') {
      text = `Topic: ${result.data.topic}\n\nExplanation:\n${result.data.explanation}\n\nAnalogy:\n${result.data.simple_analogy}`;
    } else if (result.type === 'quiz') {
      text = `Quiz on ${result.data.topic}\n\n` +
        result.data.questions
          .map(
            (q, i) =>
              `${i + 1}. ${q.question}\n` +
              q.options.map((opt, oi) => `  ${String.fromCharCode(65 + oi)}. ${opt}`).join('\n') +
              `\nAnswer: ${String.fromCharCode(65 + q.correct_option_index)} - ${q.explanation}`
          )
          .join('\n\n');
    } else if (result.type === 'summarize') {
      text = `${result.data.title}\n\nSummary:\n${result.data.summary}\n\nKey Points:\n${result.data.key_points.join('\n')}\n\nTakeaway: ${result.data.quick_takeaway}`;
    } else if (result.type === 'recommendations') {
      text = `Learning Roadmap: ${result.data.topic}\n\n${result.data.overview}\n\n` +
        result.data.tiers
          .map(
            (t) =>
              `=== ${t.level} (${t.duration}) ===\nTopics:\n${t.subtopics.join('\n')}\nMilestone: ${t.milestone}`
          )
          .join('\n\n');
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Task Controller Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>Modular FastAPI & Gemini Engine</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                REST: {currentTaskMeta.endpoint}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              EduGenie Learning Assistant
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select an educational task, enter your subject or passage, and receive instant AI assistance.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Globe2 className="w-4 h-4 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Select Output Language (Multilingual Support)"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang.split(' ')[0]}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task Selection Dropdown */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Learning Task
            </label>
            <div className="relative">
              <select
                value={selectedTask}
                onChange={(e) => {
                  setSelectedTask(e.target.value as EduTaskType);
                  setResult(null);
                }}
                className="w-full px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 bg-indigo-50/50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 appearance-none cursor-pointer transition-all"
              >
                {TASKS.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.icon} {task.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-700 font-bold">
                ▼
              </div>
            </div>
          </div>

          {/* Model Toggle (Visible when task is 'explain') */}
          {selectedTask === 'explain' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Explanation Engine Selection:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {useLightweight
                      ? 'LaMini-Flan-T5 (Lightweight local model mode: simplified language, no heavy jargon)'
                      : 'Google Gemini 3.8 Flash (Comprehensive, full academic rigor)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setUseLightweight(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    useLightweight
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lightweight (LaMini)
                </button>
                <button
                  type="button"
                  onClick={() => setUseLightweight(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    !useLightweight
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gemini Flash
                </button>
              </div>
            </div>
          )}

          {/* Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Content / Question Input
              </label>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="tabular-nums">{inputText.length} chars</span>
                <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Text</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="relative rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 bg-slate-50/50 transition-all">
              <textarea
                rows={selectedTask === 'summarize' || selectedTask === 'quiz' ? 5 : 3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentTaskMeta.placeholder}
                className="w-full px-4 py-3 text-sm sm:text-base text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none resize-none"
              />

              {/* Bottom bar inside input */}
              <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-100 rounded-b-xl">
                {/* Voice input button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    isListening
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Speech-to-Text Voice Interaction"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing ({currentTaskMeta.endpoint})...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Task</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Try sample {currentTaskMeta.name.split(' ')[0]} inputs:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentTaskMeta.samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(sample);
                    handleSubmit(undefined, sample);
                  }}
                  className="text-left text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  {sample.length > 70 ? `${sample.slice(0, 70)}...` : sample}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Execution Failed</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-full" />
            <div className="h-3.5 bg-slate-100 rounded w-5/6" />
            <div className="h-3.5 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
      )}

      {/* =======================================================
          RESULT SECTION: Displays responses clearly for each task
         ======================================================= */}
      {result && !isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Result Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                {result.type.toUpperCase()} Response
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-mono">
                {TASKS.find((t) => t.id === result.type)?.endpoint}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Audio Listen Button */}
              <button
                type="button"
                onClick={() => {
                  let text = '';
                  if (result.type === 'qa') text = result.data.answer;
                  else if (result.type === 'explain') text = result.data.explanation;
                  else if (result.type === 'summarize') text = result.data.summary;
                  toggleSpeechOutput(text);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
                title={isSpeaking ? 'Stop Audio' : 'Text-to-Speech Audio Readout'}
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

              {/* Copy Button */}
              <button
                type="button"
                onClick={copyResultText}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
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

          {/* 1. Q&A RESULT DISPLAY */}
          {result.type === 'qa' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Question Asked:
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {result.data.question}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Answer
                </h3>
                <div className="text-sm leading-relaxed text-slate-800">
                  <FormattedContent content={result.data.answer} />
                </div>
              </div>

              {result.data.key_takeaways?.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Key Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {result.data.key_takeaways.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.data.related_topics?.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Explore Related:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.data.related_topics.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setInputText(t);
                          handleSubmit(undefined, t);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. EXPLANATION RESULT DISPLAY */}
          {result.type === 'explain' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    Topic Explained
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 font-display">
                    {result.data.topic}
                  </h2>
                </div>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                  Model: {result.data.model_used}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 leading-relaxed text-sm text-slate-800">
                <FormattedContent content={result.data.explanation} />
              </div>

              {result.data.simple_analogy && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Beginner Everyday Analogy</span>
                  </div>
                  <p className="text-sm text-amber-950 italic">
                    "{result.data.simple_analogy}"
                  </p>
                </div>
              )}

              {result.data.key_concepts?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Core Conceptual Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.data.key_concepts.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs bg-indigo-50 border border-indigo-200/60 text-indigo-900 font-medium px-2.5 py-1 rounded-lg"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. QUIZ GENERATION RESULT DISPLAY (3 MCQs with 4 options each) */}
          {result.type === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    Generated Practice Quiz (3 MCQs)
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {result.data.topic || 'Subject Assessment'}
                  </h2>
                </div>
                {quizSubmitted && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Score:</span>
                    <span className="text-lg font-bold text-indigo-600 tabular-nums">
                      {
                        result.data.questions.filter(
                          (q, i) => quizAnswers[i] === q.correct_option_index
                        ).length
                      }{' '}
                      / {result.data.questions.length}
                    </span>
                  </div>
                )}
              </div>

              {/* List of 3 Questions */}
              <div className="space-y-5">
                {result.data.questions.map((q, qIdx) => {
                  const userChoice = quizAnswers[qIdx];
                  const isCorrect = userChoice === q.correct_option_index;

                  return (
                    <div
                      key={q.id || qIdx}
                      className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          <span className="text-indigo-600 mr-1.5 tabular-nums">Q{qIdx + 1}.</span>
                          {q.question}
                        </h4>
                        {quizSubmitted && (
                          <span className="shrink-0">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                <XCircle className="w-3.5 h-3.5" /> Missed
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* 4 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userChoice === optIdx;
                          const isAnswerKey = optIdx === q.correct_option_index;

                          let btnStyle = 'border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 text-slate-700';

                          if (quizSubmitted) {
                            if (isAnswerKey) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                            } else if (isSelected && !isAnswerKey) {
                              btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                            } else {
                              btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-600';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              disabled={quizSubmitted}
                              className={`p-3 rounded-lg border text-left text-xs font-medium flex items-start gap-2 transition-all ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1 leading-relaxed">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                          <span className="font-bold text-slate-800">
                            Pedagogical Explanation:
                          </span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Action */}
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleEvaluateQuiz}
                  disabled={Object.keys(quizAnswers).length < result.data.questions.length}
                  className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Submit Answers & Calculate Score</span>
                  <Award className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Retry This Quiz
                </button>
              )}
            </div>
          )}

          {/* 4. SUMMARIZATION RESULT DISPLAY */}
          {result.type === 'summarize' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Document Summary
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {result.data.title}
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-800">
                <FormattedContent content={result.data.summary} />
              </div>

              {result.data.key_points?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Crucial Educational Takeaways ({result.data.key_points.length})
                  </h4>
                  <div className="space-y-2">
                    {result.data.key_points.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                          {i + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          {pt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.data.quick_takeaway && (
                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-950 font-medium flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">
                      Quick Revision Takeaway:
                    </span>
                    <p>{result.data.quick_takeaway}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. LEARNING RECOMMENDATIONS RESULT DISPLAY */}
          {result.type === 'recommendations' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Structured Curriculum Roadmap
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  {result.data.topic}
                </h2>
                <p className="text-xs text-slate-600 mt-1">{result.data.overview}</p>
              </div>

              {/* 3 Tiers (Beginner -> Intermediate -> Advanced) */}
              <div className="space-y-4">
                {result.data.tiers?.map((tier, tIdx) => {
                  const isBeginner = tier.level.toLowerCase().includes('beginner');
                  const isInter = tier.level.toLowerCase().includes('intermediate');

                  return (
                    <div
                      key={tIdx}
                      className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                              isBeginner
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInter
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            Tier {tIdx + 1}: {tier.level}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {tier.duration}
                          </span>
                        </div>
                      </div>

                      {/* Subtopics */}
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1">
                          Topics to Master:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tier.subtopics.map((st, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Resources */}
                      {tier.resources?.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1">
                            Curated Learning Resources:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tier.resources.map((res, ri) => (
                              <div
                                key={ri}
                                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs"
                              >
                                <span className="font-bold text-slate-900 block">
                                  {res.title}
                                </span>
                                <span className="text-[11px] text-indigo-600 font-semibold block mb-0.5">
                                  {res.type}
                                </span>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {res.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practical Milestone */}
                      {tier.milestone && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-900">
                              Tier Benchmark Milestone:
                            </span>{' '}
                            <span>{tier.milestone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
