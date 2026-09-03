import React, { useState, useEffect } from 'react';
import { suppliersApi } from '../services/api';
import LiveTrackingModal from '../components/LiveTrackingModal';
import { Truck, ShieldCheck, Clock, MapPin, Leaf, AlertCircle, Radio } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingCompId, setTrackingCompId] = useState(null);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await suppliersApi.getAll();
        setSuppliers(data || []);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSuppliers();
  }, []);

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
            Supplier Reliability & GPS Fleet Scorecard
            <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
              {suppliers.length} Active Suppliers
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supplier performance metrics integrated directly into the probabilistic reorder engine with live fleet GPS location tracking.
          </p>
        </div>
      </div>

      {/* Grid of Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup, idx) => {
          const isDisrupted = sup.status === 'DISRUPTED';
          const sampleCompId = `COMP-00${(idx % 5) + 1}`;
          return (
            <div
              key={sup.supplier_id}
              className={`glass-card p-5 rounded-2xl space-y-4 border ${
                isDisrupted ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">{sup.supplier_id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isDisrupted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {sup.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100">{sup.supplier_name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {sup.distance_km} km shipment distance
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 font-mono text-xs">
                <div className="p-2.5 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Reliability
                  </div>
                  <div className="text-sm font-bold text-slate-100">{(sup.reliability * 100).toFixed(0)}%</div>
                  <div className="text-[9px] text-slate-500 font-sans">On-time delivery</div>
                </div>

                <div className="p-2.5 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                    <Truck className="w-3 h-3 text-cyan-400" />
                    Fill Rate
                  </div>
                  <div className="text-sm font-bold text-cyan-400">{(sup.fill_rate * 100).toFixed(0)}%</div>
                  <div className="text-[9px] text-slate-500 font-sans">Quantity fulfilled</div>
                </div>
              </div>

              <button
                onClick={() => setTrackingCompId(sampleCompId)}
                className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-sans font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Track Active Fleet GPS Map</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
