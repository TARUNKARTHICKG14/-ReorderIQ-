import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { Activity, Lock, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('planner01');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(username, password);
      onLogin({
        user_id: res.user_id,
        role: res.role,
        token: res.access_token
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Use demo presets below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (presetUsername, presetRole) => {
    setUsername(presetUsername);
    setPassword('password123');
    onLogin({
      user_id: presetUsername,
      role: presetRole,
      token: `mock_token_${presetUsername}`
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 mb-2">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Probabilistic Smart Reorder System
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Manufacturing Operations & Inventory Uncertainty Decision Platform
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Planner Authentication
            </h2>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
              FIELD PILOT
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5 font-sans">
                Username / User ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. planner01"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Preset Roles for Evaluators */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 font-mono font-semibold flex items-center justify-between">
              <span>Quick Demo Role Presets:</span>
              <span className="text-cyan-400 text-[10px] font-sans flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> One-Click Login
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleDemoPreset('planner01', 'PLANNER')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-cyan-400">planner01</div>
                <div className="text-[10px] text-slate-500 font-sans">Role: PLANNER</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPreset('reviewer01', 'REVIEWER')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-emerald-400">reviewer01</div>
                <div className="text-[10px] text-slate-500 font-sans">Role: REVIEWER</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPreset('admin01', 'ADMIN')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-purple-400">admin01</div>
                <div className="text-[10px] text-slate-500 font-sans">Role: ADMIN</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPreset('viewer01', 'VIEWER')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-amber-400">viewer01</div>
                <div className="text-[10px] text-slate-500 font-sans">Role: VIEWER</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
