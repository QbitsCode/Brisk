"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Component types
type ComponentType = 'source' | 'beamsplitter' | 'phaseshift' | 'detector';

// Component interface
interface Component {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  params?: {
    [key: string]: any;
  };
}

// Connection interface
interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort: number;
  targetPort: number;
  sourcePos: { x: number, y: number };
  targetPos: { x: number, y: number };
}

// Photon interface for animation
interface Photon {
  id: string;
  position: { x: number, y: number };
  connectionId: string | null;
  active: boolean;
  sourceId: string;
}

/**
 * Enhanced Quantum Circuit Builder with Perceval integration and photon simulation
 */
export default function QuantumCircuitBuilder() {
  // State for components and connections
  const [components, setComponents] = useState<Component[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per step
  const [photons, setPhotons] = useState<Photon[]>([]);
  const [simulationStep, setSimulationStep] = useState(0);
  
  // Technical info display
  const [showPhysicsInfo, setShowPhysicsInfo] = useState(false);
  
  // Code generation
  const [percevalCode, setPercevalCode] = useState<string>('');
  
  // Connection drawing state
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ id: string, port: number, x: number, y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Add a new component to the canvas
  const addComponent = (type: ComponentType) => {
    const id = `component-${Date.now()}`;
    const newComponent: Component = {
      id,
      type,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      width: 70,
      height: 70,
      params: getDefaultParamsForType(type)
    };
    
    setComponents([...components, newComponent]);
    
    // Generate new Perceval code if needed
    if (connections.length > 0) {
      generatePercevalCode([...components, newComponent], connections);
    }
  };
  
  // Get default parameters for component type
  const getDefaultParamsForType = (type: ComponentType) => {
    switch (type) {
      case 'source':
        return { photonRate: 0.5, polarization: 'H' };
      case 'beamsplitter':
        return { reflectivity: 0.5 };
      case 'phaseshift':
        return { phase: 0 };
      case 'detector':
        return { efficiency: 0.9 };
      default:
        return {};
    }
  };
  
  // Delete the selected component
  const deleteSelectedComponent = () => {
    if (!selectedComponent) return;
    
    // Remove the component
    setComponents(components.filter(c => c.id !== selectedComponent));
    
    // Remove any connections involving this component
    setConnections(connections.filter(
      c => c.sourceId !== selectedComponent && c.targetId !== selectedComponent
    ));
    
    setSelectedComponent(null);
    
    // Generate new Perceval code
    generatePercevalCode(
      components.filter(c => c.id !== selectedComponent),
      connections.filter(c => c.sourceId !== selectedComponent && c.targetId !== selectedComponent)
    );
  };
  
  // Handle mouse move on canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
  };
  
  // Start drawing a connection
  const startConnection = (componentId: string, portIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setConnectionStart({ id: componentId, port: portIndex, x, y });
    setIsDrawingConnection(true);
  };
  
  // Complete a connection on mouse up
  const completeConnection = (componentId: string, portIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isDrawingConnection || !connectionStart || connectionStart.id === componentId) {
      setIsDrawingConnection(false);
      setConnectionStart(null);
      return;
    }
    
    // Create the connection
    const sourceComponent = components.find(c => c.id === connectionStart.id);
    const targetComponent = components.find(c => c.id === componentId);
    
    if (sourceComponent && targetComponent) {
      // Only allow connections from outputs to inputs
      // Sources can only be outputs, detectors can only be inputs
      if (
        (sourceComponent.type === 'detector') ||
        (targetComponent.type === 'source')
      ) {
        setIsDrawingConnection(false);
        setConnectionStart(null);
        return;
      }
      
      // Calculate connection points
      const sourceX = sourceComponent.x + sourceComponent.width;
      const sourceY = sourceComponent.y + sourceComponent.height / 2;
      
      const targetX = targetComponent.x;
      const targetY = targetComponent.y + targetComponent.height / 2;
      
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        sourceId: connectionStart.id,
        targetId: componentId,
        sourcePort: connectionStart.port,
        targetPort: portIndex,
        sourcePos: { x: sourceX, y: sourceY },
        targetPos: { x: targetX, y: targetY }
      };
      
      setConnections([...connections, newConnection]);
      
      // Generate new Perceval code
      generatePercevalCode([...components], [...connections, newConnection]);
    }
    
    setIsDrawingConnection(false);
    setConnectionStart(null);
  };
  
  // Cancel connection on canvas click
  const cancelConnection = () => {
    setIsDrawingConnection(false);
    setConnectionStart(null);
  };
  
  // Update connection positions when components move
  useEffect(() => {
    // Update connections when components move
    const updatedConnections = connections.map(conn => {
      const sourceComponent = components.find(c => c.id === conn.sourceId);
      const targetComponent = components.find(c => c.id === conn.targetId);
      
      if (!sourceComponent || !targetComponent) return conn;
      
      const sourceX = sourceComponent.x + sourceComponent.width;
      const sourceY = sourceComponent.y + sourceComponent.height / 2;
      
      const targetX = targetComponent.x;
      const targetY = targetComponent.y + targetComponent.height / 2;
      
      return {
        ...conn,
        sourcePos: { x: sourceX, y: sourceY },
        targetPos: { x: targetX, y: targetY }
      };
    });
    
    setConnections(updatedConnections);
    
    // Generate new Perceval code
    if (components.length > 0) {
      generatePercevalCode(components, updatedConnections);
    }
  }, [components]);
  
  // Start simulation with photon animation
  const startSimulation = () => {
    if (isSimulating) return;
    
    // Clear any existing photons
    setPhotons([]);
    setSimulationStep(0);
    
    // Find all source components
    const sources = components.filter(comp => comp.type === 'source');
    
    if (sources.length === 0) {
      alert("Cannot simulate: No photon sources found in the circuit.");
      return;
    }
    
    setIsSimulating(true);
    
    // Create initial photons at each source
    const initialPhotons = sources.map(source => ({
      id: `photon-${source.id}-${Date.now()}`,
      position: { 
        x: source.x + source.width,
        y: source.y + source.height / 2
      },
      connectionId: null,
      active: true,
      sourceId: source.id
    }));
    
    setPhotons(initialPhotons);
    
    // Start simulation interval
    simulationInterval.current = setInterval(() => {
      setSimulationStep(step => step + 1);
    }, simulationSpeed);
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsSimulating(false);
  };
  
  // Update photon positions during simulation
  useEffect(() => {
    if (!isSimulating) return;
    
    // Update photon positions based on current step
    setPhotons(prevPhotons => {
      return prevPhotons.map(photon => {
        if (!photon.active) return photon;
        
        // If photon is not on a connection, find an outgoing connection from its source
        if (photon.connectionId === null) {
          const outgoingConnection = connections.find(conn => conn.sourceId === photon.sourceId);
          
          if (outgoingConnection) {
            return {
              ...photon,
              connectionId: outgoingConnection.id,
              position: { ...outgoingConnection.sourcePos }
            };
          } else {
            // No outgoing connection, photon remains at source
            return photon;
          }
        }
        
        // Photon is on a connection, animate it
        const connection = connections.find(conn => conn.id === photon.connectionId);
        if (!connection) return { ...photon, active: false };
        
        // Calculate position along the bezier curve
        // Use simulation speed to adjust how far along the curve the photon moves
        const adjustedStep = simulationStep % Math.round(10 * (1000 / simulationSpeed));
        const progress = adjustedStep / Math.round(10 * (1000 / simulationSpeed));
        
        const dx = connection.targetPos.x - connection.sourcePos.x;
        const midX = connection.sourcePos.x + dx / 2;
        
        // Parametric equation for cubic bezier curve (simplified)
        const t = progress;
        const x = (1-t)*(1-t)*(1-t)*connection.sourcePos.x + 
                 3*(1-t)*(1-t)*t*midX + 
                 3*(1-t)*t*t*midX + 
                 t*t*t*connection.targetPos.x;
                 
        const y = (1-t)*(1-t)*(1-t)*connection.sourcePos.y + 
                 3*(1-t)*(1-t)*t*connection.sourcePos.y + 
                 3*(1-t)*t*t*connection.targetPos.y + 
                 t*t*t*connection.targetPos.y;
        
        // If photon reached the end of the connection
        if (progress >= 0.99) {
          // Find the target component and check if it's a detector
          const targetComponent = components.find(comp => comp.id === connection.targetId);
          
          if (targetComponent?.type === 'detector') {
            // Photon detected - deactivate it
            return { ...photon, position: { x, y }, active: false };
          }
          
          // Find next connection
          const nextConnection = connections.find(conn => conn.sourceId === connection.targetId);
          if (nextConnection) {
            // Move to next connection
            return {
              ...photon,
              position: { x, y },
              connectionId: nextConnection.id,
              sourceId: connection.targetId
            };
          } else {
            // No outgoing connection, deactivate photon
            return { ...photon, position: { x, y }, active: false };
          }
        }
        
        // Update position
        return { ...photon, position: { x, y } };
      });
    });
    
    // Generate new photons from sources every 10 steps
    if (simulationStep % 10 === 0 && simulationStep > 0) {
      // Find all source components
      const sources = components.filter(comp => comp.type === 'source');
      
      // Chance to emit a new photon based on rate
      const newPhotons = sources.flatMap(source => {
        const rate = source.params?.photonRate || 0.5;
        const shouldEmit = Math.random() < rate;
        
        if (shouldEmit) {
          return [{
            id: `photon-${source.id}-${Date.now()}`,
            position: { 
              x: source.x + source.width, 
              y: source.y + source.height / 2 
            },
            connectionId: null,
            active: true,
            sourceId: source.id
          }];
        }
        
        return [];
      });
      
      if (newPhotons.length > 0) {
        setPhotons(prevPhotons => [...prevPhotons, ...newPhotons]);
      }
    }
  }, [simulationStep, isSimulating, simulationSpeed]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);
  
  // Add keyboard shortcut for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedComponent) {
        deleteSelectedComponent();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent]);
  
  // Physics Information Panel 
  const PhysicsInfoPanel = () => {
    const activeSources = components.filter(c => c.type === 'source').length;
    const activeBeamSplitters = components.filter(c => c.type === 'beamsplitter').length;
    const activePhaseShifters = components.filter(c => c.type === 'phaseshift').length;
    const activeDetectors = components.filter(c => c.type === 'detector').length;
    const activePhotons = photons.filter(p => p.active).length;
    
    // Calculate theoretical detection probabilities for a very basic circuit
    let detectionProbability = "N/A";
    if (activeBeamSplitters === 1 && activeSources === 1 && activeDetectors >= 1) {
      const bs = components.find(c => c.type === 'beamsplitter');
      const reflectivity = bs?.params?.reflectivity || 0.5;
      detectionProbability = `${Math.round((1-reflectivity)*100)}% / ${Math.round(reflectivity*100)}%`;
    }
    
    return (
      <Card className="mt-4 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Quantum Physics Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold">Circuit Properties</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>Active Sources: {activeSources}</li>
              <li>Beam Splitters: {activeBeamSplitters}</li>
              <li>Phase Shifters: {activePhaseShifters}</li>
              <li>Detectors: {activeDetectors}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Simulation Data</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>Active Photons: {activePhotons}</li>
              <li>Simulation Speed: {(1000/simulationSpeed).toFixed(1)}x</li>
              <li>Detection Probability: {detectionProbability}</li>
              <li>Simulation Steps: {simulationStep}</li>
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="font-semibold">Physics Notes</h4>
            <p className="text-gray-300 text-xs mt-1">
              This simulation uses a simplified model of quantum photonics. In real quantum systems:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300 text-xs">
              <li>Photons travel at c ≈ 3×10⁸ m/s in vacuum</li>
              <li>Quantum superposition allows photons to exist in multiple states simultaneously</li>
              <li>Photon behavior demonstrates wave-particle duality</li>
              <li>Quantum entanglement enables non-classical correlations between photons</li>
            </ul>
          </div>
        </div>
      </Card>
    );
  };
  
  // Get connection path for SVG
  const getConnectionPath = (conn: Connection) => {
    const dx = conn.targetPos.x - conn.sourcePos.x;
    const midX = conn.sourcePos.x + dx / 2;
    
    return `M ${conn.sourcePos.x} ${conn.sourcePos.y} C ${midX} ${conn.sourcePos.y}, ${midX} ${conn.targetPos.y}, ${conn.targetPos.x} ${conn.targetPos.y}`;
  };
  
  // Get temporary connection path
  const getTempConnectionPath = () => {
    if (!connectionStart) return '';
    
    const dx = mousePos.x - connectionStart.x;
    const midX = connectionStart.x + dx / 2;
    
    return `M ${connectionStart.x} ${connectionStart.y} C ${midX} ${connectionStart.y}, ${midX} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`;
  };
  
  // Generate Perceval code
  const generatePercevalCode = (components: Component[], connections: Connection[]) => {
    let code = `import perceval as pcvl

# Create a new circuit
circuit = pcvl.Circuit(m=2, n=2)

`;
    
    // Add component definitions
    components.forEach(component => {
      switch (component.type) {
        case 'source':
          code += `# Add single-photon source
source_${component.id} = pcvl.Source(${component.params?.polarization || 'H'})
`;
          break;
        case 'beamsplitter':
          code += `# Add beam splitter with reflectivity ${component.params?.reflectivity || 0.5}
bs_${component.id} = pcvl.BS(${component.params?.reflectivity || 0.5})
`;
          break;
        case 'phaseshift':
          code += `# Add phase shifter with phase ${component.params?.phase || 0}
ps_${component.id} = pcvl.PS(${component.params?.phase || 0})
`;
          break;
        case 'detector':
          code += `# Add detector with efficiency ${component.params?.efficiency || 0.9}
detector_${component.id} = pcvl.Detector(efficiency=${component.params?.efficiency || 0.9})
`;
          break;
      }
    });
    
    // Add connections
    code += `\n# Add connections\n`;
    connections.forEach(conn => {
      const source = components.find(c => c.id === conn.sourceId);
      const target = components.find(c => c.id === conn.targetId);
      
      if (source && target) {
        code += `circuit.add(${getComponentVarName(source)}, ${getComponentVarName(target)}, ${conn.sourcePort}, ${conn.targetPort})\n`;
      }
    });
    
    // Add simulation code
    code += `
# Simulate the circuit
simulator = pcvl.Simulator(circuit)
result = simulator.simulate()

# Print the result
print(result)
`;
    
    setPercevalCode(code);
  };
  
  // Helper to get variable name for component
  const getComponentVarName = (component: Component) => {
    switch (component.type) {
      case 'source': return `source_${component.id}`;
      case 'beamsplitter': return `bs_${component.id}`;
      case 'phaseshift': return `ps_${component.id}`;
      case 'detector': return `detector_${component.id}`;
      default: return `component_${component.id}`;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quantum Circuit Builder</h1>
      <p className="text-gray-300 mb-4">
        Create your quantum circuit by adding components and connecting them.
      </p>
      
      <Tabs defaultValue="designer" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="designer">Circuit Designer</TabsTrigger>
          <TabsTrigger value="code">Perceval Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="designer" className="space-y-4">
          {/* Component Palette */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => addComponent('source')} variant="outline">
              Add Source
            </Button>
            <Button onClick={() => addComponent('beamsplitter')} variant="outline">
              Add Beam Splitter
            </Button>
            <Button onClick={() => addComponent('phaseshift')} variant="outline">
              Add Phase Shifter
            </Button>
            <Button onClick={() => addComponent('detector')} variant="outline">
              Add Detector
            </Button>
            {selectedComponent && (
              <Button onClick={deleteSelectedComponent} variant="destructive">
                Delete Selected
              </Button>
            )}
            
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
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPhysicsInfo(!showPhysicsInfo)}
                    className="mr-2"
                  >
                    {showPhysicsInfo ? 'Hide Physics Info' : 'Show Physics Info'}
                  </Button>
                  <Button onClick={stopSimulation} variant="destructive">
                    Stop Simulation
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPhysicsInfo(!showPhysicsInfo)}
                    className="mr-2"
                  >
                    {showPhysicsInfo ? 'Hide Physics Info' : 'Show Physics Info'}
                  </Button>
                  <Button 
                    onClick={startSimulation} 
                    variant="default"
                    disabled={components.length === 0}
                  >
                    Start Simulation
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Circuit Canvas */}
          <div
            ref={canvasRef}
            className="relative bg-slate-900 border border-slate-700 rounded-lg min-h-[500px] w-full"
            onMouseMove={handleMouseMove}
            onClick={cancelConnection}
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Existing Connections */}
              {connections.map(conn => (
                <path
                  key={conn.id}
                  d={getConnectionPath(conn)}
                  stroke="#60a5fa"
                  strokeWidth="2"
                  fill="none"
                />
              ))}
              
              {/* Connection being drawn */}
              {isDrawingConnection && connectionStart && (
                <path
                  d={getTempConnectionPath()}
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />
              )}
            </svg>
            
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
                  // FIX: Improved drag handler to ensure BS components are draggable
                  // The issue with BS not moving is here - we need to properly handle events
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
            
            {/* Photons for animation */}
            {photons.map(photon => (
              photon.active && (
                <div
                  key={photon.id}
                  className="absolute w-4 h-4 bg-yellow-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg shadow-yellow-300/50"
                  style={{
                    left: photon.position.x,
                    top: photon.position.y,
                    transition: `all ${simulationSpeed / 3000}s ease`
                  }}
                />
              )
            ))}
          </div>
          
          {/* Technical Information */}
          {showPhysicsInfo && <PhysicsInfoPanel />}
        </TabsContent>
        
        <TabsContent value="code" className="space-y-4">
          <Card className="p-4 bg-slate-900">
            <h3 className="text-lg font-semibold mb-2">Generated Perceval Code</h3>
            <pre className="bg-slate-950 p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm text-gray-300">
              {percevalCode || 'Build a circuit in the Designer tab to generate Perceval code.'}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
