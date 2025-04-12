"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface QuantumLoaderProps {
  className?: string;
}

// This component shows a subtle quantum-themed animation during page transitions
export function QuantumLoader({ className }: QuantumLoaderProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  
  // Trigger animation when pathname changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Animation shows for just 800ms
    
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
            className
          )}
        >
          <div className="relative h-20 w-20">
            {/* Quantum particles with wave-like animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-3 w-3 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 0.8, 0],
                    rotate: [0, 180],
                    translateX: [0, 20 * Math.cos(i * Math.PI / 3), 0],
                    translateY: [0, 20 * Math.sin(i * Math.PI / 3), 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            {/* Wave function visualization */}
            <motion.div
              className="absolute inset-0 border-2 border-primary/60 rounded-full"
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
