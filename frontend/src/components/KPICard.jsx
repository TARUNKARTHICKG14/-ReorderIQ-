import React from 'react';

export default function KPICard({ title, value, subtext, icon: Icon, trend, color = 'cyan' }) {
  const colorStyles = {
    cyan: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/5',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/5'
  };

  return (
    <div className={`glass-card p-5 rounded-xl border ${colorStyles[color] || colorStyles.cyan}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && <Icon className="w-5 h-5 opacity-80" />}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.includes('-') || trend.includes('Saved') || trend.includes('Improved') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-[11px] text-slate-400">{subtext}</p>}
    </div>
  );
}
