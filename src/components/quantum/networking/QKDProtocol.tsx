import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface QKDState {
  aliceBasis: ('X' | 'Z')[];
  bobBasis: ('X' | 'Z')[];
  aliceBits: number[];
  bobMeasurements: number[];
  sharedKey: number[];
}

interface QKDProtocolProps {
  className?: string;
  keyLength?: number;
}

export function QKDProtocol({ 
  className,
  keyLength = 8
}: QKDProtocolProps) {
  const [qkdState, setQkdState] = useState<QKDState>({
    aliceBasis: [],
    bobBasis: [],
    aliceBits: [],
    bobMeasurements: [],
    sharedKey: [],
  });

  const generateRandomBasis = (length: number): ('X' | 'Z')[] => {
    return Array.from({ length }, () => 
      Math.random() < 0.5 ? 'X' : 'Z'
    );
  };

  const generateRandomBits = (length: number): number[] => {
    return Array.from({ length }, () => 
      Math.random() < 0.5 ? 0 : 1
    );
  };

  const measureQubit = (bit: number, sentBasis: 'X' | 'Z', measureBasis: 'X' | 'Z'): number => {
    if (sentBasis === measureBasis) {
      return bit;
    }
    return Math.random() < 0.5 ? 0 : 1;
  };

  const startProtocol = () => {
    const aliceBasis = generateRandomBasis(keyLength);
    const bobBasis = generateRandomBasis(keyLength);
    const aliceBits = generateRandomBits(keyLength);
    
    const bobMeasurements = aliceBits.map((bit, i) => 
      measureQubit(bit, aliceBasis[i], bobBasis[i])
    );

    const sharedKey = aliceBits.filter((_, i) => 
      aliceBasis[i] === bobBasis[i]
    );

    setQkdState({
      aliceBasis,
      bobBasis,
      aliceBits,
      bobMeasurements,
      sharedKey,
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">BB84 QKD Protocol</h3>
        <button
          onClick={startProtocol}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Start Protocol
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Alice</h4>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm mb-2">Basis: {qkdState.aliceBasis.join(', ')}</p>
            <p className="text-sm">Bits: {qkdState.aliceBits.join(', ')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Bob</h4>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm mb-2">Basis: {qkdState.bobBasis.join(', ')}</p>
            <p className="text-sm">Measurements: {qkdState.bobMeasurements.join(', ')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-accent rounded-lg">
        <h4 className="font-medium mb-2">Shared Secret Key</h4>
        <p className="text-sm">{qkdState.sharedKey.join(', ')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Key length: {qkdState.sharedKey.length} bits
        </p>
      </div>
    </div>
  );
}
