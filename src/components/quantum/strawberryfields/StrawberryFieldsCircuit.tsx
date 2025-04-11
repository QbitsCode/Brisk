'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Play, Trash, RotateCcw, Terminal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Circuit visualization components
interface GateProps {
  type: string;
  mode: number;
  parameter?: number;
}

interface CircuitState {
  modes: number;
  operations: GateProps[];
  results: any | null;
}

const GATE_COLORS = {
  'beamsplitter': 'bg-blue-500',
  'displacement': 'bg-green-500',
  'squeezing': 'bg-purple-500',
  'rotation': 'bg-amber-500',
  'measurement': 'bg-red-500',
};

const Gate: React.FC<{ gate: GateProps; onRemove: () => void }> = ({ gate, onRemove }) => {
  const baseClasses = `${GATE_COLORS[gate.type] || 'bg-gray-500'} text-white px-3 py-2 rounded-md flex flex-col items-center justify-center relative`;
  
  return (
    <div className={baseClasses}>
      <button 
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
      >
        ×
      </button>
      <span className="font-bold">{gate.type}</span>
      <span className="text-xs">Mode: {gate.mode}</span>
      {gate.parameter !== undefined && (
        <span className="text-xs">Param: {gate.parameter.toFixed(2)}</span>
      )}
    </div>
  );
};

