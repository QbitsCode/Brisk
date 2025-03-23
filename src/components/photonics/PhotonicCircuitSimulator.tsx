'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface CircuitComponent {
  id: string;
  type: string;
  params: Record<string, number>;
}

interface CircuitConnection {
  source: { componentId: string; port: string };
  target: { componentId: string; port: string };
}

interface CircuitDesign {
  components: CircuitComponent[];
  connections: CircuitConnection[];
}

interface SimulationResult {
  state: number[][];
  probabilities: number[];
  state_visualization: string;
  gds_layout: string;
  transmission_spectrum?: number[];
  wavelengths?: number[];
}

interface PhotonicCircuitSimulatorProps {
  designData: CircuitDesign | null;
}

export default function PhotonicCircuitSimulator({ designData }: PhotonicCircuitSimulatorProps) {
  const [simulationParams, setSimulationParams] = useState({
    wavelength: 1550, // nm
    resolution: 100,
    temperature: 25, // °C
    inputPower: 1, // mW
    simulationType: 'modal'
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const runSimulation = async () => {
    if (!designData || designData.components.length === 0) {
      toast({
        title: "Error",
        description: "No circuit design to simulate. Please design a circuit first.",
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    setSimulationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    try {
      // Convert circuit design to API format
      const apiRequest = {
        circuit: {
          components: designData.components.map(comp => ({
            id: comp.id,
            type: comp.type,
            parameters: comp.params
          })),
          connections: designData.connections.map(conn => ({
            source: {
              component_id: conn.source.componentId,
              port: conn.source.port
            },
            target: {
              component_id: conn.target.componentId,
              port: conn.target.port
            }
          }))
        },
        simulation_parameters: {
          wavelength: simulationParams.wavelength,
          resolution: simulationParams.resolution,
          temperature: simulationParams.temperature,
          input_power: simulationParams.inputPower,
          simulation_type: simulationParams.simulationType
        }
      };

      // Call API
      const response = await fetch('http://localhost:8000/api/quantum/circuit/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data = await response.json();
      setSimulationResults(data);
      
      toast({
        title: "Simulation Complete",
        description: "Circuit simulation has completed successfully.",
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: "Failed to run the simulation. Please check your circuit design.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setSimulationProgress(100);
      setIsSimulating(false);
    }
  };

  const handleParameterChange = (param: string, value: number | string) => {
    setSimulationParams({
      ...simulationParams,
      [param]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quantum Photonic Circuit Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Panel - Simulation Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simulationType">Simulation Type</Label>
                <Select 
                  value={simulationParams.simulationType}
                  onValueChange={(value: string) => handleParameterChange('simulationType', value)}
                >
                  <SelectTrigger id="simulationType">
                    <SelectValue placeholder="Select simulation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modal">Modal Analysis</SelectItem>
                    <SelectItem value="fdtd">FDTD</SelectItem>
                    <SelectItem value="beam">Beam Propagation</SelectItem>
                    <SelectItem value="quantum">Quantum State</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wavelength">Wavelength (nm)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="wavelength"
                    value={[simulationParams.wavelength]}
                    min={1300}
                    max={1600}
                    step={0.1}
                    onValueChange={([value]) => handleParameterChange('wavelength', value)}
                  />
                  <span className="w-12 text-right">{simulationParams.wavelength}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="resolution"
                    value={[simulationParams.resolution]}
                    min={10}
                    max={500}
                    step={10}
                    onValueChange={([value]) => handleParameterChange('resolution', value)}
                  />
                  <span className="w-12 text-right">{simulationParams.resolution}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="temperature"
                    value={[simulationParams.temperature]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleParameterChange('temperature', value)}
                  />
                  <span className="w-12 text-right">{simulationParams.temperature}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inputPower">Input Power (mW)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="inputPower"
                    value={[simulationParams.inputPower]}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onValueChange={([value]) => handleParameterChange('inputPower', value)}
                  />
                  <span className="w-12 text-right">{simulationParams.inputPower}</span>
                </div>
              </div>

              <Button 
                onClick={runSimulation}
                disabled={isSimulating || !designData}
                className="w-full mt-4"
              >
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </Button>

              {isSimulating && (
                <div className="space-y-2">
                  <Progress value={simulationProgress} className="w-full" />
                  <p className="text-sm text-center">{Math.round(simulationProgress)}% Complete</p>
                </div>
              )}
            </div>

            {/* Middle and Right Panel - Simulation Results */}
            <div className="md:col-span-2">
              {simulationResults ? (
                <Tabs defaultValue="state" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="state">Quantum State</TabsTrigger>
                    <TabsTrigger value="layout">Circuit Layout</TabsTrigger>
                    <TabsTrigger value="transmission">Spectra</TabsTrigger>
                    <TabsTrigger value="field">Field Visualization</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="state" className="p-4 border rounded-md mt-2">
                    {simulationResults.state_visualization && (
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-2">Quantum State Probabilities</h3>
                        <img 
                          src={`data:image/png;base64,${simulationResults.state_visualization}`} 
                          alt="Quantum State Visualization"
                          className="max-w-full h-auto"
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="layout" className="p-4 border rounded-md mt-2">
                    {simulationResults.gds_layout && (
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-2">GDS Layout</h3>
                        <img 
                          src={`data:image/png;base64,${simulationResults.gds_layout}`} 
                          alt="GDS Layout"
                          className="max-w-full h-auto"
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="transmission" className="p-4 border rounded-md mt-2">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-semibold mb-2">Transmission Spectrum</h3>
                      {simulationResults.transmission_spectrum ? (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                          <p>Transmission Spectrum Graph Would Render Here</p>
                        </div>
                      ) : (
                        <p>No transmission data available for this simulation.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="field" className="p-4 border rounded-md mt-2">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-semibold mb-2">Optical Field Visualization</h3>
                      <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                        <p>Field Visualization Would Render Here</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 border rounded-md">
                  <p className="text-lg text-muted-foreground mb-4">
                    {designData ? 'Run simulation to see results here' : 'Design a circuit first in the Design tab'}
                  </p>
                  {!designData && (
                    <p className="text-sm text-muted-foreground text-center">
                      Go to the Design tab to create a photonic circuit, then return here to simulate it.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
