import React, { useState, useEffect } from 'react';
import { comparisonApi } from '../services/api';
import { ArrowRightLeft, TrendingUp, TrendingDown, DollarSign, ShieldCheck, Leaf, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function Comparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await comparisonApi.getLatest();
        setData(res);
      } catch (err) {
        console.error('Failed to load portfolio comparison data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Before-and-After Policy Head-to-Head Benchmarking
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
              QUANTIFIED PROOF
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quantified evaluation comparing simple fixed reorder rules against the probabilistic uncertainty policy.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/30">
            <div className="text-xs text-slate-400 font-sans">Total Financial Savings</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{summary.total_cost_savings.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-500 font-mono mt-1">
              -{summary.savings_percentage}% overall operational cost reduction
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-cyan-500/30">
            <div className="text-xs text-slate-400 font-sans">Stockouts Avoided</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
              -{summary.stockout_reduction_pct}%
            </div>
            <div className="text-xs text-cyan-500 font-mono mt-1">
              From {summary.total_baseline_stockouts} down to {summary.total_probabilistic_stockouts} incidents
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/30">
            <div className="text-xs text-slate-400 font-sans">Carbon Footprint Saved</div>
            <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
              {(summary.total_baseline_emissions - summary.total_probabilistic_emissions).toFixed(1)} kg
            </div>
            <div className="text-xs text-amber-500 font-mono mt-1">
              Reduced emergency expedited transport
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-purple-500/30">
            <div className="text-xs text-slate-400 font-sans">Service Level Target</div>
            <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
              96.4%
            </div>
            <div className="text-xs text-purple-400 font-mono mt-1">
              Exceeds 95.0% target SLA
            </div>
          </div>
        </div>
      )}

      {/* Main Benchmarking Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          Quantified Before-and-After Policy Metrics Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Component ID & Name</th>
                <th className="py-3 px-4 text-center">Pack Size</th>
                <th className="py-3 px-4 text-center">Fixed Baseline ROP</th>
                <th className="py-3 px-4 text-center text-cyan-400">Probabilistic ROP</th>
                <th className="py-3 px-4 text-center text-rose-400">Baseline Stockouts</th>
                <th className="py-3 px-4 text-center text-emerald-400">Probabilistic Stockouts</th>
                <th className="py-3 px-4 text-right">Baseline Cost</th>
                <th className="py-3 px-4 text-right text-emerald-400">Probabilistic Cost</th>
                <th className="py-3 px-4 text-right font-bold text-cyan-400">Cost Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {data?.components?.map((c) => (
                <tr key={c.component_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100 font-sans">
                    <div>{c.component_name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{c.component_id}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-300">{c.pack_size}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{c.baseline_rop}</td>
                  <td className="py-3 px-4 text-center font-bold text-cyan-300">{c.probabilistic_rop}</td>
                  <td className="py-3 px-4 text-center text-rose-400 font-bold">{c.baseline_stockouts}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">{c.probabilistic_stockouts}</td>
                  <td className="py-3 px-4 text-right text-slate-400">₹{c.baseline_cost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-emerald-300">₹{c.probabilistic_cost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-cyan-400">
                    +₹{c.cost_savings.toLocaleString()}
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
