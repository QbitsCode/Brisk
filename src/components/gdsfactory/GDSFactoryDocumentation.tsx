'use client'

import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function GDSFactoryDocumentation() {
  return (
    <div>
      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="components">Quantum Components</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="fabrication">Fabrication</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[600px] pr-4">
          <TabsContent value="quickstart" className="mt-4 space-y-4">
            <h2 className="text-xl font-bold">Getting Started with GDSFactory for Quantum Photonics</h2>
            
            <div className="space-y-4">
              <p>
                GDSFactory is a powerful Python library for designing photonic chips, including quantum photonic circuits.
                This guide will help you get started with designing quantum photonic components using GDSFactory.
              </p>
              
              <h3 className="text-lg font-semibold">Basic Component Creation</h3>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                <pre className="text-sm font-mono">
                  {`# Import the library
import gdsfactory as gf

# Create a simple waveguide
waveguide = gf.components.straight(length=10)

# Show the component
waveguide.show()`}
                </pre>
              </div>
              
              <h3 className="text-lg font-semibold">Quantum Components</h3>
              <p>
                For quantum photonic circuits, you'll typically need components like:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Beam splitters</strong> - Implemented using directional couplers or MMIs</li>
                <li><strong>Phase shifters</strong> - Implemented using heaters or delay lines</li>
                <li><strong>Interferometers</strong> - Using Mach-Zehnder configurations</li>
                <li><strong>Waveguide crossings</strong> - For routing complex quantum circuits</li>
              </ul>
              
              <h3 className="text-lg font-semibold">Creating a Simple Quantum Circuit</h3>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                <pre className="text-sm font-mono">
                  {`import gdsfactory as gf
from gdsfactory.components import mzi

# Create a Mach-Zehnder interferometer (functions as a tunable beamsplitter)
mzi_component = mzi(delta_length=10)

# Show the component
mzi_component.show()

# Export to GDS
mzi_component.write_gds("quantum_mzi.gds")`}
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="mt-4">
            <h2 className="text-xl font-bold mb-4">Quantum Photonic Components</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Beam Splitters</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>Beam splitters are fundamental components in quantum photonic circuits, used to create superposition states.</p>
                    
                    <h4 className="font-semibold">Available Components:</h4>
                    <ul className="list-disc pl-6">
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">directional_coupler</code> - Evanescent coupling between waveguides</li>
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">mmi2x2</code> - Multimode interference coupler with 2 inputs and 2 outputs</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Phase Shifters</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>Phase shifters allow controlled manipulation of quantum states by adjusting the optical path length.</p>
                    
                    <h4 className="font-semibold">Implementation Options:</h4>
                    <ul className="list-disc pl-6">
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">delay_snake</code> - Physical path length difference</li>
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">ring_single</code> - Ring resonators for phase control</li>
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">heater_metal</code> - Thermo-optic phase shifter</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Mach-Zehnder Interferometers</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>MZIs are essential building blocks for implementing quantum gates in photonic quantum computers.</p>
                    
                    <h4 className="font-semibold">Key Parameters:</h4>
                    <ul className="list-disc pl-6">
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">delta_length</code> - Path length difference</li>
                      <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">splitter</code> - Type of splitter ('directional_coupler' or 'mmi2x2')</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="api" className="mt-4 space-y-4">
            <h2 className="text-xl font-bold">GDSFactory API Reference</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Core Functions</h3>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Component Creation</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">gf.Component()</code> - Create a new empty component</li>
                  <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">component.show()</code> - Display a component visualization</li>
                  <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">component.write_gds(filename)</code> - Save component to a GDS file</li>
                </ul>
              </div>
              
              <h3 className="text-lg font-semibold">Quantum-Specific Components</h3>
              <p>
                These components are particularly useful for quantum photonic applications:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">gf.components.mzi()</code> - Mach-Zehnder interferometer</li>
                <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">gf.components.mmi2x2()</code> - 2x2 multimode interference coupler</li>
                <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">gf.components.coupler()</code> - Directional coupler</li>
                <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">gf.components.ring_single()</code> - Single ring resonator</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="fabrication" className="mt-4 space-y-4">
            <h2 className="text-xl font-bold">Fabrication Guidelines</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">GDSII Export</h3>
              <p>
                GDSFactory designs can be exported to industry-standard GDSII format for fabrication:
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                <pre className="text-sm font-mono">
                  {`# Export a component to GDSII
component.write_gds("quantum_chip.gds")

# Export with specific settings
component.write_gds(
    "quantum_chip.gds",
    unit=1e-6,  # units in microns
    precision=1e-9  # nanometer precision
)`}
                </pre>
              </div>
              
              <h3 className="text-lg font-semibold">Quantum-Specific Fabrication Considerations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Low-Loss Requirements</strong>: Quantum photonic circuits require extremely low-loss waveguides. 
                  Use curved waveguides with large bend radii (>20μm for silicon) and minimize crossings.
                </li>
                <li>
                  <strong>Phase Stability</strong>: Phase shifters should be carefully designed for thermal isolation
                  to prevent crosstalk between quantum operations.
                </li>
                <li>
                  <strong>Symmetrical Couplers</strong>: Beam splitters must be fabricated with high precision to 
                  achieve the desired splitting ratios for quantum operations.
                </li>
              </ul>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
