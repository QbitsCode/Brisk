export interface Position {
  x: number;
  y: number;
}

export interface QuantumGate {
  id: string;
  type: 'beamsplitter' | 'phaseshift' | 'detector' | 'source';
  position: Position;
  rotation: number;
  parameters?: {
    [key: string]: number;
  };
}

export interface Connection {
  sourceId: string;
  targetId: string;
  sourcePort: string;
  targetPort: string;
}

export interface CircuitState {
  gates: QuantumGate[];
  connections: Connection[];
  selectedGateId: string | null;
  selectedConnectionId: string | null;
}

export interface SimulationParameters {
  numPhotons: number;
  errorRate: number;
  lossRate: number;
}
