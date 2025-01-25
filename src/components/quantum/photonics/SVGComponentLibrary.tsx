import React from 'react';
import { cn } from '@/lib/utils';

interface SVGComponentLibraryProps {
  type: string;
  className?: string;
}

export function SVGComponentLibrary({ type, className }: SVGComponentLibraryProps) {
  const components = {
    source: (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="6" className="fill-primary/20" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <circle cx="12" cy="12" r="2" className="fill-primary" />
      </svg>
    ),
    beamsplitter: (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 2l20 20" className="stroke-primary" />
        <rect x="4" y="4" width="16" height="16" rx="2" className="fill-primary/10" />
        <path d="M12 2v20" className="stroke-primary/50 stroke-dashed" />
      </svg>
    ),
    phaseshift: (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" className="fill-primary/10" />
        <path d="M12 4v16" className="stroke-primary" />
        <path d="M8 12h8" className="stroke-primary" />
        <circle cx="12" cy="12" r="2" className="fill-primary/50" />
      </svg>
    ),
    detector: (
      <svg
        viewBox="0 0 24 24"
        className={cn('w-full h-full', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v4" className="stroke-primary" />
        <path d="M4.93 7.93l2.83 2.83" className="stroke-primary" />
        <path d="M2 16h4" className="stroke-primary" />
        <path d="M19.07 7.93l-2.83 2.83" className="stroke-primary" />
        <path d="M18 16h4" className="stroke-primary" />
        <path d="M12 12v8" className="stroke-primary" />
        <circle cx="12" cy="12" r="3" className="fill-primary/20" />
      </svg>
    ),
  };

  return components[type as keyof typeof components] || null;
}
