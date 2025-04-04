'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GDSFactoryCodeEditor from '@/components/gdsfactory/GDSFactoryCodeEditor'
import GDSFactoryDocumentation from '@/components/gdsfactory/GDSFactoryDocumentation'
import GDSFactoryTemplates from '@/components/gdsfactory/GDSFactoryTemplates'
import GDSFactoryVisualizer from '@/components/gdsfactory/GDSFactoryVisualizer'
import { Button } from "@/components/ui/button"

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
  const [activeTab, setActiveTab] = useState<string>("code")
  const [debugInfo, setDebugInfo] = useState<any>(null) // For debugging visualization issues

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const loadTemplate = (templateCode: string) => {
    console.log('Loading template code:', templateCode.substring(0, 50) + '...');
    setCode(templateCode);
    setActiveTab("code"); // Switch to code editor tab after template selection
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
      
      // Save debug info
      setDebugInfo({
        hasPreview: !!result.preview,
        previewType: typeof result.preview,
        previewLength: result.preview ? result.preview.length : 0,
        isDataUrl: result.preview ? result.preview.startsWith('data:') : false
      })
      
      setResults(result)
    } catch (error: unknown) {
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

      {/* GUARANTEED Direct Visualization - Full Width, Impossible to Miss */}
      {results && (
        <div className="border-4 border-blue-500 bg-white p-8 rounded-md shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">Quantum Photonic Component Visualization</h2>
          
          {/* Super Direct Image Display - Will show no matter what */}
          <div className="w-full flex justify-center mb-4">
            {results.preview && (
              <img 
                src={results.preview} 
                alt="Quantum Photonic Component"
                className="max-w-[80%] border-2 border-green-500 shadow-lg"
                style={{ maxHeight: '600px' }}
              />
            )}
            
            {!results.preview && results.visualization && (
              <img 
                src={results.visualization} 
                alt="Quantum Photonic Component"
                className="max-w-[80%] border-2 border-yellow-500 shadow-lg"
                style={{ maxHeight: '600px' }}
              />
            )}
            
            {!results.preview && !results.visualization && (
              <div className="bg-red-100 p-8 rounded-md text-center">
                <h3 className="text-lg font-semibold text-red-700 mb-2">No Visualization Available</h3>
                <p>The component couldn't be visualized. Check the error messages below.</p>
              </div>
            )}
          </div>
          
          {/* Direct information about visualization status */}
          <div className="text-center text-sm">
            {results.preview && (
              <p className="text-green-600 font-semibold">✓ Preview generated successfully</p>
            )}
            
            {results.stdout && results.stdout.includes('Successfully saved preview') && (
              <p className="text-green-600 font-semibold mt-2">
                ✓ Image saved and converted successfully
              </p>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
