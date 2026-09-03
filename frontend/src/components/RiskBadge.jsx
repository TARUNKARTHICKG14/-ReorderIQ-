import React from 'react';

export default function RiskBadge({ level }) {
  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    CRITICAL: 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${styles[level?.toUpperCase()] || styles.LOW}`}>
      ● {level?.toUpperCase() || 'NORMAL'}
    </span>
  );
}
