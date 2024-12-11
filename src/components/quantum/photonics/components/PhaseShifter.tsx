import React from 'react';
import { cn } from '@/lib/utils';

interface PhaseShifterProps {
  className?: string;
  phase?: number;
  position: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onPhaseChange?: (phase: number) => void;
}

export function PhaseShifter({
  className,
  phase = 0,
  position,
  onPositionChange,
  onPhaseChange
}: PhaseShifterProps) {
  const handleDrag = (e: React.DragEvent) => {
    if (onPositionChange) {
      const rect = e.currentTarget.getBoundingClientRect();
      onPositionChange({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onPhaseChange) {
      onPhaseChange(parseFloat(e.target.value));
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
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="8"
          y1="24"
          x2="40"
          y2="24"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="24"
          y="40"
          textAnchor="middle"
          className="text-xs"
        >
          {(phase * 180 / Math.PI).toFixed(0)}°
        </text>
      </svg>
      <input
        type="range"
        min="0"
        max={2 * Math.PI}
        step="0.1"
        value={phase}
        onChange={handlePhaseChange}
        className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
