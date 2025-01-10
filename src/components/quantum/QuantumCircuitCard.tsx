'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import StateVisualizer from './StateVisualizer'
import CircuitVisualizer from './CircuitVisualizer'

interface Operation {
  type: string
  wire?: number
  control?: number
  target?: number
  phi?: number
}

interface QuantumState {
  state_vector: Array<{ real: number, imag: number }>
  visualization_data: {
    bloch_sphere: {
      theta: number
      phi: number
      r: number
    }
    probability_dist: number[]
  }
}

export default function QuantumCircuitCard() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [numWires, setNumWires] = useState(2)
  const [quantumState, setQuantumState] = useState<QuantumState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addGate = (gateType: string) => {
    let newOperation: Operation
    
    switch (gateType) {
      case 'hadamard':
        newOperation = { type: 'hadamard', wire: 0 }
        break
      case 'cnot':
        newOperation = { type: 'cnot', control: 0, target: 1 }
        break
      case 'phase':
        newOperation = { type: 'phase', wire: 0, phi: Math.PI/4 }
        break
      default:
        return
    }
    
    setOperations([...operations, newOperation])
  }

  const simulateCircuit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/quantum/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations,
          num_wires: numWires,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to simulate quantum circuit')
      }

      const data = await response.json()
      setQuantumState(data)
      toast({
        title: "Success",
        description: "Circuit simulation completed successfully",
      })
    } catch (error) {
      console.error('Error simulating circuit:', error)
      toast({
        title: "Error",
        description: "Failed to simulate quantum circuit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantum Circuit Designer</CardTitle>
        <CardDescription>Add gates and simulate quantum circuits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={() => addGate('hadamard')} variant="outline">
              Add Hadamard
            </Button>
            <Button onClick={() => addGate('cnot')} variant="outline">
              Add CNOT
            </Button>
            <Button onClick={() => addGate('phase')} variant="outline">
              Add Phase
            </Button>
          </div>

          <div className="border rounded p-4">
            <h3 className="text-sm font-medium mb-2">Circuit Operations:</h3>
            {operations.map((op, idx) => (
              <div key={idx} className="text-sm text-muted-foreground">
                {op.type === 'hadamard' && `H on wire ${op.wire}`}
                {op.type === 'cnot' && `CNOT control=${op.control} target=${op.target}`}
                {op.type === 'phase' && `Phase(${op.phi?.toFixed(2)}) on wire ${op.wire}`}
              </div>
            ))}
          </div>

          <div className="border rounded p-4">
            <CircuitVisualizer
              operations={operations}
              numWires={numWires}
              onUpdateOperations={setOperations}
            />
          </div>

          <Button onClick={simulateCircuit} disabled={isLoading}>
            {isLoading ? 'Simulating...' : 'Simulate Circuit'}
          </Button>

          {quantumState && (
            <StateVisualizer state={quantumState} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
