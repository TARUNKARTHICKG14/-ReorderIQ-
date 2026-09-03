import React, { useState, useEffect } from 'react';
import { trackingApi } from '../services/api';
import {
  X,
  MapPin,
  Truck,
  Navigation,
  Clock,
  Thermometer,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function LiveTrackingModal({ componentId, onClose }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTracking() {
      try {
        setLoading(true);
        const data = await trackingApi.getLiveTracking(componentId);
        setTracking(data);
      } catch (err) {
        console.error('Error loading live tracking telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    if (componentId) {
      fetchTracking();
    }
  }, [componentId]);

  if (!componentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">{tracking?.component_name || 'Live GPS Product Tracker'}</h3>
                <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">
                  {componentId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Tracking ID: {tracking?.tracking_id || 'TRK-FETCHING'} | Carrier: {tracking?.carrier_name || 'In-Transit'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {loading || !tracking ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Acquiring satellite GPS telemetry...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Interactive Vector GIS Map Display */}
            <div className="lg:col-span-2 p-5 space-y-4 bg-slate-950/60 relative">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  Route Coordinates: {tracking.origin.name} → {tracking.destination.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tracking.status === 'DELAYED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  ● {tracking.status}
                </span>
              </div>

              {/* Graphical Route Canvas */}
              <div className="h-64 w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 relative flex flex-col justify-between overflow-hidden">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

                {/* Animated Route Line */}
                <div className="relative w-full h-full flex items-center justify-between px-6 z-10">
                  {/* Origin Marker */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-cyan-950/80 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                      {tracking.origin.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {tracking.origin.lat}, {tracking.origin.lng}
                    </span>
                  </div>

                  {/* Route Polyline Container */}
                  <div className="flex-1 px-4 relative flex items-center">
                    <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${tracking.transit_progress_pct}%` }}
                      />
                    </div>

                    {/* Live Truck Animated Marker */}
                    <div
                      className="absolute -top-4 transition-all duration-500 transform -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${tracking.transit_progress_pct}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/50 animate-bounce">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-500/40 mt-1 whitespace-nowrap">
                        LIVE ({tracking.transit_progress_pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Destination Marker */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                      {tracking.destination.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {tracking.destination.lat}, {tracking.destination.lng}
                    </span>
                  </div>
                </div>

                {/* Bottom Telemetry Bar */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-slate-300">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    Current Coordinates: <strong className="text-cyan-300">{tracking.current_location.lat}, {tracking.current_location.lng}</strong>
                  </span>
                  <span className="text-slate-400">{tracking.current_location.name}</span>
                </div>
              </div>

              {/* Waypoints List */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <span className="text-slate-400 text-[10px] font-sans uppercase font-semibold">GPS Route Waypoint Checkpoints</span>
                <div className="grid grid-cols-3 gap-2">
                  {tracking.waypoints.slice(0, 3).map((wp, idx) => (
                    <div key={idx} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-400 text-[10px]">
                      Checkpoint {idx + 1}: <strong className="text-slate-200">{wp.lat}, {wp.lng}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Telemetry Information Drawer */}
            <div className="p-5 space-y-4 font-mono text-xs bg-slate-900/40">
              <h4 className="text-xs font-semibold text-slate-100 font-sans flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                In-Transit Vehicle Telemetry
              </h4>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans">Estimated Time of Arrival (ETA)</div>
                  <div className="text-sm font-bold text-cyan-400">{tracking.estimated_arrival}</div>
                  <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {tracking.eta_hours_remaining} hrs remaining in transit
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-sans">Speed</div>
                    <div className="text-sm font-bold text-slate-100">{tracking.speed_kmh} km/h</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" /> Temp
                    </div>
                    <div className="text-sm font-bold text-amber-300">{tracking.temperature_c} °C</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-semibold">Carrier & Logistics Contact</div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500 font-sans">Vehicle ID:</span>
                  <span className="text-cyan-400 font-bold">{tracking.vehicle_id}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500 font-sans">Driver:</span>
                  <span className="text-slate-200">{tracking.driver_name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500 font-sans">Contact:</span>
                  <span className="text-slate-400">{tracking.driver_phone}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Close Tracking Telemetry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
