import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { componentsApi, suppliersApi, recommendationsApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LiveTrackingModal from '../components/LiveTrackingModal';
import {
  ArrowLeft,
  Package,
  Truck,
  Sparkles,
  SlidersHorizontal,
  DollarSign,
  Layers,
  History,
  MapPin,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function ComponentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [component, setComponent] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const comp = await componentsApi.getById(id);
        setComponent(comp);

        if (comp) {
          const sup = await suppliersApi.getById(comp.supplier_id);
          setSupplier(sup);

          const rec = await recommendationsApi.calculate(comp.component_id, 0.95, 2000).catch(() => null);
          setRecommendation(rec);
        }
      } catch (err) {
        console.error('Failed to load component details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading || !component) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading component details...</div>;
  }

  // Generate synthetic daily demand chart sample for component detail view
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    demand: Math.round(80 + Math.sin(i / 3) * 25 + (i % 5) * 6)
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Live Tracking Modal */}
      {showTracking && (
        <LiveTrackingModal
          componentId={component.component_id}
          onClose={() => setShowTracking(false)}
        />
      )}

      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/components')}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800 flex items-center space-x-2 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTracking(true)}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Track Live GPS Location</span>
          </button>
          <button
            onClick={() => navigate(`/simulation`)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors border border-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Simulate Scenarios</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-100">{component.component_name}</h2>
              <span className="font-mono text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                {component.component_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Category: <strong className="text-slate-300">{component.category}</strong> | Supplier:{' '}
              <strong className="text-slate-300">{supplier?.supplier_name || component.supplier_id}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 font-sans uppercase">Supplier Pack Size</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">{component.pack_size} units</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 font-sans uppercase">Current Stock</div>
              <div className="text-lg font-bold text-slate-100 font-mono">{component.current_inventory}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Trajectory Chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
            <span>Historical Daily Demand Trajectory</span>
            <span className="text-xs font-mono text-slate-400">Mean: 100 u/day | Std: 22 u/day</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#demandGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Probabilistic Policy Deep Dive */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Probabilistic Policy Deep Dive</span>
          </h3>

          {recommendation ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-sans">Probabilistic Reorder Point (ROP)</div>
                <div className="text-xl font-bold text-slate-100">{recommendation.reorder_point} units</div>
                <p className="text-[10px] text-slate-500 font-sans">95th percentile lead-time demand</p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/30 space-y-1">
                <div className="text-[10px] text-slate-400 font-sans">Recommended Order Quantity</div>
                <div className="text-xl font-bold text-cyan-400">{recommendation.recommended_order_quantity} units</div>
                <p className="text-[10px] text-cyan-500 font-sans">
                  Rounded up to pack size ({component.pack_size})
                </p>
              </div>

              <button
                onClick={() => setShowTracking(true)}
                className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-sans text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Open Live GPS Satellite Map</span>
              </button>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Policy calculating...</div>
          )}
        </div>
      </div>
    </div>
  );
}
