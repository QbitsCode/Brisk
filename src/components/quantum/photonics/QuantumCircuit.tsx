import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuantumGate, Position, CircuitState } from '@/types/quantum';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { SVGComponentLibrary } from './SVGComponentLibrary';
import { Maximize2, Minimize2, X } from 'lucide-react';
import '@/styles/quantum-animations.css';

const GRID_SIZE = 20;

// Define Connection interface
interface Connection {
  id: string;
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
}

// Define Port interface
interface Port {
  id: string;
  type: 'input' | 'output';
  position: Position;
  parentId: string;
}

// Utility function to group components by category
function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, item) => {
    const group = item[key] as string;
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {} as { [key: string]: T[] });
}

// Component port configuration
const COMPONENT_PORTS: Record<string, { inputs: string[], outputs: string[] }> = {
  'single-photon-source': {
    inputs: [],
    outputs: ['out']
  },
  'entangled-source': {
    inputs: [],
    outputs: ['out1', 'out2']
  },
  'beamsplitter': {
    inputs: ['in1', 'in2'],
    outputs: ['out1', 'out2']
  },
  'polarizing-beamsplitter': {
    inputs: ['in1', 'in2'],
    outputs: ['out1', 'out2']
  },
  'phaseshift': {
    inputs: ['in'],
    outputs: ['out']
  },
  'polarizer': {
    inputs: ['in'],
    outputs: ['out']
  },
  'waveplate': {
    inputs: ['in'],
    outputs: ['out']
  },
  'mirror': {
    inputs: ['in'],
    outputs: ['out']
  },
  'waveguide': {
    inputs: ['in'],
    outputs: ['out']
  },
  'coupler': {
    inputs: ['in1', 'in2'],
    outputs: ['out1', 'out2']
  },
  'detector': {
    inputs: ['in'],
    outputs: []
  },
  'photon-counter': {
    inputs: ['in'],
    outputs: []
  }
};

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
  onSelect: (id: string | null) => void;
  onPortClick: (componentId: string, portId: string, portType: 'input' | 'output') => void;
  isSelected: boolean;
  isActive: boolean;
}

