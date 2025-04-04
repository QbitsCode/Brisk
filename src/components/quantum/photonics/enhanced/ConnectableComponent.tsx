"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Port, ConnectableQuantumComponent } from '@/types/quantum/connections';
import { SVGComponentLibrary } from '../SVGComponentLibrary';
import { cn } from '@/lib/utils';

interface ConnectableComponentProps {
  component: ConnectableQuantumComponent;
  onSelect: (id: string) => void;
  onStartConnection: (portId: string, componentId: string, event: React.MouseEvent) => void;
  onPositionChange: (id: string, position: { x: number, y: number }) => void;
  onRotate: (id: string, angle: number) => void;
  isSelected: boolean;
}

export const ConnectableComponent: React.FC<ConnectableComponentProps> = ({
  component,
  onSelect,
  onStartConnection,
  onPositionChange,
  onRotate,
  isSelected
}) => {
  const { id, type, position, angle, inputPorts, outputPorts } = component;
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
    onSelect(id);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    onPositionChange(id, {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    });
  };

  const handleRotateClick = () => {
    onRotate(id, (angle + 90) % 360);
  };

  // Function to render a port
  const renderPort = (port: Port) => {
    const isConnected = !!port.connectionId;
    
    return (
      <div
        key={port.id}
        className={cn(
          "absolute w-3 h-3 rounded-full border-2 cursor-pointer z-10 transition-colors",
          port.type === 'input' 
            ? "bg-blue-500 hover:bg-blue-300 border-blue-700" 
            : "bg-green-500 hover:bg-green-300 border-green-700",
          isConnected && "ring-2 ring-yellow-400"
        )}
        style={{
          left: `calc(50% + ${port.position.x}px)`,
          top: `calc(50% + ${port.position.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent component selection
          onStartConnection(port.id, component.id, e);
        }}
        title={`${port.label} (${port.type})`}
      />
    );
  };

  return (
    <motion.div
      className={cn(
        "absolute cursor-move select-none",
        isSelected && "ring-2 ring-white",
        isDragging && "opacity-70"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: '60px',
        height: '60px',
        transform: `rotate(${angle}deg)`,
      }}
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(id)}
    >
      {/* Component Icon */}
      <div className="relative w-full h-full">
        <SVGComponentLibrary 
          type={type} 
          className="w-full h-full" 
          isActive={isSelected} 
        />
        
        {/* Rotation Handle (only visible when selected) */}
        {isSelected && (
          <div 
            className="absolute top-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleRotateClick();
            }}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2"
            >
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </div>
        )}
        
        {/* Render input and output ports */}
        {inputPorts.map(renderPort)}
        {outputPorts.map(renderPort)}
      </div>
    </motion.div>
  );
};
