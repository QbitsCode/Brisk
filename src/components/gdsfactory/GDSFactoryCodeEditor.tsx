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

        {results && (
          <div className="border rounded-md p-4 bg-gray-800 text-white font-mono text-sm h-80 overflow-auto">
            <Tabs defaultValue="output">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="preview">Quick Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="output" className="h-64 overflow-auto">
                {results?.stdout && (
                  <>
                    <p className="text-green-400">&gt;&gt;&gt; Executing GDSFactory code...</p>
                    <pre className="text-yellow-400">{results.stdout || 'No output generated.'}</pre>
                  </>
                )}
                {results?.stderr && (
                  <pre className="text-red-400">{results.stderr}</pre>
                )}
                {error && (
                  <pre className="text-red-400">{error}</pre>
                )}
              </TabsContent>
              <TabsContent value="preview" className="p-0">
                <div className="bg-white dark:bg-slate-800 h-[465px] flex items-center justify-center">
                  {(previewImage || results?.preview) ? (
                    <div className="w-full h-full overflow-auto p-4">
                      <img 
                        src={`data:image/png;base64,${previewImage || results.preview}`} 
                        alt="Photonic Chip Preview"
                        className="max-w-full h-auto mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      No preview available. Generate your chip design to see a quick preview.
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
