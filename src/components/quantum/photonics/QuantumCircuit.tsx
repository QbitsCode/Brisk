import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuantumGate, Position } from '@/types/quantum';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { SVGComponentLibrary } from './SVGComponentLibrary';
import '@/styles/quantum-animations.css';

const GRID_SIZE = 20;

// Utility function to group components by category
function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, item) => {
    const group = item[key] as string;
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {} as { [key: string]: T[] });
}

const QUANTUM_COMPONENTS = [
  {
    id: 'single-photon-source',
    name: 'Single Photon Source',
    description: 'Generates single photons',
    category: 'sources'
  },
  {
    id: 'entangled-source',
    name: 'Entangled Source',
    description: 'Generates entangled photon pairs',
    category: 'sources'
  },
  {
    id: 'beamsplitter',
    name: 'Beam Splitter',
    description: '50:50 beam splitter',
    category: 'interference'
  },
  {
    id: 'polarizing-beamsplitter',
    name: 'Polarizing Beam Splitter',
    description: 'Splits photons based on polarization',
    category: 'interference'
  },
  {
    id: 'phaseshift',
    name: 'Phase Shifter',
    description: 'Adjusts the phase of photons',
    category: 'manipulation'
  },
  {
    id: 'waveplate',
    name: 'Wave Plate',
    description: 'Modifies photon polarization',
    category: 'manipulation'
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Reflects photons',
    category: 'routing'
  },
  {
    id: 'fiber-coupler',
    name: 'Fiber Coupler',
    description: 'Couples photons into optical fibers',
    category: 'routing'
  },
  {
    id: 'detector',
    name: 'Single Photon Detector',
    description: 'Detects individual photons',
    category: 'measurement'
  }
];

interface DraggableComponentProps {
  component: QuantumGate;
  onMove: (id: string, pos: Position) => void;
  onRotate: (id: string, angle: number) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isActive: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onMove,
  onRotate,
  onSelect,
  isSelected,
  isActive
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('component', JSON.stringify({
      id: component.id,
      type: component.type,
      currentPosition: component.position
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add laser beam effect for sources
  const renderLaserBeam = () => {
    if (!isActive || !['single-photon-source', 'entangled-source'].includes(component.type)) {
      return null;
    }

    const isEntangled = component.type === 'entangled-source';
    const beamLength = 300; // Length of the beam
    const componentSize = 40; // Component size
    const centerX = componentSize / 2; // Center X of component
    const centerY = componentSize / 2; // Center Y of component
    const beamStartX = centerX; // Start from center of component

    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: `${beamLength + componentSize}px`,
          height: `${componentSize}px`,
          transform: `rotate(${component.rotation}deg)`,
          transformOrigin: `${centerX}px ${centerY}px`,
        }}
      >
        {isEntangled ? (
          <>
            {/* First beam starting from center */}
            <line
              x1={beamStartX}
              y1={centerY - 3}
              x2={beamLength + centerX}
              y2={centerY - 3}
              className="laser-beam-entangled"
            />
            
            {/* Second beam starting from center */}
            <line
              x1={beamStartX}
              y1={centerY + 3}
              x2={beamLength + centerX}
              y2={centerY + 3}
              className="laser-beam-entangled"
            />
          </>
        ) : (
          <line
            x1={beamStartX}
            y1={centerY}
            x2={beamLength + centerX}
            y2={centerY}
            className="laser-beam"
          />
        )}
      </svg>
    );
  };

  return (
    <>
      <motion.div
        ref={componentRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "quantum-component absolute cursor-grab active:cursor-grabbing component-appear",
          `component-${component.type}`,
          isSelected && "ring-2 ring-blue-500 ring-opacity-50",
          isDragging && "dragging",
          isActive && "active"
        )}
        initial={false}
        animate={{ 
          scale: isSelected ? 1.1 : 1,
          rotate: component.rotation,
        }}
        whileHover={{ scale: 1.05 }}
        style={{
          position: 'absolute',
          left: component.position.x,
          top: component.position.y,
          width: 40,
          height: 40,
        }}
        onClick={() => onSelect(component.id)}
      >
        <SVGComponentLibrary 
          type={component.type} 
          isActive={isActive}
          className="w-full h-full"
        />
      </motion.div>
      {renderLaserBeam()}
    </>
  );
};

export function QuantumCircuit({ className }: { className?: string }) {
  const [components, setComponents] = useState<QuantumGate[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeComponents, setActiveComponents] = useState<Set<string>>(new Set());
  const circuitRef = useRef<HTMLDivElement>(null);

  // Add effect to simulate photon propagation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveComponents(prev => {
        const newActive = new Set(prev);
        components.forEach(comp => {
          if (comp.type.includes('source')) {
            newActive.add(comp.id);
          }
        });
        return newActive;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [components]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('component'));
    const rect = circuitRef.current?.getBoundingClientRect();
    
    if (rect) {
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      // If it's a new component
      if (!data.currentPosition) {
        const id = `${data.type}-${Date.now()}`;
        setComponents(prev => [...prev, {
          id,
          type: data.type,
          position,
          rotation: 0,
          params: {}
        }]);
      } 
      // If it's an existing component being moved
      else {
        setComponents(prev => prev.map(comp => 
          comp.id === data.id ? { ...comp, position } : comp
        ));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleComponentMove = (id: string, newPosition: Position) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, position: newPosition } : comp
    ));
  };

  const handleComponentRotate = (id: string, angle: number) => {
    setComponents(prev => prev.map(comp =>
      comp.id === id ? { ...comp, rotation: angle } : comp
    ));
  };

  return (
    <div className={cn("flex h-full", className)}>
      <div className="w-64 bg-card p-4 border-r">
        <h3 className="text-lg font-medium mb-4">Components</h3>
        <div className="space-y-4">
          {Object.entries(groupBy(QUANTUM_COMPONENTS, 'category')).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => (
                  <Tooltip key={item.id} content={item.description}>
                    <div
                      draggable
                      className={cn(
                        "quantum-component w-12 h-12 rounded-lg bg-background/50 p-2 cursor-grab",
                        "hover:bg-accent/50 transition-colors border component-appear",
                        `component-${item.id}`
                      )}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('component', JSON.stringify({
                          type: item.id
                        }));
                      }}
                    >
                      <SVGComponentLibrary type={item.id} />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div 
        ref={circuitRef}
        className="flex-1 relative bg-background/50 border rounded-lg m-4"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {components.map((component) => (
            <DraggableComponent
              key={component.id}
              component={component}
              onMove={handleComponentMove}
              onRotate={handleComponentRotate}
              onSelect={setSelectedComponent}
              isSelected={selectedComponent === component.id}
              isActive={activeComponents.has(component.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
