import React from 'react';
import { cn } from '@/lib/utils';

interface SVGComponentLibraryProps {
  type: string;
  className?: string;
  isActive?: boolean;
}

export function SVGComponentLibrary({ type, className, isActive = false }: SVGComponentLibraryProps) {
  const components = {
    'single-photon-source': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="6" className={cn("fill-emerald-500/20", { "fill-emerald-500/40": isActive })} />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" className="stroke-emerald-400" />
        <circle cx="12" cy="12" r="2" className={cn("fill-emerald-500", { "filter drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]": isActive })} />
        {isActive && (
          <g className="animate-pulse">
            <circle cx="12" cy="12" r="8" className="fill-emerald-500/10 animate-ping" />
            <path d="M18 12h6" className="stroke-emerald-400/50 animate-laser" />
          </g>
        )}
      </svg>
    ),
    'entangled-source': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="6" className={cn("fill-purple-500/20", { "fill-purple-500/40": isActive })} />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" className="stroke-purple-400" />
        <path d="M8 12h8" className="stroke-purple-400" />
        <circle cx="8" cy="12" r="2" className={cn("fill-purple-500", { "filter drop-shadow-[0_0_8px_rgba(147,51,234,0.7)]": isActive })} />
        <circle cx="16" cy="12" r="2" className={cn("fill-purple-500", { "filter drop-shadow-[0_0_8px_rgba(147,51,234,0.7)]": isActive })} />
        {isActive && (
          <g className="animate-pulse">
            <circle cx="12" cy="12" r="8" className="fill-purple-500/10 animate-ping" />
            <path d="M18 12h6M0 12h6" className="stroke-purple-400/50 animate-laser" />
          </g>
        )}
      </svg>
    ),
    'beamsplitter': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 2l20 20" className="stroke-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
        <rect x="4" y="4" width="16" height="16" rx="2" className="fill-blue-500/20" />
        <path d="M12 2v20" className="stroke-blue-400/50 stroke-dashed" />
      </svg>
    ),
    'polarizing-beamsplitter': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 2l20 20" className="stroke-indigo-400 drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]" />
        <rect x="4" y="4" width="16" height="16" rx="2" className="fill-indigo-500/20" />
        <path d="M12 2v20M2 12h20" className="stroke-indigo-400/50 stroke-dashed" />
        <circle cx="12" cy="12" r="2" className="fill-indigo-500/50" />
      </svg>
    ),
    'phaseshift': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" className="fill-amber-500/20" />
        <path d="M12 4v16" className="stroke-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
        <path d="M8 12h8" className="stroke-amber-400" />
        <circle cx="12" cy="12" r="2" className="fill-amber-500/50" />
      </svg>
    ),
    'waveplate': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" className="fill-cyan-500/20" />
        <path d="M12 4v16M4 12h16" className="stroke-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
        <circle cx="12" cy="12" r="4" className="fill-cyan-500/30 stroke-cyan-400" />
      </svg>
    ),
    'detector': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="6" y="6" width="12" height="12" rx="2" className="fill-rose-500/20" />
        <path d="M2 22l20-20" className="stroke-rose-400 drop-shadow-[0_0_4px_rgba(225,29,72,0.5)]" />
        <path d="M22 22L2 2" className="stroke-rose-400 drop-shadow-[0_0_4px_rgba(225,29,72,0.5)]" />
        <circle cx="12" cy="12" r="2" className={cn("fill-rose-500", { "animate-ping": isActive })} />
      </svg>
    ),
    'fiber-coupler': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 12c0-4 4-8 10-8s10 4 10 8" className="stroke-teal-400 drop-shadow-[0_0_4px_rgba(20,184,166,0.5)]" />
        <rect x="6" y="12" width="12" height="8" rx="2" className="fill-teal-500/20" />
        <circle cx="12" cy="4" r="2" className="fill-teal-500/50" />
      </svg>
    ),
    'mirror': (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 2l16 20" className="stroke-slate-400 drop-shadow-[0_0_4px_rgba(148,163,184,0.5)]" />
        <rect x="2" y="2" width="4" height="20" className="fill-slate-500/20" />
      </svg>
    ),
  };

  return components[type] || null;
}
