import React from 'react';
import { cn } from '@/lib/utils';

interface BeamSplitterProps {
  className?: string;
  reflectivity?: number;
  position: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export function BeamSplitter({ 
  className,
  reflectivity = 0.5,
  position,
  onPositionChange
}: BeamSplitterProps) {
  const handleDrag = (e: React.DragEvent) => {
    if (onPositionChange) {
      const rect = e.currentTarget.getBoundingClientRect();
      onPositionChange({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div
      className={cn(
        "relative w-12 h-12 cursor-move",
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      draggable
      onDrag={handleDrag}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
      >
        <line
          x1="0"
          y1="24"
          x2="48"
          y2="24"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="16"
          y="16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          transform="rotate(45 24 24)"
        />
        <text
          x="24"
          y="40"
          textAnchor="middle"
          className="text-xs"
        >
          {(reflectivity * 100).toFixed(0)}%
        </text>
      </svg>
    </div>
  );
}
