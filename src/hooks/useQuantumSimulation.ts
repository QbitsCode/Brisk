import { useState } from 'react';
import { QuantumGate } from '@/types/quantum';

interface SimulationResults {
  stateVector: number[];
  probabilities: number[];
  blochSphere?: {
    x: number;
    y: number;
    z: number;
  };
}

export function useQuantumSimulation() {
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (
    gates: QuantumGate[],
    connections: Array<[string, string]>
  ) => {
    setIsSimulating(true);
    setError(null);

    try {
      // Make API call to quantum backend
      const response = await fetch('/api/quantum/circuit/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: gates.map(gate => ({
            type: gate.type,
            position: gate.position,
            rotation: gate.rotation,
          })),
          connections: connections,
        }),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const results = await response.json();
      setSimulationResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    simulationResults,
    isSimulating,
    error,
    runSimulation,
  };
}
