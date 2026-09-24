import React, { useState, useEffect } from 'react';
import { ActiveTab, StudentProfile, QuizRecord } from './types';
import { Navbar } from './components/Navbar';
import { StudentProfileModal } from './components/StudentProfileModal';
import { TaskWorkspace } from './components/TaskWorkspace';
import { QuestionAnswer } from './components/QuestionAnswer';
import { TopicExplainer } from './components/TopicExplainer';
import { TextSummarizer } from './components/TextSummarizer';
import { QuizGenerator } from './components/QuizGenerator';
import { StudyPlanner } from './components/StudyPlanner';
import { PersonalizedLearning } from './components/PersonalizedLearning';
import { ProgressTracker } from './components/ProgressTracker';
import { FastApiCodeViewer } from './components/FastApiCodeViewer';
import {
  getStoredProfile,
  saveStoredProfile,
  updateStreak,
  getStoredQuizHistory,
  saveQuizRecord,
} from './utils/storage';
import {
  GraduationCap,
  Sparkles,
  CheckSquare,
  Calendar,
  Compass,
  BarChart3,
  FileCode2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [profile, setProfile] = useState<StudentProfile>(getStoredProfile());
  const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Cross-feature shared topic states
  const [jumpTopic, setJumpTopic] = useState('');
  const [jumpSourceText, setJumpSourceText] = useState('');

  // Initial load
  useEffect(() => {
    const loadedProfile = getStoredProfile();
    const updated = updateStreak(loadedProfile);
    setProfile(updated);
    setQuizHistory(getStoredQuizHistory());
  }, []);

  const handleSaveProfile = (updated: StudentProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleQuizCompleted = (record: QuizRecord) => {
    saveQuizRecord(record);
    setQuizHistory(getStoredQuizHistory());
  };

  const handleClearHistory = () => {
    localStorage.removeItem('edugenie_quiz_history_v1');
    setQuizHistory([]);
  };

  // Navigators between modules
  const navigateToQuiz = (topic?: string, sourceText?: string) => {
    if (topic) setJumpTopic(topic);
    if (sourceText) setJumpSourceText(sourceText);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToExplain = (topic: string) => {
    setJumpTopic(topic);
    setActiveTab('explain');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPlan = (topic: string) => {
    setJumpTopic(topic);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'workspace' && (
          <TaskWorkspace
            onQuizScoreRecorded={handleQuizCompleted}
            onSelectTopicForPlanner={navigateToPlan}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizGenerator
            profile={profile}
            initialTopic={jumpTopic}
            initialSourceText={jumpSourceText}
            onQuizCompleted={handleQuizCompleted}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            profile={profile}
            initialTopic={jumpTopic}
            onJumpToQuiz={navigateToQuiz}
          />
        )}

        {activeTab === 'recommendations' && (
          <PersonalizedLearning
            profile={profile}
            quizHistory={quizHistory}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onJumpToExplain={navigateToExplain}
            onJumpToQuiz={navigateToQuiz}
            onJumpToPlan={navigateToPlan}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTracker
            profile={profile}
            quizHistory={quizHistory}
            onClearHistory={handleClearHistory}
            onJumpToQuiz={navigateToQuiz}
          />
        )}

        {activeTab === 'fastapi' && <FastApiCodeViewer />}

        {activeTab === 'qna' && (
          <QuestionAnswer
            profile={profile}
            onJumpToQuiz={navigateToQuiz}
            onJumpToExplain={navigateToExplain}
          />
        )}

        {activeTab === 'explain' && (
          <TopicExplainer
            profile={profile}
            initialTopic={jumpTopic}
            onJumpToQuiz={navigateToQuiz}
            onJumpToPlan={navigateToPlan}
          />
        )}

        {activeTab === 'summarize' && (
          <TextSummarizer
            onJumpToQuiz={(source, title) => navigateToQuiz(title, source)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-700">EduGenie</span>
              <span>·</span>
              <span>FastAPI & Google Gemini Learning Assistant</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <button
                onClick={() => setActiveTab('workspace')}
                className="hover:text-indigo-600 transition-colors"
              >
                Task Assistant
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveTab('fastapi')}
                className="hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>FastAPI Python Modules</span>
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveTab('progress')}
                className="hover:text-indigo-600 transition-colors"
              >
                Analytics
              </button>
              <span>·</span>
              <span>Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Student Profile Settings Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