const DraggableComponent = ({
  component,
  onMove,
  onRotate,
  onSelect,
  onPortClick,
  isSelected,
  isActive
}: DraggableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag gesture with proper types
  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onMove(component.id, {
      x: component.position.x + info.delta.x,
      y: component.position.y + info.delta.y
    });
  };

  // Handle component selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  };
  
  // Calculate port positions based on component type and rotation
  const getPortPositions = () => {
    const ports: { id: string, type: 'input' | 'output', position: Position }[] = [];
    const componentConfig = COMPONENT_PORTS[component.type];
    
    if (!componentConfig) return ports;
    
    const width = 40;
    const height = 40;
    const center = { x: component.position.x + width/2, y: component.position.y + height/2 };
    const radius = 20;
    
    // Add input ports
    componentConfig.inputs.forEach((portId, index) => {
      const angleOffset = (Math.PI / (componentConfig.inputs.length + 1)) * (index + 1);
      const angle = Math.PI + component.rotation * (Math.PI / 180) + angleOffset;
      
      ports.push({
        id: portId,
        type: 'input',
        position: {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius
        }
      });
    });
    
    // Add output ports
    componentConfig.outputs.forEach((portId, index) => {
      const angleOffset = (Math.PI / (componentConfig.outputs.length + 1)) * (index + 1);
      const angle = component.rotation * (Math.PI / 180) + angleOffset;
      
      ports.push({
        id: portId,
        type: 'output',
        position: {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius
        }
      });
    });
    
    return ports;
  };
  
  const ports = getPortPositions();

  // Better laser beam rendering that starts from the component
  const renderLaserBeam = () => {
    if (!isActive) return null;
    
    // More reliable way to check component types using includes()
    const isSource = component.type.includes('source');
    
    if (isSource) {
      const outputPorts = ports.filter(port => port.type === 'output');
      
      return (
        <>
          {outputPorts.map(port => (
            <div
              key={`laser-${port.id}`}
              className="absolute w-40 h-1 bg-green-500/60 blur-[1px] -z-10 animate-laser-beam"
              style={{ 
                left: port.position.x - component.position.x,
                top: port.position.y - component.position.y,
                transformOrigin: 'left center',
                transform: 'translateX(0) translateY(-50%)'
              }}
            />
          ))}
        </>
      );
    }
    
    return null;
  };
  
  return (
    <>
      <motion.div
        className={cn(
          "absolute cursor-grab quantum-component",
          isSelected && "ring-2 ring-primary ring-offset-2",
          isDragging && "cursor-grabbing",
          isActive && "quantum-active"
        )}
        style={{
          width: 40,
          height: 40,
          x: component.position.x,
          y: component.position.y,
          rotate: component.rotation,
          zIndex: isDragging ? 100 : 10
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={handleClick}
        drag
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        <SVGComponentLibrary 
          type={component.type} 
          isSelected={isSelected}
          isActive={isActive}
          className="w-full h-full"
        />
        
        {/* Render ports */}
        {ports.map(port => (
          <div
            key={`${component.id}-${port.id}`}
            className={cn(
              "absolute w-3 h-3 rounded-full border-2 cursor-pointer",
              port.type === 'input' ? "bg-amber-400 border-amber-600" : "bg-green-400 border-green-600",
              "transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
            )}
            style={{
              left: port.position.x - component.position.x,
              top: port.position.y - component.position.y,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(component.id, port.id, port.type);
            }}
            title={`${port.type === 'input' ? 'Input' : 'Output'} port: ${port.id}`}
          />
        ))}
      </motion.div>
      {renderLaserBeam()}
    </>
  );
};

// Define Circuit Template interface to match the format in CircuitTemplates.tsx
export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  components: {
    id: string;
    type: string;
    x: number;
    y: number;
    rotation: number;
    params: { [key: string]: any };
    ports: { [key: string]: { x: number; y: number } };
  }[];
  connections: {
    source: { component: string; port: string };
    target: { component: string; port: string };
  }[];
}

// Define props for the QuantumCircuit component
interface QuantumCircuitProps {
  className?: string;
  selectedTemplate?: CircuitTemplate | null;
  onTemplateLoaded?: () => void;
}

