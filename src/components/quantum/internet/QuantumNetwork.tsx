import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { QuantumChannel } from '../networking/components/QuantumChannel';
import { QuantumRepeater } from '../networking/components/QuantumRepeater';

interface Node {
  id: string;
  type: 'repeater' | 'endpoint';
  position: { x: number; y: number };
}

interface Link {
  id: string;
  source: string;
  target: string;
  distance: number;
  loss: number;
}

interface QuantumNetworkProps {
  className?: string;
}

export function QuantumNetwork({ className }: QuantumNetworkProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const addNode = (type: Node['type'], position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position
    };
    setNodes([...nodes, newNode]);
  };

  const addLink = (sourceId: string, targetId: string) => {
    const source = nodes.find(n => n.id === sourceId);
    const target = nodes.find(n => n.id === targetId);
    
    if (!source || !target) return;

    // Calculate Euclidean distance
    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy) / 100; // Scale to km

    const newLink: Link = {
      id: `link-${Date.now()}`,
      source: sourceId,
      target: targetId,
      distance,
      loss: 0.2 // Default loss in dB/km
    };
    
    setLinks([...links, newLink]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => addNode('repeater', { x: 100, y: 100 })}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Add Repeater
        </button>
        <button
          onClick={() => addNode('endpoint', { x: 100, y: 100 })}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
        >
          Add Endpoint
        </button>
      </div>

      <div className="relative w-full h-[600px] border rounded-lg bg-muted/30">
        {/* Render Links */}
        {links.map(link => {
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (!source || !target) return null;

          return (
            <svg
              key={link.id}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <line
                x1={source.position.x}
                y1={source.position.y}
                x2={target.position.x}
                y2={target.position.y}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          );
        })}

        {/* Render Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={cn(
              "absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-move",
              node.type === 'repeater' ? 'bg-primary' : 'bg-secondary',
              'rounded-full flex items-center justify-center'
            )}
            style={{
              left: node.position.x,
              top: node.position.y
            }}
            onClick={() => {
              if (selectedNode && selectedNode !== node.id) {
                addLink(selectedNode, node.id);
                setSelectedNode(null);
              } else {
                setSelectedNode(node.id);
              }
            }}
          >
            {node.type === 'repeater' ? 'R' : 'E'}
          </div>
        ))}
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <QuantumChannel
          className="col-span-1"
          distance={5}
          loss={0.2}
        />
        <QuantumRepeater
          className="col-span-1"
          efficiency={0.9}
          memoryTime={1000}
        />
      </div>
    </div>
  );
}
