"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Basic circuit designer with minimal dependencies
 */
export default function BasicCircuitDesignerPage() {
  // Component and connection state
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const canvasRef = useRef(null);
  
  // Add a component to the canvas
  const addComponent = (type) => {
    const id = `component-${Date.now()}`;
    const newComponent = {
      id,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 50,
      height: 50
    };
    setComponents([...components, newComponent]);
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Basic Quantum Circuit Designer</h1>
      <p className="text-gray-300">
        We're building a simple version first to make sure the basics work before adding more advanced features.
      </p>
      
      <div className="flex gap-4 mb-4">
        <Button onClick={() => addComponent('source')}>Add Source</Button>
        <Button onClick={() => addComponent('beamsplitter')}>Add Beam Splitter</Button>
        <Button onClick={() => addComponent('detector')}>Add Detector</Button>
      </div>
      
      <div 
        ref={canvasRef}
        className="bg-slate-800 border border-slate-700 rounded-md min-h-[500px] relative"
      >
        {/* Components */}
        {components.map(component => (
          <div
            key={component.id}
            className="absolute bg-slate-700 rounded-md flex items-center justify-center cursor-move"
            style={{
              left: component.x,
              top: component.y,
              width: component.width,
              height: component.height
            }}
            draggable="true"
            onDragStart={() => setDraggedComponent(component)}
            onDragEnd={(e) => {
              if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left - component.width / 2;
                const y = e.clientY - rect.top - component.height / 2;
                
                setComponents(components.map(c => 
                  c.id === component.id 
                    ? { ...c, x: Math.max(0, x), y: Math.max(0, y) }
                    : c
                ));
              }
              setDraggedComponent(null);
            }}
          >
            {component.type === 'source' && (
              <div className="w-6 h-6 bg-green-500 rounded-full"/>
            )}
            {component.type === 'beamsplitter' && (
              <div className="w-6 h-6 bg-blue-500 transform rotate-45"/>
            )}
            {component.type === 'detector' && (
              <div className="w-6 h-6 bg-red-500 rounded-sm"/>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-slate-900 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click the buttons above to add components to the canvas</li>
          <li>Drag components to position them</li>
          <li>We'll add connection capabilities next</li>
        </ul>
      </div>
    </div>
  );
}
