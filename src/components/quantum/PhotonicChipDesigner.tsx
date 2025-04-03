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
import { 
  ComponentParams as PhotonicComponentParams,
  Component as PhotonicComponent, 
  Connection as PhotonicConnection,
  CircuitTemplate as PhotonicCircuitTemplate 
} from '@/types/photonic'
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

interface LocalComponentParams {
  [key: string]: string | number;
}

interface LocalComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;  
  params: LocalComponentParams;
  ports: Record<string, { x: number; y: number }>;
}

interface LocalConnection {
  source: { component: number; port: string };
  target: { component: number; port: string };
}

interface LocalCircuitTemplate {
  id: string;
  name: string;
  description: string;
  components: {
    type: string;
    x: number;
    y: number;
    rotation?: number;
    params: { [key: string]: string | number };
    ports?: Record<string, { x: number; y: number }>;
  }[];
  connections: LocalConnection[];
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

const PREDEFINED_CIRCUITS: LocalCircuitTemplate[] = [
  {
    id: '1',
    name: 'Simple Circuit',
    description: 'A simple circuit',
    components: [
      {
        type: 'straight',
        x: 100,
        y: 100,
        rotation: 0,
        params: { length: 10, width: 0.5, layer: 1, cross_section: 'xs_sc' },
        ports: {}
      },
      {
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
  const [components, setComponents] = useState<PhotonicComponent[]>([]);
  const [connections, setConnections] = useState<PhotonicConnection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PhotonicComponent | null>(null);
  const [connecting, setConnecting] = useState<{ component: PhotonicComponent; port: string } | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [showParams, setShowParams] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const addComponent = (type: keyof typeof COMPONENT_TYPES) => {
    const componentType = COMPONENT_TYPES[type];
    const newComponent: PhotonicComponent = {
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

  const updateComponentParams = (component: PhotonicComponent, params: Partial<PhotonicComponentParams>) => {
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
    component: PhotonicComponent,
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
      component.ports[port as keyof PhotonicComponent['ports']] = {
        x: component.x + x,
        y: component.y + y
      };
    });
    
    ctx.restore();

    // Draw label below component
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
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
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use our enhanced drawing function for better visualization
    drawCircuit(ctx);
    
    // Draw temporary connection line
    if (connecting) {
      const sourceComponent = components.find(c => c.id === `component-${connecting.component.id}`);
      if (sourceComponent) {
        const portName = connecting.port;
        const port = sourceComponent.ports[portName];
        
        if (port) {
          // Draw line from port to current mouse position
          ctx.beginPath();
          ctx.moveTo(port.x, port.y);
          ctx.lineTo(lastMousePos.x, lastMousePos.y);
          ctx.strokeStyle = '#f59e0b'; // Amber for connection in progress
          ctx.setLineDash([5, 3]); // Dashed line
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]); // Reset dash
        }
      }
    }
  };

  const drawCircuit = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 800, 600);
    
    // Draw connections
    connections.forEach(connection => {
      const sourceComponent = components.find(c => c.id === `component-${connection.source.component}`);
      const targetComponent = components.find(c => c.id === `component-${connection.target.component}`);
      
      if (sourceComponent && targetComponent) {
        // Get source port coordinates
        let sourceX = sourceComponent.x;
        let sourceY = sourceComponent.y;
        const sourcePort = sourceComponent.ports[connection.source.port];
        if (sourcePort) {
          sourceX = sourcePort.x;
          sourceY = sourcePort.y;
        }
        
        // Get target port coordinates
        let targetX = targetComponent.x;
        let targetY = targetComponent.y;
        const targetPort = targetComponent.ports[connection.target.port];
        if (targetPort) {
          targetX = targetPort.x;
          targetY = targetPort.y;
        }
        
        // Draw connection
        ctx.beginPath();
        
        // Draw direct line or bezier depending on position
        if (Math.abs(sourceX - targetX) < 20 || Math.abs(sourceY - targetY) < 20) {
          // Direct line for nearby components
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(targetX, targetY);
        } else {
          // Bezier curve for distant components
          ctx.moveTo(sourceX, sourceY);
          // Calculate control points
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          ctx.quadraticCurveTo(midX, sourceY, midX, midY);
          ctx.quadraticCurveTo(midX, targetY, targetX, targetY);
        }
        
        ctx.strokeStyle = "#3b82f6"; // Blue color for waveguides
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Draw components
    components.forEach(component => {
      const x = component.x;
      const y = component.y;
      
      // Determine the component type and draw accordingly
      const type = component.type.toLowerCase();
      
      ctx.save();
      ctx.translate(x, y);
      
      if (component.rotation) {
        ctx.rotate(component.rotation * Math.PI / 180);
      }
      
      // Default styles
      ctx.lineWidth = 2;
      ctx.fillStyle = "#3b82f6"; // Default blue
      
      // Draw based on component type with enhanced visualization
      if (type.includes("source") || type === "source") {
        // Single Photon Source
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#22c55e"; // Green
        ctx.fill();
        
        // Draw emission lines
        const rays = 7;
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI;
          ctx.beginPath();
          ctx.moveTo(20 * Math.cos(angle), 20 * Math.sin(angle));
          ctx.lineTo(30 * Math.cos(angle), 30 * Math.sin(angle));
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Draw photon symbol
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('γ', 0, 0);
        
      } else if (type.includes("beam") || type === "beamsplitter") {
        // Beam Splitter
        ctx.beginPath();
        ctx.moveTo(-20, -20); // Top-left
        ctx.lineTo(20, -20);  // Top-right
        ctx.lineTo(20, 20);   // Bottom-right
        ctx.lineTo(-20, 20);  // Bottom-left
        ctx.closePath();
        ctx.fillStyle = "#3b82f6"; // Blue
        ctx.fill();
        
        // Draw splitting line
        ctx.beginPath();
        ctx.moveTo(-20, -20);
        ctx.lineTo(20, 20);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
      } else if (type.includes("phase") || type === "phaseshifter") {
        // Phase Shifter
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#f97316"; // Orange
        ctx.fill();
        
        // Draw phi symbol
        ctx.fillStyle = 'white';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('φ', 0, 0);
        
      } else if (type.includes("detector") || type === "detector") {
        // Single Photon Detector
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444"; // Red
        ctx.fill();
        
        // Draw detector icon
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw detection lines
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, 10);
        ctx.moveTo(-10, 10);
        ctx.lineTo(10, -10);
        ctx.stroke();
        
      } else if (type.includes("mzi")) {
        // Mach-Zehnder Interferometer
        ctx.beginPath();
        ctx.roundRect(-20, -10, 40, 20, 5);
        ctx.fillStyle = "#8b5cf6"; // Purple
        ctx.fill();
        
        // Draw MZI internal structure
        ctx.beginPath();
        ctx.moveTo(-15, -5);
        ctx.lineTo(15, -5);
        ctx.moveTo(-15, 5);
        ctx.lineTo(15, 5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
      } else if (type.includes("ring") || type === "ring") {
        // Ring Resonator
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'transparent';
        ctx.strokeStyle = "#06b6d4"; // Cyan
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw waveguide
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(30, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
      } else if (type.includes("straight") || type === "straight") {
        // Straight Waveguide
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(25, 0);
        ctx.strokeStyle = "#10b981"; // Green
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add small markers at ends
        ctx.beginPath();
        ctx.arc(-25, 0, 3, 0, Math.PI * 2);
        ctx.arc(25, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();
        
      } else {
        // Generic component (fallback)
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#64748b"; // Gray
        ctx.fill();
        
        // Question mark for unknown component
        ctx.fillStyle = 'white';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
      }
      
      // Draw ports
      Object.entries(component.ports || {}).forEach(([portName, portPos]) => {
        if (portPos) {
          const portX = portPos.x - component.x;
          const portY = portPos.y - component.y;
          
          ctx.beginPath();
          ctx.arc(portX, portY, 4, 0, Math.PI * 2);
          
          // Color ports by type
          if (portName.includes('i') || portName.includes('input')) {
            ctx.fillStyle = '#f97316'; // Orange for inputs
          } else if (portName.includes('o') || portName.includes('output') || portName.includes('through')) {
            ctx.fillStyle = '#22c55e'; // Green for outputs
          } else if (portName.includes('drop')) {
            ctx.fillStyle = '#06b6d4'; // Cyan for drop ports
          } else {
            ctx.fillStyle = '#94a3b8'; // Gray for other ports
          }
          
          ctx.fill();
        }
      });
      
      ctx.restore();
      
      // Draw component label
      let label = component.type;
      if (type.includes("source") || type === "source") label = "Source";
      if (type.includes("beam") || type === "beamsplitter") label = "Beam Splitter";
      if (type.includes("phase") || type === "phaseshifter") label = "Phase Shifter";
      if (type.includes("detector") || type === "detector") label = "Detector";
      if (type.includes("mzi")) label = "MZI";
      if (type.includes("ring") || type === "ring") label = "Ring Resonator";
      if (type.includes("straight") || type === "straight") label = "Waveguide";
      
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + 30);
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

  const handleLoadCircuit = (circuit: typeof PREDEFINED_CIRCUITS[0]) => {
    // Map the predefined components to our enhanced component types
    const mappedComponents: PhotonicComponent[] = circuit.components.map((component, index) => {
      // Map the old component types to our new enhanced types
      let enhancedType = component.type;
      
      // Map common component types to our enhanced types
      if (component.type === 'source') enhancedType = 'singlePhotonSource';
      if (component.type === 'straight') enhancedType = 'straight';
      if (component.type === 'beamSplitter') enhancedType = 'beamsplitter';
      if (component.type === 'detector') enhancedType = 'singlePhotonDetector';
      if (component.type === 'phaseShifter') enhancedType = 'phaseShifter';
      if (component.type === 'ring') enhancedType = 'ringResonator';
      
      // Get the default parameters for this component type
      const typeConfig = COMPONENT_TYPES[enhancedType] || { name: component.type, color: '#777777' };
      
      // Generate properly positioned ports based on component type
      const ports: Record<string, { x: number, y: number }> = {};
      const portRadius = 25; // Distance from center to port
      
      // Special handling for different component types to ensure proper port positioning
      if (enhancedType === 'singlePhotonSource') {
        ports.output = { x: component.x + portRadius, y: component.y };
      } else if (enhancedType === 'singlePhotonDetector') {
        ports.input = { x: component.x - portRadius, y: component.y };
      } else if (enhancedType === 'beamsplitter') {
        ports.input1 = { x: component.x - portRadius, y: component.y - portRadius };
        ports.input2 = { x: component.x - portRadius, y: component.y + portRadius };
        ports.output1 = { x: component.x + portRadius, y: component.y - portRadius };
        ports.output2 = { x: component.x + portRadius, y: component.y + portRadius };
      } else if (enhancedType === 'phaseShifter') {
        ports.input = { x: component.x - portRadius, y: component.y };
        ports.output = { x: component.x + portRadius, y: component.y };
      } else if (enhancedType === 'ringResonator') {
        ports.input = { x: component.x - portRadius, y: component.y };
        ports.through = { x: component.x + portRadius, y: component.y };
        ports.drop = { x: component.x, y: component.y + portRadius };
      } else {
        // Handle all other port types
        if (component.ports) {
          Object.entries(component.ports).forEach(([portName, portPos]) => {
            if (portPos) {
              ports[portName] = { 
                x: component.x + portPos.x, 
                y: component.y + portPos.y
              };
            }
          });
        }
      }

      // Convert string params to numbers where applicable
      const processedParams: PhotonicComponentParams = {};
      
      if (component.params) {
        Object.entries(component.params).forEach(([key, value]) => {
          // Try to convert string values to numbers where appropriate
          if (typeof value === 'string' && !isNaN(Number(value))) {
            processedParams[key] = Number(value);
          } else if (typeof value === 'number') {
            processedParams[key] = value;
          } else {
            // For any other type, use a default number value
            // This handles cases where we can't convert to a number safely
            processedParams[key] = 0;
          }
        });
      }
      
      // Ensure required params exist with defaults
      if (!('width' in processedParams)) processedParams.width = 0.5;
      if (!('length' in processedParams)) processedParams.length = 10;
      if (!('layer' in processedParams)) processedParams.layer = 1;
      
      // Create enhanced component with proper visualization properties
      return {
        id: `component-${index}`,
        type: enhancedType,
        x: component.x,
        y: component.y,
        rotation: component.rotation || 0,
        params: processedParams,
        ports: ports
      };
    });
    
    // Map the connections to use the correct component IDs and port names
    const mappedConnections: PhotonicConnection[] = circuit.connections.map((connection) => ({
      source: connection.source,
      target: connection.target
    }));
    
    // Set state with properly typed components
    setComponents(mappedComponents);
    setConnections(mappedConnections);
    
    toast({
      title: "Circuit Loaded",
      description: `Loaded ${circuit.name} successfully.`,
    });
  };

  // Set up animation loop
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      drawCircuit(canvasRef.current?.getContext('2d') as CanvasRenderingContext2D);
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
                              // Convert to number if it's a numeric value, otherwise keep as string
                              const paramValue = !isNaN(Number(e.target.value)) 
                                ? Number(e.target.value) 
                                : e.target.value;
                              
                              updateComponentParams(selectedComponent, {
                                ...selectedComponent.params,
                                [param]: paramValue
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
                                [param]: Number(newValue) // Ensure it's a number
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
