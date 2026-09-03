import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentsApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LiveTrackingModal from '../components/LiveTrackingModal';
import { Search, Filter, Package, ArrowRight, Layers, MapPin } from 'lucide-react';

export default function Components() {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [trackingCompId, setTrackingCompId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await componentsApi.getAll();
        setComponents(data || []);
      } catch (err) {
        console.error('Failed to load components:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['ALL', ...new Set(components.map((c) => c.category))];

  const filteredComponents = components.filter((c) => {
    const matchesSearch =
      c.component_name.toLowerCase().includes(search.toLowerCase()) ||
      c.component_id.toLowerCase().includes(search.toLowerCase()) ||
      c.supplier_id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Live Tracking Modal */}
      {trackingCompId && (
        <LiveTrackingModal
          componentId={trackingCompId}
          onClose={() => setTrackingCompId(null)}
        />
      )}

      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Component Inventory Catalog
            <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
              {filteredComponents.length} Components
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Component parameters including unit costs, holding costs, stockout penalties, supplier variable pack sizes, and live location tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search component ID, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Component ID</th>
                <th className="py-3.5 px-4">Name & Category</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 font-semibold text-cyan-400">Pack Size</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4 text-center">Live GPS Location</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredComponents.map((c) => {
                const risk = c.current_inventory < 400 ? 'HIGH' : c.current_inventory < 700 ? 'MEDIUM' : 'LOW';
                return (
                  <tr key={c.component_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-400">{c.component_id}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{c.component_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.category}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{c.supplier_id}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800 px-2 py-1 rounded-md text-[11px]">
                        {c.pack_size} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-100 font-bold">{c.current_inventory}</td>
                    <td className="py-3.5 px-4 text-emerald-400">₹{c.unit_cost}</td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={risk} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setTrackingCompId(c.component_id)}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[11px] font-sans transition-colors inline-flex items-center space-x-1"
                      >
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>Track Location</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/components/${c.component_id}`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-sans transition-colors inline-flex items-center space-x-1 border border-slate-700"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
