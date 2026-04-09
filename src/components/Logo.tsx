import React from 'react';

export function Logo({ className = "", textClassName = "", iconSize = "w-12 h-12" }: { className?: string, textClassName?: string, iconSize?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${iconSize}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00E676" />
            </linearGradient>
          </defs>
          {/* Spiral/Vortex Icon */}
          <g transform="translate(50, 50)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <path
                key={angle}
                d="M 0 0 C 0 -20 10 -35 30 -35 C 20 -25 10 -15 0 0"
                fill="url(#logoGradient)"
                transform={`rotate(${angle})`}
              />
            ))}
          </g>
        </svg>
      </div>
      <span className={`font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] to-[#00E676] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] ${textClassName}`}>
        droto
      </span>
    </div>
  );
}
