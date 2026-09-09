'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { randomCharacterConfig } from '@/lib/characterPresets';
import { CharacterConfig } from '@/types';
import CharacterAvatar from '@/components/avatar/CharacterAvatar';
import CharacterEditorModal from '@/components/avatar/CharacterEditorModal';
import { User, Briefcase, Building, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('Amalraj');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [character, setCharacter] = useState<CharacterConfig>(randomCharacterConfig());
  const [showEditor, setShowEditor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const userProfile = {
      displayName: displayName.trim(),
      department: department.trim(),
      jobTitle: jobTitle.trim(),
      avatar: 'custom',
      character,
      status: 'Working',
    };

    localStorage.setItem('officeworld_user', JSON.stringify(userProfile));
    router.push('/office');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/60">
            Step 2 of 2
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight pt-1">Create your character</h2>
          <p className="text-xs text-slate-400">Customize your avatar&apos;s hair, outfit &amp; accessories — Bitmoji style</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Preview + Customize */}
          <div className="flex flex-col items-center gap-3 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <CharacterAvatar config={character} variant="full" size={140} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEditor(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Customize Character
              </button>
              <button
                type="button"
                onClick={() => setCharacter(randomCharacterConfig())}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Randomize
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Amalraj"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Department</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Job Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Tech Lead"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center space-x-2"
          >
            <span>Enter OfficeWorld</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {showEditor && (
        <CharacterEditorModal
          initialConfig={character}
          displayName={displayName}
          onSave={(cfg) => {
            setCharacter(cfg);
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
