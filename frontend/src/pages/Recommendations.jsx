import React, { useState, useEffect } from 'react';
import { componentsApi, recommendationsApi } from '../services/api';
import {
  Sparkles,
  CheckCircle,
  Edit3,
  XCircle,
  Package,
  ShieldAlert,
  Leaf,
  DollarSign,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export default function Recommendations() {
  const [components, setComponents] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [serviceTarget, setServiceTarget] = useState(0.95);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Form states for Modify / Approve / Reject
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'MODIFY' | 'REJECT'
  const [reason, setReason] = useState('');
  const [modRop, setModRop] = useState('');
  const [modQty, setModQty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadComps() {
      try {
        const data = await componentsApi.getAll();
        setComponents(data || []);
        if (data && data.length > 0) {
          setSelectedCompId(data[0].component_id);
        }
      } catch (err) {
        console.error('Failed to load components:', err);
      }
    }
    loadComps();
  }, []);

  const handleCalculate = async () => {
    if (!selectedCompId) return;
    setLoading(true);
    setActionSuccess('');
    try {
      const rec = await recommendationsApi.calculate(selectedCompId, parseFloat(serviceTarget), 5000);
      setRecommendation(rec);
      setModRop(rec.reorder_point);
      setModQty(rec.recommended_order_quantity);
    } catch (err) {
      alert('Error calculating recommendation: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompId) {
      handleCalculate();
    }
  }, [selectedCompId, serviceTarget]);

  const handleExecuteAction = async () => {
    if (!reason || reason.trim().length < 3) {
      alert('A mandatory justification reason (at least 3 characters) is required for audit logs.');
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await recommendationsApi.approve(selectedCompId, 'planner01', reason);
        setActionSuccess(`Plan for ${selectedCompId} APPROVED and logged to immutable audit history.`);
      } else if (actionType === 'MODIFY') {
        await recommendationsApi.modify(
          selectedCompId,
          'planner01',
          reason,
          parseInt(modRop),
          parseInt(modQty)
        );
        setActionSuccess(`Plan for ${selectedCompId} MODIFIED (Version incremented) and audit log updated.`);
      } else if (actionType === 'REJECT') {
        await recommendationsApi.reject(selectedCompId, 'planner01', reason);
        setActionSuccess(`Plan for ${selectedCompId} REJECTED and justification recorded.`);
      }
      setActionType(null);
      setReason('');
      handleCalculate(); // Refresh
    } catch (err) {
      alert('Error processing decision: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Probabilistic Reorder Engine & Human Approval Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engine evaluates demand volatility, lead-time uncertainty, supplier reliability, and supplier variable pack sizes.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            {components.map((c) => (
              <option key={c.component_id} value={c.component_id}>
                {c.component_id} - {c.component_name}
              </option>
            ))}
          </select>

          <select
            value={serviceTarget}
            onChange={(e) => setServiceTarget(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value={0.90}>90% Service Level</option>
            <option value={0.95}>95% Service Level (Default)</option>
            <option value={0.98}>98% Service Level</option>
            <option value={0.99}>99% High Service Target</option>
          </select>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-slate-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Main Recommendation Details Card */}
      {recommendation ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">{recommendation.component_id}</span>
                <h3 className="text-lg font-bold text-slate-100">{recommendation.component_name}</h3>
                <p className="text-xs text-slate-400">Supplier: {recommendation.supplier_name}</p>
              </div>

              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                  recommendation.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  recommendation.status === 'MODIFIED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  recommendation.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}>
                  ● {recommendation.status} (Ver {recommendation.version})
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">By: {recommendation.created_by}</div>
              </div>
            </div>

            {/* Core Metrics Highlight Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-sans">Probabilistic Reorder Point (ROP)</div>
                <div className="text-2xl font-bold text-slate-100 font-mono">{recommendation.reorder_point} units</div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Current Stock: <strong className="text-slate-300 font-mono">{recommendation.current_inventory} units</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-cyan-500/30 space-y-1">
                <div className="text-xs text-slate-400 font-sans">Recommended Order Quantity</div>
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {recommendation.recommended_order_quantity} units
                </div>
                <p className="text-[11px] text-cyan-500 font-sans">
                  Rounded up to pack size: <strong className="font-mono">{recommendation.pack_size} units</strong> (Raw EOQ: {recommendation.raw_unrounded_quantity.toFixed(1)})
                </p>
              </div>
            </div>

            {/* Tradeoff Breakdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Stockout Probability</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {(recommendation.stockout_probability * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Holding Cost</div>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  ₹{recommendation.expected_holding_cost}
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Stockout Penalty Cost</div>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  ₹{recommendation.expected_stockout_cost}
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-amber-400" /> Carbon Emissions
                </div>
                <div className="text-sm font-bold text-amber-300 font-mono">
                  {recommendation.estimated_emissions_kg} kg
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center space-x-3">
              <button
                onClick={() => setActionType('APPROVE')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Recommendation</span>
              </button>

              <button
                onClick={() => setActionType('MODIFY')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-amber-600/20 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modify Parameters</span>
              </button>

              <button
                onClick={() => setActionType('REJECT')}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-rose-600/20 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Plan</span>
              </button>
            </div>
          </div>

          {/* Action Modal / Justification Panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Human Governance & Audit Form
            </h3>

            {actionType ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                  Action: <strong className="text-cyan-400">{actionType}</strong> for Component {selectedCompId}
                </div>

                {actionType === 'MODIFY' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-sans block mb-1">
                        Override Reorder Point (ROP)
                      </label>
                      <input
                        type="number"
                        value={modRop}
                        onChange={(e) => setModRop(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-sans block mb-1">
                        Override Order Quantity (Will round to pack size {recommendation.pack_size})
                      </label>
                      <input
                        type="number"
                        value={modQty}
                        onChange={(e) => setModQty(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-slate-400 font-sans block mb-1">
                    Mandatory Audit Change Reason / Justification <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed justification for decision log..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    disabled={submitting}
                    onClick={handleExecuteAction}
                    className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {submitting ? 'Recording Audit...' : 'Submit & Commit Audit'}
                  </button>
                  <button
                    onClick={() => setActionType(null)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto text-slate-600" />
                <p>Select an action (Approve, Modify, or Reject) to record a decision with auditable history.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-xs">Loading recommendation...</div>
      )}
    </div>
  );
}
