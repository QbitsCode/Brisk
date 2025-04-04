'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GDSFactoryCodeEditorProps {
  code: string
  onCodeChange: (code: string) => void
  onRunCode: () => void
  results: any
  error?: string | null
}

export default function GDSFactoryCodeEditor({ 
  code, 
  onCodeChange, 
  onRunCode,
  results,
  error 
}: GDSFactoryCodeEditorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Parse and extract visualization data when results change
  useEffect(() => {
    if (results && results.stdout) {
      // Try to find JSON data in the output using compatible regex
      const jsonPattern = /# JSON visualization data begins here:\s*({.*})\s*# JSON visualization data ends here/;
      const jsonMatch = results.stdout.match(jsonPattern);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const visualizationData = JSON.parse(jsonMatch[1]);
          if (visualizationData.preview) {
            setPreviewImage(visualizationData.preview);
            
            // Also add to results object for the visualizer component
            if (!results.visualization && visualizationData.visualization) {
              results.visualization = visualizationData.visualization;
            }
            if (!results.preview && visualizationData.preview) {
              results.preview = visualizationData.preview;
            }
          }
        } catch (e) {
          console.error('Error parsing visualization data:', e);
        }
      }
      
      // Also look for img_data tags in the output using compatible regex
      const imgPattern = /<img_data>([\s\S]*?)<\/img_data>/;
      const imgMatch = results.stdout.match(imgPattern);
      if (imgMatch && imgMatch[1]) {
        setPreviewImage(imgMatch[1]);
        
        // Also add to results object for the visualizer component
        if (!results.visualization) {
          results.visualization = imgMatch[1];
        }
        if (!results.preview) {
          results.preview = imgMatch[1];
        }
      }
    }
  }, [results]);

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      await onRunCode()
    } catch (error) {
      console.error('Error running code:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleExport = () => {
    if (!results || !results.gds_file) {
      toast({
        title: "Export Failed",
        description: "No GDS file available for export. Run your design first.",
        variant: "destructive",
      })
      return
    }

    // Create a download link for the GDS file
    const downloadLink = document.createElement('a')
    downloadLink.href = `data:application/octet-stream;base64,${results.gds_file}`
    downloadLink.download = "quantum_photonic_chip.gds"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    toast({
      title: "GDS File Exported",
      description: "Your quantum photonic chip design has been exported as a GDS file.",
    })
  }

  const handleSave = () => {
    toast({
      title: "Code Saved",
      description: "Your GDSFactory code has been saved.",
    })
  }

  const handleClear = () => {
    const confirmed = confirm('Are you sure you want to clear the code editor?')
    if (confirmed) {
      onCodeChange('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 items-center">
        <Button onClick={handleRunCode} disabled={isRunning}>
          {isRunning ? 'Generating...' : 'Generate Chip'}
        </Button>
        <Button onClick={handleExport} disabled={!results?.gds_file} variant="outline">Export GDS</Button>
        <Button onClick={handleSave} variant="outline">Save</Button>
        <Button onClick={handleClear} variant="outline">Clear</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="relative h-[32rem] border rounded-md overflow-hidden">
          <textarea 
            value={code} 
            onChange={(e) => onCodeChange(e.target.value)}
            className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none bg-gray-900 text-white"
            placeholder="Enter your GDSFactory code here..."
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md mt-4">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="space-y-2 mt-4">
            <Tabs defaultValue="output" className="w-full">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="preview">Quick Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="output" className="mt-2">
                <div className="border rounded min-h-[200px] max-h-[300px] overflow-auto bg-black text-green-500 font-mono text-sm p-4">
                  <div className="text-yellow-400 mb-2">{'>>> Executing GDSFactory code...'}</div>
                  <div className="whitespace-pre-wrap">{results.stdout}</div>
                  {results.stderr && (
                    <div className="text-red-400 whitespace-pre-wrap mt-2">{results.stderr}</div>
                  )}
                  {results.preview && (
                    <div className="mt-4">
                      <img 
                        src={results.preview.startsWith('data:') 
                          ? results.preview 
                          : `data:image/png;base64,${results.preview}`}
                        alt="GDSFactory Preview"
                        className="max-w-full h-auto border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="border rounded p-4 bg-white dark:bg-slate-900 flex justify-center">
                  {results.preview ? (
                    <img 
                      src={results.preview.startsWith('data:') 
                        ? results.preview 
                        : `data:image/png;base64,${results.preview}`}
                      alt="GDSFactory Preview"
                      className="max-w-full h-auto border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="text-center text-gray-500 p-8">
                      <p>No preview available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
