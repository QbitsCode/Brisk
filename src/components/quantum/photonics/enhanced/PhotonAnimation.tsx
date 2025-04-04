"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Connection } from '@/types/quantum/connections';

interface PhotonAnimationProps {
  connections: Connection[];
  isSimulating: boolean;
  simulationSpeed?: number;
  connectionPaths: Record<string, string>;
  onSimulationComplete?: () => void;
}

interface Photon {
  id: string;
  connectionId: string;
  sourceComponentId: string;
  targetComponentId: string;
  progress: number; // 0 to 1
  state: 'superposition' | 'entangled' | 'single';
  color: string;
}

/**
 * A simple photon animation component that uses CSS animations instead of SVG
 */
export const PhotonAnimation: React.FC<PhotonAnimationProps> = ({
  connections,
  isSimulating,
  simulationSpeed = 1,
  connectionPaths,
  onSimulationComplete
}) => {
  // Photon state
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [completedConnections, setCompletedConnections] = useState<string[]>([]);
  
  // Animation timing
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  // Start simulation when isSimulating changes
  useEffect(() => {
    if (isSimulating) {
      // Reset state
      setActiveConnections([]);
      setCompletedConnections([]);
      
      // Find all source connections (from photon sources)
      const sourceConnections = connections.filter(conn => 
        conn.sourceComponentId.includes('single-photon-source') || 
        conn.sourceComponentId.includes('entangled-source')
      );
      
      if (sourceConnections.length === 0) {
        // No source connections, complete immediately
        if (onSimulationComplete) {
          onSimulationComplete();
        }
        return;
      }
      
      // Activate source connections
      setActiveConnections(sourceConnections.map(c => c.id));
      
      // Schedule next step after animation
      const baseDelay = 1000 / simulationSpeed;
      
      animationTimeoutRef.current = setTimeout(() => {
        simulateNextStep(sourceConnections);
      }, baseDelay);
    } else {
      // Stop simulation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      
      // Clear state
      setActiveConnections([]);
      setCompletedConnections([]);
    }
  }, [isSimulating, connections, simulationSpeed]);
  
  // Simulate the next step of photon propagation
  const simulateNextStep = (currentConnections: Connection[]) => {
    // Mark current connections as completed
    setCompletedConnections(prev => [...prev, ...currentConnections.map(c => c.id)]);
    
    // Find next connections
    const nextConnections: Connection[] = [];
    
    currentConnections.forEach(conn => {
      // Find connections starting from this connection's target
      const outgoing = connections.filter(c => 
        c.sourceComponentId === conn.targetComponentId && 
        !completedConnections.includes(c.id)
      );
      
      // If this is a beam splitter, it may split the photon
      if (conn.targetComponentId.includes('beamsplitter')) {
        nextConnections.push(...outgoing);
      } 
      // Otherwise, just take the first outgoing connection
      else if (outgoing.length > 0) {
        nextConnections.push(outgoing[0]);
      }
    });
    
    // If there are no more connections, complete simulation
    if (nextConnections.length === 0) {
      if (onSimulationComplete) {
        onSimulationComplete();
      }
      return;
    }
    
    // Activate next connections
    setActiveConnections(nextConnections.map(c => c.id));
    
    // Schedule next step
    const baseDelay = 1000 / simulationSpeed;
    
    animationTimeoutRef.current = setTimeout(() => {
      simulateNextStep(nextConnections);
    }, baseDelay);
  };
  
  // Get color based on connection type
  const getConnectionColor = (conn: Connection): string => {
    const sourceComponent = conn.sourceComponentId;
    
    if (sourceComponent.includes('single-photon-source')) {
      return '#4ade80'; // Green
    } else if (sourceComponent.includes('entangled-source')) {
      return '#fb7185'; // Red
    } else if (sourceComponent.includes('beamsplitter')) {
      return '#a78bfa'; // Purple for superposition
    }
    
    return '#60a5fa'; // Default blue
  };
  
  // Render glowing connections for active connections
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Active connections with glowing effect */}
      {activeConnections.map(connId => {
        const conn = connections.find(c => c.id === connId);
        if (!conn) return null;
        
        const pathData = connectionPaths[connId];
        if (!pathData) return null;
        
        return (
          <div 
            key={connId}
            className="absolute left-0 top-0 w-full h-full"
          >
            <svg className="w-full h-full">
              <path
                d={pathData}
                stroke={getConnectionColor(conn)}
                strokeWidth="3"
                fill="none"
                className="animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 3px ${getConnectionColor(conn)})`,
                  strokeDasharray: '4',
                  strokeDashoffset: '0',
                  animation: `dash ${2 / simulationSpeed}s linear forwards`,
                }}
              />
            </svg>
          </div>
        );
      })}
      
      {/* Pulse effect at endpoints */}
      {activeConnections.map(connId => {
        const conn = connections.find(c => c.id === connId);
        if (!conn) return null;
        
        // Only show pulse at detectors
        if (!conn.targetComponentId.includes('detector')) return null;
        
        // Find target component position
        const targetComponentId = conn.targetComponentId;
        const targetConnections = connections.filter(c => c.targetComponentId === targetComponentId);
        
        if (targetConnections.length === 0) return null;
        
        return (
          <div 
            key={`pulse-${connId}`}
            className="absolute w-6 h-6 rounded-full animate-ping"
            style={{
              // Approximate detector position
              left: '50%',
              top: '50%',
              backgroundColor: getConnectionColor(conn),
              opacity: 0.6,
            }}
          />
        );
      })}
      
      {/* Add some additional styles for the animations */}
      <style jsx>{`
        @keyframes dash {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
