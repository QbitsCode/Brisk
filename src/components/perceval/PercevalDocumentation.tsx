'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function PercevalDocumentation() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">What is Perceval?</h3>
              <p className="text-sm mb-4">
                Perceval is an open source framework for programming photonic quantum computers,
                developed by Quandela. It provides tools for simulating, designing, and understanding
                photonic quantum computing systems.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Key Features</h3>
              <ul className="list-disc list-inside text-sm space-y-2">
                <li>Design and simulate photonic quantum circuits</li>
                <li>Support for various backends (SLOS, Clifford, MPS, etc.)</li>
                <li>Built-in visualization tools</li>
                <li>Quantum algorithm implementations</li>
                <li>Seamless integration with quantum hardware</li>
              </ul>
              
              <div className="mt-6">
                <a href="https://github.com/Quandela/Perceval" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="mr-2">GitHub Repository</Button>
                </a>
                <a href="https://perceval.quandela.net/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">Official Documentation</Button>
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <p className="text-sm mb-4">
                To use Perceval, you need to understand a few core concepts:
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Quantum Optical Circuits</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">
                      Perceval models photonic circuits using a set of optical components like:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Beam Splitters (BS)</li>
                      <li>Phase Shifters (PS)</li>
                      <li>Polarizing Beam Splitters (PBS)</li>
                      <li>Waveplates (WP)</li>
                    </ul>
                    <p className="text-sm mt-2">
                      These components are arranged in a circuit to manipulate quantum states of light.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Quantum States</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">
                      Photonic quantum states in Perceval are represented using the Fock basis.
                      For example, |1,0⟩ represents a single photon in the first mode and no photons
                      in the second mode. Perceval supports:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Basic Fock states</li>
                      <li>Superposition states</li>
                      <li>Entangled states</li>
                      <li>Mixed states</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Backends and Simulation</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">
                      Perceval offers several backends for simulation:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><strong>SLOS</strong>: Single Layer Optical Simulator (default)</li>
                      <li><strong>Clifford</strong>: For Clifford circuits</li>
                      <li><strong>MPS</strong>: Matrix Product States for larger systems</li>
                      <li><strong>QISKIT</strong>: Integration with IBM's Qiskit</li>
                    </ul>
                    <p className="text-sm mt-2">
                      Choose a backend based on your simulation needs and system size.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Beam Splitter Example</h3>
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-sm">
{`import perceval as pcvl
import numpy as np

# Create a circuit with 2 modes
circuit = pcvl.Circuit(2)

# Add a beam splitter (50/50)
circuit.add(0, pcvl.BS())

# Define input state (single photon in first mode)
input_state = pcvl.BasicState([1, 0])

# Run the simulation
backend = pcvl.BackendFactory().get_backend("SLOS")
simulator = pcvl.Processor(backend, circuit)
result = simulator.process(input_state)

# Display results
print(result)

# Visualize the circuit
pcvl.pdisplay(circuit)`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Hong-Ou-Mandel Effect</h3>
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-sm">
{`import perceval as pcvl
import numpy as np

# Create a circuit with 2 modes
circuit = pcvl.Circuit(2)

# Add a beam splitter (50/50)
circuit.add(0, pcvl.BS())

# Input state with one photon in each mode
input_state = pcvl.BasicState([1, 1])

# Run simulation
backend = pcvl.BackendFactory().get_backend("SLOS")
simulator = pcvl.Processor(backend, circuit)
result = simulator.process(input_state)

# Display results (showing Hong-Ou-Mandel interference)
print(result)`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Simple Mach-Zehnder Interferometer</h3>
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-sm">
{`import perceval as pcvl
import numpy as np

# Create a circuit with 2 modes
circuit = pcvl.Circuit(2)

# First beam splitter
circuit.add(0, pcvl.BS())

# Phase shift in the top arm
circuit.add(0, pcvl.PS(phi=np.pi/4))

# Second beam splitter
circuit.add(0, pcvl.BS())

# Visualize the circuit
pcvl.pdisplay(circuit)

# Input a single photon
input_state = pcvl.BasicState([1, 0])

# Run simulation
backend = pcvl.BackendFactory().get_backend("SLOS")
simulator = pcvl.Processor(backend, circuit)
result = simulator.process(input_state)

# Display results
print(result)`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Core API Reference</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="circuit">
                  <AccordionTrigger>Circuit Operations</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.Circuit(n)</code> - Create a circuit with n modes</li>
                      <li><code className="bg-slate-100 p-1 rounded">circuit.add(m, component)</code> - Add a component starting at mode m</li>
                      <li><code className="bg-slate-100 p-1 rounded">circuit.compute_unitary()</code> - Calculate the unitary matrix</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.pdisplay(circuit)</code> - Display the circuit diagram</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="components">
                  <AccordionTrigger>Optical Components</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.BS(theta=pi/4)</code> - Beam splitter (default 50/50)</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.PS(phi)</code> - Phase shifter with phase phi</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.PBS()</code> - Polarizing beam splitter</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.WP(phi, theta)</code> - Waveplate</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.CX()</code> - Controlled-X gate</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="states">
                  <AccordionTrigger>Quantum States</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.BasicState([n1, n2, ...])</code> - Fock state |n1, n2, ...⟩</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.StateVector(amplitudes, fock_states)</code> - Superposition state</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.vacuum_state(n)</code> - Create n-mode vacuum state |0, 0, ...⟩</li>
                      <li><code className="bg-slate-100 p-1 rounded">state_1 + state_2</code> - Add two states (with normalization)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="backends">
                  <AccordionTrigger>Backends</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li><code className="bg-slate-100 p-1 rounded">backend = pcvl.BackendFactory().get_backend("SLOS")</code> - Single Layer Optical Simulator</li>
                      <li><code className="bg-slate-100 p-1 rounded">backend = pcvl.BackendFactory().get_backend("Clifford")</code> - Clifford simulator</li>
                      <li><code className="bg-slate-100 p-1 rounded">backend = pcvl.BackendFactory().get_backend("MPS")</code> - Matrix Product States</li>
                      <li><code className="bg-slate-100 p-1 rounded">pcvl.Processor(backend, circuit)</code> - Create a processor with a backend and circuit</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Learning Resources</h3>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Official Documentation</h4>
                  <p className="text-sm mb-2">Comprehensive documentation for Perceval with tutorials and examples.</p>
                  <a href="https://perceval.quandela.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">https://perceval.quandela.net/</a>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">GitHub Repository</h4>
                  <p className="text-sm mb-2">Source code, issues, and community contributions.</p>
                  <a href="https://github.com/Quandela/Perceval" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">https://github.com/Quandela/Perceval</a>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Quandela Cloud</h4>
                  <p className="text-sm mb-2">Access to real quantum photonic hardware via cloud services.</p>
                  <a href="https://cloud.quandela.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">https://cloud.quandela.com/</a>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Research Papers</h4>
                  <p className="text-sm mb-2">Academic papers related to Perceval and photonic quantum computing:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Heuristic methods for quantum state generation on photonic hardware</li>
                    <li>Perceval: A Software Platform for Discrete Variable Photonic Quantum Computing</li>
                    <li>Quantum Computing with Optical Metasurfaces</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
