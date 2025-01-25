import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuantumGate, Position, Connection, CircuitTemplate } from '@/types/quantum';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { SVGComponentLibrary } from './SVGComponentLibrary';
import { ConnectionLine } from './ConnectionLine';
import { QuantumStateViewer } from '../visualization/QuantumStateViewer';
import { useQuantumSimulation } from '@/hooks/useQuantumSimulation';
import { ComponentControls } from './ComponentControls';

const GRID_SIZE = 20;

interface DraggableGateProps {
  gate: QuantumGate;
  onMove: (id: string, pos: Position) => void;
  onRotate: (id: string, angle: number) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onStartConnection: (gateId: string, portType: 'input' | 'output') => void;
}

const DraggableGate: React.FC<DraggableGateProps> = ({
  gate,
  onMove,
  onRotate,
  onSelect,
  isSelected,
  onStartConnection,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gate',
    item: { id: gate.id, type: gate.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <motion.div
      ref={drag}
      initial={{ scale: 0.9 }}
      animate={{ 
        scale: isSelected ? 1.1 : 1,
        boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
      }}
      whileHover={{ scale: 1.05 }}
      style={{
        position: 'absolute',
        left: gate.position.x,
        top: gate.position.y,
        cursor: 'move',
        transform: `rotate(${gate.rotation || 0}deg)`,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={() => onSelect(gate.id)}
      className={cn(
        'w-12 h-12 rounded-lg bg-background border-2',
        isSelected ? 'border-primary' : 'border-border',
        isDragging ? 'opacity-50' : 'opacity-100'
      )}
    >
      <SVGComponentLibrary type={gate.type} />
      
      {/* Connection ports */}
      <div
        className="absolute left-0 top-1/2 w-2 h-2 -ml-1 bg-primary rounded-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection(gate.id, 'input');
        }}
      />
      <div
        className="absolute right-0 top-1/2 w-2 h-2 -mr-1 bg-primary rounded-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection(gate.id, 'output');
        }}
      />
    </motion.div>
  );
};

export function QuantumCircuit({ className }: { className?: string }) {
  const [gates, setGates] = useState<QuantumGate[]>([]);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionStart, setConnectionStart] = useState<{
    gateId: string;
    portType: 'input' | 'output';
  } | null>(null);
  const circuitRef = useRef<HTMLDivElement>(null);
  const { simulationResults, isSimulating, error, runSimulation } = useQuantumSimulation();

  const handleUpdateParameters = (id: string, params: Record<string, number>) => {
    setGates(gates.map(gate =>
      gate.id === id ? { ...gate, parameters: params } : gate
    ));
  };

  const handleDeleteGate = (id: string) => {
    setGates(gates.filter(gate => gate.id !== id));
    setConnections(connections.filter(conn => 
      conn.sourceId !== id && conn.targetId !== id
    ));
    setSelectedGate(null);
  };

  const [, drop] = useDrop(() => ({
    accept: 'gate',
    drop: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const offset = monitor.getClientOffset();
      
      if (delta && offset && circuitRef.current) {
        const rect = circuitRef.current.getBoundingClientRect();
        const x = Math.round((offset.x - rect.left) / GRID_SIZE) * GRID_SIZE;
        const y = Math.round((offset.y - rect.top) / GRID_SIZE) * GRID_SIZE;
        
        handleGateDrag(item.id, { x, y });
      }
    },
  }));

  const handleGateDrag = (id: string, newPosition: Position) => {
    setGates(gates.map(gate =>
      gate.id === id ? { ...gate, position: newPosition } : gate
    ));
  };

  const handleGateRotate = (id: string, angle: number) => {
    setGates(gates.map(gate =>
      gate.id === id ? { ...gate, rotation: (gate.rotation || 0) + angle } : gate
    ));
  };

  const handleStartConnection = (gateId: string, portType: 'input' | 'output') => {
    setConnectionStart({ gateId, portType });
  };

  const handleCompleteConnection = (gateId: string) => {
    if (connectionStart && connectionStart.gateId !== gateId) {
      const newConnection: Connection = {
        sourceId: connectionStart.portType === 'output' ? connectionStart.gateId : gateId,
        targetId: connectionStart.portType === 'output' ? gateId : connectionStart.gateId,
        sourcePort: 'output',
        targetPort: 'input',
      };
      setConnections([...connections, newConnection]);
    }
    setConnectionStart(null);
  };

  const addGate = (type: QuantumGate['type']) => {
    const newGate: QuantumGate = {
      id: `gate-${Date.now()}`,
      type,
      position: { x: 50, y: 50 },
      rotation: 0,
    };
    setGates([...gates, newGate]);
    setSelectedGate(newGate.id);
  };

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-2">
        <Tooltip content="Add Photon Source">
          <Button
            onClick={() => addGate('source')}
            variant="outline"
            size="icon"
            className="w-10 h-10"
          >
            <SVGComponentLibrary type="source" />
          </Button>
        </Tooltip>
        <Tooltip content="Add Beam Splitter">
          <Button
            onClick={() => addGate('beamsplitter')}
            variant="outline"
            size="icon"
            className="w-10 h-10"
          >
            <SVGComponentLibrary type="beamsplitter" />
          </Button>
        </Tooltip>
        <Tooltip content="Add Phase Shift">
          <Button
            onClick={() => addGate('phaseshift')}
            variant="outline"
            size="icon"
            className="w-10 h-10"
          >
            <SVGComponentLibrary type="phaseshift" />
          </Button>
        </Tooltip>
        <Tooltip content="Add Detector">
          <Button
            onClick={() => addGate('detector')}
            variant="outline"
            size="icon"
            className="w-10 h-10"
          >
            <SVGComponentLibrary type="detector" />
          </Button>
        </Tooltip>
      </div>

      <div
        ref={drop}
        className="relative w-full h-[600px] border-2 border-dashed border-border rounded-lg bg-grid-pattern"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((conn, idx) => {
            const sourceGate = gates.find(g => g.id === conn.sourceId);
            const targetGate = gates.find(g => g.id === conn.targetId);
            
            if (sourceGate && targetGate) {
              return (
                <ConnectionLine
                  key={idx}
                  connection={conn}
                  sourcePosition={{
                    x: sourceGate.position.x + 48, // Add width of gate
                    y: sourceGate.position.y + 24, // Add half height
                  }}
                  targetPosition={{
                    x: targetGate.position.x,
                    y: targetGate.position.y + 24,
                  }}
                />
              );
            }
            return null;
          })}
        </svg>

        <AnimatePresence>
          {gates.map((gate) => (
            <DraggableGate
              key={gate.id}
              gate={gate}
              onMove={handleGateDrag}
              onRotate={handleGateRotate}
              onSelect={setSelectedGate}
              isSelected={gate.id === selectedGate}
              onStartConnection={handleStartConnection}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-between p-4 bg-muted rounded-lg">
        <Button
          onClick={() => runSimulation(gates, connections)}
          variant="default"
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Run Simulation'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {simulationResults && (
        <QuantumStateViewer
          stateVector={simulationResults.stateVector}
          probabilities={simulationResults.probabilities}
          blochSphere={simulationResults.blochSphere}
        />
      )}
    </div>
  );
}
