import React from 'react';
import { Stage, Layer, Circle, Line, Text, Group, Rect } from 'react-konva';
import { useEffect, useState } from 'react';

interface QuantumState {
  state: number[];
  probabilities: number[];
  gds_layout: any;
}

interface QuantumCircuitVisualizerProps {
  state: QuantumState | null;
  components: any[];
  connections: any[];
}

export const QuantumCircuitVisualizer: React.FC<QuantumCircuitVisualizerProps> = ({
  state,
  components,
  connections
}) => {
  const [stateVisualization, setStateVisualization] = useState<string | null>(null);
  const [probabilities, setProbabilities] = useState<number[] | null>(null);
  const [gdsLayout, setGdsLayout] = useState<string | null>(null);

  useEffect(() => {
    if (state) {
      // Create visualization of quantum state
      const maxProb = Math.max(...state.probabilities);
      const normalized = state.probabilities.map(p => p / maxProb);
      setProbabilities(normalized);
      setStateVisualization(`data:image/png;base64,${state.state}`);
      setGdsLayout(`data:image/png;base64,${state.gds_layout}`);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      {/* Quantum State Visualization */}
      <div className="border rounded-lg p-4 bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Quantum State</h3>
        {stateVisualization && (
          <img 
            src={stateVisualization}
            alt="Quantum State"
            className="w-full"
          />
        )}
      </div>

      {/* Probability Distribution */}
      <div className="border rounded-lg p-4 bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Probability Distribution</h3>
        {probabilities && (
          <Stage width={600} height={200}>
            <Layer>
              {probabilities.map((prob, idx) => (
                <Group key={idx} x={50 + idx * 60} y={100}>
                  <Rect
                    width={40}
                    height={-prob * 100}
                    fill="#4CAF50"
                    opacity={0.8}
                  />
                  <Text
                    text={`|${idx}⟩`}
                    fill="white"
                    fontSize={14}
                    align="center"
                    x={-10}
                    y={10}
                  />
                  <Text
                    text={`${(prob * 100).toFixed(1)}%`}
                    fill="white"
                    fontSize={12}
                    align="center"
                    x={-15}
                    y={-prob * 100 - 20}
                  />
                </Group>
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      {/* GDS Layout */}
      {gdsLayout && (
        <div className="border rounded-lg p-4 bg-gray-900">
          <h3 className="text-lg font-semibold mb-2">GDS Layout</h3>
          <img 
            src={gdsLayout}
            alt="GDS Layout"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
