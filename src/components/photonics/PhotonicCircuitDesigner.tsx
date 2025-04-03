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
  params: Record<string, any>;
  ports: Record<string, {x: number, y: number}>;
  rotation: number;
  width: number;
  height: number;
  label: string;
  description?: string;
  quantumProperties?: {
    transmissionRate?: number;
    reflectionRate?: number;
    phaseShift?: number;
    wavelength?: number;
    fidelity?: number;
  };
}

interface CircuitConnection {
  id: string;
  source: { componentId: string; port: string };
  target: { componentId: string; port: string };
  path: Array<{x: number, y: number}>;
  properties: {
    lossRate?: number;
    propagationDelay?: number;
    photonMode?: 'single' | 'entangled' | 'squeezed';
    waveguideType?: 'strip' | 'ridge' | 'slot';
  };
}

interface CircuitDesign {
  components: CircuitComponent[];
  connections: CircuitConnection[];
  metadata: {
    name: string;
    description: string;
    version: string;
    lastModified: Date;
    author: string;
    quantumProperties: {
      operatingWavelength: number;
      temperatureK: number;
      simulationType: 'ideal' | 'thermal-noise' | 'fabrication-variation';
    };
  };
}

const COMPONENT_TYPES = {
  singlePhotonSource: { 
    name: 'Single Photon Source', 
    color: '#22c55e', 
    ports: ['output'],
    params: {
      wavelength: 1550, // nm
      purity: 0.99,
      efficiency: 0.85,
      repetitionRate: 80, // MHz
      linewidth: 0.1, // nm
    },
    description: 'Deterministic source of single photons',
  },
  
  beamsplitter: { 
    name: 'Beam Splitter', 
    color: '#3b82f6', 
    ports: ['input1', 'input2', 'output1', 'output2'],
    params: {
      splittingRatio: 0.5, // 50:50 by default
      phase: 0, // radians
      waveguideWidth: 450, // nm
      couplingLength: 10, // μm
    },
    description: 'Splits or combines optical paths with defined ratio',
  },
  
  phaseShifter: { 
    name: 'Phase Shifter', 
    color: '#f97316', 
    ports: ['input', 'output'],
    params: {
      phaseShift: 0, // 0 to 2π
      controlVoltage: 0, // V
      length: 100, // μm
      efficiency: 0.9, // V·cm
    },
    description: 'Adjusts the phase of photons passing through',
  },
  
  spdDetector: { 
    name: 'Single Photon Detector', 
    color: '#ef4444', 
    ports: ['input'],
    params: {
      efficiency: 0.9,
      darkCount: 100, // Hz
      deadTime: 50, // ns
      timingJitter: 35, // ps
    },
    description: 'Superconducting nanowire single-photon detector',
  },
  
  mzi: { 
    name: 'Mach-Zehnder Interferometer', 
    color: '#a855f7', 
    ports: ['input1', 'input2', 'output1', 'output2'],
    params: {
      deltaLength: 30, // μm
      phaseShift: 0, // radians
      symmetry: 1.0, // 1.0 means perfect symmetry
      splitterType: 'MMI', // 'MMI' or 'Directional'
    },
    description: 'Two-path interferometer for phase measurements',
  },
  
  ringResonator: { 
    name: 'Ring Resonator', 
    color: '#06b6d4', 
    ports: ['input', 'through', 'drop'],
    params: {
      radius: 10, // μm
      couplingCoefficient: 0.1,
      FSR: 5, // nm (Free Spectral Range)
      Q: 10000, // Quality factor
      finesse: 100,
    },
    description: 'Wavelength-selective resonator',
  },
  
  entangledSource: { 
    name: 'Entangled Photon Source', 
    color: '#16a34a', 
    ports: ['outputA', 'outputB'],
    params: {
      pairRate: 1000000, // pairs/s
      wavelength: 1550, // nm
      entanglementFidelity: 0.98,
      brightnessPerMW: 200000, // pairs/s/mW
      pumpPower: 5, // mW
    },
    description: 'Generates entangled photon pairs',
  },
  
  cnot: { 
    name: 'CNOT Gate', 
    color: '#fbbf24', 
    ports: ['control_in', 'target_in', 'control_out', 'target_out'],
    params: {
      fidelity: 0.95,
      successProbability: 0.33,
      operationTime: 100, // ns
    },
    description: 'Two-qubit Controlled-NOT quantum gate',
  },
  
  polarizer: { 
    name: 'Polarizer', 
    color: '#7dd3fc', 
    ports: ['input', 'output'],
    params: {
      angle: 0, // degrees
      extinction: 1000, // extinction ratio
    },
    description: 'Filters photons based on polarization',
  },
  
  quantumMemory: { 
    name: 'Quantum Memory', 
    color: '#38bdf8', 
    ports: ['input', 'output'],
    params: {
      storageTime: 1000, // ns
      fidelity: 0.9,
      efficiency: 0.7,
      bandwidth: 1, // GHz
    },
    description: 'Stores quantum states temporarily',
  },
};

