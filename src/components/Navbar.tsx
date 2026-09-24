import React from 'react';
import { ActiveTab, StudentProfile } from '../types';
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileText,
  CheckSquare,
  Calendar,
  Compass,
  BarChart3,
  Cpu,
  Flame,
  User,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  profile,
  onOpenProfile,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'workspace', label: 'Task Hub', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> },
    { id: 'qna', label: 'AI Q&A', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'explain', label: 'Explainer', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'quiz', label: 'Quiz Arena', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'summarize', label: 'Summarizer', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'planner', label: 'Learning Paths', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'recommendations', label: 'Personalized', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'progress', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'fastapi', label: 'FastAPI Backend', icon: <Cpu className="w-3.5 h-3.5 text-emerald-600" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => onTabChange('workspace')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  EduGenie
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/50">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                AI Learning Assistant & Study Companion
              </p>
            </div>
          </div>

          {/* Desktop Nav Navigation (Scrollable Segmented Control) */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Medium Screens Nav (Slightly condensed) */}
          <nav className="hidden md:flex xl:hidden items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-md">
            {[
              { id: 'workspace' as ActiveTab, label: 'Task Hub', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> },
              { id: 'qna' as ActiveTab, label: 'Q&A', icon: <HelpCircle className="w-3.5 h-3.5" /> },
              { id: 'explain' as ActiveTab, label: 'Explain', icon: <Lightbulb className="w-3.5 h-3.5" /> },
              { id: 'quiz' as ActiveTab, label: 'Quiz', icon: <CheckSquare className="w-3.5 h-3.5" /> },
              { id: 'summarize' as ActiveTab, label: 'Summary', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'planner' as ActiveTab, label: 'Roadmap', icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'fastapi' as ActiveTab, label: 'FastAPI', icon: <Cpu className="w-3.5 h-3.5 text-emerald-600" /> },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60"
              title={`${profile.streakDays} day study streak!`}
            >
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="font-semibold tabular-nums">{profile.streakDays}d Streak</span>
            </div>

            {/* Student Profile Quick View Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              title="Student Profile Settings"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline font-semibold">{profile.name}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Scrollbar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 -mx-4 px-4 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md shrink-0 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
