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
          {/* Shield Outline */}
          <path d="M50 95C50 95 10 75 10 35V15L50 5L90 15V35C90 75 50 95 50 95Z" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* House */}
          <path d="M50 20L30 35V50H70V35L50 20Z" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M42 50V40H58V50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Car */}
          <path d="M20 60L28 50H52L60 60H20Z" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="32" cy="60" r="4" stroke="url(#logoGradient)" strokeWidth="2"/>
          <circle cx="48" cy="60" r="4" stroke="url(#logoGradient)" strokeWidth="2"/>
          
          {/* Heart */}
          <path d="M75 45C82 40 88 45 88 52C88 62 75 72 75 72C75 72 62 62 62 52C62 45 68 40 75 45Z" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M68 52L72 48L75 55L78 48L82 52" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Chart */}
          <path d="M35 85V75M42 85V65M49 85V70M56 85V60M63 85V78" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className={`font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] to-[#00E676] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] ${textClassName}`}>
        Dijilla
      </span>
    </div>
  );
}
