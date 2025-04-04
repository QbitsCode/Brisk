import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QKDState {
  aliceBasis: ('X' | 'Z')[];
  bobBasis: ('X' | 'Z')[];
  aliceBits: number[];
  bobMeasurements: number[];
  sharedKey: number[];
}

interface CVQKDState {
  aliceAmplitudes: number[];
  alicePhases: number[];
  bobMeasurements: number[];
  noiseLevel: number;
  transmissionLoss: number;
  reconciliationEfficiency: number;
  secretKeyRate: number;
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
  // BB84 State
  const [bb84State, setBB84State] = useState<QKDState>({
    aliceBasis: [],
    bobBasis: [],
    aliceBits: [],
    bobMeasurements: [],
    sharedKey: [],
  });

  // CV-QKD State
  const [cvQkdState, setCVQKDState] = useState<CVQKDState>({
    aliceAmplitudes: [],
    alicePhases: [],
    bobMeasurements: [],
    noiseLevel: 0.01,
    transmissionLoss: 0.2,
    reconciliationEfficiency: 0.95,
    secretKeyRate: 0,
    sharedKey: [],
  });

  // Tabs state
  const [activeProtocol, setActiveProtocol] = useState<'bb84' | 'cvqkd'>('bb84');

  // BB84 Protocol Functions
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

  const startBB84Protocol = () => {
    const aliceBasis = generateRandomBasis(keyLength);
    const bobBasis = generateRandomBasis(keyLength);
    const aliceBits = generateRandomBits(keyLength);
    
    const bobMeasurements = aliceBits.map((bit, i) => 
      measureQubit(bit, aliceBasis[i], bobBasis[i])
    );

    const sharedKey = aliceBits.filter((_, i) => 
      aliceBasis[i] === bobBasis[i]
    );

    setBB84State({
      aliceBasis,
      bobBasis,
      aliceBits,
      bobMeasurements,
      sharedKey,
    });
  };

  // CV-QKD Protocol Functions
  const generateGaussianDistribution = (mean: number, stdDev: number, length: number): number[] => {
    return Array.from({ length }, () => {
      // Box-Muller transform for Gaussian distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mean + stdDev * z0;
    });
  };

  const calculateSecretKeyRate = (
    variance: number, 
    transmissionLoss: number, 
    noiseLevel: number, 
    reconciliationEfficiency: number
  ): number => {
    // Simplified model of CV-QKD secret key rate
    // Based on Gaussian modulation coherent state protocol
    const channelTransmittance = 1 - transmissionLoss;
    const signalToNoise = variance * channelTransmittance / noiseLevel;
    
    // Shannon formula with reconciliation efficiency
    let keyRate = 0.5 * Math.log2(1 + signalToNoise) * reconciliationEfficiency;
    
    // Account for other losses in real systems
    keyRate = Math.max(0, keyRate - 0.2); // Subtract security parameter overhead
    
    return Number(keyRate.toFixed(3));
  };

  const homodyneDetection = (
    amplitude: number, 
    phase: number, 
    transmissionLoss: number, 
    noise: number
  ): number => {
    // Model homodyne detection with channel loss and noise
    const attenuatedAmplitude = amplitude * (1 - transmissionLoss);
    // Add Gaussian noise
    const noisyMeasurement = attenuatedAmplitude + generateGaussianDistribution(0, noise, 1)[0];
    return noisyMeasurement;
  };

  const performPrivacyAmplification = (measurements: number[], threshold: number): number[] => {
    // Simple threshold-based privacy amplification
    return measurements.map(m => m > threshold ? 1 : 0);
  };

