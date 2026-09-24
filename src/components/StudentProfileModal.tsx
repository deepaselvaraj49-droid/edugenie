import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { X, User, Target, BookOpen, Check } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
}

const GRADE_OPTIONS = [
  'Middle School (Grades 6-8)',
  'High School (Grades 9-10)',
  'High School Senior / AP (Grades 11-12)',
  'College / Undergraduate',
  'Graduate / Advanced Study',
  'Self-Taught / Professional',
];

const SUBJECT_OPTIONS = [
  'Mathematics & Calculus',
  'Physics & Mechanics',
  'Chemistry & Organic Chem',
  'Biology & Genetics',
  'Computer Science & Algorithms',
  'Literature & Writing',
  'World History & Civics',
  'Economics & Finance',
  'Psychology',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevel);
  const [targetGoal, setTargetGoal] = useState(profile.targetGoal);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(profile.weakSubjects);
  const [strongSubjects, setStrongSubjects] = useState<string[]>(profile.strongSubjects);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleSubject = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      name: name.trim() || 'Learner',
      gradeLevel,
      targetGoal: targetGoal.trim() || 'Master target coursework',
      weakSubjects,
      strongSubjects,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Student Learning Profile</h2>
              <p className="text-xs text-slate-500">
                Customizes AI difficulty, explanations, and personalized recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Student Name or Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Alex"
              required
            />
          </div>

          {/* Academic Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Academic Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Target Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Learning Goal
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Ace upcoming AP exams, understand organic reactions, master data structures"
            />
          </div>

          {/* Subjects needing improvement */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-rose-700">
                Focus Areas (Subjects you want to improve)
              </label>
              <span className="text-[11px] text-slate-400">Click to select</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = weakSubjects.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(weakSubjects, setWeakSubjects, sub)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strong Subjects */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-emerald-700">
                Strong Subjects (Your comfortable topics)
              </label>
              <span className="text-[11px] text-slate-400">Click to select</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = strongSubjects.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(strongSubjects, setStrongSubjects, sub)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
