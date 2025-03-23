'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import PercevalCodeEditor from "@/components/perceval/PercevalCodeEditor"
import PercevalVisualizer from "@/components/perceval/PercevalVisualizer"
import PercevalDocumentation from "@/components/perceval/PercevalDocumentation"

export default function PercevalPage() {
  const { toast } = useToast()
  const [currentCode, setCurrentCode] = useState<string>(`# Perceval example code
import perceval as pcvl
import numpy as np

# Create a simple circuit with a beamsplitter
circuit = pcvl.Circuit(2)
circuit.add(0, pcvl.BS())  # Add a 50/50 beamsplitter

# Define input state (single photon in first mode)
input_state = pcvl.BasicState([1, 0])

# Run the simulation
backend = pcvl.BackendFactory().get_backend("SLOS")
simulator = pcvl.Processor(backend, circuit)
result = simulator.process(input_state)

# Display the results
print(result)
`)
  
  const [simulationResults, setSimulationResults] = useState<any>(null)
  
  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode)
  }
  
  const runSimulation = async () => {
    toast({
      title: "Executing Perceval Code",
      description: "Sending code to quantum backend for processing...",
    })
    
    try {
      const response = await fetch('http://localhost:8000/api/quantum/perceval/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: currentCode }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to execute Perceval code')
      }
      
      const data = await response.json()
      setSimulationResults(data)
      
      toast({
        title: "Execution Complete",
        description: "The Perceval simulation has finished successfully.",
      })
    } catch (error) {
      console.error('Execution error:', error)
      toast({
        title: "Execution Failed",
        description: "Failed to run the simulation. Please check your code.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Perceval Quantum Photonics Framework</h1>
        <p className="text-muted-foreground">
          Program, simulate, and visualize photonic quantum computers with Perceval - an open source framework from Quandela
        </p>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="code">Code Editor</TabsTrigger>
          <TabsTrigger value="visualize">Visualize</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perceval Code Editor</CardTitle>
              <CardDescription>Write and execute Perceval quantum code</CardDescription>
            </CardHeader>
            <CardContent>
              <PercevalCodeEditor 
                code={currentCode} 
                onCodeChange={handleCodeChange} 
                onRunCode={runSimulation}
                results={simulationResults}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visualize" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Circuit Visualization</CardTitle>
              <CardDescription>Visualize and interact with quantum photonic circuits</CardDescription>
            </CardHeader>
            <CardContent>
              <PercevalVisualizer code={currentCode} results={simulationResults} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perceval Documentation</CardTitle>
              <CardDescription>Quick reference guides and examples</CardDescription>
            </CardHeader>
            <CardContent>
              <PercevalDocumentation />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
