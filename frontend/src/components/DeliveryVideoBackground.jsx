import React from 'react';

export default function DeliveryVideoBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dark Backdrop Overlay */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-10" />

      {/* Radial Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] z-10" />

      {/* SVG Animated Logistics Highway & Delivery Fleet Network Background */}
      <svg
        className="w-full h-full opacity-25 object-cover"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Highway Glow Lines */}
          <linearGradient id="roadGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="roadGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid Infrastructure Lines */}
        <pattern id="logisticsGrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
          <circle cx="60" cy="60" r="1.5" fill="#38bdf8" opacity="0.3" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#logisticsGrid)" />

        {/* Global Logistics Transit Highways */}
        <path
          d="M -100 250 Q 350 100, 720 380 T 1540 200"
          fill="none"
          stroke="url(#roadGrad1)"
          strokeWidth="3"
          filter="url(#glow)"
        />
        <path
          d="M -100 700 Q 400 450, 900 650 T 1540 400"
          fill="none"
          stroke="url(#roadGrad2)"
          strokeWidth="2.5"
          filter="url(#glow)"
        />
        <path
          d="M 200 -50 C 300 300, 600 500, 1100 950"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeDasharray="8 8"
          opacity="0.4"
        />

        {/* Moving Delivery Trucks & Transit Signal Pulses */}
        {/* Truck 1: High-Speed North-East Highway Route */}
        <g className="animate-pulse">
          <circle cx="720" cy="380" r="8" fill="#38bdf8" filter="url(#glow)" />
          <circle cx="720" cy="380" r="16" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6">
            <animate attributeName="r" values="8;24;8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="735" y="385" fill="#7dd3fc" fontSize="10" fontFamily="monospace" fontWeight="bold">
            TRK-FREIGHT-801 [68 km/h]
          </text>
        </g>

        {/* Truck 2: Southern Supply Corridor Route */}
        <g>
          <circle cx="400" cy="500" r="7" fill="#10b981" filter="url(#glow)" />
          <circle cx="400" cy="500" r="14" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5">
            <animate attributeName="r" values="6;20;6" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <text x="415" y="505" fill="#6ee7b7" fontSize="10" fontFamily="monospace" fontWeight="bold">
            CARGO-EXPRESS-409 [72 km/h]
          </text>
        </g>

        {/* Supply Chain Hub Nodes */}
        <g>
          {/* Bengaluru Hub */}
          <circle cx="350" cy="180" r="6" fill="#f59e0b" />
          <text x="365" y="185" fill="#fcd34d" fontSize="11" fontFamily="sans-serif" fontWeight="600">
            Bengaluru Hub [Origin]
          </text>

          {/* Hyderabad HQ Plant */}
          <circle cx="900" cy="650" r="9" fill="#06b6d4" filter="url(#glow)" />
          <text x="918" y="655" fill="#38bdf8" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            Hyderabad HQ Plant [Destination]
          </text>
        </g>

        {/* Animated Satellite Radar Sweep */}
        <g transform="translate(1200, 150)">
          <circle cx="0" cy="0" r="60" fill="none" stroke="#334155" strokeWidth="1" />
          <circle cx="0" cy="0" r="40" fill="none" stroke="#334155" strokeWidth="1" />
          <circle cx="0" cy="0" r="20" fill="none" stroke="#334155" strokeWidth="1" />
          <line x1="-60" y1="0" x2="60" y2="0" stroke="#1e293b" />
          <line x1="0" y1="-60" x2="0" y2="60" stroke="#1e293b" />
          <path d="M 0 0 L 42 -42 A 60 60 0 0 0 -60 0 Z" fill="url(#roadGrad1)" opacity="0.15">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </div>
  );
}
