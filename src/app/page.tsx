'use client';

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QuantumCircuit, CircuitTemplate } from '@/components/quantum/photonics/QuantumCircuit';
import { QKDProtocol } from '@/components/quantum/networking/QKDProtocol';
import { StateVisualizer } from '@/components/quantum/visualization/StateVisualizer';
import { QuantumNetwork } from '@/components/quantum/internet/QuantumNetwork';
import { CircuitTemplates } from '@/components/quantum/templates/CircuitTemplates';
import { briskConfig } from '@/config/brisk';
import { CheckIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StrawberryFieldsCircuit from '@/components/quantum/strawberryfields/StrawberryFieldsCircuit';

export default function Home() {
  // Add state to track the selected template
  const [selectedTemplate, setSelectedTemplate] = useState<CircuitTemplate | null>(null);
  const { toast } = useToast();

  // Splash video redirection logic
  useEffect(() => {
    // Check if we're being redirected from the splash page
    const fromSplash = new URLSearchParams(window.location.search).get('from_splash');
    
    // Don't redirect if we're already coming from splash
    if (fromSplash === 'true') {
      return;
    }
    
    // Check if we've seen the splash before
    const hasSeenSplash = localStorage.getItem('brisk_has_seen_splash');
    
    if (!hasSeenSplash) {
      // First visit, redirect to splash video
      window.location.href = '/splash.html';
    }
  }, []);

  // Handle template selection
  const handleTemplateSelection = (template: CircuitTemplate) => {
    setSelectedTemplate(template);
    toast({
      title: "Template Selected",
      description: `Loaded "${template.name}" circuit template.`,
      duration: 3000
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Test button removed for beta release */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Brisk Quantum Framework</h1>
            <span className="bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-300 text-xs font-medium px-3 py-1 rounded-full flex items-center animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)] dark:shadow-[0_0_10px_rgba(34,197,94,0.7)]">
              Beta
            </span>
          </div>
          <p className="text-xl text-muted-foreground">
            {briskConfig.framework.description}
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Interactive Quantum Applications</h2>
          
          <div className="bg-card rounded-lg mb-6">
            <div className="p-6 border-b">
              <h3 className="text-xl font-medium">Quantum Circuit & Network Center</h3>
              <p className="text-muted-foreground mt-2">
                Design quantum circuits with gates, qubits, and measurements, then integrate with quantum networks.
              </p>
            </div>
            <div className="p-6">
              <Tabs defaultValue="photonic">
                <TabsList className="mb-4">
                  <TabsTrigger value="photonic">Photonic Circuit</TabsTrigger>
                  <TabsTrigger value="strawberry">Quantum Gate Circuit</TabsTrigger>
                  <TabsTrigger value="network">Quantum Network</TabsTrigger>
                </TabsList>
                <TabsContent value="strawberry">
                  <StrawberryFieldsCircuit />
                </TabsContent>
                <TabsContent value="photonic">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <QuantumCircuit 
                        className="w-full h-full" 
                        selectedTemplate={selectedTemplate} 
                        onTemplateLoaded={() => setSelectedTemplate(null)}
                      />
                    </div>
                    <div className="flex-1">
                      <CircuitTemplates
                        onSelectTemplate={handleTemplateSelection}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="network">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <QuantumNetwork className="w-full" />
                    </div>
                    <div className="flex-1">
                      <QKDProtocol className="w-full" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg flex flex-col">
              <div className="p-6 border-b min-h-[120px]">
                <h3 className="text-xl font-medium">Quantum State Visualization</h3>
                <p className="text-muted-foreground mt-2">
                  Visualize quantum states and analyze measurement outcomes.
                </p>
              </div>
              <div className="p-6 flex-1">
                <StateVisualizer 
                  states={[
                    { amplitude: 0.707, phase: 0, basis: '|00⟩ + |11⟩' },
                    { amplitude: 0.5, phase: Math.PI/4, basis: '|+⟩' },
                    { amplitude: 0.5, phase: Math.PI/2, basis: '|-⟩' }
                  ]} 
                  className="w-full h-full" 
                />
              </div>
            </div>

            <div className="bg-card rounded-lg flex flex-col">
              <div className="p-6 border-b min-h-[120px]">
                <h3 className="text-xl font-medium">Simulation Results</h3>
                <p className="text-muted-foreground mt-2">
                  View detailed results from quantum circuit and network simulations.
                </p>
              </div>
              <div className="p-6 flex-1">
                <div className="text-center py-8 text-muted-foreground italic">
                  Run a simulation to see results
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-medium">Framework Capabilities</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-base font-medium mb-4">Simulation</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Linear Optics</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>State Evolution</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Measurement</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Noise Modeling</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-medium mb-4">Hardware</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Photon Sources</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Beam Splitters</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Phase Shifters</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Detectors</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-medium mb-4">Analysis</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Visualization</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>State Tomography</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Process Tomography</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Error Analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DndProvider>
  );
}
