import React, { useState, useEffect, useCallback } from 'react';
import { componentsApi, simulationApi } from '../services/api';
import { SlidersHorizontal, Play, RefreshCw, BarChart2, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function Simulation() {
  const [components, setComponents] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('COMP-001');
  const [serviceTarget, setServiceTarget] = useState(0.95);
  const [runs, setRuns] = useState(10000);

  // Sliders & Overrides
  const [demandMean, setDemandMean] = useState(100);
  const [demandStd, setDemandStd] = useState(25);
  const [leadTimeMean, setLeadTimeMean] = useState(7);
  const [leadTimeStd, setLeadTimeStd] = useState(2);
  const [reliability, setReliability] = useState(0.90);
  const [fillRate, setFillRate] = useState(0.95);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastExecutedTime, setLastExecutedTime] = useState('');

  const executeSimulation = useCallback(async () => {
    if (!selectedCompId) return;
    setLoading(true);
    try {
      const res = await simulationApi.run({
        component_id: selectedCompId,
        service_target: parseFloat(serviceTarget),
        simulation_runs: parseInt(runs),
        override_demand_mean: parseFloat(demandMean),
        override_demand_std: parseFloat(demandStd),
        override_lead_time_mean: parseFloat(leadTimeMean),
        override_lead_time_std: parseFloat(leadTimeStd),
        override_reliability: parseFloat(reliability),
        override_fill_rate: parseFloat(fillRate)
      });
      setSimResult(res);
      setLastExecutedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompId, serviceTarget, runs, demandMean, demandStd, leadTimeMean, leadTimeStd, reliability, fillRate]);

  useEffect(() => {
    async function loadComps() {
      try {
        const data = await componentsApi.getAll();
        setComponents(data || []);
        if (data && data.length > 0) {
          setSelectedCompId(data[0].component_id);
        }
      } catch (err) {
        console.error('Error loading components:', err);
      }
    }
    loadComps();
  }, []);

  // Re-run simulation dynamically when any parameter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSimulation();
    }, 250);
    return () => clearTimeout(timer);
  }, [executeSimulation]);

  // Format trajectory data for Recharts
  const trajectoryChartData = simResult?.daily_trajectory_sample?.days.map((day, idx) => ({
    day: `Day ${day}`,
    Baseline: simResult.daily_trajectory_sample.baseline_inventory[idx],
    Probabilistic: simResult.daily_trajectory_sample.probabilistic_inventory[idx],
    Demand: simResult.daily_trajectory_sample.demand[idx]
  })) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Workbench Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Monte Carlo Simulation Workbench
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {runs.toLocaleString()} Iterations
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate 365-day inventory trajectories to evaluate stockouts, excess inventory, and financial costs under parameter uncertainty.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lastExecutedTime && (
            <span className="text-[11px] font-mono text-slate-400">
              Executed: <strong className="text-slate-200">{lastExecutedTime}</strong>
            </span>
          )}

          <button
            disabled={loading}
            onClick={executeSimulation}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Play className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating 10,000 Runs...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: 4 cols for controls, 8 cols for trajectory chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Slider Panel (4 Cols) */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 font-mono text-xs lg:col-span-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 font-sans flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Parameter Controls
            </h3>
            <button
              onClick={executeSimulation}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-sans"
            >
              <RefreshCw className="w-3 h-3" /> Recalculate
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-sans">Target Component SKU</label>
              <select
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              >
                {components.map((c) => (
                  <option key={c.component_id} value={c.component_id}>
                    {c.component_id} - {c.component_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Service Target SLA:</span>
                <span className="text-cyan-400 font-bold">{(serviceTarget * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={serviceTarget}
                onChange={(e) => setServiceTarget(parseFloat(e.target.value))}
                className="w-full mt-1 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Daily Demand Mean:</span>
                <span className="text-slate-100 font-bold">{demandMean} u/d</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={demandMean}
                onChange={(e) => setDemandMean(parseFloat(e.target.value))}
                className="w-full mt-1 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Daily Demand Std Dev:</span>
                <span className="text-slate-100 font-bold">±{demandStd} u</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={demandStd}
                onChange={(e) => setDemandStd(parseFloat(e.target.value))}
                className="w-full mt-1 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Supplier Lead Time:</span>
                <span className="text-slate-100 font-bold">{leadTimeMean} days</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={leadTimeMean}
                onChange={(e) => setLeadTimeMean(parseFloat(e.target.value))}
                className="w-full mt-1 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Lead Time Std Dev:</span>
                <span className="text-slate-100 font-bold">±{leadTimeStd} days</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={leadTimeStd}
                onChange={(e) => setLeadTimeStd(parseFloat(e.target.value))}
                className="w-full mt-1 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Supplier Reliability:</span>
                <span className="text-emerald-400 font-bold">{(reliability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="1.0"
                step="0.05"
                value={reliability}
                onChange={(e) => setReliability(parseFloat(e.target.value))}
                className="w-full mt-1 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Supplier Fill Rate:</span>
                <span className="text-cyan-400 font-bold">{(fillRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="1.0"
                step="0.05"
                value={fillRate}
                onChange={(e) => setFillRate(parseFloat(e.target.value))}
                className="w-full mt-1 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Dynamic 365-day Trajectory Line Chart (8 Cols) */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-8 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              365-Day Simulated Daily Inventory Balance Trajectory
              {loading && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
            </h3>
            {simResult && (
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-rose-400">Baseline Stockouts: <strong>{simResult.baseline_metrics.stockout_count}d</strong></span>
                <span className="text-emerald-400">Probabilistic Stockouts: <strong>{simResult.probabilistic_metrics.stockout_count}d</strong></span>
              </div>
            )}
          </div>

          <div className="h-80 w-full relative bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryChartData.slice(0, 120)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Baseline" stroke="#f43f5e" strokeWidth={2} dot={false} name="Fixed Baseline Inventory" />
                <Line type="monotone" dataKey="Probabilistic" stroke="#38bdf8" strokeWidth={2} dot={false} name="Probabilistic Policy Inventory" />
                <Line type="monotone" dataKey="Demand" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Daily Demand" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics Comparison Summary Cards */}
          {simResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Baseline ROP</div>
                <div className="text-sm font-bold text-slate-200">{simResult.baseline_rop} units</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 font-sans">Probabilistic ROP</div>
                <div className="text-sm font-bold text-cyan-300">{simResult.probabilistic_rop} units</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Baseline Total Cost</div>
                <div className="text-sm font-bold text-rose-400">₹{simResult.baseline_metrics.total_cost.toLocaleString()}</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 font-sans">Probabilistic Cost</div>
                <div className="text-sm font-bold text-emerald-300">₹{simResult.probabilistic_metrics.total_cost.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
