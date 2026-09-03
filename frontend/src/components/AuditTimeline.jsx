import React from 'react';
import { History, UserCheck, ShieldAlert, CheckCircle, Edit3, XCircle } from 'lucide-react';

export default function AuditTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return <div className="text-slate-400 text-xs p-4 text-center">No plan change history recorded.</div>;
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED':
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1"><History className="w-3 h-3" /> CREATED (v1)</span>;
      case 'APPROVED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1"><CheckCircle className="w-3 h-3" /> APPROVED</span>;
      case 'MODIFIED':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1"><Edit3 className="w-3 h-3" /> MODIFIED</span>;
      case 'REJECTED':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1"><XCircle className="w-3 h-3" /> REJECTED</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">{action}</span>;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {logs.map((log) => (
        <div key={log.audit_id} className="relative group">
          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />
          
          <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getActionBadge(log.action)}
                <span className="text-xs text-slate-300 font-mono font-semibold">Plan ID: {log.plan_id}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ver {log.version}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Planner: <strong className="text-slate-100 font-mono">{log.user_id}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Component: <strong className="text-slate-200 font-mono">{log.component_id}</strong></span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
              <div><strong className="text-slate-400 font-sans">Justification:</strong> {log.reason}</div>
              <div className="text-[11px] text-slate-400 truncate">
                <strong className="text-slate-400 font-sans">Snapshot:</strong> {log.new_value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
