import {
  QAResult,
  ExplainResult,
  QuizResult,
  SummarizeResult,
  LearningPathResult,
  AnswerResponse,
  ExplanationData,
  ExplanationResponse,
  SummaryResponse,
  QuizData,
  StudyPlanData,
  RecommendationsResponse,
  QuizRecord,
} from '../types';

// ==========================================
// REST Endpoints (/qa, /explain, /quiz, /summarize, /learn/recommendations)
// ==========================================

export async function fetchQA(question: string, language: string = 'English'): Promise<QAResult> {
  const res = await fetch('/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchExplain(
  topic: string,
  useLightweight: boolean = true,
  language: string = 'English'
): Promise<ExplainResult> {
  const res = await fetch('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, use_lightweight: useLightweight, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchQuiz(
  topic: string = '',
  passage: string = '',
  language: string = 'English'
): Promise<QuizResult> {
  const res = await fetch('/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, passage, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchSummarize(text: string, language: string = 'English'): Promise<SummarizeResult> {
  const res = await fetch('/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchLearningRecommendations(
  topic: string,
  language: string = 'English'
): Promise<LearningPathResult> {
  const res = await fetch('/learn/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchPythonCode(fileName: string): Promise<{ filename: string; content: string }> {
  const res = await fetch(`/api/python-code/${fileName}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${fileName}`);
  }
  return res.json();
}

// ==========================================
// Compatibility Aliases for Modular UI Views
// ==========================================

export async function askQuestion(params: {
  question: string;
  subject?: string;
  studentLevel?: string;
  gradeLevel?: string;
}): Promise<AnswerResponse> {
  const data = await fetchQA(params.question);
  return {
    answer: data.answer,
    keyTakeaways: data.key_takeaways || [],
    analogy: data.key_takeaways?.[0] || '',
    followUpQuestions: data.related_topics || [],
    sourceTopic: params.subject,
  };
}

export async function explainTopic(params: {
  topic: string;
  depthLevel?: string;
  level?: string;
  subject?: string;
}): Promise<ExplanationResponse> {
  const data = await fetchExplain(params.topic, (params.depthLevel || params.level) === 'simple');
  return {
    title: `Understanding ${data.topic}`,
    topic: data.topic,
    depthLevel: params.depthLevel || params.level || 'simple',
    overview: data.explanation,
    breakdown: (data.key_concepts || []).map((c) => ({
      heading: c,
      content: `Core functional principle of ${c} within ${data.topic}.`,
    })),
    analogy: data.simple_analogy || `Think of ${data.topic} as a foundational system component.`,
    misconceptions: [
      'Assuming that complex technical terminology is required to grasp the underlying intuition.',
      'Overlooking how the fundamental assumptions hold true in everyday environments.',
    ],
    summary: data.simple_analogy || data.explanation,
    coreMechanisms: data.key_concepts?.map((c) => ({ title: c, explanation: c })) || [],
    everydayAnalogy: data.simple_analogy || '',
    commonMisconceptions: ['Assuming complex jargon is needed to understand the core mechanism'],
    mentalModelTakeaway: data.simple_analogy || data.topic,
    furtherQuestions: ['How does this apply to real-world systems?', 'What is the most common test question on this?'],
  };
}

export async function summarizeText(params: {
  text: string;
  format?: string;
  length?: string;
}): Promise<SummaryResponse> {
  const data = await fetchSummarize(params.text);
  return {
    title: data.title,
    summary: data.summary,
    keyPoints: data.key_points || [],
    vocabulary: (data.key_points || []).slice(0, 4).map((kp) => {
      const parts = kp.split(':');
      return {
        term: parts[0]?.trim() || 'Core Concept',
        definition: parts[1]?.trim() || kp,
      };
    }),
    quickReview: data.quick_takeaway,
  };
}

export async function generateQuiz(params: {
  topic?: string;
  sourceText?: string;
  questionCount?: number;
  difficulty?: string;
}): Promise<QuizData> {
  const data = await fetchQuiz(params.topic, params.sourceText);
  return {
    topic: data.topic || params.topic || 'Practice Quiz',
    quizTitle: `${data.topic || params.topic || 'Assessment'} Mastery Quiz`,
    difficulty: params.difficulty || 'Medium',
    questions: data.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correct_option_index ?? (q as any).correctIndex ?? 0,
      correct_option_index: q.correct_option_index ?? 0,
      explanation: q.explanation,
      hint: `Think carefully about: ${q.options[q.correct_option_index ?? 0]?.slice(0, 20)}...`,
    })),
  };
}

export async function generateStudyPlan(params: {
  topic: string;
  timeframe?: string;
  dailyHours?: number;
  goal?: string;
  studentLevel?: string;
}): Promise<StudyPlanData> {
  const data = await fetchLearningRecommendations(params.topic);
  return {
    title: `Mastery Roadmap: ${params.topic}`,
    topic: params.topic,
    targetGoal: params.goal || 'Foundational to Advanced Mastery',
    totalEstimatedHours: (params.dailyHours || 2) * 14,
    strategyOverview: data.overview,
    phases: data.tiers.map((t, idx) => ({
      phaseNumber: idx + 1,
      phaseName: `${t.level} Mastery (${t.duration})`,
      duration: t.duration,
      milestones: t.subtopics.map((st, sIdx) => ({
        id: `m-${idx}-${sIdx}`,
        title: st,
        estimatedMinutes: 90,
        description: `Deep dive into ${st} using suggested materials.`,
        practiceTask: t.milestone || `Complete hands-on exercise for ${st}.`,
      })),
    })),
    retentionTips: [
      'Practice active recall by testing yourself after every study session.',
      'Revisit earlier tier milestones every 48 hours for spaced repetition.',
      'Explain the topic out loud in your own words using simple analogies.',
    ],
  };
}

export async function getRecommendations(params: {
  gradeLevel?: string;
  weakSubjects?: string[];
  strongSubjects?: string[];
  quizHistory?: QuizRecord[];
  interests?: string[];
}): Promise<RecommendationsResponse> {
  const topic = params.weakSubjects?.[0] || params.interests?.[0] || 'Core Subject Foundations';
  const data = await fetchLearningRecommendations(topic);
  return {
    motivationalAnalysis: `Based on your profile, focusing on ${topic} will unlock high-retention mastery across interconnected topics.`,
    focusRecommendations: [
      {
        subject: topic,
        topic: `${topic} Foundations`,
        priority: 'high',
        reason: 'Identified as a prime opportunity for score acceleration.',
        actionableStep: 'Review core concepts and complete the 3-question diagnostic quiz.',
      },
    ],
    suggestedNextTopics: [
      `${topic} Mechanisms`,
      'Active Problem Solving',
      'Advanced Edge Cases & Applications',
    ],
    dailyHabitTip: 'Spend 20 focused minutes on your highest priority topic before switching to review.',
  };
}
