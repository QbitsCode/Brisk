import React from 'react';
import { cn } from '@/lib/utils';

interface QuantumChannelProps {
  className?: string;
  loss?: number; // Channel loss in dB/km
  distance?: number; // Channel length in km
  onLossChange?: (loss: number) => void;
  onDistanceChange?: (distance: number) => void;
}

export function QuantumChannel({
  className,
  loss = 0.2,
  distance = 1,
  onLossChange,
  onDistanceChange
}: QuantumChannelProps) {
  const totalLoss = loss * distance;
  const transmittance = Math.pow(10, -totalLoss / 10);

  return (
    <div className={cn("space-y-4 p-4 border rounded-lg", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Channel Parameters</span>
        <span className="text-sm text-muted-foreground">
          Transmittance: {(transmittance * 100).toFixed(2)}%
        </span>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm">
          Loss (dB/km):
          <input
            type="number"
            min="0"
            step="0.1"
            value={loss}
            onChange={(e) => onLossChange?.(parseFloat(e.target.value))}
            className="w-full mt-1 px-2 py-1 border rounded"
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm">
          Distance (km):
          <input
            type="number"
            min="0"
            step="0.1"
            value={distance}
            onChange={(e) => onDistanceChange?.(parseFloat(e.target.value))}
            className="w-full mt-1 px-2 py-1 border rounded"
          />
        </label>
      </div>

      <div className="relative h-8 bg-gradient-to-r from-primary to-primary/20 rounded">
        <div
          className="absolute inset-y-0 right-0 bg-background/80"
          style={{ width: `${(1 - transmittance) * 100}%` }}
        />
      </div>
    </div>
  );
}
