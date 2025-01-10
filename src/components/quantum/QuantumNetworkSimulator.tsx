'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Node {
  id: string
  type: 'quantum_memory' | 'detector' | 'source'
  position: { x: number, y: number }
  parameters: {
    [key: string]: number
  }
}

interface Link {
  from: string
  to: string
  type: 'optical_fiber' | 'free_space'
  parameters: {
    length: number
    loss: number
  }
}

interface NetworkState {
  nodes: Node[]
  links: Link[]
  simulationResults?: {
    entanglement_rates: { [key: string]: number }
    fidelities: { [key: string]: number }
    secret_key_rates: { [key: string]: number }
  }
}

export default function QuantumNetworkSimulator() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    nodes: [],
    links: []
  })
  const [selectedNodeType, setSelectedNodeType] = useState<Node['type']>('quantum_memory')
  const { toast } = useToast()

  const addNode = () => {
    const newNode: Node = {
      id: `node_${networkState.nodes.length}`,
      type: selectedNodeType,
      position: { x: networkState.nodes.length * 100, y: 100 },
      parameters: getDefaultNodeParameters(selectedNodeType)
    }

    setNetworkState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }

  const addLink = (fromId: string, toId: string) => {
    const newLink: Link = {
      from: fromId,
      to: toId,
      type: 'optical_fiber',
      parameters: {
        length: 10,
        loss: 0.2
      }
    }

    setNetworkState(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }))
  }

  const getDefaultNodeParameters = (type: Node['type']) => {
    switch (type) {
      case 'quantum_memory':
        return { coherence_time: 1000, efficiency: 0.9 }
      case 'detector':
        return { efficiency: 0.8, dark_count: 100 }
      case 'source':
        return { rate: 1000000, fidelity: 0.98 }
      default:
        return {}
    }
  }

  const simulateNetwork = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/network/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(networkState),
      })

      if (!response.ok) {
        throw new Error('Failed to simulate quantum network')
      }

      const data = await response.json()
      setNetworkState(prev => ({
        ...prev,
        simulationResults: data
      }))

      toast({
        title: "Simulation Complete",
        description: "Network simulation finished successfully",
      })
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Error simulating quantum network",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantum Network Simulator</CardTitle>
        <CardDescription>Design and simulate quantum networks with realistic parameters</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Select value={selectedNodeType} onValueChange={(value: Node['type']) => setSelectedNodeType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantum_memory">Quantum Memory</SelectItem>
                <SelectItem value="detector">Single-Photon Detector</SelectItem>
                <SelectItem value="source">Entangled Source</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addNode}>Add Node</Button>
          </div>

          <div className="border rounded-lg p-4 min-h-[400px] relative">
            {networkState.nodes.map((node) => (
              <div
                key={node.id}
                className="absolute border rounded p-2 bg-white cursor-move"
                style={{
                  left: node.position.x,
                  top: node.position.y
                }}
              >
                <div className="text-sm font-medium">{node.type}</div>
                {Object.entries(node.parameters).map(([param, value]) => (
                  <div key={param} className="text-xs">
                    {param}: {value}
                  </div>
                ))}
              </div>
            ))}
            {networkState.links.map((link, idx) => (
              <div key={idx} className="absolute text-xs">
                {link.type}: {link.parameters.length}km
              </div>
            ))}
          </div>

          <Button onClick={simulateNetwork}>Run Simulation</Button>

          {networkState.simulationResults && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Entanglement Rates</h3>
                {Object.entries(networkState.simulationResults.entanglement_rates).map(([pair, rate]) => (
                  <div key={pair} className="text-xs">
                    {pair}: {rate.toFixed(2)} Hz
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Fidelities</h3>
                {Object.entries(networkState.simulationResults.fidelities).map(([pair, fidelity]) => (
                  <div key={pair} className="text-xs">
                    {pair}: {fidelity.toFixed(4)}
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-medium">Secret Key Rates</h3>
                {Object.entries(networkState.simulationResults.secret_key_rates).map(([pair, rate]) => (
                  <div key={pair} className="text-xs">
                    {pair}: {rate.toFixed(2)} bits/s
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