  const startCVQKDProtocol = () => {
    // Generate Gaussian-modulated coherent states for Alice
    const variance = 4.0; // Modulation variance
    const aliceAmplitudes = generateGaussianDistribution(0, Math.sqrt(variance/2), keyLength);
    const alicePhases = generateGaussianDistribution(0, Math.sqrt(variance/2), keyLength);
    
    // Bob performs homodyne detection on received states
    const bobMeasurements = aliceAmplitudes.map(amp => 
      homodyneDetection(amp, alicePhases[aliceAmplitudes.indexOf(amp)], cvQkdState.transmissionLoss, cvQkdState.noiseLevel)
    );
    
    // Calculate the secret key rate
    const secretKeyRate = calculateSecretKeyRate(
      variance, 
      cvQkdState.transmissionLoss, 
      cvQkdState.noiseLevel, 
      cvQkdState.reconciliationEfficiency
    );
    
    // Generate shared key through privacy amplification
    const threshold = 0; // Threshold for binarization
    const sharedKey = performPrivacyAmplification(bobMeasurements, threshold);
    
    setCVQKDState({
      ...cvQkdState,
      aliceAmplitudes,
      alicePhases,
      bobMeasurements,
      secretKeyRate,
      sharedKey: sharedKey.slice(0, Math.ceil(secretKeyRate * keyLength)), // Only keep secure bits
    });
  };

  const handleNoiseChange = (value: number[]) => {
    setCVQKDState({
      ...cvQkdState,
      noiseLevel: value[0]
    });
  };

  const handleLossChange = (value: number[]) => {
    setCVQKDState({
      ...cvQkdState,
      transmissionLoss: value[0]
    });
  };

  const handleReconEfficiencyChange = (value: number[]) => {
    setCVQKDState({
      ...cvQkdState,
      reconciliationEfficiency: value[0]
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs defaultValue="bb84" onValueChange={(value) => setActiveProtocol(value as 'bb84' | 'cvqkd')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bb84">BB84 Protocol</TabsTrigger>
          <TabsTrigger value="cvqkd">CV-QKD Protocol</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bb84" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">BB84 QKD Protocol</h3>
            <button
              onClick={startBB84Protocol}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Start Protocol
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Alice</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">Basis: {bb84State.aliceBasis.join(', ')}</p>
                <p className="text-sm">Bits: {bb84State.aliceBits.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Bob</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">Basis: {bb84State.bobBasis.join(', ')}</p>
                <p className="text-sm">Measurements: {bb84State.bobMeasurements.join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <h4 className="font-medium mb-2">Shared Secret Key</h4>
            <p className="text-sm">Key length: {bb84State.sharedKey.length} bits</p>
            <p className="text-sm">Key: {bb84State.sharedKey.join('')}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="cvqkd" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">CV-QKD Protocol</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Continuous-Variable QKD uses coherent states of light instead of single photons. 
                      It's compatible with standard telecom infrastructure and can be implemented using
                      existing photonic components.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <button
              onClick={startCVQKDProtocol}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Start Protocol
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Noise Level: {cvQkdState.noiseLevel.toFixed(2)}</label>
              </div>
              <Slider
                defaultValue={[0.01]}
                max={0.1}
                min={0.001}
                step={0.001}
                value={[cvQkdState.noiseLevel]}
                onValueChange={handleNoiseChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Transmission Loss: {(cvQkdState.transmissionLoss * 100).toFixed(0)}%</label>
              </div>
              <Slider
                defaultValue={[0.2]}
                max={0.9}
                min={0.1}
                step={0.01}
                value={[cvQkdState.transmissionLoss]}
                onValueChange={handleLossChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Reconciliation Efficiency: {(cvQkdState.reconciliationEfficiency * 100).toFixed(0)}%</label>
              </div>
              <Slider
                defaultValue={[0.95]}
                max={1}
                min={0.5}
                step={0.01}
                value={[cvQkdState.reconciliationEfficiency]}
                onValueChange={handleReconEfficiencyChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Alice</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">Coherent State Amplitudes (first 4):</p>
                <p className="text-sm break-all">
                  {cvQkdState.aliceAmplitudes.slice(0, 4).map(a => a.toFixed(2)).join(', ')}...
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Bob</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">Homodyne Measurements (first 4):</p>
                <p className="text-sm break-all">
                  {cvQkdState.bobMeasurements.slice(0, 4).map(m => m.toFixed(2)).join(', ')}...
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <h4 className="font-medium mb-2">CV-QKD Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Secret Key Rate:</p>
                <p className="text-sm">{cvQkdState.secretKeyRate.toFixed(3)} bits/symbol</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Secure Bits:</p>
                <p className="text-sm">{cvQkdState.sharedKey.length} bits</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium">Secure Key (first 16 bits):</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {cvQkdState.sharedKey.slice(0, 16).join('')}{cvQkdState.sharedKey.length > 16 ? '...' : ''}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
