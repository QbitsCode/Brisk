import React from 'react'
import { Card } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface ComplexNumber {
  real: number
  imag: number
}

interface StateVisualizerProps {
  state: {
    state_vector: ComplexNumber[]
    visualization_data: {
      bloch_sphere: {
        theta: number
        phi: number
        r: number
      }
      probability_dist: number[]
    }
  }
}

export default function StateVisualizer({ state }: StateVisualizerProps) {
  const probabilityData = state.visualization_data.probability_dist.map((prob, idx) => ({
    state: `|${idx.toString(2).padStart(Math.log2(state.state_vector.length), '0')}\u27E9`,
    probability: prob
  }))

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quantum State Visualization</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Probability Distribution</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probabilityData}>
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="probability" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Bloch Sphere Parameters</h4>
          <div className="space-y-2">
            <div>
              <span className="font-medium">θ (theta):</span>{' '}
              {state.visualization_data.bloch_sphere.theta.toFixed(3)}
            </div>
            <div>
              <span className="font-medium">φ (phi):</span>{' '}
              {state.visualization_data.bloch_sphere.phi.toFixed(3)}
            </div>
            <div>
              <span className="font-medium">r:</span>{' '}
              {state.visualization_data.bloch_sphere.r.toFixed(3)}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">State Vector</h4>
            <div className="font-mono text-sm space-y-1">
              {state.state_vector.map((complex, idx) => (
                <div key={idx} className="text-muted-foreground">
                  |{idx}\u27E9: {complex.real.toFixed(3)} {complex.imag >= 0 ? '+' : ''}{complex.imag.toFixed(3)}i
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
