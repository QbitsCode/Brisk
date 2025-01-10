import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Line, Text, Group, Rect } from 'react-konva';

interface BB84Step {
  alice_bit?: number;
  alice_basis?: number;
  bob_basis?: number;
  bob_result?: number;
  matched?: boolean;
}

interface BB84VisualizerProps {
  steps: BB84Step[];
  finalKey?: number[];
  errorRate: number;
  eavesdropping: boolean;
}

export const BB84Visualizer: React.FC<BB84VisualizerProps> = ({
  steps,
  finalKey,
  errorRate,
  eavesdropping
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [steps.length]);

  const renderBasis = (basis: number, bit: number) => {
    return basis === 0 ? (
      // Rectilinear basis
      <Line
        points={bit === 0 ? [-10, 0, 10, 0] : [0, -10, 0, 10]}
        stroke="white"
        strokeWidth={2}
      />
    ) : (
      // Diagonal basis
      <Group>
        <Line
          points={bit === 0 ? [-7, -7, 7, 7] : [-7, 7, 7, -7]}
          stroke="white"
          strokeWidth={2}
        />
      </Group>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg p-4 bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">BB84 Protocol Simulation</h3>
        <div className="flex justify-between mb-4">
          <div>Error Rate: {(errorRate * 100).toFixed(1)}%</div>
          <div>Eavesdropping: {eavesdropping ? 'Detected' : 'None'}</div>
        </div>
        
        <Stage width={800} height={200}>
          <Layer>
            {/* Alice */}
            <Group x={100} y={50}>
              <Circle radius={30} fill="#4CAF50" />
              <Text text="Alice" x={-20} y={35} fill="white" />
              {steps[currentStep]?.alice_basis !== undefined && (
                <Group>
                  {renderBasis(steps[currentStep].alice_basis!, steps[currentStep].alice_bit!)}
                </Group>
              )}
            </Group>

            {/* Quantum Channel */}
            <Line
              points={[150, 50, 650, 50]}
              stroke="#666"
              strokeWidth={2}
              dash={[10, 5]}
            />
            
            {/* Eve (if eavesdropping) */}
            {eavesdropping && (
              <Group x={400} y={50}>
                <Circle radius={20} fill="#F44336" />
                <Text text="Eve" x={-15} y={25} fill="white" />
              </Group>
            )}

            {/* Bob */}
            <Group x={700} y={50}>
              <Circle radius={30} fill="#2196F3" />
              <Text text="Bob" x={-15} y={35} fill="white" />
              {steps[currentStep]?.bob_basis !== undefined && (
                <Group>
                  {renderBasis(steps[currentStep].bob_basis!, steps[currentStep].bob_result!)}
                </Group>
              )}
            </Group>
          </Layer>
        </Stage>
      </div>

      {/* Key Visualization */}
      {finalKey && (
        <div className="border rounded-lg p-4 bg-gray-900">
          <h3 className="text-lg font-semibold mb-2">Final Shared Key</h3>
          <div className="flex gap-1">
            {finalKey.map((bit, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 flex items-center justify-center rounded
                  ${bit === 0 ? 'bg-blue-600' : 'bg-green-600'}`}
              >
                {bit}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protocol Steps */}
      <div className="border rounded-lg p-4 bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Protocol Steps</h3>
        <div className="grid grid-cols-5 gap-2 text-sm">
          <div>Step</div>
          <div>Alice's Bit</div>
          <div>Alice's Basis</div>
          <div>Bob's Basis</div>
          <div>Match</div>
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div>{idx + 1}</div>
              <div>{step.alice_bit}</div>
              <div>{step.alice_basis === 0 ? '+' : '×'}</div>
              <div>{step.bob_basis === 0 ? '+' : '×'}</div>
              <div>{step.matched ? '✓' : '×'}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
