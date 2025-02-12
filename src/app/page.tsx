'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QuantumCircuit } from '@/components/quantum/photonics/QuantumCircuit';
import { QKDProtocol } from '@/components/quantum/networking/QKDProtocol';
import { StateVisualizer } from '@/components/quantum/visualization/StateVisualizer';
import { QuantumNetwork } from '@/components/quantum/internet/QuantumNetwork';
import { CircuitTemplates } from '@/components/quantum/templates/CircuitTemplates';
import { briskConfig } from '@/config/brisk';
import { CheckIcon } from 'lucide-react';

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Brisk Quantum Framework</h1>
          <p className="text-xl text-muted-foreground">
            {briskConfig.framework.description}
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Interactive Quantum Applications</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg flex flex-col">
              <div className="p-6 border-b min-h-[132px]">
                <h3 className="text-xl font-medium">Quantum Circuit Designer</h3>
                <p className="text-muted-foreground mt-2">
                  Design and simulate quantum photonic circuits with an intuitive drag-and-drop interface.
                </p>
              </div>
              <div className="p-6 flex-1">
                <QuantumCircuit className="w-full h-full" />
              </div>
            </div>

            <div className="bg-card rounded-lg flex flex-col">
              <div className="p-6 border-b min-h-[132px]">
                <h3 className="text-xl font-medium">Circuit Templates</h3>
                <p className="text-muted-foreground mt-2">
                  Choose from pre-designed quantum circuit templates for common experiments and quantum protocols. Easily import and customize templates.
                </p>
              </div>
              <div className="p-6 flex-1">
                <CircuitTemplates onSelectTemplate={(template) => {
                  // Handle template selection
                }} />
              </div>
            </div>

            <div className="bg-card rounded-lg flex flex-col">
              <div className="p-6 border-b">
                <h3 className="text-xl font-medium">Quantum Network Simulator</h3>
                <p className="text-muted-foreground mt-2">
                  Simulate quantum networks and communication protocols in real-time.
                </p>
              </div>
              <div className="p-6 flex-1">
                <QuantumNetwork className="w-full h-full" />
              </div>
            </div>

            <div className="bg-card rounded-lg flex flex-col">
              <div className="p-6 border-b">
                <h3 className="text-xl font-medium">Quantum Key Distribution</h3>
                <p className="text-muted-foreground mt-2">
                  Implement and analyze quantum key distribution protocols.
                </p>
              </div>
              <div className="p-6 flex-1">
                <QKDProtocol className="w-full h-full" />
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
