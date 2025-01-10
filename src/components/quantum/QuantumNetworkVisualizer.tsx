import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Line, Text, Group } from 'react-konva';

interface NetworkMetrics {
  avg_path_length: number;
  clustering: number;
  num_nodes: number;
  num_edges: number;
}

interface QuantumMetrics {
  entanglement_rates: { [key: string]: number };
  fidelities: { [key: string]: number };
}

interface NetworkVisualizerProps {
  nodes: any[];
  connections: any[];
  metrics?: {
    network_metrics: NetworkMetrics;
    quantum_metrics: QuantumMetrics;
  };
}

export const QuantumNetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  nodes,
  connections,
  metrics
}) => {
  const stageRef = useRef<any>(null);

  const NODE_COLORS = {
    repeater: '#9C27B0',
    endpoint: '#4CAF50',
    memory: '#2196F3'
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg p-4 bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Quantum Network Topology</h3>
        <Stage width={600} height={400} ref={stageRef}>
          <Layer>
            {/* Draw connections with entanglement rates */}
            {connections.map((conn, idx) => {
              const source = nodes[conn.source];
              const target = nodes[conn.target];
              const connKey = `${conn.source}-${conn.target}`;
              const rate = metrics?.quantum_metrics.entanglement_rates[connKey];
              const fidelity = metrics?.quantum_metrics.fidelities[connKey];
              
              return (
                <Group key={idx}>
                  <Line
                    points={[source.position.x, source.position.y, target.position.x, target.position.y]}
                    stroke="#666"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                  {rate && fidelity && (
                    <Text
                      x={(source.position.x + target.position.x) / 2}
                      y={(source.position.y + target.position.y) / 2 - 20}
                      text={`Rate: ${rate.toFixed(1)} Hz\nFidelity: ${(fidelity * 100).toFixed(1)}%`}
                      fill="white"
                      fontSize={12}
                      align="center"
                    />
                  )}
                </Group>
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node, idx) => (
              <Group key={idx} x={node.position.x} y={node.position.y}>
                <Circle
                  radius={20}
                  fill={NODE_COLORS[node.type as keyof typeof NODE_COLORS]}
                  strokeWidth={2}
                  stroke="white"
                  shadowColor="black"
                  shadowBlur={10}
                  shadowOpacity={0.5}
                />
                <Text
                  text={node.type.charAt(0).toUpperCase()}
                  fontSize={16}
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  x={-6}
                  y={-8}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-gray-900">
            <h3 className="text-lg font-semibold mb-2">Network Metrics</h3>
            <div className="space-y-2">
              <p>Average Path Length: {metrics.network_metrics.avg_path_length.toFixed(2)}</p>
              <p>Clustering Coefficient: {metrics.network_metrics.clustering.toFixed(2)}</p>
              <p>Number of Nodes: {metrics.network_metrics.num_nodes}</p>
              <p>Number of Edges: {metrics.network_metrics.num_edges}</p>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-gray-900">
            <h3 className="text-lg font-semibold mb-2">Quantum Metrics</h3>
            <div className="space-y-2">
              <p>Average Fidelity: {
                Object.values(metrics.quantum_metrics.fidelities)
                  .reduce((a, b) => a + b, 0) / Object.keys(metrics.quantum_metrics.fidelities).length
              }</p>
              <p>Total Entanglement Rate: {
                Object.values(metrics.quantum_metrics.entanglement_rates)
                  .reduce((a, b) => a + b, 0).toFixed(1)
              } Hz</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