export function QuantumCircuit({ className, selectedTemplate, onTemplateLoaded }: QuantumCircuitProps) {
  const [components, setComponents] = useState<QuantumGate[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeComponents, setActiveComponents] = useState<Set<string>>(new Set());
  const [connectingFrom, setConnectingFrom] = useState<{ componentId: string, portId: string, portType: 'input' | 'output' } | null>(null);
  const [mousePosition, setMousePosition] = useState<Position | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const circuitRef = useRef<HTMLDivElement>(null);
  
  // Auto-expand when complex templates are loaded or many components are added
  useEffect(() => {
    // Auto-expand when loading templates or when there are many components
    if ((selectedTemplate && components.length > 3) || components.length > 5) {
      setIsExpanded(true);
    }
  }, [selectedTemplate, components]);

  // Process the template when it changes
  useEffect(() => {
    if (selectedTemplate) {
      loadTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);
  
  // Function to load a circuit template
  const loadTemplate = (template: CircuitTemplate) => {
    // Clear existing circuit
    setComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setConnectingFrom(null);
    
    // Automatically expand the view for better visibility when loading templates
    setIsExpanded(true);
    
    // Map template components to our format
    const mappedComponents = template.components.map(component => {
      // Map component types to match the expected format
      let componentType = component.type;
      
      // Map common component types if needed
      if (componentType === 'source') componentType = 'single-photon-source';
      if (componentType === 'beamsplitter') componentType = 'beamsplitter';
      if (componentType === 'detector') componentType = 'detector';
      if (componentType === 'phaseshift') componentType = 'phaseshift';
      
      return {
        id: component.id,
        type: componentType as any,
        position: { x: component.x, y: component.y },
        rotation: component.rotation,
        parameters: component.params
      };
    });
    
    // Map template connections to our format
    const mappedConnections = template.connections.map((connection, index) => {
      // Create a connection ID
      const connectionId = `connection-${index}`;
      
      // Handle both possible formats of connection data
      if ('source' in connection && typeof connection.source === 'object') {
        // Format: { source: { component, port }, target: { component, port }}
        return {
          id: connectionId,
          sourceId: connection.source.component,
          sourcePort: connection.source.port,
          targetId: connection.target.component,
          targetPort: connection.target.port
        };
      } else {
        // Format: { sourceId, targetId, sourcePort, targetPort }
        return {
          id: connectionId,
          sourceId: (connection as any).sourceId,
          sourcePort: (connection as any).sourcePort,
          targetId: (connection as any).targetId,
          targetPort: (connection as any).targetPort
        };
      }
    });
    
    // Calculate optimal sizing and positioning
    const containerRect = circuitRef.current?.getBoundingClientRect();
    if (!containerRect || mappedComponents.length === 0) {
      return;
    }
    
    // Find the bounds of the template components
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    mappedComponents.forEach(component => {
      minX = Math.min(minX, component.position.x);
      maxX = Math.max(maxX, component.position.x);
      minY = Math.min(minY, component.position.y);
      maxY = Math.max(maxY, component.position.y);
    });
    
    // Calculate template dimensions and padding
    const templateWidth = maxX - minX;
    const templateHeight = maxY - minY;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Determine proper scaling factor
    // We want to use 70% of the container's dimensions to leave room for ports and connections
    const scaleX = (containerWidth * 0.7) / Math.max(templateWidth, 100);
    const scaleY = (containerHeight * 0.7) / Math.max(templateHeight, 100);
    const scale = Math.min(scaleX, scaleY, 1.5); // Cap scaling to 1.5x to avoid too large components
    
    // Calculate center points for positioning
    const templateCenterX = minX + templateWidth / 2;
    const templateCenterY = minY + templateHeight / 2;
    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;
    
    // Adjust components to fit properly in the container
    const adjustedComponents = mappedComponents.map(comp => {
      // Calculate new position based on scaling and centering
      const relativeX = comp.position.x - templateCenterX;
      const relativeY = comp.position.y - templateCenterY;
      
      return {
        ...comp,
        position: {
          x: containerCenterX + relativeX * scale,
          y: containerCenterY + relativeY * scale
        }
      };
    });
    
    // Set the new circuit state
    setComponents(adjustedComponents);
    setConnections(mappedConnections);
    
    // Notify parent that template was loaded
    if (onTemplateLoaded) {
      onTemplateLoaded();
    }
  };
  
  // Track mouse position for drawing temporary connection line
  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectingFrom && circuitRef.current) {
      const rect = circuitRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Function to get all ports for all components
  const getAllPorts = () => {
    const allPorts: { 
      portId: string, 
      componentId: string, 
      position: Position,
      type: 'input' | 'output' 
    }[] = [];
    
    components.forEach(component => {
      const componentConfig = COMPONENT_PORTS[component.type];
      if (!componentConfig) return;
      
      const width = 40;
      const height = 40;
      const center = { x: component.position.x + width/2, y: component.position.y + height/2 };
      const radius = 20;
      
      // Add input ports
      componentConfig.inputs.forEach((portId, index) => {
        const angleOffset = (Math.PI / (componentConfig.inputs.length + 1)) * (index + 1);
        const angle = Math.PI + component.rotation * (Math.PI / 180) + angleOffset;
        
        allPorts.push({
          portId,
          componentId: component.id,
          type: 'input',
          position: {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
          }
        });
      });
      
      // Add output ports
      componentConfig.outputs.forEach((portId, index) => {
        const angleOffset = (Math.PI / (componentConfig.outputs.length + 1)) * (index + 1);
        const angle = component.rotation * (Math.PI / 180) + angleOffset;
        
        allPorts.push({
          portId,
          componentId: component.id,
          type: 'output',
          position: {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
          }
        });
      });
    });
    
    return allPorts;
  };
  
  // Handle port clicks for creating connections
  const handlePortClick = (componentId: string, portId: string, portType: 'input' | 'output') => {
    if (!connectingFrom) {
      // Start connection
      setConnectingFrom({ componentId, portId, portType });
    } else {
      // Attempt to complete connection
      // Don't connect to the same component
      if (connectingFrom.componentId === componentId) {
        setConnectingFrom(null);
        return;
      }
      
      // Don't connect input to input or output to output
      if (connectingFrom.portType === portType) {
        setConnectingFrom(null);
        return;
      }
      
      // Determine source and target based on port types
      let sourceId, sourcePort, targetId, targetPort;
      
      if (connectingFrom.portType === 'output') {
        sourceId = connectingFrom.componentId;
        sourcePort = connectingFrom.portId;
        targetId = componentId;
        targetPort = portId;
      } else {
        sourceId = componentId;
        sourcePort = portId;
        targetId = connectingFrom.componentId;
        targetPort = connectingFrom.portId;
      }
      
      // Create the connection
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        sourceId,
        sourcePort,
        targetId,
        targetPort
      };
      
      setConnections(prev => [...prev, newConnection]);
      setConnectingFrom(null);
    }
  };
  
  // Cancel connection on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectingFrom) {
        setConnectingFrom(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectingFrom]);
  
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

  // Render connections between components with better path calculation
  const renderConnections = () => {
    const allPorts = getAllPorts();
    
    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Existing connections */}
        {connections.map(connection => {
          const sourcePort = allPorts.find(
            p => p.componentId === connection.sourceId && p.portId === connection.sourcePort
          );
          const targetPort = allPorts.find(
            p => p.componentId === connection.targetId && p.portId === connection.targetPort
          );
          
          if (!sourcePort || !targetPort) return null;
          
          // Calculate control points for bezier curve
          const dx = targetPort.position.x - sourcePort.position.x;
          const dy = targetPort.position.y - sourcePort.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Adjust control points based on distance between ports
          const controlPointDistance = Math.min(distance * 0.5, 100);
          
          // Calculate source port angle based on port type and position
          const sourceAngle = Math.atan2(targetPort.position.y - sourcePort.position.y, 
                                        targetPort.position.x - sourcePort.position.x);
                                        
          // Calculate target port angle based on port type and position
          const targetAngle = Math.atan2(sourcePort.position.y - targetPort.position.y, 
                                       sourcePort.position.x - targetPort.position.x);
          
          const controlPoint1 = {
            x: sourcePort.position.x + Math.cos(sourceAngle) * controlPointDistance,
            y: sourcePort.position.y + Math.sin(sourceAngle) * controlPointDistance
          };
          
          const controlPoint2 = {
            x: targetPort.position.x + Math.cos(targetAngle) * controlPointDistance,
            y: targetPort.position.y + Math.sin(targetAngle) * controlPointDistance
          };
          
          return (
            <path
              key={connection.id}
              d={`M ${sourcePort.position.x} ${sourcePort.position.y} 
                  C ${controlPoint1.x} ${controlPoint1.y}, 
                    ${controlPoint2.x} ${controlPoint2.y}, 
                    ${targetPort.position.x} ${targetPort.position.y}`}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              className="quantum-connection"
            />
          );
        })}
        
        {/* Temporary connection line when creating a new connection */}
        {connectingFrom && mousePosition && (() => {
          const sourcePort = allPorts.find(
            p => p.componentId === connectingFrom.componentId && p.portId === connectingFrom.portId
          );
          
          if (!sourcePort) return null;
          
          // Calculate control point for temporary connection
          const dx = mousePosition.x - sourcePort.position.x;
          const dy = mousePosition.y - sourcePort.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const controlPointDistance = Math.min(distance * 0.5, 100);
          
          const angle = Math.atan2(dy, dx);
          const controlPoint = {
            x: sourcePort.position.x + Math.cos(angle) * controlPointDistance,
            y: sourcePort.position.y + Math.sin(angle) * controlPointDistance
          };
          
          return (
            <path
              d={`M ${sourcePort.position.x} ${sourcePort.position.y} 
                  Q ${controlPoint.x} ${controlPoint.y}, 
                    ${mousePosition.x} ${mousePosition.y}`}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          );
        })()}
      </svg>
    );
  };

  return (
    <div className={cn("flex h-full", className, isExpanded && "fixed inset-0 z-50 bg-black/50")}>
      {/* Left sidebar (collapsed in expanded mode) */}
      <div className={cn(
        "bg-card p-4 border-r transition-all duration-300", 
        isExpanded ? "w-12 overflow-hidden" : "w-64"
      )}>
        {!isExpanded ? (
          // Full component list in normal mode
          <>
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
          </>
        ) : (
          // Collapsed icons only in expanded mode
          <div className="flex flex-col items-center space-y-4">
            {Object.entries(groupBy(QUANTUM_COMPONENTS, 'category')).map(([category, items]) => (
              <div key={category} className="w-8 h-8">
                <Tooltip content={category}>
                  <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-xs">
                    {category.charAt(0).toUpperCase()}
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cn(
        "flex-1 relative",
        isExpanded && "p-8" // Add padding in expanded mode
      )}>
        {/* Modern glass effect container */}
        <div className={cn(
          "absolute rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 shadow-lg",
          !isExpanded && "inset-0 m-4 p-1", // Normal size
          isExpanded && "left-[5%] right-[5%] top-[10%] bottom-[10%] p-2" // Reduced expanded size
        )}>
          {/* Decorative elements for glass effect */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"></div>
          
          {/* Header bar with subtle gradient */}
          <div className="bg-background/40 backdrop-blur-md px-4 py-2 border-b border-white/10 rounded-t-lg flex justify-between items-center">
            <h3 className="text-sm font-medium text-primary/80">Quantum Circuit</h3>
            <div className="flex space-x-3 items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-400/80"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/80"></div>
                <div className="w-2 h-2 rounded-full bg-green-400/80"></div>
              </div>
              
              {/* Expand/Collapse button */}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                {isExpanded ? 
                  <Minimize2 className="h-4 w-4 text-white/70" /> : 
                  <Maximize2 className="h-4 w-4 text-white/70" />
                }
              </button>
              
              {/* Close expanded view button (only in expanded mode) */}
              {isExpanded && (
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              )}
            </div>
          </div>
          
          {/* Circuit workspace */}
          <div 
            ref={circuitRef}
            className={cn(
              "relative bg-black/30 backdrop-blur-md w-full rounded-b-lg",
              isExpanded ? "h-[calc(80vh-10rem)]" : "h-[calc(100%-32px)]" // Less tall in expanded mode
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseMove={handleMouseMove}
          >
            {renderConnections()}
            <AnimatePresence>
              {components.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  onMove={handleComponentMove}
                  onRotate={handleComponentRotate}
                  onSelect={setSelectedComponent}
                  onPortClick={handlePortClick}
                  isSelected={selectedComponent === component.id}
                  isActive={activeComponents.has(component.id)}
                />
              ))}
            </AnimatePresence>
            
            {/* Connection instructions */}
            {connectingFrom && (
              <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-md p-2 rounded-md shadow-md border border-white/10">
                <p className="text-sm">Click on a {connectingFrom.portType === 'output' ? 'input' : 'output'} port to connect, or press Esc to cancel</p>
              </div>
            )}
            
            {/* Empty state message */}
            {components.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <div className="bg-background/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg text-center max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">Circuit Designer</h3>
                  <p className="mb-4">Drag components from the left panel or select a template to start building your quantum circuit.</p>
                  <div className="animate-pulse text-xs text-primary/60">← Drag components to start</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
