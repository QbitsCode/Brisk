import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Operation {
  type: string
  wire?: number
  control?: number
  target?: number
  phi?: number
}

interface CircuitVisualizerProps {
  operations: Operation[]
  numWires: number
  onUpdateOperations: (operations: Operation[]) => void
}

export default function CircuitVisualizer({
  operations,
  numWires,
  onUpdateOperations,
}: CircuitVisualizerProps) {
  const removeOperation = (index: number) => {
    const newOperations = [...operations]
    newOperations.splice(index, 1)
    onUpdateOperations(newOperations)
  }

  const updateOperation = (index: number, updates: Partial<Operation>) => {
    const newOperations = [...operations]
    newOperations[index] = { ...newOperations[index], ...updates }
    onUpdateOperations(newOperations)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Circuit Diagram</h3>
      <div className="grid gap-2">
        {Array.from({ length: numWires }, (_, wireIndex) => (
          <div key={wireIndex} className="flex items-center space-x-2">
            <div className="w-8 text-center text-sm">q{wireIndex}</div>
            <div className="flex-1 border-t border-dashed"></div>
            {operations.map((op, opIndex) => (
              <div key={opIndex} className="relative">
                {renderGate(op, wireIndex)}
                <button
                  onClick={() => removeOperation(opIndex)}
                  className="absolute -top-2 -right-2 text-xs text-red-500 hover:text-red-700"
                >
                  ×
                </button>
                {op.type === 'hadamard' && (
                  <Input
                    type="number"
                    value={op.wire}
                    onChange={(e) => updateOperation(opIndex, { wire: parseInt(e.target.value) })}
                    min={0}
                    max={numWires - 1}
                    className="w-20 absolute -bottom-6"
                  />
                )}
                {op.type === 'cnot' && (
                  <>
                    <Input
                      type="number"
                      value={op.control}
                      onChange={(e) => updateOperation(opIndex, { control: parseInt(e.target.value) })}
                      min={0}
                      max={numWires - 1}
                      className="w-20 absolute -bottom-6"
                      placeholder="Control"
                    />
                    <Input
                      type="number"
                      value={op.target}
                      onChange={(e) => updateOperation(opIndex, { target: parseInt(e.target.value) })}
                      min={0}
                      max={numWires - 1}
                      className="w-20 absolute -bottom-12"
                      placeholder="Target"
                    />
                  </>
                )}
                {op.type === 'phase' && (
                  <>
                    <Input
                      type="number"
                      value={op.wire}
                      onChange={(e) => updateOperation(opIndex, { wire: parseInt(e.target.value) })}
                      min={0}
                      max={numWires - 1}
                      className="w-20 absolute -bottom-6"
                    />
                    <Input
                      type="number"
                      value={op.phi}
                      onChange={(e) => updateOperation(opIndex, { phi: parseFloat(e.target.value) })}
                      step={0.1}
                      className="w-20 absolute -bottom-12"
                      placeholder="Phase"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function renderGate(operation: Operation, wireIndex: number) {
  switch (operation.type) {
    case 'hadamard':
      if (operation.wire === wireIndex) {
        return (
          <div className="w-8 h-8 border rounded flex items-center justify-center bg-blue-100">
            H
          </div>
        )
      }
      break
    case 'cnot':
      if (operation.control === wireIndex) {
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            •
          </div>
        )
      } else if (operation.target === wireIndex) {
        return (
          <div className="w-8 h-8 border rounded-full flex items-center justify-center">
            ⊕
          </div>
        )
      }
      break
    case 'phase':
      if (operation.wire === wireIndex) {
        return (
          <div className="w-8 h-8 border rounded flex items-center justify-center bg-green-100">
            P
          </div>
        )
      }
      break
  }
  return <div className="w-8 h-8"></div>
}
