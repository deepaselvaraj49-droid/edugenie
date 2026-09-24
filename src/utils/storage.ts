import { StudentProfile, QuizRecord, SavedStudyPlan } from '../types';

const PROFILE_KEY = 'edugenie_profile_v1';
const QUIZ_HISTORY_KEY = 'edugenie_quiz_history_v1';
const STUDY_PLANS_KEY = 'edugenie_study_plans_v1';

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Alex Learner',
  gradeLevel: 'High School Senior / Freshman',
  primarySubject: 'STEM & Sciences',
  targetGoal: 'Master AP / College entrance and exams',
  weakSubjects: ['Organic Chemistry', 'Calculus Integration'],
  strongSubjects: ['Physics Mechanics', 'World History'],
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export function getStoredProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function updateStreak(profile: StudentProfile): StudentProfile {
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActiveDate === today) {
    return profile;
  }

  const lastDate = new Date(profile.lastActiveDate);
  const currentDate = new Date(today);
  const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = profile.streakDays;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const updated = {
    ...profile,
    streakDays: newStreak,
    lastActiveDate: today,
  };
  saveStoredProfile(updated);
  return updated;
}

export function getStoredQuizHistory(): QuizRecord[] {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (!raw) {
      // Seed with initial realistic quiz record for demonstration
      const initial: QuizRecord[] = [
        {
          id: 'quiz-init-1',
          title: 'Cellular Respiration & ATP Synthesis',
          topic: 'Biology',
          difficulty: 'medium',
          score: 4,
          totalQuestions: 5,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          questions: [],
          userAnswers: {},
        },
        {
          id: 'quiz-init-2',
          title: 'Newtonian Forces & Free Body Diagrams',
          topic: 'Physics',
          difficulty: 'hard',
          score: 5,
          totalQuestions: 5,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          questions: [],
          userAnswers: {},
        },
      ];
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuizRecord(record: QuizRecord): QuizRecord[] {
  try {
    const history = getStoredQuizHistory();
    const updated = [record, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save quiz record', e);
    return [];
  }
}

export function getStoredStudyPlans(): SavedStudyPlan[] {
  try {
    const raw = localStorage.getItem(STUDY_PLANS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStudyPlan(plan: SavedStudyPlan): SavedStudyPlan[] {
  try {
    const plans = getStoredStudyPlans();
    const existingIndex = plans.findIndex((p) => p.id === plan.id);
    let updated: SavedStudyPlan[];
    if (existingIndex >= 0) {
      updated = [...plans];
      updated[existingIndex] = plan;
    } else {
      updated = [plan, ...plans];
    }
    localStorage.setItem(STUDY_PLANS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save study plan', e);
    return [];
  }
}

export function toggleMilestoneCompletion(planId: string, milestoneId: string): SavedStudyPlan[] {
  try {
    const plans = getStoredStudyPlans();
    const updated = plans.map((p) => {
      if (p.id !== planId) return p;
      const completed = p.completedMilestones.includes(milestoneId)
        ? p.completedMilestones.filter((id) => id !== milestoneId)
        : [...p.completedMilestones, milestoneId];
      return { ...p, completedMilestones: completed };
    });
    localStorage.setItem(STUDY_PLANS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to toggle milestone', e);
    return [];
  }
}
