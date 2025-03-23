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
      
      // Extract layout visualization
      let layoutImage = results.visualization;
      
      // If the visualization is embedded in stdout, try to extract it
      if (!layoutImage && results.stdout) {
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
                        src={`data:image/png;base64,${visualizationData.layout}`}
                        alt="GDS Layout"
                        className="max-w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p className="mb-2">No visualization available</p>
                      <p className="text-sm">Generate your chip design to see the layout visualization</p>
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
    </div>
  )
}
