'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AVATAR_OPTIONS } from '@/lib/mockData';
import { User, Briefcase, Building, Check, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('Amal');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [selectedAvatar, setSelectedAvatar] = useState('character1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const userProfile = {
      displayName: displayName.trim(),
      department: department.trim(),
      jobTitle: jobTitle.trim(),
      avatar: selectedAvatar,
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
          <p className="text-xs text-slate-400">Set up your avatar and profile details for your coworkers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Character Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Choose Character</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = selectedAvatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedAvatar(opt.id)}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}

                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: opt.color }}
                    >
                      {opt.name.charAt(0)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300">{opt.name}</span>
                  </button>
                );
              })}
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
                  placeholder="e.g. Amal"
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
    </div>
  );
}
