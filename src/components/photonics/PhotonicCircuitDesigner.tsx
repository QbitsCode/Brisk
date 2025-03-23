'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface CircuitComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  params: Record<string, number>;
  ports: Record<string, {x: number, y: number}>;
}

interface CircuitConnection {
  source: { componentId: string; port: string };
  target: { componentId: string; port: string };
}

interface CircuitDesign {
  components: CircuitComponent[];
  connections: CircuitConnection[];
}

interface PhotonicCircuitDesignerProps {
  onDesignUpdate: (design: CircuitDesign) => void;
}

const COMPONENT_TYPES = {
  source: { name: 'Source', color: '#22c55e', ports: ['output'] },
  beamsplitter: { name: 'Beam Splitter', color: '#3b82f6', ports: ['input1', 'input2', 'output1', 'output2'] },
  phaseshift: { name: 'Phase Shifter', color: '#f97316', ports: ['input', 'output'] },
  detector: { name: 'Detector', color: '#ef4444', ports: ['input'] },
  mzi: { name: 'Mach-Zehnder Interferometer', color: '#a855f7', ports: ['input1', 'input2', 'output1', 'output2'] },
  ring: { name: 'Ring Resonator', color: '#06b6d4', ports: ['input', 'through', 'drop'] },
};

export default function PhotonicCircuitDesigner({ onDesignUpdate }: PhotonicCircuitDesignerProps) {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [connections, setConnections] = useState<CircuitConnection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<CircuitComponent | null>(null);
  const [connecting, setConnecting] = useState<{componentId: string, port: string} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawCircuit(ctx);
      }
    }
  }, [components, connections, selectedComponent, connecting]);

  const drawCircuit = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw connections
    drawConnections(ctx);
    
    // Draw components
    components.forEach(component => {
      drawComponent(ctx, component, component === selectedComponent);
    });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const gridSize = 20;
    
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    
    ctx.stroke();
  };

  const drawComponent = (ctx: CanvasRenderingContext2D, component: CircuitComponent, isSelected: boolean) => {
    const componentType = COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES];
    const radius = 25;
    
    // Draw component body
    ctx.beginPath();
    ctx.arc(component.x, component.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = componentType.color;
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Draw component label
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(component.type.charAt(0).toUpperCase(), component.x, component.y);
    
    // Draw ports
    const portRadius = 5;
    const portDistance = radius + 5;
    const portPositions = calculatePortPositions(component, portDistance);
    
    Object.entries(portPositions).forEach(([portName, position]) => {
      component.ports[portName] = position;
      
      ctx.beginPath();
      ctx.arc(position.x, position.y, portRadius, 0, Math.PI * 2);
      ctx.fillStyle = connecting && connecting.componentId === component.id && connecting.port === portName
        ? '#facc15' // Highlighted port color
        : '#94a3b8'; // Default port color
      ctx.fill();
    });
  };

  const calculatePortPositions = (component: CircuitComponent, distance: number) => {
    const componentType = COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES];
    const portPositions: Record<string, {x: number, y: number}> = {};
    
    componentType.ports.forEach((port, index) => {
      const angle = (index * 2 * Math.PI) / componentType.ports.length;
      portPositions[port] = {
        x: component.x + distance * Math.cos(angle),
        y: component.y + distance * Math.sin(angle)
      };
    });
    
    return portPositions;
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    connections.forEach(connection => {
      const sourceComponent = components.find(c => c.id === connection.source.componentId);
      const targetComponent = components.find(c => c.id === connection.target.componentId);
      
      if (sourceComponent && targetComponent) {
        const sourcePort = sourceComponent.ports[connection.source.port];
        const targetPort = targetComponent.ports[connection.target.port];
        
        if (sourcePort && targetPort) {
          // Draw connection line
          ctx.beginPath();
          ctx.moveTo(sourcePort.x, sourcePort.y);
          ctx.lineTo(targetPort.x, targetPort.y);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicked on component
    const clickedComponent = components.find(component => {
      const dx = component.x - x;
      const dy = component.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 25; // 25 is component radius
    });
    
    if (clickedComponent) {
      // Select component
      setSelectedComponent(clickedComponent);
      return;
    }
    
    // Check if clicked on port
    for (const component of components) {
      for (const [portName, portPos] of Object.entries(component.ports)) {
        const dx = portPos.x - x;
        const dy = portPos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= 5) { // 5 is port radius
          if (connecting) {
            // Complete connection
            const newConnection: CircuitConnection = {
              source: { componentId: connecting.componentId, port: connecting.port },
              target: { componentId: component.id, port: portName }
            };
            
            setConnections([...connections, newConnection]);
            setConnecting(null);
            
            // Notify parent about design update
            onDesignUpdate({
              components,
              connections: [...connections, newConnection],
            });
            
            return;
          } else {
            // Start connection
            setConnecting({ componentId: component.id, port: portName });
            return;
          }
        }
      }
    }
    
    // Cancel connecting mode if clicked on empty space
    if (connecting) {
      setConnecting(null);
      return;
    }
    
    // Deselect if clicked on empty space
    setSelectedComponent(null);
  };

  const addComponent = (type: keyof typeof COMPONENT_TYPES) => {
    const newComponent: CircuitComponent = {
      id: `component-${Date.now()}`,
      type,
      x: Math.random() * 500 + 100,
      y: Math.random() * 300 + 100,
      params: {},
      ports: {}
    };
    
    const updatedComponents = [...components, newComponent];
    setComponents(updatedComponents);
    
    // Notify parent about design update
    onDesignUpdate({
      components: updatedComponents,
      connections,
    });
    
    toast({
      title: "Component Added",
      description: `Added new ${COMPONENT_TYPES[type].name} to your circuit.`,
    });
  };

  const updateComponentParams = (componentId: string, params: Record<string, number>) => {
    setComponents(components.map(component => 
      component.id === componentId
        ? { ...component, params: { ...component.params, ...params } }
        : component
    ));
  };

  const clearCircuit = () => {
    setComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setConnecting(null);
    
    // Notify parent about design update
    onDesignUpdate({
      components: [],
      connections: [],
    });
    
    toast({
      title: "Circuit Cleared",
      description: "All components and connections have been removed.",
    });
  };

  const simulateCircuit = () => {
    // Prepare design for simulation
    const designData = {
      components: components.map(component => ({
        id: component.id,
        type: component.type,
        params: component.params
      })),
      connections
    };
    
    onDesignUpdate(designData);
    
    toast({
      title: "Design Ready",
      description: "Circuit design is ready for simulation. Switch to the Simulate tab to proceed.",
    });
  };
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Quantum Photonic Circuit Designer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-4">Components</h3>
              <div className="space-y-2">
                {Object.entries(COMPONENT_TYPES).map(([type, info]) => (
                  <Button 
                    key={type} 
                    onClick={() => addComponent(type as keyof typeof COMPONENT_TYPES)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: info.color }}
                    ></div>
                    {info.name}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Actions</h3>
                <Button 
                  onClick={clearCircuit} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear Circuit
                </Button>
                <Button 
                  onClick={simulateCircuit} 
                  className="w-full"
                >
                  Prepare for Simulation
                </Button>
              </div>
              
              {selectedComponent && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Component Properties</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <div className="text-sm">{COMPONENT_TYPES[selectedComponent.type as keyof typeof COMPONENT_TYPES].name}</div>
                    </div>
                    
                    {selectedComponent.type === 'phaseshift' && (
                      <div className="space-y-2">
                        <Label>Phase (π rad)</Label>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[selectedComponent.params.phase || 0]}
                            min={0}
                            max={2}
                            step={0.01}
                            onValueChange={([value]) => updateComponentParams(selectedComponent.id, { phase: value })}
                          />
                          <span className="text-sm">{(selectedComponent.params.phase || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedComponent.type === 'beamsplitter' && (
                      <div className="space-y-2">
                        <Label>Transmittivity</Label>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[selectedComponent.params.transmittivity || 0.5]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) => updateComponentParams(selectedComponent.id, { transmittivity: value })}
                          />
                          <span className="text-sm">{(selectedComponent.params.transmittivity || 0.5).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-3 border rounded-md overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                className="bg-white w-full h-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
