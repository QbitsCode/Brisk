import React from 'react';
import { cn } from '@/lib/utils';

interface QuantumRepeaterProps {
  className?: string;
  efficiency?: number;
  memoryTime?: number; // Quantum memory coherence time in microseconds
  onEfficiencyChange?: (efficiency: number) => void;
  onMemoryTimeChange?: (time: number) => void;
}

export function QuantumRepeater({
  className,
  efficiency = 0.9,
  memoryTime = 1000,
  onEfficiencyChange,
  onMemoryTimeChange
}: QuantumRepeaterProps) {
  return (
    <div className={cn("space-y-4 p-4 border rounded-lg", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Quantum Repeater</span>
        <span className="text-sm text-muted-foreground">
          Efficiency: {(efficiency * 100).toFixed(1)}%
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm">
          Efficiency:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={efficiency}
            onChange={(e) => onEfficiencyChange?.(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm">
          Memory Time (µs):
          <input
            type="number"
            min="0"
            step="100"
            value={memoryTime}
            onChange={(e) => onMemoryTimeChange?.(parseFloat(e.target.value))}
            className="w-full mt-1 px-2 py-1 border rounded"
          />
        </label>
      </div>

      <div className="relative p-4 bg-muted rounded-lg">
        <svg viewBox="0 0 100 60" className="w-full h-auto">
          {/* Quantum Memory Units */}
          <rect x="10" y="10" width="20" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="70" y="10" width="20" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
          
          {/* Entanglement Swapping */}
          <line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* Labels */}
          <text x="20" y="55" textAnchor="middle" className="text-xs">QM1</text>
          <text x="80" y="55" textAnchor="middle" className="text-xs">QM2</text>
        </svg>
      </div>
    </div>
  );
}