const StrawberryFieldsCircuit: React.FC<{ className?: string; onCircuitChange?: (circuit: CircuitState) => void }> = ({ 
  className = '',
  onCircuitChange
}) => {
  const [circuit, setCircuit] = useState<CircuitState>({
    modes: 2,
    operations: [],
    results: null
  });
  
  const [newGate, setNewGate] = useState<{
    type: string;
    mode: number;
    parameter: number;
  }>({
    type: 'beamsplitter',
    mode: 0,
    parameter: 0.5
  });

  const [pythonCode, setPythonCode] = useState<string>('');
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [isCodeEdited, setIsCodeEdited] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Notify parent component when circuit changes
    if (onCircuitChange) {
      onCircuitChange(circuit);
    }

    // Generate Python code from circuit
    generatePythonCode();
  }, [circuit, onCircuitChange]);

  const generatePythonCode = () => {
    // Skip generation if user has edited the code manually
    if (isCodeEdited) return;
    
    // Generate Python code for Strawberry Fields based on the circuit
    let code = '# Strawberry Fields quantum circuit\nimport strawberryfields as sf\nimport numpy as np\nfrom strawberryfields.ops import *\n\n';
    
    // Create program and engine
    code += `# Initialize program with ${circuit.modes} modes\nprog = sf.Program(${circuit.modes})\n`;
    code += 'eng = sf.Engine("gaussian")\n\n';
    
    // Add operations
    code += '# Define quantum circuit\nwith prog.context as q:\n';
    
    if (circuit.operations.length === 0) {
      code += '    # Add gates to your circuit\n    pass\n';
    } else {
      circuit.operations.forEach((gate, index) => {
        const param = gate.parameter !== undefined ? gate.parameter.toFixed(2) : '0.5';
        
        switch(gate.type) {
          case 'beamsplitter':
            code += `    BSgate(${param}, 0) | (q[${gate.mode}], q[${Math.min(circuit.modes-1, gate.mode+1)}])\n`;
            break;
          case 'displacement':
            code += `    Dgate(${param}, 0) | q[${gate.mode}]\n`;
            break;
          case 'squeezing':
            code += `    Sgate(${param}) | q[${gate.mode}]\n`;
            break;
          case 'rotation':
            code += `    Rgate(${param}) | q[${gate.mode}]\n`;
            break;
          case 'measurement':
            code += `    MeasureFock() | q[${gate.mode}]\n`;
            break;
          default:
            break;
        }
      });
    }
    
    // Add simulation and results
    code += '\n# Run simulation\nresults = eng.run(prog)\n\n';
    code += '# Print results\nprint(results.state)\n';
    
    setPythonCode(code);
  };
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPythonCode(e.target.value);
    setIsCodeEdited(true);
  };

  const handleAddGate = () => {
    setCircuit(prev => ({
      ...prev,
      operations: [...prev.operations, { ...newGate }]
    }));
    
    toast({
      title: "Gate Added",
      description: `Added ${newGate.type} gate to mode ${newGate.mode}`,
      duration: 2000,
    });
  };

  const handleRemoveGate = (index: number) => {
    setCircuit(prev => ({
      ...prev,
      operations: prev.operations.filter((_, i) => i !== index)
    }));
  };

  const handleRunSimulation = async () => {
    try {
      setIsCodeRunning(true);
      
      // In a real implementation, this would call a backend API that uses Strawberry Fields
      // For now, we'll simulate a response
      const simulatedResults = {
        state: {
          type: 'gaussian',
          fock_prob: [0.83, 0.14, 0.03, 0.0],
          mean_photon: circuit.operations.length > 2 ? 1.2 : 0.8,
          success: true
        }
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCircuit(prev => ({
        ...prev,
        results: simulatedResults
      }));
      
      toast({
        title: "Simulation Complete",
        description: "Circuit simulation finished successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "There was an error running the simulation.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCodeRunning(false);
    }
  };

  const handleRunCode = async () => {
    try {
      setIsCodeRunning(true);
      toast({
        title: "Running Code",
        description: "Executing in Strawberry Fields environment...",
        duration: 2000,
      });
      
      // Simulate backend API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, we would send the code to a backend service
      // that runs the Python code using Strawberry Fields and captures the output
      
      // For now, we'll simulate a response based on the code content
      let simulatedOutput = 'Executing code...\n';
      
      // Check if the code has common patterns to simulate different outputs
      if (pythonCode.includes('BSgate') && pythonCode.includes('MeasureFock')) {
        simulatedOutput += '\n> Running circuit with beam splitters and measurements...\n';
        simulatedOutput += '> Preparing quantum state...\n';
        simulatedOutput += '> Applying operations...\n';
        simulatedOutput += '> Performing measurements...\n';
        simulatedOutput += '\n<GaussianState: num_modes=2, pure=True, hbar=2>\n';
      } else if (pythonCode.includes('Sgate')) {
        simulatedOutput += '\n> Calculating squeezed state evolution...\n';
        simulatedOutput += '> Applying squeezing operation with r=' + 
          (pythonCode.match(/Sgate\(([\d.]+)/) ? pythonCode.match(/Sgate\(([\d.]+)/)[1] : '0.5') + '\n';
        simulatedOutput += '\n<GaussianState: num_modes=2, pure=True, hbar=2>\n';
      } else {
        // Generic output for any other code
        simulatedOutput += '\n> Initializing quantum system...\n';
        simulatedOutput += '> Setting up Strawberry Fields engine...\n';
        simulatedOutput += '> Program executed successfully\n';
        simulatedOutput += '\n<GaussianState: num_modes=' + circuit.modes + ', pure=True, hbar=2>\n';
      }
      
      const simulatedResults = {
        state: {
          type: 'gaussian',
          fock_prob: [0.83, 0.14, 0.03, 0.0],
          mean_photon: pythonCode.length > 300 ? 1.2 : 0.8,
          success: true,
          output: simulatedOutput
        }
      };
      
      // Simulate execution completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCircuit(prev => ({
        ...prev,
        results: simulatedResults
      }));
      
      toast({
        title: "Execution Complete",
        description: "Code executed successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Code Execution Failed",
        description: "There was an error executing the code.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCodeRunning(false);
    }
  };

  const handleClearCode = () => {
    // Reset the circuit and code
    setCircuit({
      modes: 2,
      operations: [],
      results: null
    });
    
    // Reset the code edited flag so auto-generation works again
    setIsCodeEdited(false);
    
    // Force regenerate the empty code template
    setTimeout(() => {
      generatePythonCode();
    }, 0);
    
    toast({
      title: "Circuit Cleared",
      description: "Circuit and code have been reset.",
      duration: 2000,
    });
  };
  
  const handleResetCodeToCircuit = () => {
    // Reset the code edited flag and regenerate based on circuit
    setIsCodeEdited(false);
    generatePythonCode();
    
    toast({
      title: "Code Reset",
      description: "Code has been reset to match the circuit.",
      duration: 2000,
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    
    toast({
      title: "Code Copied",
      description: "Python code copied to clipboard.",
      duration: 2000,
    });
  };

  const handleNetworkIntegration = () => {
    // In a real implementation, this would integrate with the quantum network
    toast({
      title: "Network Integration",
      description: "Circuit has been integrated with the quantum network.",
      duration: 3000,
    });
  };

  const handleModeChange = (value: number) => {
    setCircuit(prev => ({
      ...prev,
      modes: value
    }));
  };

  const resultDisplay = circuit.results ? (
    <div className="mt-4 p-4 bg-black/10 rounded-md">
      <h4 className="font-medium mb-2">Results:</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>State type:</span>
          <span className="font-mono">{circuit.results.state.type}</span>
        </div>
        <div className="flex justify-between">
          <span>Mean photon number:</span>
          <span className="font-mono">{circuit.results.state.mean_photon.toFixed(2)}</span>
        </div>
        {circuit.results.state.output && (
          <div className="mt-2 p-2 bg-black/90 text-green-400 rounded font-mono text-xs max-h-[200px] overflow-auto">
            <pre>{circuit.results.state.output}</pre>
          </div>
        )}
        <div>
          <span>Fock probabilities:</span>
          <div className="mt-1 flex items-end h-24 gap-1">
            {circuit.results.state.fock_prob.map((prob: number, i: number) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className="bg-blue-500 w-10" 
                  style={{ height: `${prob * 100}%` }}
                ></div>
                <span className="text-xs mt-1">{i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">Modes:</label>
          <Select 
            value={circuit.modes.toString()} 
            onValueChange={(value) => handleModeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Modes" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Gate Type:</label>
          <Select 
            value={newGate.type} 
            onValueChange={(value) => setNewGate(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Gate Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beamsplitter">Beam Splitter</SelectItem>
              <SelectItem value="displacement">Displacement</SelectItem>
              <SelectItem value="squeezing">Squeezing</SelectItem>
              <SelectItem value="rotation">Rotation</SelectItem>
              <SelectItem value="measurement">Measurement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Mode:</label>
          <Select 
            value={newGate.mode.toString()} 
            onValueChange={(value) => setNewGate(prev => ({ ...prev, mode: parseInt(value) }))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: circuit.modes }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-40">
          <label className="block text-sm font-medium mb-1">Parameter: {newGate.parameter.toFixed(2)}</label>
          <Slider 
            value={[newGate.parameter]} 
            min={0} 
            max={1} 
            step={0.05}
            onValueChange={([value]) => setNewGate(prev => ({ ...prev, parameter: value }))}
          />
        </div>
        
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={handleAddGate}>
            Add Gate
          </Button>
          <Button variant="default" onClick={handleRunSimulation}>
            Run Simulation
          </Button>
          <Button variant="outline" onClick={handleNetworkIntegration}>
            Network Integration
          </Button>
        </div>
      </div>
      
      {/* Circuit Visualization */}
      <div className="relative overflow-x-auto bg-black/5 rounded-md p-4 mb-4 min-h-[120px]">
        <div className="flex flex-wrap gap-3">
          {circuit.operations.length === 0 ? (
            <div className="text-center w-full text-muted-foreground italic py-8">
              Add gates to build your quantum circuit
            </div>
          ) : circuit.operations.map((gate, index) => (
            <Gate 
              key={index} 
              gate={gate} 
              onRemove={() => handleRemoveGate(index)} 
            />
          ))}
        </div>
      </div>
      
      {/* Mode lines visualization */}
      <div className="bg-black/5 rounded-md p-4 mb-4">
        {Array.from({ length: circuit.modes }, (_, i) => (
          <div key={i} className="py-2 flex items-center">
            <div className="w-10 text-center">{i}</div>
            <div className="flex-1 h-px bg-gray-400 relative">
              {circuit.operations
                .filter(op => op.mode === i)
                .map((op, idx) => (
                  <div 
                    key={idx}
                    className={`absolute -top-2 w-4 h-4 rounded-full ${GATE_COLORS[op.type] || 'bg-gray-500'}`}
                    style={{ left: `${(idx + 1) * 15}%` }}
                    title={op.type}
                  ></div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Code Editor */}
      <div className="mt-4 bg-black/10 rounded-md overflow-hidden">
        <div className="flex justify-between items-center p-3 bg-black/20">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-4 w-4" />
            <h4 className="font-medium text-sm">Code</h4>
          </div>
          <div className="flex gap-1.5">
            {/* Copy button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyCode} 
              className="h-8 w-8 relative group"
              title="Copy code"
            >
              <Copy className="h-4 w-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Copy code</span>
            </Button>

            {/* Reset button - only shown when code is edited */}
            {isCodeEdited && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleResetCodeToCircuit} 
                className="h-8 w-8 relative group"
                title="Reset to circuit"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Reset to circuit</span>
              </Button>
            )}
            
            {/* Clear button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClearCode} 
              className="h-8 w-8 relative group"
              title="Clear circuit and code"
            >
              <Trash className="h-4 w-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Clear circuit and code</span>
            </Button>
            
            {/* Run button */}
            <Button 
              variant="default" 
              size="icon" 
              onClick={handleRunCode} 
              className="h-8 w-8 relative group" 
              disabled={isCodeRunning}
              title="Run code"
            >
              {isCodeRunning ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Run code</span>
            </Button>
          </div>
        </div>
        <div className="p-4 bg-black/90 text-green-400 font-mono text-sm">
          <textarea
            value={pythonCode}
            onChange={handleCodeChange}
            className="w-full h-[300px] bg-transparent border-none focus:outline-none resize-none text-green-400 font-mono text-sm"
            spellCheck="false"
            style={{ caretColor: '#34d399' }}
          />
        </div>
      </div>
      
      {/* Results */}
      {resultDisplay}
    </div>
  );
};

export default StrawberryFieldsCircuit;
