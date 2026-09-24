export type ActiveTab =
  | 'workspace'
  | 'qna'
  | 'explain'
  | 'quiz'
  | 'summarize'
  | 'planner'
  | 'recommendations'
  | 'progress'
  | 'fastapi';

export type EduTaskType = 'qa' | 'explain' | 'quiz' | 'summarize' | 'recommendations';

export interface QAResult {
  question: string;
  answer: string;
  key_takeaways: string[];
  related_topics: string[];
}

export interface ExplainResult {
  topic: string;
  explanation: string;
  simple_analogy: string;
  model_used: string;
  key_concepts: string[];
}

export interface QuizQuestionItem {
  id: number;
  question: string;
  options: string[];
  correct_option_index: number;
  correctIndex?: number;
  explanation: string;
  hint?: string;
}

export interface QuizResult {
  topic: string;
  questions: QuizQuestionItem[];
}

export interface SummarizeResult {
  title: string;
  summary: string;
  key_points: string[];
  quick_takeaway: string;
}

export interface LearningResource {
  title: string;
  type: string;
  description: string;
}

export interface LearningTier {
  level: string;
  duration: string;
  subtopics: string[];
  resources: LearningResource[];
  milestone: string;
}

export interface LearningPathResult {
  topic: string;
  overview: string;
  tiers: LearningTier[];
}

export type TaskResult =
  | { type: 'qa'; data: QAResult }
  | { type: 'explain'; data: ExplainResult }
  | { type: 'quiz'; data: QuizResult }
  | { type: 'summarize'; data: SummarizeResult }
  | { type: 'recommendations'; data: LearningPathResult };

export interface StudentProfile {
  name: string;
  gradeLevel: string;
  primarySubject: string;
  targetGoal: string;
  weakSubjects: string[];
  strongSubjects: string[];
  streakDays: number;
  lastActiveDate: string;
}

export interface QuizRecord {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  date: string;
  questions: any[];
  userAnswers: Record<number, number>;
}

export interface AnswerResponse {
  answer: string;
  keyTakeaways: string[];
  analogy?: string;
  followUpQuestions?: string[];
  sourceTopic?: string;
}

export type QnAResponse = AnswerResponse;

export interface ExplanationResponse {
  title: string;
  topic: string;
  depthLevel?: string;
  overview: string;
  breakdown: { heading: string; content: string }[];
  analogy: string;
  misconceptions: string[];
  summary: string;
  coreMechanisms?: { title: string; explanation: string }[];
  everydayAnalogy?: string;
  commonMisconceptions?: string[];
  mentalModelTakeaway?: string;
  furtherQuestions?: string[];
}

export type ExplanationData = ExplanationResponse;

export interface SummaryResponse {
  title: string;
  summary: string;
  keyPoints: string[];
  vocabulary: { term: string; definition: string }[];
  quickReview: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  correct_option_index?: number;
  explanation: string;
  hint?: string;
}

export interface QuizData {
  topic: string;
  quizTitle: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface StudyMilestone {
  id: string;
  title: string;
  estimatedMinutes: number;
  description: string;
  practiceTask: string;
}

export interface StudyPhase {
  phaseNumber: number;
  phaseName: string;
  duration: string;
  milestones: StudyMilestone[];
}

export interface StudyPlanData {
  title: string;
  topic: string;
  targetGoal: string;
  totalEstimatedHours: number;
  strategyOverview: string;
  phases: StudyPhase[];
  retentionTips: string[];
}

export interface SavedStudyPlan extends StudyPlanData {
  id: string;
  createdAt: string;
  completedMilestones: string[];
}

export interface FocusRecommendation {
  subject: string;
  topic: string;
  priority: 'high' | 'medium' | 'low' | string;
  reason: string;
  actionableStep: string;
}

export interface RecommendationsResponse {
  motivationalAnalysis: string;
  focusRecommendations: FocusRecommendation[];
  suggestedNextTopics: string[];
  dailyHabitTip: string;
}
