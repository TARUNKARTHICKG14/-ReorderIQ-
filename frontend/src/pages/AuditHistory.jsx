import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import AuditTimeline from '../components/AuditTimeline';
import { History, ShieldCheck, Filter, Search } from 'lucide-react';

export default function AuditHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchComp, setSearchComp] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await auditApi.getLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchComp) return true;
    return (
      log.component_id.toLowerCase().includes(searchComp.toLowerCase()) ||
      log.plan_id.toLowerCase().includes(searchComp.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchComp.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchComp.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Auditable Reorder Plan Change History
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
              IMMUTABLE LOGS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail preserving every plan version, override justification reason, planner ID, and timestamp.
          </p>
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Filter by plan ID, component, planner..."
            value={searchComp}
            onChange={(e) => setSearchComp(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="glass-panel p-6 rounded-2xl">
        <AuditTimeline logs={filteredLogs} />
      </div>
    </div>
  );
}
