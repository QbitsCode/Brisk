'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GDSFactoryCodeEditor from '@/components/gdsfactory/GDSFactoryCodeEditor'
import GDSFactoryDocumentation from '@/components/gdsfactory/GDSFactoryDocumentation'
import GDSFactoryTemplates from '@/components/gdsfactory/GDSFactoryTemplates'
import GDSFactoryVisualizer from '@/components/gdsfactory/GDSFactoryVisualizer'

export default function PhotonicChipPage() {
  const [code, setCode] = useState<string>(
`# Import the gdsfactory library
import gdsfactory as gf

# Create a simple Mach-Zehnder Interferometer (MZI)
# This can function as a tunable beamsplitter for quantum operations
mzi = gf.components.mzi(
    delta_length=20,  # Path length difference
)

# Display the component
mzi.show()`
  )
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const loadTemplate = (templateCode: string) => {
    setCode(templateCode)
  }

  const runCode = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Sending code to backend:', code)
      
      const response = await fetch('http://localhost:8000/api/quantum/gdsfactory/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify({ code }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        setError(`Error: ${response.status} - ${response.statusText}. ${errorText}`)
        setIsLoading(false)
        return
      }

      const result = await response.json()
      console.log('Got result:', result)
      setResults(result)
    } catch (error) {
      console.error('Error running code:', error)
      setError(`Failed to fetch: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Quantum Photonic Chip Designer</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Design, visualize, and export quantum photonic chips using the powerful GDSFactory Python library.
        </p>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="code">Code Editor</TabsTrigger>
          <TabsTrigger value="visualize">Visualizer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="code" className="mt-0">
            <GDSFactoryCodeEditor 
              code={code} 
              onCodeChange={handleCodeChange} 
              onRunCode={runCode}
              results={results}
              error={error}
            />
          </TabsContent>
          
          <TabsContent value="visualize" className="mt-0">
            <GDSFactoryVisualizer results={results} code={code} />
          </TabsContent>
          
          <TabsContent value="templates" className="mt-0">
            <GDSFactoryTemplates onSelectTemplate={loadTemplate} />
          </TabsContent>
          
          <TabsContent value="docs" className="mt-0">
            <GDSFactoryDocumentation />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
