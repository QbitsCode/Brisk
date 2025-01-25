import React from 'react';
import { motion } from 'framer-motion';
import { Connection } from '@/types/quantum';

interface ConnectionLineProps {
  connection: Connection;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  isSelected?: boolean;
  onClick?: () => void;
}

export function ConnectionLine({
  connection,
  sourcePosition,
  targetPosition,
  isSelected,
  onClick,
}: ConnectionLineProps) {
  // Calculate control points for the curved line
  const midX = (sourcePosition.x + targetPosition.x) / 2;
  const midY = (sourcePosition.y + targetPosition.y) / 2;
  
  // Add some curvature based on the distance
  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create curved path
  const path = `
    M ${sourcePosition.x} ${sourcePosition.y}
    Q ${midX} ${midY - distance * 0.2}
    ${targetPosition.x} ${targetPosition.y}
  `;

  return (
    <motion.path
      d={path}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5 }}
      className={`stroke-2 fill-none transition-colors cursor-pointer ${
        isSelected ? 'stroke-primary' : 'stroke-primary/50'
      }`}
      onClick={onClick}
    >
      {/* Animated photon particle effect */}
      <motion.circle
        r="3"
        fill="currentColor"
        className="text-primary"
        initial={{ offset: 0 }}
        animate={{ offset: 1 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <animateMotion
          dur="1s"
          repeatCount="indefinite"
          path={path}
        />
      </motion.circle>
    </motion.path>
  );
}
