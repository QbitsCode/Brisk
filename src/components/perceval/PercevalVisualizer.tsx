'use client'

import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PercevalVisualizerProps {
  code: string
  results: any
}

export default function PercevalVisualizer({ code, results }: PercevalVisualizerProps) {
  const [circuitVisualization, setCircuitVisualization] = useState<string | null>(null)
  const [stateVisualization, setStateVisualization] = useState<string | null>(null)
  const [processingVisualization, setProcessingVisualization] = useState(false)
  const { toast } = useToast()
  
  // Parse the code to extract circuit information for visualization
  useEffect(() => {
    if (code) {
      generateVisualizations()
    }
  }, [code, results])
  
  const generateVisualizations = async () => {
    if (!code) return
    
    setProcessingVisualization(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/quantum/perceval/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate visualizations')
      }
      
      const data = await response.json()
      
      if (data.circuit_visualization) {
        setCircuitVisualization(data.circuit_visualization)
      }
      
      if (data.state_visualization) {
        setStateVisualization(data.state_visualization)
      }
    } catch (error) {
      console.error('Visualization error:', error)
      toast({
        title: "Visualization Failed",
        description: "Failed to generate visualizations. Please check your code.",
        variant: "destructive",
      })
    } finally {
      setProcessingVisualization(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="circuit" className="w-full">
        <TabsList>
          <TabsTrigger value="circuit">Circuit Diagram</TabsTrigger>
          <TabsTrigger value="state">Quantum State</TabsTrigger>
          <TabsTrigger value="unitary">Unitary Matrix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="circuit" className="mt-2">
          <Card className="p-4 min-h-[400px] flex items-center justify-center">
            {processingVisualization ? (
              <div className="text-center">
                <p className="text-lg mb-2">Generating circuit visualization...</p>
                <div className="animate-pulse h-6 w-40 bg-slate-200 rounded mx-auto"></div>
              </div>
            ) : circuitVisualization ? (
              <img 
                src={`data:image/png;base64,${circuitVisualization}`} 
                alt="Circuit Visualization" 
                className="max-w-full h-auto"
              />
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">No circuit visualization available.</p>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Create a Perceval circuit and use <code className="bg-slate-100 p-1 rounded">pcvl.pdisplay(circuit)</code> in your code to generate a visualization.
                </p>
                <Button onClick={generateVisualizations}>Generate Visualization</Button>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="state" className="mt-2">
          <Card className="p-4 min-h-[400px] flex items-center justify-center">
            {processingVisualization ? (
              <div className="text-center">
                <p className="text-lg mb-2">Generating state visualization...</p>
                <div className="animate-pulse h-6 w-40 bg-slate-200 rounded mx-auto"></div>
              </div>
            ) : stateVisualization ? (
              <img 
                src={`data:image/png;base64,${stateVisualization}`} 
                alt="State Visualization" 
                className="max-w-full h-auto"
              />
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">No state visualization available.</p>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Process a quantum state through your circuit and visualize the results to see a state visualization.
                </p>
                <Button onClick={generateVisualizations}>Generate Visualization</Button>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="unitary" className="mt-2">
          <Card className="p-4 min-h-[400px] flex items-center justify-center">
            {(results && results.unitary) ? (
              <div className="font-mono p-4 overflow-auto max-h-[400px] w-full">
                <table className="w-full border-collapse">
                  <tbody>
                    {JSON.parse(results.unitary).map((row: any[], i: number) => (
                      <tr key={i}>
                        {row.map((cell: any, j: number) => (
                          <td key={j} className="border p-1 text-center">
                            {typeof cell === 'object' && cell !== null && 'real' in cell && 'imag' in cell
                              ? `${cell.real.toFixed(3)} ${cell.imag >= 0 ? '+' : ''}${cell.imag.toFixed(3)}i`
                              : typeof cell === 'number' 
                                ? cell.toFixed(3)
                                : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">No unitary matrix available.</p>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Use <code className="bg-slate-100 p-1 rounded">circuit.compute_unitary()</code> in your code to generate the unitary matrix.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Interactive Circuit Builder</h3>
        <div className="border rounded-md p-4 min-h-[300px] bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Interactive circuit builder coming soon!</p>
            <p className="text-sm text-muted-foreground max-w-lg">
              In future updates, you'll be able to visually design Perceval circuits and automatically generate the corresponding code.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
