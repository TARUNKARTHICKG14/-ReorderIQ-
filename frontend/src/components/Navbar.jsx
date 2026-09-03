import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, User, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-cyan-400 font-mono font-extrabold tracking-wider text-lg">-ReorderIQ-</span>
            <span className="text-slate-400 text-xs font-normal hidden sm:inline">| Probabilistic Smart Reorder Engine</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
              FIELD-READY MVP
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Variable Pack-Size Manufacturing Pilot</p>
        </div>
      </div>

      {/* User Session & Role Management */}
      <div className="flex items-center space-x-4">
        {/* User Info Capsule */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs">
          <User className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-slate-200 font-bold block">{currentUser?.user_id || 'planner01'}</span>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              ROLE: {currentUser?.role || 'PLANNER'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5"
          title="Sign Out of Operations Console"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
