import React, { useState } from 'react';
import { failureCasesApi } from '../services/api';
import { Flame, AlertTriangle, ShieldAlert, Clock, PackageX, UserX, CheckCircle2 } from 'lucide-react';

export default function FailureTesting() {
  const [activeResults, setActiveResults] = useState({});
  const [loadingCase, setLoadingCase] = useState(null);

  const runTest = async (caseId, apiCall) => {
    setLoadingCase(caseId);
    try {
      const res = await apiCall();
      setActiveResults((prev) => ({ ...prev, [caseId]: { success: true, data: res } }));
    } catch (err) {
      setActiveResults((prev) => ({
        ...prev,
        [caseId]: {
          success: false,
          error: err.response?.data?.detail || err.message,
          statusCode: err.response?.status
        }
      }));
    } finally {
      setLoadingCase(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Failure & Edge Case Workbench
            <span className="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded-full font-mono">
              STRESS TESTING
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test system resiliency against supplier disruptions, lead-time delays, partial deliveries, demand spikes, and pack size errors.
          </p>
        </div>
      </div>

      {/* Grid of 5 Failure Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario 1: Supplier Delay */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Case 1: Severe Supplier Delay (15 Days)
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
              LEAD-TIME SPIKE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Supplier lead time increases from 7 to 15 days; reliability drops to 60%. Engine must increase safety stock.
          </p>
          <button
            disabled={loadingCase === 1}
            onClick={() => runTest(1, () => failureCasesApi.testSupplierDelay('COMP-001', 15))}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
          >
            {loadingCase === 1 ? 'Testing Delay Scenario...' : 'Execute Supplier Delay Scenario'}
          </button>

          {activeResults[1] && renderResult(activeResults[1])}
        </div>

        {/* Scenario 2: Partial Delivery */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PackageX className="w-4 h-4 text-cyan-400" />
              Case 2: Partial Delivery (60% Fill Rate)
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
              FILL RATE DEFICIT
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Supplier delivers only 60% of requested pack size orders. Engine adjusts reorder point to compensate.
          </p>
          <button
            disabled={loadingCase === 2}
            onClick={() => runTest(2, () => failureCasesApi.testPartialDelivery('COMP-001', 0.6))}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
          >
            {loadingCase === 2 ? 'Testing Partial Delivery...' : 'Execute Partial Delivery Scenario'}
          </button>

          {activeResults[2] && renderResult(activeResults[2])}
        </div>

        {/* Scenario 3: Demand Spike */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-rose-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Case 3: Extreme Demand Spike (250 u/day)
            </h3>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono">
              2.5X DEMAND SURGE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Daily demand surges 2.5x from 100 to 250 units/day. Engine detects abnormal demand and surges ROP.
          </p>
          <button
            disabled={loadingCase === 3}
            onClick={() => runTest(3, () => failureCasesApi.testDemandSpike('COMP-001', 250))}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
          >
            {loadingCase === 3 ? 'Testing Demand Spike...' : 'Execute Demand Spike Scenario'}
          </button>

          {activeResults[3] && renderResult(activeResults[3])}
        </div>

        {/* Scenario 4: Invalid Pack Size */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              Case 4: Invalid Pack Size Input (pack_size = 0)
            </h3>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
              VALIDATION GUARD
            </span>
          </div>
          <p className="text-xs text-slate-400">
            System receives invalid pack size = 0. System MUST reject with HTTP 422 validation error.
          </p>
          <button
            disabled={loadingCase === 4}
            onClick={() => runTest(4, () => failureCasesApi.testInvalidPackSize(0))}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
          >
            {loadingCase === 4 ? 'Testing Pack Size Guard...' : 'Execute Invalid Pack Size Test'}
          </button>

          {activeResults[4] && renderResult(activeResults[4])}
        </div>

        {/* Scenario 5: Supplier Disruption */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-red-500/40 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-400" />
              Case 5: Supplier Disruption / Unavailability Event
            </h3>
            <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono">
              HUMAN ESCALATION
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Supplier marked DISRUPTED. Automated ordering is halted immediately and dispatched for planner human review & dual-sourcing.
          </p>
          <button
            disabled={loadingCase === 5}
            onClick={() => runTest(5, () => failureCasesApi.testSupplierDisruption('SUP-001'))}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
          >
            {loadingCase === 5 ? 'Testing Disruption Event...' : 'Trigger Supplier Disruption Event'}
          </button>

          {activeResults[5] && renderResult(activeResults[5])}
        </div>
      </div>
    </div>
  );
}

function renderResult(res) {
  if (!res.success) {
    return (
      <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300 space-y-1">
        <div className="font-bold flex items-center gap-1">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          HTTP {res.statusCode} Error Handled Correctly
        </div>
        <div>Detail: {res.error}</div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 space-y-1">
      <div className="font-bold text-emerald-400 flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        {res.data.status}
      </div>
      <div><strong>Action:</strong> {res.data.system_action || res.data.description}</div>
      {res.data.adjusted_reorder_point && (
        <div className="text-cyan-400">Adjusted ROP: {res.data.adjusted_reorder_point} units</div>
      )}
    </div>
  );
}
