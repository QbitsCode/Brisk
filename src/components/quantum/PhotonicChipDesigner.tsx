'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CircuitExporter, CircuitValidator } from '@/lib/circuit-utils';
import { Component, Connection, CircuitTemplate } from '@/types/photonic';
import { useToast } from "@/components/ui/use-toast";
import PredefinedCircuits from './examples/PredefinedCircuits';
import TutorialOverlay from './tutorial/TutorialOverlay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ComponentParams {
  [key: string]: number;
}

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  params: ComponentParams;
  ports: {
    input?: { x: number; y: number };
    output?: { x: number; y: number };
    through?: { x: number; y: number };
    drop?: { x: number; y: number };
    o1?: { x: number; y: number };
    o2?: { x: number; y: number };
    o3?: { x: number; y: number };
    o4?: { x: number; y: number };
  };
}

interface Connection {
  source: { component: number; port: string };
  target: { component: number; port: string };
}

interface CircuitTemplate {
  name: string;
  components: Component[];
  connections: Connection[];
}

const COMPONENT_TYPES = {
  // Waveguides
  straight: {
    name: 'Straight Waveguide',
    params: { 
      length: 10, 
      width: 0.5,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#22c55e'
  },
  bend_circular: {
    name: 'Circular Bend',
    params: { 
      radius: 10, 
      width: 0.5,
      angle: 90,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#3b82f6'
  },
  bend_euler: {
    name: 'Euler Bend',
    params: { 
      radius: 10, 
      width: 0.5,
      angle: 90,
      p: 0.5, // Euler parameter
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#1d4ed8'
  },
  // Couplers
  coupler: {
    name: 'Directional Coupler',
    params: { 
      gap: 0.2, 
      length: 10, 
      width: 0.5,
      dx: 10, // Input/output port separation
      dy: 5,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2', 'o3', 'o4'],
    color: '#a855f7'
  },
  mmi1x2: {
    name: 'MMI 1x2',
    params: { 
      width: 2.5, 
      width_taper: 1.0,
      length_taper: 10,
      length_mmi: 5.5,
      width_mmi: 2.5,
      gap_mmi: 0.25,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2', 'o3'],
    color: '#ef4444'
  },
  mmi2x2: {
    name: 'MMI 2x2',
    params: { 
      width: 2.5, 
      width_taper: 1.0,
      length_taper: 10,
      length_mmi: 5.5,
      width_mmi: 2.5,
      gap_mmi: 0.25,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2', 'o3', 'o4'],
    color: '#dc2626'
  },
  // Ring Resonators
  ring: {
    name: 'Ring Resonator',
    params: { 
      radius: 10,
      gap: 0.2,
      width: 0.5,
      length_x: 4,
      length_y: 0,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#f97316'
  },
  ring_double: {
    name: 'Double Ring Resonator',
    params: { 
      radius: 10,
      gap: 0.2,
      gap_ring: 0.2,
      width: 0.5,
      length_x: 4,
      length_y: 0,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#ea580c'
  },
  // Phase Shifters
  mzm: {
    name: 'Mach-Zehnder Modulator',
    params: { 
      length_x: 500,
      length_y: 2,
      delta_length: 0,
      width: 0.5,
      gap: 5.0,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#06b6d4'
  },
  phase_shifter_heater: {
    name: 'Heater Phase Shifter',
    params: { 
      length: 100, 
      width: 0.5,
      heater_width: 2.5,
      heater_gap: 1.0,
      layer: 1,
      heater_layer: 2,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2'],
    color: '#0891b2'
  },
  // Gratings
  grating_coupler_uniform: {
    name: 'Uniform Grating Coupler',
    params: { 
      period: 0.67,
      width: 0.5,
      duty_cycle: 0.5,
      length: 40,
      taper_length: 16.6,
      n_periods: 20,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1'],
    color: '#7c3aed'
  },
  grating_coupler_elliptical: {
    name: 'Elliptical Grating Coupler',
    params: { 
      polarization: 'te',
      taper_length: 16.6,
      taper_angle: 40,
      wavelength: 1.55,
      fiber_angle: 15,
      grating_line_width: 0.343,
      n_periods: 20,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1'],
    color: '#6d28d9'
  },
  // Y-Splitters
  y_splitter: {
    name: 'Y-Splitter',
    params: {
      length: 10,
      width: 0.5,
      length_taper: 5,
      angle: 2.5,
      layer: 1,
      cross_section: 'xs_sc'
    },
    ports: ['o1', 'o2', 'o3'],
    color: '#ec4899'
  }
} as const;

const COMPONENT_SYMBOLS = {
  straight: '━',
  bend_circular: '┗',
  bend_euler: '⌒',
  coupler: '⋈',
  mmi1x2: 'Y',
  mmi2x2: '#',
  ring: '⊕',
  ring_double: '⊗',
  mzm: '⫰',
  phase_shifter_heater: '≋',
  grating_coupler_uniform: '≂',
  grating_coupler_elliptical: '≃',
  y_splitter: '⋎'
};

const CROSS_SECTIONS = [
  { value: 'xs_sc', label: 'Strip (220nm)' },
  { value: 'xs_rc', label: 'Rib (90nm slab)' },
  { value: 'xs_nc', label: 'Nitride Core' },
  { value: 'xs_nw', label: 'Nitride Wire' }
];

const LAYER_STACK = [
  { value: 1, label: 'Si Core (220nm)', color: '#2563eb' },
  { value: 2, label: 'Heater Metal', color: '#dc2626' },
  { value: 3, label: 'Si N Core', color: '#7c3aed' },
  { value: 4, label: 'Via 1', color: '#a16207' },
  { value: 5, label: 'Metal 1', color: '#a3a3a3' }
];

const PREDEFINED_CIRCUITS: CircuitTemplate[] = [
  {
    name: 'Simple Circuit',
    components: [
      {
        id: '1',
        type: 'straight',
        x: 100,
        y: 100,
        rotation: 0,
        params: { length: 10, width: 0.5, layer: 1, cross_section: 'xs_sc' },
        ports: {}
      },
      {
        id: '2',
        type: 'bend_circular',
        x: 200,
        y: 200,
        rotation: 0,
        params: { radius: 10, width: 0.5, angle: 90, layer: 1, cross_section: 'xs_sc' },
        ports: {}
      }
    ],
    connections: [
      { source: { component: 0, port: 'o1' }, target: { component: 1, port: 'o1' } }
    ]
  }
];

export default function PhotonicChipDesigner() {
  const [components, setComponents] = useState<Component[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [connecting, setConnecting] = useState<{ component: Component; port: string } | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [showParams, setShowParams] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const addComponent = (type: keyof typeof COMPONENT_TYPES) => {
    const componentType = COMPONENT_TYPES[type];
    const newComponent: Component = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.random() * 600 + 100,
      y: Math.random() * 200 + 100,
      rotation: 0,
      params: { ...componentType.params },
      ports: {}
    };
    
    const errors = CircuitValidator.validateComponent(newComponent);
    if (errors.length > 0) {
      setErrors(errors);
      setShowErrorDialog(true);
      return;
    }

    setComponents(prev => [...prev, newComponent]);
    toast({
      title: "Component Added",
      description: `Added new ${componentType.name}`,
    });
  };

  const updateComponentParams = (component: Component, params: ComponentParams) => {
    setComponents(prev =>
      prev.map(c =>
        c.id === component.id
          ? { ...c, params: { ...c.params, ...params } }
          : c
      )
    );
  };

  const drawComponent = (
    ctx: CanvasRenderingContext2D,
    component: Component,
    isSelected: boolean = false
  ) => {
    const radius = 25;
    ctx.save();
    
    // Transform context for rotation
    ctx.translate(component.x, component.y);
    ctx.rotate((component.rotation * Math.PI) / 180);
    
    // Draw component body
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const componentType = COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES];
    ctx.fillStyle = componentType?.color || '#666';
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw symbol
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      COMPONENT_SYMBOLS[component.type as keyof typeof COMPONENT_SYMBOLS] || '?',
      0,
      0
    );

    // Draw ports
    const portRadius = 5;
    Object.entries(componentType?.ports || {}).forEach(([port, _], index) => {
      const angle = (index * 2 * Math.PI) / componentType.ports.length;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(x, y, portRadius, 0, Math.PI * 2);
      ctx.fillStyle = connecting?.component.id === component.id && connecting.port === port
        ? '#fff'
        : '#9ca3af';
      ctx.fill();
      
      // Store port position for connections
      component.ports[port as keyof Component['ports']] = {
        x: component.x + x,
        y: component.y + y
      };
    });
    
    ctx.restore();

    // Draw label below component
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      componentType?.name || 'Unknown',
      component.x,
      component.y + 40
    );
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(conn => {
      const source = components[conn.source.component];
      const target = components[conn.target.component];
      if (source && target) {
        drawConnection(ctx, source.ports[conn.source.port], target.ports[conn.target.port]);
      }
    });

    // Draw temporary connection line
    if (connecting) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = lastMousePos.x - rect.left;
      const mouseY = lastMousePos.y - rect.top;
      drawConnection(ctx, connecting.component.ports[connecting.port], { x: mouseX, y: mouseY });
    }

    // Draw components
    components.forEach(component => {
      drawComponent(
        ctx,
        component,
        connecting?.component.id === component.id || selectedComponent?.id === component.id
      );
    });
  };

  // Track mouse position for drawing temporary connection line
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastMousePos({ x: e.clientX, y: e.clientY });

    if (dragging) {
      setComponents(prev =>
        prev.map(c =>
          c.id === dragging.id
            ? { ...c, x: x - dragging.offsetX, y: y - dragging.offsetY }
            : c
        )
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked component
    const clickedComponent = components.find(c => {
      const dx = c.x - x;
      const dy = c.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clickedComponent) {
      if (!connecting) {
        // Start dragging
        setDragging({
          id: clickedComponent.id,
          offsetX: x - clickedComponent.x,
          offsetY: y - clickedComponent.y
        });
        setSelectedComponent(clickedComponent);
      } else if (connecting.component.id !== clickedComponent.id) {
        // Complete connection
        const sourceIndex = components.findIndex(c => c.id === connecting.component.id);
        const targetIndex = components.findIndex(c => c.id === clickedComponent.id);
        const newConnection = {
          source: { component: sourceIndex, port: connecting.port },
          target: { component: targetIndex, port: 'o1' }
        };

        const errors = CircuitValidator.validateConnection(newConnection, components);
        if (errors.length > 0) {
          setErrors(errors);
          setShowErrorDialog(true);
          return;
        }

        setConnections(prev => [...prev, newConnection]);
        setConnecting(null);
        toast({
          title: "Connected",
          description: "Components connected successfully",
        });
      }
    } else if (connecting) {
      // Cancel connection if clicking empty space
      setConnecting(null);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedComponent = components.find(c => {
      const dx = c.x - x;
      const dy = c.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (!clickedComponent) return;

    if (connecting) {
      if (connecting.component.id !== clickedComponent.id) {
        const sourceIndex = components.findIndex(c => c.id === connecting.component.id);
        const targetIndex = components.findIndex(c => c.id === clickedComponent.id);
        
        const newConnection = {
          source: { component: sourceIndex, port: connecting.port },
          target: { component: targetIndex, port: 'o1' }
        };

        const errors = CircuitValidator.validateConnection(newConnection, components);
        if (errors.length > 0) {
          setErrors(errors);
          setShowErrorDialog(true);
          return;
        }

        setConnections(prev => [...prev, newConnection]);
        setConnecting(null);
        toast({
          title: "Connected",
          description: "Components connected successfully",
        });
      }
    } else {
      setConnecting({ component: clickedComponent, port: 'o1' });
      toast({
        title: "Connecting",
        description: "Click another component to connect",
      });
    }
  };

  // Export functions
  const handleExportJSON = async () => {
    try {
      const design = {
        components,
        connections,
        metadata: {
          name: 'Quantum Circuit Design',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const errors = CircuitValidator.validateCircuit(design);
      if (errors.length > 0) {
        setErrors(errors);
        setShowErrorDialog(true);
        return;
      }

      const jsonString = CircuitExporter.toJSON(design);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quantum-circuit.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Circuit design exported as JSON",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleExportGDSII = async () => {
    try {
      const design = {
        components,
        connections,
        metadata: {
          name: 'Quantum Circuit Design',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const errors = CircuitValidator.validateCircuit(design);
      if (errors.length > 0) {
        setErrors(errors);
        setShowErrorDialog(true);
        return;
      }

      const gdsiiData = await CircuitExporter.toGDSII(design);
      const blob = new Blob([gdsiiData], { type: 'application/x-gdsii' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quantum-circuit.gds';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Circuit design exported as GDSII",
      });
    } catch (error) {
      console.error('GDSII Export Error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Import function
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const design = CircuitExporter.fromJSON(content);
          
          setComponents(design.components);
          setConnections(design.connections);
          
          toast({
            title: "Import Successful",
            description: "Circuit design imported successfully",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLoadCircuit = (circuit: CircuitTemplate) => {
    setComponents(circuit.components);
    setConnections(circuit.connections);
    toast({
      title: "Circuit Loaded",
      description: `Loaded ${circuit.name} successfully.`,
    });
  };

  // Set up animation loop
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [components, connections, connecting, selectedComponent, lastMousePos]);

  return (
    <div className="w-full h-full p-4">
      <Card className="p-4 bg-background border">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 flex-wrap component-buttons">
              {Object.entries(COMPONENT_TYPES).map(([type, config]) => (
                <Button 
                  key={type}
                  onClick={() => addComponent(type as keyof typeof COMPONENT_TYPES)}
                  variant="default"
                  className={`bg-[${config.color}] hover:bg-[${config.color}]/90`}
                >
                  Add {config.name}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <PredefinedCircuits onLoadCircuit={handleLoadCircuit} />
              <Button variant="outline" onClick={() => setShowTutorial(true)}>
                Show Tutorial
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportJSON}>
                  Export JSON
                </Button>
                <Button variant="outline" onClick={handleExportGDSII}>
                  Export GDSII
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                    Import
                  </Button>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[600px] bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a]">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              className="w-full h-full"
              style={{ 
                backgroundColor: '#18181b',
                borderRadius: '8px'
              }}
            />
          </div>

          {selectedComponent && (
            <Dialog open={showParams} onOpenChange={setShowParams}>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Parameters</Button>
              </DialogTrigger>
              <DialogContent className="parameter-panel">
                <DialogHeader>
                  <DialogTitle>
                    {COMPONENT_TYPES[selectedComponent.type as keyof typeof COMPONENT_TYPES]?.name} Parameters
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {Object.entries(selectedComponent.params).map(([param, value]) => (
                    <div key={param} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={param} className="text-right">
                        {param}
                      </Label>
                      <div className="col-span-3">
                        {param === 'layer' ? (
                          <select
                            id={param}
                            value={value}
                            onChange={(e) => {
                              updateComponentParams(selectedComponent, {
                                ...selectedComponent.params,
                                [param]: parseInt(e.target.value)
                              });
                            }}
                          >
                            {LAYER_STACK.map((layer) => (
                              <option key={layer.value} value={layer.value}>
                                {layer.label}
                              </option>
                            ))}
                          </select>
                        ) : param === 'cross_section' ? (
                          <select
                            id={param}
                            value={value}
                            onChange={(e) => {
                              updateComponentParams(selectedComponent, {
                                ...selectedComponent.params,
                                [param]: e.target.value
                              });
                            }}
                          >
                            {CROSS_SECTIONS.map((section) => (
                              <option key={section.value} value={section.value}>
                                {section.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Slider
                            id={param}
                            min={0}
                            max={param.includes('width') ? 5 : 100}
                            step={0.1}
                            value={[value]}
                            onValueChange={([newValue]) => {
                              updateComponentParams(selectedComponent, {
                                ...selectedComponent.params,
                                [param]: newValue
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Circuit Design Errors</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="mt-2 space-y-2">
                    {errors.map((error, index) => (
                      <div key={index} className="text-destructive">
                        • {error}
                      </div>
                    ))}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                  Acknowledge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {showTutorial && (
            <TutorialOverlay
              onComplete={() => setShowTutorial(false)}
              onSkip={() => setShowTutorial(false)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
