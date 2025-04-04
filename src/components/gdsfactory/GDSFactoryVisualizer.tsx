'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface GDSFactoryVisualizerProps {
  results: any
  code?: string
}

export default function GDSFactoryVisualizer({ results, code }: GDSFactoryVisualizerProps) {
  const [activeTab, setActiveTab] = useState('layout')
  const { toast } = useToast()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [visualizationData, setVisualizationData] = useState<{
    layout: string | null;
    view3d: string | null;
    simulation: any | null;
  }>({
    layout: null,
    view3d: null,
    simulation: null
  })

  // Process visualization data when results change
  useEffect(() => {
    if (results) {
      console.log('Processing visualization data:', results);
      
      // Extract layout visualization - try multiple possible sources
      let layoutImage = null;
      
      // First try direct fields from the results object
      if (results.preview) {
        layoutImage = results.preview;
        
        // Force-display the preview image, even if it's a data URL
        if (typeof results.preview === 'string') {
          // If it's already a data URL, use it as is
          if (results.preview.startsWith('data:')) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'fixed top-4 right-4 z-50 bg-white p-4 rounded shadow-lg';
            previewDiv.innerHTML = `
              <div class="flex justify-between mb-2">
                <h3 class="font-semibold">GDS Component Preview</h3>
                <button class="text-gray-500 hover:text-gray-700" onclick="this.parentElement.parentElement.remove()">×</button>
              </div>
              <img 
                src="${results.preview}" 
                alt="GDS Preview" 
                class="max-w-[300px] max-h-[300px]"
              />
            `;
            document.body.appendChild(previewDiv);
          }
          // If it's a base64 string without the data URL prefix, add it
          else {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'fixed top-4 right-4 z-50 bg-white p-4 rounded shadow-lg';
            previewDiv.innerHTML = `
              <div class="flex justify-between mb-2">
                <h3 class="font-semibold">GDS Component Preview</h3>
                <button class="text-gray-500 hover:text-gray-700" onclick="this.parentElement.parentElement.remove()">×</button>
              </div>
              <img 
                src="data:image/png;base64,${results.preview}" 
                alt="GDS Preview" 
                class="max-w-[300px] max-h-[300px]"
              />
            `;
            document.body.appendChild(previewDiv);
          }
        }
      } else if (results.visualization) {
        layoutImage = results.visualization;
      }
      
      // If still not found and stdout exists, try to extract from stdout
      if (!layoutImage && results.stdout) {
        // Try to find any base64 image data in the output
        const base64Pattern = /data:image\/png;base64,([A-Za-z0-9+/=]+)/;
        const base64Match = results.stdout.match(base64Pattern);
        
        if (base64Match && base64Match[1]) {
          layoutImage = base64Match[1];
        } else {
          // Look for direct preview/visualization mentions in the output
          const previewMatch = /"preview"\s*:\s*"([^"]+)"/;
          const visualizationMatch = /"visualization"\s*:\s*"([^"]+)"/;
          
          const previewResult = previewMatch.exec(results.stdout);
          const visualizationResult = visualizationMatch.exec(results.stdout);
          
          if (visualizationResult && visualizationResult[1]) {
            layoutImage = visualizationResult[1];
          } else if (previewResult && previewResult[1]) {
            layoutImage = previewResult[1];
          }
        }
      }
      
      console.log('Layout image found:', layoutImage ? 'Yes' : 'No');
      
      setVisualizationData({
        layout: layoutImage,
        view3d: results.visualization_3d || null,
        simulation: results.simulation_results || null
      });
      
      handleResetView();
    }
  }, [results]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleResetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleExportGDS = () => {
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

  const QuickPreviewTab = () => {
    // First try preview, then visualization
    const previewImage = results?.preview || results?.visualization;
    
    // Debug output
    console.log('Quick Preview data:', {
      hasResults: !!results,
      hasPreview: !!results?.preview,
      hasVisualization: !!results?.visualization,
      previewLength: results?.preview?.length || 0,
      stdoutLength: results?.stdout?.length || 0
    });
    
    return (
      <div className="w-full h-full min-h-[400px] border rounded p-2 bg-white dark:bg-slate-900 overflow-auto">
        {previewImage ? (
          <div className="flex justify-center">
            <img 
              src={previewImage.startsWith('data:') 
                ? previewImage 
                : `data:image/png;base64,${previewImage}`}
              alt="Quantum Photonic Component Preview"
              className="max-w-full h-auto"
            />
          </div>
        ) : results?.stdout ? (
          // If no image but we have stdout, check for error messages or other information
          <div className="text-sm font-mono whitespace-pre-wrap p-2">
            <h3 className="font-bold mb-2">Backend Output:</h3>
            <pre className="bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300 p-3 rounded overflow-auto">
              {results.stdout}
            </pre>
            {results.stderr && (
              <>
                <h3 className="font-bold mt-4 mb-2 text-red-500">Errors:</h3>
                <pre className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded overflow-auto">
                  {results.stderr}
                </pre>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="mb-2">No preview available</p>
            <p className="text-sm">Generate your chip design first by clicking "Generate Chip"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="3d">3D View</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="layout" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="min-h-[500px] border rounded-md flex flex-col">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 flex justify-between items-center">
                  <div className="space-x-1">
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <span className="text-lg">+</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <span className="text-lg">-</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetView}>
                      Reset View
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportGDS}>
                    Export GDS
                  </Button>
                </div>
                <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden">
                  {visualizationData.layout ? (
                    <div 
                      className="relative"
                      style={{
                        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                        transition: 'transform 0.1s ease-out'
                      }}
                    >
                      <img 
                        src={visualizationData.layout.startsWith('data:') 
                          ? visualizationData.layout 
                          : `data:image/png;base64,${visualizationData.layout}`}
                        alt="GDS Layout"
                        className="max-w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p className="mb-2">No visualization available</p>
                      <p className="text-sm">Generate your chip design to see the layout visualization</p>
                      {results && results.stderr && (
                        <div className="mt-4 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-300">
                          <p className="font-bold">Error:</p>
                          <pre className="mt-1 whitespace-pre-wrap">{results.stderr}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="3d" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="min-h-[500px] border rounded-md flex items-center justify-center bg-white dark:bg-slate-900">
                {visualizationData.view3d ? (
                  <div className="w-full h-full">
                    <img 
                      src={`data:image/png;base64,${visualizationData.view3d}`}
                      alt="3D Visualization"
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="mb-2">No 3D visualization available</p>
                    <p className="text-sm">3D visualization requires a valid quantum photonic chip design</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="simulation" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="min-h-[500px] border rounded-md flex items-center justify-center bg-white dark:bg-slate-900">
                {visualizationData.simulation ? (
                  <div className="w-full h-full overflow-auto p-4">
                    {results.simulation_plots && results.simulation_plots.map((plot: string, i: number) => (
                      <div key={i} className="mb-4">
                        <img 
                          src={`data:image/png;base64,${plot}`}
                          alt={`Simulation Plot ${i+1}`}
                          className="max-w-full h-auto mx-auto"
                        />
                      </div>
                    ))}
                    <div className="mt-4 font-mono text-sm">
                      <h3 className="font-bold mb-2">Simulation Data:</h3>
                      <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto">
                        {JSON.stringify(visualizationData.simulation, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="mb-2">No simulation results available</p>
                    <p className="text-sm">Run a simulation on your design to see optical behavior</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="space-y-2 mt-4">
        <Tabs defaultValue="output" className="w-full">
          <TabsList>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="preview">Quick Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="mt-2">
            <div className="border rounded min-h-[200px] max-h-[300px] overflow-auto bg-black text-green-500 font-mono text-sm p-4">
              {results ? (
                <>
                  <div className="text-yellow-400 mb-2">{'>>> Executing GDSFactory code...'}</div>
                  <div className="whitespace-pre-wrap">{results.stdout}</div>
                  {results.stderr && (
                    <div className="text-red-400 whitespace-pre-wrap mt-2">{results.stderr}</div>
                  )}
                </>
              ) : (
                <div className="text-gray-400">Run your code to see output here</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="preview" className="mt-2">
            <QuickPreviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
