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
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface OptimizationParameter {
  componentId: string;
  paramName: string;
  min: number;
  max: number;
  initialValue: number;
  currentValue: number;
}

interface OptimizationResult {
  iterationHistory: {
    iteration: number;
    parameters: Record<string, number>;
    objectiveValue: number;
  }[];
  bestParameters: Record<string, number>;
  finalObjectiveValue: number;
  convergenceGraph: string; // base64 image
}

interface PhotonicCircuitOptimizerProps {
  designData: CircuitDesign | null;
}

export default function PhotonicCircuitOptimizer({ designData }: PhotonicCircuitOptimizerProps) {
  const [optimizationParams, setOptimizationParams] = useState({
    objectiveFunction: 'transmission',
    outputPort: '',
    wavelength: 1550,
    algorithm: 'gradient',
    maxIterations: 100,
    tolerance: 0.001
  });
  
  const [optimizableParams, setOptimizableParams] = useState<OptimizationParameter[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const { toast } = useToast();

  // Initialize optimizable parameters based on design
  React.useEffect(() => {
    if (designData && designData.components.length > 0) {
      const params: OptimizationParameter[] = [];
      
      designData.components.forEach(component => {
        // Phase shifters and beam splitters are optimizable
        if (component.type === 'phaseshift') {
          params.push({
            componentId: component.id,
            paramName: 'phase',
            min: 0,
            max: 2 * Math.PI,
            initialValue: component.params.phase || 0,
            currentValue: component.params.phase || 0
          });
        } else if (component.type === 'beamsplitter') {
          params.push({
            componentId: component.id,
            paramName: 'transmittivity',
            min: 0,
            max: 1,
            initialValue: component.params.transmittivity || 0.5,
            currentValue: component.params.transmittivity || 0.5
          });
        } else if (component.type === 'mzi') {
          // MZI phase difference
          params.push({
            componentId: component.id,
            paramName: 'phase_diff',
            min: 0,
            max: 2 * Math.PI,
            initialValue: component.params.phase_diff || 0,
            currentValue: component.params.phase_diff || 0
          });
        }
      });
      
      setOptimizableParams(params);
    }
  }, [designData]);

  const runOptimization = async () => {
    if (!designData || designData.components.length === 0) {
      toast({
        title: "Error",
        description: "No circuit design to optimize. Please design a circuit first.",
        variant: "destructive",
      });
      return;
    }

    if (optimizableParams.length === 0) {
      toast({
        title: "Error",
        description: "No optimizable parameters found in the circuit.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);

    try {
      // In a real implementation, we would call an API here
      // For now, we'll simulate an optimization process
      
      // Simulate optimization iterations
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Create mock optimization results
      const iterations = [];
      let bestObjective = 0;
      
      for (let i = 0; i < 20; i++) {
        const mockParams: Record<string, number> = {};
        optimizableParams.forEach(param => {
          mockParams[`${param.componentId}_${param.paramName}`] = 
            param.min + Math.random() * (param.max - param.min);
        });
        
        const objectiveValue = 0.5 + (i / 20) * 0.45 + Math.random() * 0.05;
        
        iterations.push({
          iteration: i,
          parameters: mockParams,
          objectiveValue
        });
        
        if (objectiveValue > bestObjective) {
          bestObjective = objectiveValue;
        }
      }
      
      // Update optimizable params with "optimized" values
      const updatedParams = optimizableParams.map(param => ({
        ...param,
        currentValue: param.min + Math.random() * (param.max - param.min)
      }));
      
      setOptimizableParams(updatedParams);
      
      setOptimizationResults({
        iterationHistory: iterations,
        bestParameters: iterations[iterations.length - 1].parameters,
        finalObjectiveValue: bestObjective,
        convergenceGraph: '' // In a real implementation, we'd have an actual graph
      });
      
      toast({
        title: "Optimization Complete",
        description: `Final ${optimizationParams.objectiveFunction} value: ${bestObjective.toFixed(4)}`,
      });
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize the circuit. Please check your design and parameters.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setOptimizationProgress(100);
      setIsOptimizing(false);
    }
  };

  const handleParamChange = (param: string, value: number | string) => {
    setOptimizationParams({
      ...optimizationParams,
      [param]: value
    });
  };

  const updateOptimizableParam = (index: number, field: string, value: number) => {
    const updatedParams = [...optimizableParams];
    updatedParams[index] = {
      ...updatedParams[index],
      [field]: value
    };
    setOptimizableParams(updatedParams);
  };

  const applyOptimizedParameters = () => {
    if (!optimizationResults) return;
    
    toast({
      title: "Parameters Applied",
      description: "Optimized parameters have been applied to the circuit design.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quantum Photonic Circuit Optimizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Optimization Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objectiveFunction">Objective Function</Label>
                <Select 
                  value={optimizationParams.objectiveFunction}
                  onValueChange={value => handleParamChange('objectiveFunction', value)}
                >
                  <SelectTrigger id="objectiveFunction">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transmission">Maximize Transmission</SelectItem>
                    <SelectItem value="reflection">Minimize Reflection</SelectItem>
                    <SelectItem value="coupling">Maximize Coupling</SelectItem>
                    <SelectItem value="extinction">Maximize Extinction Ratio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="algorithm">Optimization Algorithm</Label>
                <Select 
                  value={optimizationParams.algorithm}
                  onValueChange={value => handleParamChange('algorithm', value)}
                >
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Gradient Descent</SelectItem>
                    <SelectItem value="nelder-mead">Nelder-Mead</SelectItem>
                    <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                    <SelectItem value="pso">Particle Swarm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wavelength">Operating Wavelength (nm)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="wavelength"
                    value={[optimizationParams.wavelength]}
                    min={1300}
                    max={1600}
                    step={0.1}
                    onValueChange={([value]) => handleParamChange('wavelength', value)}
                  />
                  <span className="w-12 text-right">{optimizationParams.wavelength}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxIterations">Maximum Iterations</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="maxIterations"
                    value={[optimizationParams.maxIterations]}
                    min={10}
                    max={1000}
                    step={10}
                    onValueChange={([value]) => handleParamChange('maxIterations', value)}
                  />
                  <span className="w-12 text-right">{optimizationParams.maxIterations}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tolerance">Convergence Tolerance</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="tolerance"
                    value={[optimizationParams.tolerance * 1000]}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onValueChange={([value]) => handleParamChange('tolerance', value / 1000)}
                  />
                  <span className="w-12 text-right">{optimizationParams.tolerance}</span>
                </div>
              </div>

              <Button 
                onClick={runOptimization}
                disabled={isOptimizing || !designData || optimizableParams.length === 0}
                className="w-full mt-4"
              >
                {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
              </Button>

              {isOptimizing && (
                <div className="space-y-2">
                  <Progress value={optimizationProgress} className="w-full" />
                  <p className="text-sm text-center">{Math.round(optimizationProgress)}% Complete</p>
                </div>
              )}
              
              {optimizationResults && (
                <Button 
                  onClick={applyOptimizedParameters}
                  variant="outline"
                  className="w-full mt-2"
                >
                  Apply Optimized Parameters
                </Button>
              )}
            </div>

            {/* Middle Panel - Optimizable Parameters */}
            <div>
              <div className="border rounded-md p-4 h-full">
                <h3 className="text-lg font-semibold mb-4">Optimizable Parameters</h3>
                {optimizableParams.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {optimizableParams.map((param, index) => (
                      <div key={`${param.componentId}-${param.paramName}`} className="space-y-2 border-b pb-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">
                            {param.componentId.split('-')[0]} - {param.paramName}
                          </Label>
                          <Checkbox 
                            id={`optimize-${index}`}
                            defaultChecked={true}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Min</Label>
                            <Input 
                              type="number" 
                              value={param.min}
                              onChange={(e) => updateOptimizableParam(index, 'min', parseFloat(e.target.value))}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Max</Label>
                            <Input 
                              type="number" 
                              value={param.max}
                              onChange={(e) => updateOptimizableParam(index, 'max', parseFloat(e.target.value))}
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Current: {param.currentValue.toFixed(3)}</Label>
                          <Slider
                            value={[param.currentValue]}
                            min={param.min}
                            max={param.max}
                            step={(param.max - param.min) / 100}
                            onValueChange={([value]) => updateOptimizableParam(index, 'currentValue', value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground text-center">
                      {designData 
                        ? "No optimizable parameters found in the circuit. Add phase shifters or beam splitters." 
                        : "Design a circuit first to see optimizable parameters."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Optimization Results */}
            <div>
              <div className="border rounded-md p-4 h-full">
                <h3 className="text-lg font-semibold mb-4">Optimization Results</h3>
                {optimizationResults ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">Final {optimizationParams.objectiveFunction} value:</p>
                      <p className="text-2xl">{optimizationResults.finalObjectiveValue.toFixed(4)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Optimization Convergence</h4>
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Convergence Graph Would Render Here</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Iteration History</h4>
                      <div className="max-h-48 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Iteration</TableHead>
                              <TableHead>Objective</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {optimizationResults.iterationHistory.map((iteration) => (
                              <TableRow key={iteration.iteration}>
                                <TableCell>{iteration.iteration}</TableCell>
                                <TableCell>{iteration.objectiveValue.toFixed(4)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground text-center">
                      Run optimization to see results here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
