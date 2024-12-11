import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface QuantumGate {
  id: string;
  type: 'beamsplitter' | 'phaseshift' | 'detector' | 'source';
  position: { x: number; y: number };
}

interface QuantumCircuitProps {
  className?: string;
}

export function QuantumCircuit({ className }: QuantumCircuitProps) {
  const [gates, setGates] = useState<QuantumGate[]>([]);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  const addGate = (type: QuantumGate['type']) => {
    const newGate: QuantumGate = {
      id: `gate-${Date.now()}`,
      type,
      position: { x: 0, y: 0 },
    };
    setGates([...gates, newGate]);
  };

  const handleGateDrag = (id: string, newPosition: { x: number; y: number }) => {
    setGates(gates.map(gate => 
      gate.id === id ? { ...gate, position: newPosition } : gate
    ));
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex space-x-2 p-4 bg-muted rounded-lg">
        <button
          onClick={() => addGate('source')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Source
        </button>
        <button
          onClick={() => addGate('beamsplitter')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Beam Splitter
        </button>
        <button
          onClick={() => addGate('phaseshift')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Phase Shift
        </button>
        <button
          onClick={() => addGate('detector')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Detector
        </button>
      </div>

      <div className="relative w-full h-[600px] border rounded-lg bg-background">
        {gates.map((gate) => (
          <div
            key={gate.id}
            className="absolute p-2 bg-accent rounded-md cursor-move"
            style={{
              transform: `translate(${gate.position.x}px, ${gate.position.y}px)`,
            }}
            draggable
            onDragStart={() => setSelectedGate(gate.id)}
          >
            {gate.type}
          </div>
        ))}
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium mb-2">Circuit Properties</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-sm text-muted-foreground">Gates:</span>
            <span className="ml-2 text-sm">{gates.length}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Selected:</span>
            <span className="ml-2 text-sm">{selectedGate || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
