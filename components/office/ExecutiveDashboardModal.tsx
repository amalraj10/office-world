'use client';

import { Profile } from '@/types';
import { getCharacterConfig } from '@/lib/characterPresets';
import { STATUS_META } from '@/lib/status';
import CharacterAvatar from '@/components/avatar/CharacterAvatar';
import { ShieldCheck, Eye, Coffee, Laptop, UserX } from 'lucide-react';

interface ExecutiveDashboardModalProps {
  coworkers: Profile[];
  onClose: () => void;
  onHighlightEmployee?: (userId: string) => void;
}

export default function ExecutiveDashboardModal({
  coworkers,
  onClose,
  onHighlightEmployee,
}: ExecutiveDashboardModalProps) {
  const total = coworkers.length;
  const working = coworkers.filter((c) => c.status === 'Working' || c.status === 'Available' || c.status === 'In a meeting');
  const away = coworkers.filter((c) => c.status === 'Away');
  const onBreak = coworkers.filter((c) => c.status === 'Break');
  const offline = coworkers.filter((c) => c.status === 'Offline');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>CEO Executive Floor Overview</span>
                <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Live View
                </span>
              </h2>
              <p className="text-xs text-slate-400">Instant visibility into team location, desk presence & status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition"
          >
            Close Dashboard
          </button>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>🟢 Active Working</span>
              <Laptop className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{working.length} <span className="text-xs text-slate-500 font-normal">/ {total}</span></p>
            <p className="text-[10px] text-emerald-400">At desks / meeting rooms</p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>🟡 Away / Stepped Out</span>
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">{away.length}</p>
            <p className="text-[10px] text-amber-400">In office floor but idle</p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>🔵 On Break / Pantry</span>
              <Coffee className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{onBreak.length}</p>
            <p className="text-[10px] text-blue-400">In café / lounge area</p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>⚫ Absent / Offline</span>
              <UserX className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-white">{offline.length}</p>
            <p className="text-[10px] text-slate-400">Not logged into office</p>
          </div>
        </div>

        {/* Detailed Instant Employee Status Matrix Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Instant Employee Attendance Matrix</span>
            <span className="text-xs text-slate-500 font-normal">Sorted by Realtime Activity</span>
          </h3>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Employee</th>
                  <th className="p-3 font-semibold">Department & Role</th>
                  <th className="p-3 font-semibold">Current Status</th>
                  <th className="p-3 font-semibold">Office Location / Desk</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {coworkers.map((cw) => (
                  <tr key={cw.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 flex items-center space-x-2.5">
                      <CharacterAvatar config={getCharacterConfig(cw.avatar, cw.character ?? null)} size={28} variant="face" />
                      <span className="font-bold text-white">{cw.display_name}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-300">{cw.job_title}</p>
                      <p className="text-[10px] text-slate-500">{cw.department}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-800 ${
                          STATUS_META[cw.status].text
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[cw.status].dot}`} />
                        <span>{STATUS_META[cw.status].label}</span>
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {cw.status === 'Working' || cw.status === 'Available'
                        ? cw.desk_id ? `💻 ${cw.desk_id.toUpperCase()}` : '💻 Work Bay'
                        : cw.status === 'Break'
                        ? '☕ Pantry & Lounge'
                        : cw.status === 'In a meeting'
                        ? '📊 Meeting Room'
                        : cw.status === 'Away'
                        ? '🛋️ Floor Walkway'
                        : '❌ Not In Office'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (onHighlightEmployee) onHighlightEmployee(cw.id);
                          onClose();
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-[11px] transition"
                      >
                        Locate on Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
