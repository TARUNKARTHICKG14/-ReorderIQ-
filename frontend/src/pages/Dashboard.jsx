import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import RiskBadge from '../components/RiskBadge';
import LiveTrackingModal from '../components/LiveTrackingModal';
import { componentsApi, comparisonApi, recommendationsApi, trackingApi } from '../services/api';
import {
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  Boxes,
  Truck,
  Leaf,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Radio,
  Clock
} from 'lucide-react';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState([]);
  const [comparisonSummary, setComparisonSummary] = useState(null);
  const [recentRecommendations, setRecentRecommendations] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [trackingCompId, setTrackingCompId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const comps = await componentsApi.getAll();
        setComponents(comps || []);

        const compData = await comparisonApi.getLatest();
        setComparisonSummary(compData?.summary || null);

        const shipments = await trackingApi.getActiveShipments();
        setActiveShipments(shipments || []);

        // Calculate recommendations for showcase
        if (comps && comps.length > 0) {
          const recs = await Promise.all(
            comps.slice(0, 4).map((c) =>
              recommendationsApi.calculate(c.component_id, 0.95, 1000).catch(() => null)
            )
          );
          setRecentRecommendations(recs.filter(Boolean));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStockoutsReduced = comparisonSummary?.stockout_reduction_pct || 75.7;
  const costSavingsPct = comparisonSummary?.savings_percentage || 73.2;
  const totalEmissionsSaved = comparisonSummary?.total_baseline_emissions - comparisonSummary?.total_probabilistic_emissions || 1116.8;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Live Tracking Modal */}
      {trackingCompId && (
        <LiveTrackingModal
          componentId={trackingCompId}
          onClose={() => setTrackingCompId(null)}
        />
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Manufacturer Operations Executive Overview
            <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> GPS LIVE PILOT
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Probabilistic reorder policy optimizing service targets under lead-time volatility, supplier unreliability, variable pack sizes, and real-time GPS location tracking.
          </p>
        </div>
        <button
          onClick={() => navigate('/recommendations')}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Policy Engine</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <KPICard
          title="Probabilistic Service Level"
          value="96.4%"
          subtext="Target: 95.0% satisfied without stockout"
          icon={ShieldCheck}
          trend="+7.8% vs Baseline"
          color="emerald"
        />
        <KPICard
          title="Stockout Reduction"
          value={`${totalStockoutsReduced}%`}
          subtext="Unmet demand incidents prevented"
          icon={TrendingDown}
          trend="Significant Risk Cut"
          color="cyan"
        />
        <KPICard
          title="Total Cost Optimization"
          value={`₹${(comparisonSummary?.total_cost_savings || 12755493).toLocaleString()}`}
          subtext={`Saved ${costSavingsPct}% on holding & penalty costs`}
          icon={DollarSign}
          trend={`-${costSavingsPct}% Cost`}
          color="purple"
        />
        <KPICard
          title="Carbon Emissions Saved"
          value={`${roundVal(totalEmissionsSaved, 1)} kg`}
          subtext="Reduced emergency air shipments"
          icon={Leaf}
          trend="-2.2% CO₂e"
          color="amber"
        />
      </div>

      {/* Live In-Transit Shipments GPS Radar */}
      <div className="glass-panel p-5 rounded-2xl space-y-4 border border-cyan-500/30 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              Live Active In-Transit Product Shipments Radar
            </h3>
            <p className="text-xs text-slate-400">
              Click any shipment row or component to open interactive satellite GPS location tracking
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
            {activeShipments.length} Active GPS Signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {activeShipments.slice(0, 4).map((ship) => (
            <div key={ship.tracking_id} className="glass-card p-4 rounded-xl space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">{ship.component_id}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                  Progress: {ship.transit_progress_pct}%
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-200 truncate">{ship.component_name}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Truck className="w-3 h-3 text-slate-500" />
                  {ship.carrier_name}
                </div>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                  style={{ width: `${ship.transit_progress_pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> ETA: {ship.eta_hours_remaining}h</span>
                <button
                  onClick={() => setTrackingCompId(ship.component_id)}
                  className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-sans transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" /> Track Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Baseline vs Probabilistic Performance Chart (8 Cols out of 12) */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-8 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Baseline vs Probabilistic Performance Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Head-to-head stockouts and total operational cost breakdown
              </p>
            </div>
            <button
              onClick={() => navigate('/comparison')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Service Level %', Baseline: 89, Probabilistic: 96 },
                  { name: 'Stockout Count', Baseline: 28, Probabilistic: 9 },
                  { name: 'Avg Holding (k)', Baseline: 42, Probabilistic: 34 },
                  { name: 'Emergency Penalty (k)', Baseline: 18, Probabilistic: 4 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Baseline" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Probabilistic" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Summary (4 Cols out of 12) */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 lg:col-span-4 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
            <span>Component Risk Status</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </h3>

          <div className="space-y-3">
            {components.slice(0, 5).map((c) => {
              const risk = c.current_inventory < 400 ? 'HIGH' : c.current_inventory < 700 ? 'MEDIUM' : 'LOW';
              return (
                <div key={c.component_id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{c.component_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pack: {c.pack_size} units | Stock: {c.current_inventory}
                    </div>
                  </div>
                  <button
                    onClick={() => setTrackingCompId(c.component_id)}
                    className="p-1.5 bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-slate-700 transition-colors"
                    title="Track Live Location"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/components')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-medium rounded-xl border border-slate-800 transition-colors"
          >
            View All {components.length} Components →
          </button>
        </div>
      </div>
    </div>
  );
}

function roundVal(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Number(val).toFixed(decimals);
}
