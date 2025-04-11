'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

interface ComponentProps {
  id: string;
  type: 'source' | 'beamsplitter' | 'phaseshift' | 'detector';
  x: number;
  y: number;
  width: number;
  height: number;
  params?: {
    polarization?: string;
    reflectivity?: number;
    phase?: number;
    efficiency?: number;
  };
}

interface ConnectionProps {
  id: string;
  sourceId: string;
  sourcePort: number;
  targetId: string;
  targetPort: number;
}

export default function CircuitDemo() {
  // State for quantum circuit components
  const [components, setComponents] = useState<ComponentProps[]>([]);
  const [connections, setConnections] = useState<ConnectionProps[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{id: string, port: number} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);

  // Start simulation
  const startSimulation = () => {
    setIsSimulating(true);
    // Implement actual simulation logic here
  };

  // Stop simulation
  const stopSimulation = () => {
    setIsSimulating(false);
  };

  // Start creating a connection
  const startConnection = (componentId: string, port: number, e: React.MouseEvent) => {
    setIsCreatingConnection(true);
    setConnectionStart({ id: componentId, port });
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Complete a connection when mouse up on an input port
  const completeConnection = (componentId: string, port: number, e: React.MouseEvent) => {
    if (isCreatingConnection && connectionStart) {
      // Add new connection
      const newConnection: ConnectionProps = {
        id: uuidv4(),
        sourceId: connectionStart.id,
        sourcePort: connectionStart.port,
        targetId: componentId,
        targetPort: port
      };
      setConnections([...connections, newConnection]);
      setIsCreatingConnection(false);
      setConnectionStart(null);
    }
  };

  // Update mouse position during connection creation
  useEffect(() => {
    if (isCreatingConnection) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isCreatingConnection]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quantum Circuit Simulator</h1>
      
      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => {
            const newComponent: ComponentProps = {
              id: uuidv4(),
              type: 'source',
              x: 100,
              y: 100,
              width: 80,
              height: 60,
              params: { polarization: 'H' }
            };
            setComponents([...components, newComponent]);
          }}
        >
          Add Source
        </Button>
        <Button
          onClick={() => {
            const newComponent: ComponentProps = {
              id: uuidv4(),
              type: 'beamsplitter',
              x: 200,
              y: 150,
              width: 80,
              height: 60,
              params: { reflectivity: 0.5 }
            };
            setComponents([...components, newComponent]);
          }}
        >
          Add Beam Splitter
        </Button>
        <Button
          onClick={() => {
            const newComponent: ComponentProps = {
              id: uuidv4(),
              type: 'phaseshift',
              x: 300,
              y: 100,
              width: 80,
              height: 60,
              params: { phase: 0 }
            };
            setComponents([...components, newComponent]);
          }}
        >
          Add Phase Shifter
        </Button>
        <Button
          onClick={() => {
            const newComponent: ComponentProps = {
              id: uuidv4(),
              type: 'detector',
              x: 400,
              y: 150,
              width: 80,
              height: 60,
              params: { efficiency: 0.9 }
            };
            setComponents([...components, newComponent]);
          }}
        >
          Add Detector
        </Button>
      </div>
      
      <div 
        className="relative w-full h-[600px] border border-gray-700 bg-slate-900 rounded-md overflow-hidden"
        onClick={() => {
          setSelectedComponent(null);
        }}
      >
        {/* Components */}
        {components.map(component => (
          <div
            key={component.id}
            className={`absolute rounded-md cursor-move flex items-center justify-center 
              ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: component.x,
              top: component.y,
              width: component.width,
              height: component.height,
              backgroundColor: selectedComponent === component.id ? '#1a365d' : '#0f172a'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(component.id);
            }}
            onMouseDown={(e) => {
              // Prevent the event from bubbling up to parent elements
              e.stopPropagation();
              
              // Only handle left mouse button
              if (e.button !== 0) return;
              
              // Prevent text selection during drag
              e.preventDefault();
              
              const startX = e.clientX;
              const startY = e.clientY;
              const startComponentX = component.x;
              const startComponentY = component.y;
              
              // Flag to track if we're dragging vs. just clicking
              let isDragging = false;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                isDragging = true;
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                
                setComponents(components.map(c => 
                  c.id === component.id
                    ? { ...c, x: Math.max(0, startComponentX + dx), y: Math.max(0, startComponentY + dy) }
                    : c
                ));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            {/* Component Icon */}
            {component.type === 'source' && (
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">S</div>
            )}
            {component.type === 'beamsplitter' && (
              <div className="w-10 h-10 bg-blue-500 rotate-45 flex items-center justify-center text-black font-bold">BS</div>
            )}
            {component.type === 'phaseshift' && (
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold">PS</div>
            )}
            {component.type === 'detector' && (
              <div className="w-10 h-10 bg-red-500 rounded-sm flex items-center justify-center text-black font-bold">D</div>
            )}
            
            {/* Component Label */}
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-300">
              {component.type === 'source' && `Source ${component.params?.polarization || 'H'}`}
              {component.type === 'beamsplitter' && `BS (r=${component.params?.reflectivity || 0.5})`}
              {component.type === 'phaseshift' && `PS (φ=${component.params?.phase || 0})`}
              {component.type === 'detector' && `Detector ${component.params?.efficiency || 0.9}`}
            </div>
            
            {/* Input/Output Connection Points */}
            {component.type !== 'source' && (
              <div 
                className="absolute left-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:ring-2 hover:ring-white flex items-center justify-center"
                onMouseUp={(e) => {
                  e.stopPropagation();
                  completeConnection(component.id, 0, e);
                }}
                title="Input"
              >
                <span className="text-xs text-white">in</span>
              </div>
            )}
            
            {component.type !== 'detector' && (
              <div 
                className="absolute right-0 top-1/2 w-4 h-4 bg-green-500 rounded-full transform translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:ring-2 hover:ring-white flex items-center justify-center"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startConnection(component.id, 0, e);
                }}
                title="Output"
              >
                <span className="text-xs text-white">out</span>
              </div>
            )}
          </div>
        ))}

        {/* Connections */}
        {connections.map(connection => {
          // Find source and target components
          const source = components.find(c => c.id === connection.sourceId);
          const target = components.find(c => c.id === connection.targetId);
          if (!source || !target) return null;
          
          // Calculate connection start and end points
          const startX = source.x + source.width;
          const startY = source.y + source.height / 2;
          const endX = target.x;
          const endY = target.y + target.height / 2;
          
          return (
            <svg key={connection.id} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              <path
                d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`}
                stroke="#60a5fa"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          );
        })}
        
        {/* Connection being created */}
        {isCreatingConnection && connectionStart && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <path
              d={`M ${components.find(c => c.id === connectionStart.id)?.x! + components.find(c => c.id === connectionStart.id)?.width!} 
                 ${components.find(c => c.id === connectionStart.id)?.y! + components.find(c => c.id === connectionStart.id)?.height! / 2} 
                 C ${components.find(c => c.id === connectionStart.id)?.x! + components.find(c => c.id === connectionStart.id)?.width! + 50} 
                 ${components.find(c => c.id === connectionStart.id)?.y! + components.find(c => c.id === connectionStart.id)?.height! / 2}, 
                 ${mousePosition.x - 50} ${mousePosition.y}, 
                 ${mousePosition.x} ${mousePosition.y}`}
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          </svg>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          <Button 
            onClick={() => {
              if (selectedComponent) {
                setComponents(components.filter(c => c.id !== selectedComponent));
                setConnections(connections.filter(
                  c => c.sourceId !== selectedComponent && c.targetId !== selectedComponent
                ));
                setSelectedComponent(null);
              }
            }}
            variant="destructive"
            disabled={!selectedComponent}
          >
            Delete Selected
          </Button>
        </div>

        <div className="ml-auto flex gap-2 items-center">
          {isSimulating ? (
            <>
              <div className="flex items-center mr-4">
                <span className="text-xs text-gray-400 mr-2">Speed:</span>
                <select 
                  className="bg-slate-800 text-white text-sm rounded-md border border-slate-700 px-2 py-1"
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                >
                  <option value="2000">0.5x</option>
                  <option value="1000">1x</option>
                  <option value="500">2x</option>
                  <option value="250">4x</option>
                  <option value="100">10x</option>
                </select>
              </div>
              <Button 
                onClick={stopSimulation} 
                variant="destructive"
              >
                Stop Simulation
              </Button>
            </>
          ) : (
            <Button 
              onClick={startSimulation} 
              variant="default"
              disabled={components.length === 0}
            >
              Start Simulation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
