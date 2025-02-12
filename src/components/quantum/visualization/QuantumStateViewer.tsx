import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuantumStateViewerProps {
  stateVector?: number[];
  probabilities?: number[];
  blochSphere?: {
    x: number;
    y: number;
    z: number;
  };
  className?: string;
}

export function QuantumStateViewer({
  stateVector,
  probabilities,
  blochSphere,
  className,
}: QuantumStateViewerProps) {
  const maxProbability = Math.max(...(probabilities || [0]));

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* State Vector Visualization */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Quantum State</h3>
        <div className="flex flex-wrap gap-2">
          {stateVector?.map((amplitude, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative flex flex-col items-center"
            >
              <div className="text-sm font-mono mb-1">|{idx.toString(2).padStart(2, '0')}⟩</div>
              <motion.div
                className="w-4 bg-primary"
                initial={{ height: 0 }}
                animate={{ height: Math.abs(amplitude) * 100 }}
                style={{
                  transformOrigin: 'bottom',
                }}
              />
              <div className="text-xs mt-1">{amplitude.toFixed(2)}</div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Probability Distribution */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Measurement Probabilities</h3>
        <div className="flex flex-wrap gap-2">
          {probabilities?.map((prob, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative flex flex-col items-center"
            >
              <div className="text-sm font-mono mb-1">{idx}</div>
              <motion.div
                className="w-4 bg-primary/60"
                initial={{ height: 0 }}
                animate={{ height: (prob / maxProbability) * 100 }}
                style={{
                  transformOrigin: 'bottom',
                }}
              />
              <div className="text-xs mt-1">{(prob * 100).toFixed(1)}%</div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Bloch Sphere Visualization */}
      {blochSphere && (
        <Card className="p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Bloch Sphere</h3>
          <div className="relative w-full h-[200px] border rounded-lg">
            <BlochSphereVisualization
              x={blochSphere.x}
              y={blochSphere.y}
              z={blochSphere.z}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

interface BlochSphereVisualizationProps {
  x: number;
  y: number;
  z: number;
}

function BlochSphereVisualization({ x, y, z }: BlochSphereVisualizationProps) {
  // Calculate the position of the state vector on the sphere
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  const theta = Math.acos(z);
  const phi = Math.atan2(y, x);
  
  const pointX = centerX + radius * Math.sin(theta) * Math.cos(phi);
  const pointY = centerY + radius * Math.sin(theta) * Math.sin(phi);

  return (
    <svg className="w-full h-full" viewBox="0 0 200 200">
      {/* Draw the main circle representing the sphere */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        className="fill-none stroke-border stroke-2"
      />
      
      {/* Draw the x, y, z axes */}
      <line
        x1={centerX - radius}
        y1={centerY}
        x2={centerX + radius}
        y2={centerY}
        className="stroke-primary/30 stroke-1"
      />
      <line
        x1={centerX}
        y1={centerY - radius}
        x2={centerX}
        y2={centerY + radius}
        className="stroke-primary/30 stroke-1"
      />
      
      {/* Draw the state vector */}
      <line
        x1={centerX}
        y1={centerY}
        x2={pointX}
        y2={pointY}
        className="stroke-primary stroke-2"
      />
      <circle
        cx={pointX}
        cy={pointY}
        r={3}
        className="fill-primary"
      />
      
      {/* Labels */}
      <text x={centerX + radius + 5} y={centerY} className="text-xs">|0⟩</text>
      <text x={centerX} y={centerY - radius - 5} className="text-xs">|1⟩</text>
    </svg>
  );
}
