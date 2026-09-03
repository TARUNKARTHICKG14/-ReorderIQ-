import React from 'react';
import RiskBadge from '../components/RiskBadge';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RiskRegister() {
  const risks = [
    {
      id: 'RSK-001',
      title: 'Demand Spike',
      prob: 'MEDIUM',
      impact: 'HIGH',
      mitigation: 'Probabilistic safety stock quantile matching 95%+ SLA target.',
      status: 'MITIGATED'
    },
    {
      id: 'RSK-002',
      title: 'Supplier Lead Time Delay',
      prob: 'MEDIUM',
      impact: 'HIGH',
      mitigation: 'Lead-time distribution sampling with supplier reliability delay penalties.',
      status: 'MITIGATED'
    },
    {
      id: 'RSK-003',
      title: 'Partial Order Delivery (Fill Deficit)',
      prob: 'MEDIUM',
      impact: 'MEDIUM',
      mitigation: 'Fill-rate beta distribution modeling & replenishment multiplier.',
      status: 'MITIGATED'
    },
    {
      id: 'RSK-004',
      title: 'Bad Historical Data',
      prob: 'MEDIUM',
      impact: 'HIGH',
      mitigation: 'Data validation rules & empirical bootstrap smoothing.',
      status: 'MONITORED'
    },
    {
      id: 'RSK-005',
      title: 'Invalid Pack Size Constraint (pack_size <= 0)',
      prob: 'LOW',
      impact: 'MEDIUM',
      mitigation: 'FastAPI Pydantic strict validation (HTTP 422 rejection guard).',
      status: 'PREVENTED'
    },
    {
      id: 'RSK-006',
      title: 'Supplier Complete Disruption / Unavailability',
      prob: 'LOW',
      impact: 'HIGH',
      mitigation: 'Halt automated ordering & dispatch alert for planner human review.',
      status: 'ESCALATED'
    },
    {
      id: 'RSK-007',
      title: 'Unnecessary Excess Inventory Holding',
      prob: 'MEDIUM',
      impact: 'MEDIUM',
      mitigation: 'Cost-aware optimization balancing holding cost vs stockout penalty.',
      status: 'OPTIMIZED'
    },
    {
      id: 'RSK-008',
      title: 'Audit Trail Tampering / Decision Loss',
      prob: 'LOW',
      impact: 'HIGH',
      mitigation: 'Immutable SQLite/Postgres versioned audit log schema.',
      status: 'PROTECTED'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            System Risk Assessment & Mitigation Register
            <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
              ISO 31000 ALIGNED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Operational risk matrix detailing vulnerability scenarios, probability, impact severity, and automated system mitigations.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Risk ID</th>
                <th className="py-3.5 px-4">Vulnerability / Failure Case</th>
                <th className="py-3.5 px-4">Probability</th>
                <th className="py-3.5 px-4">Impact</th>
                <th className="py-3.5 px-4">Automated Mitigation Strategy</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{r.id}</td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">{r.title}</td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={r.prob} />
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={r.impact} />
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-400 max-w-md">{r.mitigation}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
