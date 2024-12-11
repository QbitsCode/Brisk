import React from 'react';
import { cn } from '@/lib/utils';

interface QuantumState {
  amplitude: number;
  phase: number;
  basis: string;
}

interface StateVisualizerProps {
  className?: string;
  states: QuantumState[];
}

export function StateVisualizer({ 
  className,
  states = []
}: StateVisualizerProps) {
  const maxAmplitude = Math.max(...states.map(s => Math.abs(s.amplitude)));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quantum State Visualization</h3>
      </div>

      <div className="relative h-[300px] border rounded-lg p-4">
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {states.map((state, index) => {
            const normalizedHeight = (Math.abs(state.amplitude) / maxAmplitude) * 100;
            const hue = (state.phase / (2 * Math.PI)) * 360;
            
            return (
              <div
                key={index}
                className="relative flex flex-col items-center"
                style={{ width: `${100 / states.length}%` }}
              >
                <div
                  className="w-8 rounded-t-md"
                  style={{
                    height: `${normalizedHeight}%`,
                    backgroundColor: `hsl(${hue}, 70%, 50%)`,
                  }}
                />
                <div className="mt-2 text-xs text-center">
                  <div>{state.basis}</div>
                  <div className="text-muted-foreground">
                    {state.amplitude.toFixed(2)}∠{(state.phase * 180 / Math.PI).toFixed(1)}°
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Amplitude Legend</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Max: {maxAmplitude.toFixed(3)}</span>
              <span>States: {states.length}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Phase Color Map</h4>
          <div className="h-4 w-full rounded-md" style={{
            background: 'linear-gradient(to right, hsl(0, 70%, 50%), hsl(360, 70%, 50%))'
          }} />
          <div className="flex justify-between text-sm mt-1">
            <span>0°</span>
            <span>360°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
