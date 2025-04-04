"use client";

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConnectableComponent } from './ConnectableComponent';
import { ConnectionManager } from '@/services/quantum/ConnectionManager';
import { cn } from '@/lib/utils';
import { createComponentPorts } from './componentMetadata';
import { Connection, ConnectableQuantumComponent, Port, CircuitValidationResult } from '@/types/quantum/connections';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedQuantumCircuitProps {
  className?: string;
  onGeneratePercevalCode?: (code: string) => void;
}

export function EnhancedQuantumCircuit({ 
  className,
  onGeneratePercevalCode
}: EnhancedQuantumCircuitProps) {
  // Circuit state
  const [components, setComponents] = useState<ConnectableQuantumComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<CircuitValidationResult | null>(null);
  
  // Connection drawing state
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    portId: string;
    componentId: string;
    position: { x: number, y: number };
  } | null>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [connectionPaths, setConnectionPaths] = useState<Record<string, string>>({});
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Handle component selection
  const handleSelectComponent = (id: string) => {
    setSelectedComponentId(id);
  };
  
  // Handle component movement
  const handleComponentPositionChange = (id: string, newPosition: { x: number, y: number }) => {
    setComponents(prevComponents => 
      prevComponents.map(component => 
        component.id === id 
          ? { ...component, position: newPosition } 
          : component
      )
    );
    
    // Update connection paths after position change
    updateConnectionPaths();
  };
  
  // Handle component rotation
  const handleComponentRotate = (id: string, newAngle: number) => {
    setComponents(prevComponents => 
      prevComponents.map(component => 
        component.id === id 
          ? { ...component, angle: newAngle } 
          : component
      )
    );
  };
  
  // Start drawing a connection from a port
  const handleStartConnection = (portId: string, componentId: string, event: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sourcePort = findPortById(portId);
    
    if (!sourcePort) return;
    
    // Get source component for positioning
    const sourceComponent = components.find(c => c.id === componentId);
    if (!sourceComponent) return;
    
    // Calculate starting position
    const startX = sourceComponent.position.x + sourcePort.position.x;
    const startY = sourceComponent.position.y + sourcePort.position.y;
    
    setConnectionStart({
      portId,
      componentId,
      position: { x: startX, y: startY }
    });
    
    setCurrentMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    
    setIsDrawingConnection(true);
  };
  
  // Handle mouse move during connection drawing
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawingConnection || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    setCurrentMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };
  
  // Handle mouse up to complete connection
  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDrawingConnection || !connectionStart || !canvasRef.current) {
      setIsDrawingConnection(false);
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Find port under mouse position
    const targetPort = findPortUnderPosition(mouseX, mouseY);
    const sourcePort = findPortById(connectionStart.portId);
    
    if (targetPort && sourcePort && ConnectionManager.canConnect(sourcePort, targetPort)) {
      // Create connection
      const newConnection = ConnectionManager.createConnection(sourcePort, targetPort, components);
      if (newConnection) {
        setConnections([...connections, newConnection]);
        
        // Update components with connection info
        setComponents([...components]);
        
        // Update connection paths
        setTimeout(() => updateConnectionPaths(), 0);
      }
    }
    
    // Reset connection drawing state
    setIsDrawingConnection(false);
    setConnectionStart(null);
  };
  
  // Add a new component to the canvas
  const addComponent = (type: string) => {
    const id = uuidv4();
    const { inputPorts, outputPorts } = createComponentPorts(id, type);
    
    const newComponent: ConnectableQuantumComponent = {
      id,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      angle: 0,
      params: {},
      inputPorts,
      outputPorts,
      selected: false
    };
    
    setComponents([...components, newComponent]);
    setSelectedComponentId(id);
  };
  
  // Remove a component and its connections
  const removeSelectedComponent = () => {
    if (!selectedComponentId) return;
    
    // Find component
    const componentToRemove = components.find(c => c.id === selectedComponentId);
    if (!componentToRemove) return;
    
    // Find all connections involving this component
    const connectionsToRemove = connections.filter(
      c => c.sourceComponentId === selectedComponentId || c.targetComponentId === selectedComponentId
    );
    
    // Remove connections first
    const updatedConnections = connections.filter(
      c => c.sourceComponentId !== selectedComponentId && c.targetComponentId !== selectedComponentId
    );
    
    // Remove component
    const updatedComponents = components.filter(c => c.id !== selectedComponentId);
    
    setConnections(updatedConnections);
    setComponents(updatedComponents);
    setSelectedComponentId(null);
    
    // Update connection paths
    setTimeout(() => updateConnectionPaths(), 0);
  };
  
  // Helper to find a port by ID
  const findPortById = (portId: string): Port | undefined => {
    for (const component of components) {
      // Check input ports
      const inputPort = component.inputPorts.find(p => p.id === portId);
      if (inputPort) return inputPort;
      
      // Check output ports
      const outputPort = component.outputPorts.find(p => p.id === portId);
      if (outputPort) return outputPort;
    }
    return undefined;
  };
  
  // Helper to find a port under a position
  const findPortUnderPosition = (x: number, y: number): Port | undefined => {
    const portRadius = 10; // Detection radius for ports
    
    for (const component of components) {
      // Check each input port
      for (const port of component.inputPorts) {
        const portX = component.position.x + port.position.x;
        const portY = component.position.y + port.position.y;
        
        const distance = Math.sqrt(
          Math.pow(portX - x, 2) + Math.pow(portY - y, 2)
        );
        
        if (distance <= portRadius) {
          return port;
        }
      }
      
      // Check each output port
      for (const port of component.outputPorts) {
        const portX = component.position.x + port.position.x;
        const portY = component.position.y + port.position.y;
        
        const distance = Math.sqrt(
          Math.pow(portX - x, 2) + Math.pow(portY - y, 2)
        );
        
        if (distance <= portRadius) {
          return port;
        }
      }
    }
    
    return undefined;
  };
  
  // Calculate connection path for SVG line
  const getConnectionPath = (connection: Connection): string => {
    const sourceComponent = components.find(c => c.id === connection.sourceComponentId);
    const targetComponent = components.find(c => c.id === connection.targetComponentId);
    
    if (!sourceComponent || !targetComponent) return '';
    
    const sourcePort = sourceComponent.outputPorts.find(p => p.id === connection.sourcePortId);
    const targetPort = targetComponent.inputPorts.find(p => p.id === connection.targetPortId);
    
    if (!sourcePort || !targetPort) return '';
    
    const startX = sourceComponent.position.x + sourcePort.position.x;
    const startY = sourceComponent.position.y + sourcePort.position.y;
    const endX = targetComponent.position.x + targetPort.position.x;
    const endY = targetComponent.position.y + targetPort.position.y;
    
    // Calculate control points for curve
    const midX = (startX + endX) / 2;
    
    // Create a bezier curve path
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  };
  
  // Update all connection paths
  const updateConnectionPaths = () => {
    const newPaths: Record<string, string> = {};
    
    connections.forEach(connection => {
      const path = getConnectionPath(connection);
      if (path) {
        newPaths[connection.id] = path;
      }
    });
    
    setConnectionPaths(newPaths);
  };
  
  // Update connection paths when connections change
  useEffect(() => {
    updateConnectionPaths();
  }, [connections]);
  
  // Draw the temporary connection line when creating a connection
  const getTempConnectionPath = (): string => {
    if (!connectionStart) return '';
    
    const startX = connectionStart.position.x;
    const startY = connectionStart.position.y;
    const endX = currentMousePosition.x;
    const endY = currentMousePosition.y;
    
    // Calculate control points for curve
    const midX = (startX + endX) / 2;
    
    // Create a bezier curve path
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  };
  
  // Validate the circuit
  const validateCircuit = () => {
    const result = ConnectionManager.validateCircuit(components, connections);
    setValidationResult(result);
    
    if (!result.valid) {
      toast({
        title: "Circuit Validation Failed",
        description: result.errors.map(e => e.message).join('. '),
        variant: "destructive"
      });
    } else if (result.warnings.length > 0) {
      toast({
        title: "Circuit Validation Warnings",
        description: result.warnings.map(w => w.message).join('. '),
        variant: "default"
      });
    } else {
      toast({
        title: "Circuit Validation Successful",
        description: "Your quantum circuit is valid and ready for simulation.",
        variant: "default"
      });
    }
    
    return result.valid;
  };
  
  // Generate Perceval code from the circuit
  const generatePercevalCode = () => {
    if (!validateCircuit()) return;
    
    // This is a placeholder - in a real implementation, this would
    // convert the circuit to Perceval code
    const code = `
# Generated Perceval code
import perceval as pcvl
import numpy as np

# Create circuit
circuit = pcvl.Circuit(${getCircuitModeCount()})

# Add components
${generateComponentCode()}

# Define input state
input_state = pcvl.BasicState([1, 0])

# Run simulation
backend = pcvl.BackendFactory().get_backend("SLOS")
simulator = pcvl.Processor(backend, circuit)
result = simulator.process(input_state)

# Display results
print(result)
`;
    
    if (onGeneratePercevalCode) {
      onGeneratePercevalCode(code);
    }
    
    toast({
      title: "Perceval Code Generated",
      description: "Code has been generated from your circuit design.",
      variant: "default"
    });
  };
  
  // Helper to count number of modes needed for the circuit
  const getCircuitModeCount = (): number => {
    // This is a simplification - in a real implementation this would need
    // to properly analyze the circuit
    return Math.max(
      components.filter(c => c.type === 'single-photon-source' || c.type === 'entangled-source').length * 2,
      2 // Minimum of 2 modes
    );
  };
  
  // Helper to generate Perceval component code
  const generateComponentCode = (): string => {
    // This is a placeholder - in a real implementation this would
    // generate actual Perceval code based on the circuit topology
    return components.map((component, index) => {
      switch (component.type) {
        case 'beamsplitter':
          return `circuit.add((${index}, ${index+1}), pcvl.BS())  # Beam splitter`;
        case 'phaseshift':
          return `circuit.add(${index}, pcvl.PS(${component.params.phase || 0}))  # Phase shifter`;
        default:
          return `# Component: ${component.type} (not implemented in code generation yet)`;
      }
    }).join('\n');
  };
  
  // Simple simulation function that just highlights connections sequentially
  const runSimpleSimulation = () => {
    if (!validateCircuit()) return;
    
    // Find source connections (from photon sources)
    const sourceConnections = connections.filter(conn => 
      conn.sourceComponentId.includes('single-photon-source') || 
      conn.sourceComponentId.includes('entangled-source')
    );
    
    if (sourceConnections.length === 0) {
      toast({
        title: "Simulation Error",
        description: "No photon sources connected in the circuit.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSimulating(true);
    setActiveConnections(sourceConnections.map(c => c.id));
    
    toast({
      title: "Simulation Started",
      description: "Watch the photons flow through your circuit!",
      variant: "default"
    });
    
    // Schedule the next step
    const delay = 1000 / simulationSpeed;
    simulationTimerRef.current = setTimeout(() => {
      simulateStep(sourceConnections);
    }, delay);
  };
  
  // Simulate a step in the circuit
  const simulateStep = (currentConnections: Connection[]) => {
    // Find next connections
    const nextConnections: Connection[] = [];
    
    currentConnections.forEach(connection => {
      // Find connections starting from the target of this connection
      const next = connections.filter(c => c.sourceComponentId === connection.targetComponentId);
      
      if (connection.targetComponentId.includes('beamsplitter')) {
        // For beam splitters, potentially split the photon (add all outgoing connections)
        nextConnections.push(...next);
      } else if (next.length > 0) {
        // For other components, just follow the first connection
        nextConnections.push(next[0]);
      }
    });
    
    if (nextConnections.length === 0) {
      // No more connections, simulation complete
      setIsSimulating(false);
      setActiveConnections([]);
      
      toast({
        title: "Simulation Complete",
        description: "All photons have reached their destinations.",
        variant: "default"
      });
      return;
    }
    
    // Highlight the next set of connections
    setActiveConnections(nextConnections.map(c => c.id));
    
    // Schedule the next step
    const delay = 1000 / simulationSpeed;
    simulationTimerRef.current = setTimeout(() => {
      simulateStep(nextConnections);
    }, delay);
  };
  
  // Start simulation
  const startSimulation = () => {
    if (isSimulating) return;
    runSimpleSimulation();
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (!isSimulating) return;
    
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    
    setIsSimulating(false);
    setActiveConnections([]);
    
    toast({
      title: "Simulation Stopped",
      description: "Simulation has been stopped.",
      variant: "default"
    });
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    };
  }, []);
  
  // Add keyboard shortcuts for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedComponentId) {
        removeSelectedComponent();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId]);
  
  // Get color for a connection based on its source component
  const getConnectionColor = (connectionId: string): string => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return '#4a90e2'; // Default blue
    
    const sourceId = connection.sourceComponentId;
    
    if (sourceId.includes('single-photon-source')) {
      return '#4ade80'; // Green
    } else if (sourceId.includes('entangled-source')) {
      return '#fb7185'; // Red
    } else if (sourceId.includes('beamsplitter')) {
      return '#a78bfa'; // Purple for superposition
    }
    
    return '#4a90e2'; // Default blue
  };
  
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quantum Circuit Designer</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={validateCircuit}
          >
            Validate Circuit
          </Button>
          <Button 
            size="sm"
            onClick={generatePercevalCode}
          >
            Generate Perceval Code
          </Button>
          {isSimulating ? (
            <Button 
              size="sm"
              variant="destructive"
              onClick={stopSimulation}
            >
              Stop Simulation
            </Button>
          ) : (
            <Button 
              size="sm"
              variant="default"
              onClick={startSimulation}
            >
              Run Simulation
            </Button>
          )}
        </div>
      </div>
      
      {/* Component palette */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900 rounded-md">
        <div className="flex flex-col items-center p-2 cursor-pointer hover:bg-slate-800 rounded-md"
             onClick={() => addComponent('single-photon-source')}>
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="6" className="fill-emerald-500/20" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" className="stroke-emerald-400" />
              <circle cx="12" cy="12" r="2" className="fill-emerald-500" />
            </svg>
          </div>
          <span className="text-xs mt-1">Photon Source</span>
        </div>
        
        <div className="flex flex-col items-center p-2 cursor-pointer hover:bg-slate-800 rounded-md"
             onClick={() => addComponent('beamsplitter')}>
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l20 20" className="stroke-blue-400" />
              <rect x="4" y="4" width="16" height="16" rx="2" className="fill-blue-500/20" />
            </svg>
          </div>
          <span className="text-xs mt-1">Beam Splitter</span>
        </div>
        
        <div className="flex flex-col items-center p-2 cursor-pointer hover:bg-slate-800 rounded-md"
             onClick={() => addComponent('phaseshift')}>
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8" className="fill-amber-500/20" />
              <path d="M12 4v16" className="stroke-amber-400" />
            </svg>
          </div>
          <span className="text-xs mt-1">Phase Shifter</span>
        </div>
        
        <div className="flex flex-col items-center p-2 cursor-pointer hover:bg-slate-800 rounded-md"
             onClick={() => addComponent('detector')}>
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2" className="fill-rose-500/20" />
              <path d="M2 22l20-20" className="stroke-rose-400" />
              <path d="M22 22L2 2" className="stroke-rose-400" />
            </svg>
          </div>
          <span className="text-xs mt-1">Detector</span>
        </div>
      </div>
      
      {/* Simulation Speed (only shown when simulating) */}
      {isSimulating && (
        <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-md">
          <span className="text-sm">Simulation Speed:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{simulationSpeed}x</span>
        </div>
      )}
      
      {/* Circuit canvas */}
      <div 
        ref={canvasRef}
        className="relative bg-slate-800 border border-slate-700 rounded-md min-h-[500px] overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map(connection => {
            const isActive = activeConnections.includes(connection.id);
            return (
              <path
                key={connection.id}
                d={getConnectionPath(connection)}
                stroke={isActive ? getConnectionColor(connection.id) : "#4a90e2"}
                strokeWidth={isActive ? "4" : "2"}
                fill="none"
                className={cn(
                  "transition-all duration-200",
                  isActive && "animate-pulse"
                )}
                style={isActive ? {
                  filter: `drop-shadow(0 0 3px ${getConnectionColor(connection.id)})`
                } : undefined}
              />
            );
          })}
          
          {/* Temporary connection line when drawing */}
          {isDrawingConnection && (
            <path
              d={getTempConnectionPath()}
              stroke="#4a90e2"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          )}
        </svg>
        
        {/* Components */}
        {components.map(component => (
          <ConnectableComponent
            key={component.id}
            component={component}
            onSelect={handleSelectComponent}
            onStartConnection={handleStartConnection}
            onPositionChange={handleComponentPositionChange}
            onRotate={handleComponentRotate}
            isSelected={component.id === selectedComponentId}
          />
        ))}
        
        {/* Actions for selected component */}
        {selectedComponentId && (
          <div className="absolute bottom-4 right-4 bg-slate-900 p-2 rounded-md shadow-lg">
            <Button
              size="sm"
              variant="destructive"
              onClick={removeSelectedComponent}
            >
              Delete Component
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