export default function PhotonicCircuitDesigner({ onDesignUpdate }: { onDesignUpdate: (design: CircuitDesign) => void }) {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [connections, setConnections] = useState<CircuitConnection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<CircuitComponent | null>(null);
  const [connecting, setConnecting] = useState<{componentId: string, port: string} | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<CircuitComponent | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // State for simulation
  const [simulating, setSimulating] = useState<boolean>(false);
  const [photons, setPhotons] = useState<Array<{
    id: string;
    sourceId: string;
    position: { x: number, y: number };
    path: Array<{ x: number, y: number }>;
    currentPathIndex: number;
    wavelength: number;
    state: 'propagating' | 'detected' | 'lost';
  }>>([]);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(5);
  const simulationRef = useRef<number | null>(null);

  // Ref to track the last known component positions to avoid infinite update loops
  const lastComponentPositionsRef = useRef<Record<string, {x: number, y: number}>>({});

  // Mouse position tracking for connection drawing
  const [mousePosition, setMousePosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawCircuit(ctx);
      }
    }
    
    onDesignUpdate({
      components,
      connections,
      metadata: {
        name: "Quantum Photonic Circuit",
        description: "Advanced photonic quantum circuit design",
        version: "1.0.0",
        lastModified: new Date(),
        author: "Brisk Quantum Designer",
        quantumProperties: {
          operatingWavelength: 1550, // nm
          temperatureK: 4, // K
          simulationType: 'ideal'
        }
      }
    });
  }, [components, connections, selectedComponent, connecting]);

  useEffect(() => {
    // Check if any component positions have actually changed
    let positionsChanged = false;
    const currentPositions: Record<string, {x: number, y: number}> = {};
    
    components.forEach(component => {
      currentPositions[component.id] = { x: component.x, y: component.y };
      
      const lastPosition = lastComponentPositionsRef.current[component.id];
      if (!lastPosition || lastPosition.x !== component.x || lastPosition.y !== component.y) {
        positionsChanged = true;
      }
    });
    
    // Only update ports if positions have changed or new components were added
    if (positionsChanged || Object.keys(currentPositions).length !== Object.keys(lastComponentPositionsRef.current).length) {
      // Update last known positions
      lastComponentPositionsRef.current = currentPositions;
      
      // Updated port positions for all components
      const updatedComponents = components.map(component => {
        const componentType = COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES];
        if (!componentType) return component;
        
        // Calculate port positions based on component position
        const portPositions: Record<string, {x: number, y: number}> = {};
        
        componentType.ports.forEach((portName, index) => {
          // Calculate port positions based on component type and orientation
          let portX = component.x;
          let portY = component.y;
          const radius = 25; // Distance from center to port
          
          if (component.type.includes('beamsplitter')) {
            // Beam splitter has 4 ports at corners
            if (portName === 'input1') {
              portX = component.x - radius;
              portY = component.y - radius;
            } else if (portName === 'input2') {
              portX = component.x - radius;
              portY = component.y + radius;
            } else if (portName === 'output1') {
              portX = component.x + radius;
              portY = component.y - radius;
            } else if (portName === 'output2') {
              portX = component.x + radius;
              portY = component.y + radius;
            }
          } else if (component.type.includes('mzi')) {
            // MZI has ports on the sides
            if (portName === 'input') {
              portX = component.x - radius;
              portY = component.y;
            } else if (portName === 'output') {
              portX = component.x + radius;
              portY = component.y;
            }
          } else if (component.type.includes('ring')) {
            // Ring resonator has through and drop ports
            if (portName === 'input') {
              portX = component.x - radius;
              portY = component.y;
            } else if (portName === 'through') {
              portX = component.x + radius;
              portY = component.y;
            } else if (portName === 'drop') {
              portX = component.x;
              portY = component.y + radius;
            }
          } else if (component.type.includes('Source')) {
            // Sources typically only have output port(s)
            if (component.type.includes('Entangled')) {
              if (portName === 'outputA') {
                portX = component.x + radius;
                portY = component.y - radius/2;
              } else if (portName === 'outputB') {
                portX = component.x + radius;
                portY = component.y + radius/2;
              }
            } else {
              // Single photon source
              portX = component.x + radius;
              portY = component.y;
            }
          } else if (component.type.includes('Detector')) {
            // Detectors only have input port(s)
            portX = component.x - radius;
            portY = component.y;
          } else {
            // Default positioning for other components
            const angle = (index / componentType.ports.length) * 2 * Math.PI;
            portX = component.x + radius * Math.cos(angle);
            portY = component.y + radius * Math.sin(angle);
          }
          
          portPositions[portName] = { x: portX, y: portY };
        });
        
        return {
          ...component,
          ports: portPositions
        };
      });
      
      // Update components without causing a re-render loop
      setComponents(updatedComponents);
    }
  }, [components]);

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
    
    // Draw photons if simulating
    if (simulating) {
      drawPhotons(ctx);
    }
    
    // Draw connection in progress
    if (connecting) {
      const component = components.find(c => c.id === connecting.componentId);
      if (component) {
        const port = component.ports[connecting.port];
        if (port) {
          ctx.beginPath();
          ctx.moveTo(port.x, port.y);
          ctx.lineTo(mousePosition.x, mousePosition.y);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
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
    if (!componentType) return;
    
    const x = component.x;
    const y = component.y;
    const radius = 20;
    
    // Draw selection indicator if selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw based on component type
    if (component.type === 'singlePhotonSource') {
      // Single Photon Source
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw emission lines
      const rays = 7;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        ctx.lineTo(x + (radius + 10) * Math.cos(angle), y + (radius + 10) * Math.sin(angle));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw photon symbol
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('γ', x, y);
      
    } else if (component.type === 'entangledPhotonSource') {
      // Entangled Photon Source
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw entangled photon symbol (infinity-like)
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.bezierCurveTo(-15, -10, -5, -10, -5, 0);
      ctx.bezierCurveTo(-5, 10, -15, 10, -15, 0);
      ctx.moveTo(15, 0);
      ctx.bezierCurveTo(15, -10, 5, -10, 5, 0);
      ctx.bezierCurveTo(5, 10, 15, 10, 15, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw entanglement line
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, 0);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
    } else if (component.type === 'beamsplitter') {
      // Beam Splitter
      ctx.beginPath();
      ctx.moveTo(x - radius, y - radius);
      ctx.lineTo(x + radius, y - radius);
      ctx.lineTo(x + radius, y + radius);
      ctx.lineTo(x - radius, y + radius);
      ctx.closePath();
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw splitting line
      ctx.beginPath();
      ctx.moveTo(x - radius, y - radius);
      ctx.lineTo(x + radius, y + radius);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
    } else if (component.type === 'phaseShifter') {
      // Phase Shifter
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw phi symbol
      ctx.fillStyle = 'white';
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('φ', x, y);
      
    } else if (component.type === 'singlePhotonDetector') {
      // Single Photon Detector
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw detector icon
      ctx.beginPath();
      ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw detection lines
      ctx.beginPath();
      ctx.moveTo(x - radius/2, y - radius/2);
      ctx.lineTo(x + radius/2, y + radius/2);
      ctx.moveTo(x - radius/2, y + radius/2);
      ctx.lineTo(x + radius/2, y - radius/2);
      ctx.stroke();
      
    } else if (component.type === 'mzi') {
      // Mach-Zehnder Interferometer
      ctx.beginPath();
      ctx.roundRect(x - radius, y - radius/2, radius * 2, radius, 5);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw MZI internal structure
      ctx.beginPath();
      ctx.moveTo(x - radius + 5, y - radius/4);
      ctx.lineTo(x + radius - 5, y - radius/4);
      ctx.moveTo(x - radius + 5, y + radius/4);
      ctx.lineTo(x + radius - 5, y + radius/4);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
    } else if (component.type === 'ringResonator') {
      // Ring Resonator
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'transparent';
      ctx.strokeStyle = componentType.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw waveguide
      ctx.beginPath();
      ctx.moveTo(x - radius - 10, y);
      ctx.lineTo(x + radius + 10, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
    } else if (component.type === 'cnot') {
      // CNOT Gate
      ctx.beginPath();
      ctx.roundRect(x - radius, y - radius, radius * 2, radius * 2, 5);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw CNOT symbol
      ctx.beginPath();
      ctx.arc(x, y - radius/3, radius/3, 0, Math.PI * 2);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + radius/2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y + radius/2, radius/4, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.stroke();
      
    } else if (component.type === 'polarizer') {
      // Polarizer
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius/2, 0, 0, Math.PI * 2);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw polarization lines
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - radius/2, y + i * 3);
        ctx.lineTo(x + radius/2, y + i * 3);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
    } else if (component.type === 'quantumMemory') {
      // Quantum Memory
      ctx.beginPath();
      ctx.roundRect(x - radius, y - radius, radius * 2, radius * 2, 5);
      ctx.fillStyle = componentType.color;
      ctx.fill();
      
      // Draw memory symbol
      ctx.fillStyle = 'white';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', x, y);
    } else {
      // Default drawing for unknown components
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = componentType?.color || '#64748b';
      ctx.fill();
    }
    
    // Draw ports
    Object.entries(component.ports).forEach(([portName, portPos]) => {
      ctx.beginPath();
      ctx.arc(portPos.x, portPos.y, 4, 0, Math.PI * 2);
      
      // Color ports differently based on type
      if (portName.includes('input')) {
        ctx.fillStyle = '#f97316'; // Orange for inputs
      } else if (portName.includes('output')) {
        ctx.fillStyle = '#22c55e'; // Green for outputs
      } else {
        ctx.fillStyle = '#a1a1aa'; // Gray for other ports
      }
      
      ctx.fill();
      
      // Highlight port if we're connecting to/from it
      if (connecting && connecting.componentId === component.id && connecting.port === portName) {
        ctx.beginPath();
        ctx.arc(portPos.x, portPos.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Draw label below component
    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(component.label, x, y + radius + 12);
  };
  
  // Helper functions for drawing different component types
  const drawDefaultComponent = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const radius = 25;
    
    // Draw component body
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };
  
  const drawSinglePhotonSource = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const size = 30;
    
    // Draw base
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw light emission
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (size + 10), Math.sin(angle) * (size + 10));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw photon symbol
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('γ', 0, 0);
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  
  const drawEntangledSource = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const size = 30;
    
    // Draw base
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw entangled photons symbol (infinity-like)
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.bezierCurveTo(-15, -10, -5, -10, -5, 0);
    ctx.bezierCurveTo(-5, 10, -15, 10, -15, 0);
    ctx.moveTo(15, 0);
    ctx.bezierCurveTo(15, -10, 5, -10, 5, 0);
    ctx.bezierCurveTo(5, 10, 15, 10, 15, 0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw entanglement line
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  
  const drawBeamSplitter = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const size = 25;
    
    // Draw diamond shape
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw diagonal line indicating splitting surface
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -size - 5);
      ctx.lineTo(size + 5, 0);
      ctx.lineTo(0, size + 5);
      ctx.lineTo(-size - 5, 0);
      ctx.closePath();
      ctx.stroke();
    }
  };
  
  const drawPhaseShifter = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const width = 40;
    const height = 20;
    
    // Draw rectangle
    ctx.beginPath();
    ctx.rect(-width/2, -height/2, width, height);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw phase symbol (Greek phi φ)
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('φ', 0, 0);
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-width/2 - 3, -height/2 - 3, width + 6, height + 6);
      ctx.stroke();
    }
  };
  
  const drawDetector = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const size = 30;
    
    // Draw semicircle
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw detector elements
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw detector symbol
    ctx.beginPath();
    ctx.arc(0, -10, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size + 5, Math.PI, 0, true);
      ctx.lineTo(-size - 5, 0);
      ctx.stroke();
    }
  };
  
  const drawMZI = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const width = 50;
    const height = 30;
    
    // Draw outer rectangle
    ctx.beginPath();
    ctx.rect(-width/2, -height/2, width, height);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw internal MZI structure
    ctx.beginPath();
    // Upper path
    ctx.moveTo(-width/2, -height/4);
    ctx.lineTo(-width/4, -height/4);
    ctx.lineTo(0, -height/3);
    ctx.lineTo(width/4, -height/4);
    ctx.lineTo(width/2, -height/4);
    // Lower path
    ctx.moveTo(-width/2, height/4);
    ctx.lineTo(-width/4, height/4);
    ctx.lineTo(0, height/3);
    ctx.lineTo(width/4, height/4);
    ctx.lineTo(width/2, height/4);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-width/2 - 3, -height/2 - 3, width + 6, height + 6);
      ctx.stroke();
    }
  };
  
  const drawRingResonator = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const ringSize = 20;
    const lineLength = 30;
    
    // Draw connecting waveguide
    ctx.beginPath();
    ctx.moveTo(-lineLength, 0);
    ctx.lineTo(lineLength, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw ring
    ctx.beginPath();
    ctx.arc(0, -ringSize - 5, ringSize, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw coupling region
    ctx.beginPath();
    ctx.moveTo(-ringSize/2, 0);
    ctx.lineTo(ringSize/2, 0);
    ctx.lineTo(ringSize/2, -5);
    ctx.lineTo(-ringSize/2, -5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -ringSize - 5, ringSize + 5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.rect(-lineLength - 5, -10, lineLength * 2 + 10, 20);
      ctx.stroke();
    }
  };
  
  const drawCNOTGate = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const size = 30;
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw CNOT symbol (⊕)
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.moveTo(0, -15);
    ctx.lineTo(0, 15);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw circle around the plus
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  
  const drawPolarizer = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const size = 25;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw polarizer symbol (arrow with line)
    ctx.beginPath();
    // Arrow
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.moveTo(10, -5);
    ctx.lineTo(15, 0);
    ctx.lineTo(10, 5);
    // Vertical lines (polarizer grating)
    for (let i = -12; i <= 12; i += 6) {
      ctx.moveTo(i, -12);
      ctx.lineTo(i, 12);
    }
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  
  const drawQuantumMemory = (ctx: CanvasRenderingContext2D, color: string, isSelected: boolean) => {
    const width = 40;
    const height = 30;
    
    // Draw base rectangle
    ctx.beginPath();
    ctx.rect(-width/2, -height/2, width, height);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw memory symbol
    ctx.beginPath();
    // Draw "M" letter
    ctx.moveTo(-15, 10);
    ctx.lineTo(-10, -10);
    ctx.lineTo(0, 5);
    ctx.lineTo(10, -10);
    ctx.lineTo(15, 10);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-width/2 - 3, -height/2 - 3, width + 6, height + 6);
      ctx.stroke();
    }
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
          // Decide if we need a bent connection
          if (Math.abs(sourcePort.x - targetPort.x) > 20 && Math.abs(sourcePort.y - targetPort.y) > 20) {
            // Draw a bent connection (easier to follow visually)
            ctx.beginPath();
            ctx.moveTo(sourcePort.x, sourcePort.y);
            
            // Calculate control points for a smoother curve
            const dx = Math.abs(targetPort.x - sourcePort.x);
            
            // Draw a path with a 90-degree bend
            ctx.lineTo(sourcePort.x, sourcePort.y + (targetPort.y - sourcePort.y) / 2);
            ctx.lineTo(targetPort.x, sourcePort.y + (targetPort.y - sourcePort.y) / 2);
            ctx.lineTo(targetPort.x, targetPort.y);
            
            // Set connection style based on photon mode
            if (connection.properties?.photonMode === 'entangled') {
              // Entangled connection style (dashed)
              ctx.setLineDash([5, 3]);
              ctx.strokeStyle = '#8b5cf6'; // Purple for entangled
            } else if (connection.properties?.photonMode === 'squeezed') {
              // Squeezed state connection style (dot-dash)
              ctx.setLineDash([8, 3, 2, 3]);
              ctx.strokeStyle = '#ec4899'; // Pink for squeezed
            } else {
              // Single photon connection style (solid)
              ctx.setLineDash([]);
              ctx.strokeStyle = '#3b82f6'; // Blue for single photon
            }
            
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash pattern
          } else {
            // Draw a straight line for simple connections
            ctx.beginPath();
            ctx.moveTo(sourcePort.x, sourcePort.y);
            ctx.lineTo(targetPort.x, targetPort.y);
            
            // Single photon connection style
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }
    });
  };

  const drawPhotons = (ctx: CanvasRenderingContext2D) => {
    photons.forEach(photon => {
      if (!photon.position) return;
      
      // Different visualization based on photon state
      if (photon.state === 'propagating') {
        // Draw propagating photon
        const glowRadius = 8;
        const photonRadius = 4;
        
        // Create a glow effect
        const gradient = ctx.createRadialGradient(
          photon.position.x, photon.position.y, 0,
          photon.position.x, photon.position.y, glowRadius
        );
        
        // Color based on wavelength (simplified approximation)
        let photonColor = '#ffffff'; // Default white
        if (photon.wavelength < 1500) {
          photonColor = '#22d3ee'; // Blue for shorter wavelengths
        } else if (photon.wavelength > 1600) {
          photonColor = '#f59e0b'; // Orange for longer wavelengths
        } else {
          photonColor = '#10b981'; // Green for middle wavelengths
        }
        
        gradient.addColorStop(0, photonColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Draw glow
        ctx.beginPath();
        ctx.arc(photon.position.x, photon.position.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw photon core
        ctx.beginPath();
        ctx.arc(photon.position.x, photon.position.y, photonRadius, 0, Math.PI * 2);
        ctx.fillStyle = photonColor;
        ctx.fill();
        
        // Add a small trail effect
        if (photon.path && photon.currentPathIndex > 0) {
          const trailLength = Math.min(5, photon.currentPathIndex);
          const alpha = 0.7;
          
          ctx.beginPath();
          ctx.moveTo(photon.position.x, photon.position.y);
          
          for (let i = 1; i <= trailLength; i++) {
            const trailIndex = photon.currentPathIndex - i;
            if (trailIndex >= 0 && photon.path[trailIndex]) {
              const point = photon.path[trailIndex];
              ctx.lineTo(point.x, point.y);
            }
          }
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (photon.state === 'detected') {
        // Draw detected photon (flashing effect at detector)
        const flashSize = 10 + 5 * Math.sin(Date.now() / 100);
        
        ctx.beginPath();
        ctx.arc(photon.position.x, photon.position.y, flashSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; // Red flash for detection
        ctx.fill();
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
      setSelectedComponent(clickedComponent);
      
      // Check if clicked on a port
      let clickedOnPort = false;
      
      Object.entries(clickedComponent.ports).forEach(([portName, position]) => {
        const dx = position.x - x;
        const dy = position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= 7) { // 7 is a bit larger than port radius for better UX
          clickedOnPort = true;
          
          if (connecting) {
            // Complete connection
            const newConnection: CircuitConnection = {
              id: `connection-${Date.now()}`,
              source: { componentId: connecting.componentId, port: connecting.port },
              target: { componentId: clickedComponent.id, port: portName },
              path: [],
              properties: {
                lossRate: 0.05,
                propagationDelay: 1,
                photonMode: 'single',
                waveguideType: 'strip'
              },
            };
            
            setConnections([...connections, newConnection]);
            setConnecting(null);
            
            onDesignUpdate({
              components,
              connections: [...connections, newConnection],
              metadata: {
                name: "Quantum Photonic Circuit",
                description: "Advanced photonic quantum circuit design",
                version: "1.0.0",
                lastModified: new Date(),
                author: "Brisk Quantum Designer",
                quantumProperties: {
                  operatingWavelength: 1550, // nm
                  temperatureK: 4, // K
                  simulationType: 'ideal'
                }
              }
            });
            
            return;
          } else {
            // Start new connection
            setConnecting({
              componentId: clickedComponent.id,
              port: portName
            });
            
            return;
          }
        }
      });
      
      if (clickedOnPort) {
        return;
      }
    } else {
      setSelectedComponent(null);
    }
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicked on component
    const clickedComponent = components.find(component => {
      const dx = component.x - x;
      const dy = component.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 30; // 30 is slightly larger than component radius for better UX
    });
    
    if (clickedComponent) {
      // Set up dragging
      setDraggingComponent(clickedComponent);
      setDragOffset({
        x: x - clickedComponent.x,
        y: y - clickedComponent.y
      });
      
      // Also make it the selected component
      setSelectedComponent(clickedComponent);
    }
  };
  
  const handleCanvasMouseUp = () => {
    // End dragging
    if (draggingComponent) {
      // Save the final state of the circuit when dragging ends
      onDesignUpdate({
        components,
        connections,
        metadata: {
          name: "Quantum Photonic Circuit",
          description: "Advanced photonic quantum circuit design",
          version: "1.0.0",
          lastModified: new Date(),
          author: "Brisk Quantum Designer",
          quantumProperties: {
            operatingWavelength: 1550, // nm
            temperatureK: 4, // K
            simulationType: 'ideal'
          }
        }
      });
      
      toast({
        title: "Design Updated",
        description: "Your circuit design has been updated and is ready for simulation.",
      });
    }
    
    setDraggingComponent(null);
  };
  
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePosition({x, y});
    
    // Handle component dragging
    if (draggingComponent) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      // Create a new component object with updated position
      const updatedComponent = {
        ...draggingComponent,
        x: newX,
        y: newY
      };
      
      // Update the dragging component's port positions immediately to avoid lag
      const componentType = COMPONENT_TYPES[updatedComponent.type as keyof typeof COMPONENT_TYPES];
      if (componentType && componentType.ports) {
        const portPositions: Record<string, {x: number, y: number}> = {};
        
        componentType.ports.forEach((portName, index) => {
          let portX = newX;
          let portY = newY;
          const radius = 25;
          
          if (updatedComponent.type.includes('beamsplitter')) {
            if (portName === 'input1') {
              portX = newX - radius;
              portY = newY - radius;
            } else if (portName === 'input2') {
              portX = newX - radius;
              portY = newY + radius;
            } else if (portName === 'output1') {
              portX = newX + radius;
              portY = newY - radius;
            } else if (portName === 'output2') {
              portX = newX + radius;
              portY = newY + radius;
            }
          } else if (updatedComponent.type.includes('mzi')) {
            if (portName === 'input') {
              portX = newX - radius;
              portY = newY;
            } else if (portName === 'output') {
              portX = newX + radius;
              portY = newY;
            }
          } else if (updatedComponent.type.includes('ring')) {
            if (portName === 'input') {
              portX = newX - radius;
              portY = newY;
            } else if (portName === 'through') {
              portX = newX + radius;
              portY = newY;
            } else if (portName === 'drop') {
              portX = newX;
              portY = newY + radius;
            }
          } else if (updatedComponent.type.includes('Source')) {
            if (updatedComponent.type.includes('Entangled')) {
              if (portName === 'outputA') {
                portX = newX + radius;
                portY = newY - radius/2;
              } else if (portName === 'outputB') {
                portX = newX + radius;
                portY = newY + radius/2;
              }
            } else {
              portX = newX + radius;
              portY = newY;
            }
          } else if (updatedComponent.type.includes('Detector')) {
            portX = newX - radius;
            portY = newY;
          } else {
            const angle = (index / componentType.ports.length) * 2 * Math.PI;
            portX = newX + radius * Math.cos(angle);
            portY = newY + radius * Math.sin(angle);
          }
          
          portPositions[portName] = { x: portX, y: portY };
        });
        
        updatedComponent.ports = portPositions;
      }
      
      // Update components array with the new position and port positions
      setComponents(
        components.map(component => 
          component.id === draggingComponent.id ? updatedComponent : component
        )
      );
      
      // Also update selected component if it's the one being dragged
      if (selectedComponent && selectedComponent.id === draggingComponent.id) {
        setSelectedComponent(updatedComponent);
      }
      
      // Update the dragging component reference
      setDraggingComponent(updatedComponent);
    }
  };

  const addComponent = (type: string) => {
    // Get the default parameters for this component type
    const componentType = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
    const defaultParams = componentType?.params || {};
    
    // Center of the visible canvas area
    const canvasWidth = canvasRef.current?.width || 1000;
    const canvasHeight = canvasRef.current?.height || 600;
    
    const centerX = Math.random() * (canvasWidth * 0.7) + (canvasWidth * 0.15);
    const centerY = Math.random() * (canvasHeight * 0.7) + (canvasHeight * 0.15);
    
    const newComponent: CircuitComponent = {
      id: `component-${Date.now()}`,
      type,
      x: centerX,
      y: centerY,
      params: { ...defaultParams },
      ports: {},
      rotation: 0,
      width: 50,
      height: 50,
      label: componentType?.name || type,
      description: componentType?.description || '',
      quantumProperties: {
        transmissionRate: type.includes('beam') ? 0.5 : 1.0,
        reflectionRate: type.includes('beam') ? 0.5 : 0.0,
        phaseShift: type.includes('phase') ? 0.0 : undefined,
        wavelength: type.includes('Source') ? 1550 : undefined,
        fidelity: type.includes('Memory') || type.includes('cnot') ? 0.95 : undefined
      }
    };
    
    const updatedComponents = [...components, newComponent];
    setComponents(updatedComponents);
    
    // Select the newly added component
    setSelectedComponent(newComponent);
    
    onDesignUpdate({
      components: updatedComponents,
      connections,
      metadata: {
        name: "Quantum Photonic Circuit",
        description: "Advanced photonic quantum circuit design",
        version: "1.0.0",
        lastModified: new Date(),
        author: "Brisk Quantum Designer",
        quantumProperties: {
          operatingWavelength: 1550, // nm
          temperatureK: 4, // K
          simulationType: 'ideal'
        }
      }
    });
    
    toast({
      title: "Component Added",
      description: `Added new ${componentType?.name || type} to your circuit.`,
    });
  };
  
  const updateComponentParams = (componentId: string, params: Record<string, any>) => {
    setComponents(components.map(component => 
      component.id === componentId
        ? { ...component, params: { ...component.params, ...params } }
        : component
    ));
    
    // Also update selected component if it's the one being updated
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent({
        ...selectedComponent,
        params: { ...selectedComponent.params, ...params }
      });
    }
    
    // Update the design
    onDesignUpdate({
      components,
      connections,
      metadata: {
        name: "Quantum Photonic Circuit",
        description: "Advanced photonic quantum circuit design",
        version: "1.0.0",
        lastModified: new Date(),
        author: "Brisk Quantum Designer",
        quantumProperties: {
          operatingWavelength: 1550, // nm
          temperatureK: 4, // K
          simulationType: 'ideal'
        }
      }
    });
  };
  
  const clearCircuit = () => {
    setComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setConnecting(null);
    
    onDesignUpdate({
      components: [],
      connections: [],
      metadata: {
        name: "Quantum Photonic Circuit",
        description: "Advanced photonic quantum circuit design",
        version: "1.0.0",
        lastModified: new Date(),
        author: "Brisk Quantum Designer",
        quantumProperties: {
          operatingWavelength: 1550, // nm
          temperatureK: 4, // K
          simulationType: 'ideal'
        }
      }
    });
    
    toast({
      title: "Circuit Cleared",
      description: "All components and connections have been removed.",
    });
  };

  const deleteComponent = (componentId: string) => {
    // Remove the component
    const updatedComponents = components.filter(c => c.id !== componentId);
    
    // Remove any connections involving this component
    const updatedConnections = connections.filter(
      conn => conn.source.componentId !== componentId && conn.target.componentId !== componentId
    );
    
    setComponents(updatedComponents);
    setConnections(updatedConnections);
    
    // Deselect the component if it was selected
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null);
    }
    
    // Update parent component with new design
    onDesignUpdate({
      components: updatedComponents,
      connections: updatedConnections,
      metadata: {
        name: "Quantum Photonic Circuit",
        description: "Advanced photonic quantum circuit design",
        version: "1.0.0",
        lastModified: new Date(),
        author: "Brisk Quantum Designer",
        quantumProperties: {
          operatingWavelength: 1550, // nm
          temperatureK: 4, // K
          simulationType: 'ideal'
        }
      }
    });
    
    toast({
      title: "Component Deleted",
      description: "The component has been removed from the circuit."
    });
  };

  const exportCircuit = () => {
    const designData: CircuitDesign = {
      components: components.map(component => ({
        id: component.id,
        type: component.type,
        x: component.x,
        y: component.y,
        params: component.params,
        ports: component.ports,
        rotation: component.rotation,
        width: component.width,
        height: component.height,
        label: component.label,
        description: component.description,
        quantumProperties: component.quantumProperties
      })),
      connections,
      metadata: {
        name: "Quantum Photonic Circuit",
        description: "Advanced photonic quantum circuit design",
        version: "1.0.0",
        lastModified: new Date(),
        author: "Brisk Quantum Designer",
        quantumProperties: {
          operatingWavelength: 1550, // nm
          temperatureK: 4, // K
          simulationType: 'ideal'
        }
      }
    };
    
    onDesignUpdate(designData);
    
    // Create and trigger download of JSON file
    const dataStr = JSON.stringify(designData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = 'quantum-photonic-circuit.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast({
      title: "Circuit Exported",
      description: "Your quantum photonic circuit has been exported as JSON",
    });
  };

  const importCircuit = (design: CircuitDesign) => {
    setComponents(design.components);
    setConnections(design.connections);
    setSelectedComponent(null);
    setConnecting(null);
    
    onDesignUpdate(design);
  };

  const startSimulation = () => {
    if (simulating) return;
    
    // Reset simulation state
    setPhotons([]);
    
    // Create initial photons at source components
    const initialPhotons = components
      .filter(c => c.type.includes('Source'))
      .flatMap(source => {
        const outputPorts = Object.entries(source.ports)
          .filter(([name]) => name.includes('output'))
          .map(([_, port]) => port);
          
        if (outputPorts.length === 0) return [];
          
        return outputPorts.map(port => ({
          id: `photon-${Date.now()}-${Math.random()}`,
          sourceId: source.id,
          position: { x: port.x, y: port.y },
          path: calculatePhotonPath(source.id, port),
          currentPathIndex: 0,
          wavelength: source.params.wavelength || 1550,
          state: 'propagating' as const
        }));
      });
      
    if (initialPhotons.length === 0) {
      toast({
        title: "No photon sources",
        description: "Add at least one photon source to the circuit to run a simulation.",
      });
      return;
    }
    
    setPhotons(initialPhotons);
    setSimulating(true);
    
    // Start animation loop
    const animationSpeed = 1 + (simulationSpeed * 0.5); // 1-6 range
    
    const tick = () => {
      setPhotons(currentPhotons => {
        return currentPhotons.map(photon => {
          if (photon.state !== 'propagating') return photon;
          
          // Move photon along path
          if (!photon.path || photon.path.length <= 1) return photon;
          
          const nextIndex = Math.min(
            photon.path.length - 1,
            photon.currentPathIndex + animationSpeed
          );
          
          // If we're close to the end of the path
          if (nextIndex >= photon.path.length - 1) {
            // Check if photon reached a detector
            const lastPoint = photon.path[photon.path.length - 1];
            const detector = components.find(c => 
              c.type.includes('Detector') && 
              Math.sqrt(
                Math.pow(c.x - lastPoint.x, 2) + 
                Math.pow(c.y - lastPoint.y, 2)
              ) < 30
            );
            
            if (detector) {
              // If photon reached a detector, keep it there with 'detected' state
              return {
                ...photon,
                position: lastPoint,
                currentPathIndex: photon.path.length - 1,
                state: 'detected'
              };
            } else {
              // If we reached the end but not at a detector, restart from a source
              // (this creates a continuous simulation)
              const sources = components.filter(c => c.type.includes('Source'));
              if (sources.length > 0) {
                const randomSource = sources[Math.floor(Math.random() * sources.length)];
                const outputPorts = Object.entries(randomSource.ports)
                  .filter(([name]) => name.includes('output'))
                  .map(([_, port]) => port);
                  
                if (outputPorts.length > 0) {
                  const randomPort = outputPorts[Math.floor(Math.random() * outputPorts.length)];
                  const newPath = calculatePhotonPath(randomSource.id, randomPort);
                  
                  if (newPath.length > 0) {
                    return {
                      ...photon,
                      sourceId: randomSource.id,
                      position: newPath[0],
                      path: newPath,
                      currentPathIndex: 0,
                      state: 'propagating'
                    };
                  }
                }
              }
              
              // If no sources, just stop at end of path
              return {
                ...photon,
                position: lastPoint,
                currentPathIndex: photon.path.length - 1,
                state: 'lost'
              };
            }
          }
          
          // Calculate position based on path and index
          // Interpolate for smoother motion
          const intIndex = Math.floor(nextIndex);
          const fraction = nextIndex - intIndex;
          
          let position;
          if (fraction === 0 || intIndex >= photon.path.length - 1) {
            position = photon.path[intIndex];
          } else {
            const currentPoint = photon.path[intIndex];
            const nextPoint = photon.path[intIndex + 1];
            
            position = {
              x: currentPoint.x + (nextPoint.x - currentPoint.x) * fraction,
              y: currentPoint.y + (nextPoint.y - currentPoint.y) * fraction
            };
          }
          
          return {
            ...photon,
            position,
            currentPathIndex: nextIndex
          };
        });
      });
      
      // Continue animation if still simulating
      if (simulating) {
        simulationRef.current = requestAnimationFrame(tick);
      }
    };
    
    simulationRef.current = requestAnimationFrame(tick);
    
    toast({
      title: "Simulation Started",
      description: "Quantum photons are now propagating through your circuit."
    });
  };
  
  const stopSimulation = () => {
    if (!simulating) return;
    
    setSimulating(false);
    if (simulationRef.current) {
      cancelAnimationFrame(simulationRef.current);
      simulationRef.current = null;
    }
    
    // Clear photons
    setPhotons([]);
    
    toast({
      title: "Simulation Stopped",
      description: "The quantum simulation has been stopped."
    });
  };
  
  const calculatePhotonPath = (sourceId: string, startPort?: {x: number, y: number}): Array<{x: number, y: number}> => {
    // Simple implementation that creates a realistic path through connections
    // In a real implementation, this would trace the full quantum circuit
    
    const sourceComponent = components.find(c => c.id === sourceId);
    if (!sourceComponent) return [];
    
    const path: Array<{x: number, y: number}> = [];
    
    // Add starting point
    const sourcePort = startPort || 
                      sourceComponent.ports['output'] || 
                      sourceComponent.ports['outputA'] || 
                      Object.values(sourceComponent.ports)[0];
                      
    if (!sourcePort) return [];
    
    path.push({ x: sourcePort.x, y: sourcePort.y });
    
    // Find all connections from this component
    const followPath = (componentId: string, portName: string, visitedComponents: Set<string>, currentPath: Array<{x: number, y: number}>) => {
      // Avoid cycles in the path
      const visitKey = `${componentId}-${portName}`;
      if (visitedComponents.has(visitKey)) return;
      visitedComponents.add(visitKey);
      
      const component = components.find(c => c.id === componentId);
      if (!component) return;
      
      // Find all connections from this port
      const outgoingConnections = connections.filter(conn => 
        conn.source.componentId === componentId && 
        conn.source.port === portName
      );
      
      for (const connection of outgoingConnections) {
        const targetComponent = components.find(c => c.id === connection.target.componentId);
        if (!targetComponent) continue;
        
        const sourcePort = component.ports[connection.source.port];
        const targetPort = targetComponent.ports[connection.target.port];
        
        if (!sourcePort || !targetPort) continue;
        
        // Add intermediate points for waveguide bend if needed
        if (Math.abs(sourcePort.x - targetPort.x) > 20 && Math.abs(sourcePort.y - targetPort.y) > 20) {
          // Create a path with a 90-degree bend
          const midPath = [
            { x: sourcePort.x, y: sourcePort.y + (targetPort.y - sourcePort.y) / 2 },
            { x: targetPort.x, y: sourcePort.y + (targetPort.y - sourcePort.y) / 2 }
          ];
          currentPath.push(...midPath);
        }
        
        // Add target point
        currentPath.push({ x: targetPort.x, y: targetPort.y });
        
        // Handle component-specific behavior
        if (targetComponent.type.includes('Detector')) {
          // Detectors terminate paths
          continue;
        }
        
        if (targetComponent.type.includes('beamsplitter')) {
          // 50-50 chance of taking either output for beam splitters
          const outputPorts = Object.entries(targetComponent.ports)
            .filter(([name]) => name.includes('output'))
            .map(([name]) => name);
            
          if (outputPorts.length > 0) {
            // Choose a random output port
            const randomPort = outputPorts[Math.floor(Math.random() * outputPorts.length)];
            followPath(targetComponent.id, randomPort, visitedComponents, currentPath);
          }
        } else {
          // For other components, find output ports
          const outputPorts = Object.entries(targetComponent.ports)
            .filter(([name]) => name.includes('output') || name.includes('through') || name.includes('drop'))
            .map(([name]) => name);
            
          if (outputPorts.length > 0) {
            // Choose first output port by default
            followPath(targetComponent.id, outputPorts[0], visitedComponents, currentPath);
          }
        }
      }
    };
    
    // Start following path from source component output
    const outputPort = Object.keys(sourceComponent.ports).find(name => 
      name.includes('output') || name === 'outputA' || name === 'outputB'
    );
    
    if (outputPort) {
      followPath(sourceId, outputPort, new Set<string>(), path);
    }
    
    return path;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Quantum Photonic Circuit Designer
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="border rounded-md bg-black/5 dark:bg-white/5 relative" style={{ height: '600px' }}>
              <canvas
                ref={canvasRef}
                width={1000}
                height={600}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseDown={handleCanvasMouseDown}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col space-y-4 w-full md:w-80">
          {/* Components Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(COMPONENT_TYPES).map(([type, info]) => (
                  <Button 
                    key={type}
                    onClick={() => addComponent(type)}
                    className="justify-start h-auto py-2 px-3"
                    variant="outline"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="text-xs truncate">{info.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Properties Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedComponent ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ 
                        backgroundColor: COMPONENT_TYPES[selectedComponent.type as keyof typeof COMPONENT_TYPES]?.color 
                      }}
                    />
                    <div className="text-sm font-medium">{selectedComponent.label}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="component-label">Label</Label>
                    <Input
                      id="component-label"
                      value={selectedComponent.label}
                      onChange={(e) => {
                        setComponents(components.map(c => 
                          c.id === selectedComponent.id 
                            ? { ...c, label: e.target.value }
                            : c
                        ));
                      }}
                    />
                  </div>
                  
                  {Object.entries(selectedComponent.params).map(([param, value]) => (
                    <div key={param} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`param-${param}`}>{param}</Label>
                        <span className="text-xs text-gray-500">
                          {typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : value}
                        </span>
                      </div>
                      
                      {typeof value === 'number' && !isNaN(value) ? (
                        <Slider
                          id={`param-${param}`}
                          min={0}
                          max={param.includes('angle') ? 360 : param.includes('phase') ? 6.28 : 100}
                          step={0.01}
                          value={[value]}
                          onValueChange={(newValue) => {
                            updateComponentParams(selectedComponent.id, { [param]: newValue[0] });
                          }}
                        />
                      ) : (
                        <Input
                          id={`param-${param}`}
                          value={value as string}
                          onChange={(e) => {
                            updateComponentParams(selectedComponent.id, { [param]: e.target.value });
                          }}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteComponent(selectedComponent.id)}
                      className="w-full"
                    >
                      Delete Component
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500 italic">
                  Select a component to edit its properties
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={clearCircuit}>
                  Clear Circuit
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={exportCircuit}>
                    Export
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Circuit</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="text-sm">
                          Upload a JSON file with a previously exported circuit design
                        </div>
                        <Input
                          type="file"
                          accept=".json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                try {
                                  const design = JSON.parse(e.target?.result as string);
                                  importCircuit(design);
                                } catch (error) {
                                  toast({
                                    title: "Import Error",
                                    description: "Failed to parse the circuit design file",
                                    variant: "destructive"
                                  });
                                }
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={startSimulation}
                  >
                    Simulate
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={stopSimulation}
                  >
                    Stop Simulation
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => {
                      /* Generate code for the circuit */
                      toast({
                        title: "Code Generation",
                        description: "Generating Perceval code for your circuit..."
                      });
                    }}
                  >
                    Generate Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Simulation Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="simulation-speed">Simulation Speed</Label>
                  <span className="text-xs text-gray-500">{simulationSpeed.toFixed(1)}x</span>
                </div>
                <Slider
                  id="simulation-speed"
                  min={1}
                  max={10}
                  step={0.5}
                  value={[simulationSpeed]}
                  onValueChange={(values) => {
                    setSimulationSpeed(values[0]);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
