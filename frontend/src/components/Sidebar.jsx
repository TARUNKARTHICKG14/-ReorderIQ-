import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  Sparkles,
  SlidersHorizontal,
  ArrowRightLeft,
  History,
  AlertTriangle,
  Flame,
  FileCheck
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/components', label: 'Components Catalog', icon: Boxes },
    { to: '/suppliers', label: 'Supplier Reliability', icon: Truck },
    { to: '/recommendations', label: 'Probabilistic Reorder', icon: Sparkles },
    { to: '/simulation', label: 'Monte Carlo Sandbox', icon: SlidersHorizontal },
    { to: '/comparison', label: 'Baseline vs Proposed', icon: ArrowRightLeft },
    { to: '/audit-history', label: 'Auditable History', icon: History },
    { to: '/failure-testing', label: 'Failure Workbench', icon: Flame },
    { to: '/risk-register', label: 'Risk Matrix', icon: AlertTriangle }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between py-4 px-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          System Core
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <span>Audit Policy</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          All plan change overrides require mandatory human planner justification.
        </p>
      </div>
    </aside>
  );
}
