'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GDSFactoryTemplatesProps {
  onSelectTemplate: (code: string) => void
}

type Template = {
  id: string
  title: string
  description: string
  tags: string[]
  code: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
}

export default function GDSFactoryTemplates({ onSelectTemplate }: GDSFactoryTemplatesProps) {
  const quantumTemplates: Template[] = [
    {
      id: 'basic-mzi',
      title: 'Mach-Zehnder Interferometer',
      description: 'A basic Mach-Zehnder interferometer for quantum operations like single-qubit gates',
      tags: ['quantum gate', 'basic', 'interferometer'],
      complexity: 'beginner',
      code: `# GDSFactory Quantum Photonic Chip Design - MZI
import gdsfactory as gf
from gdsfactory.components import mzi

# Create a Mach-Zehnder interferometer for quantum operations
# Set reasonable parameters that will render properly
c = mzi(delta_length=30, splitter='mmi2x2')

# Add ports and pins for fabrication reference
c = gf.routing.add_fiber_array(c)

# Get this component as the one to be visualized
__preview_component = c

# Show the component with more spacing for clearer visualization
c.show()

# Export to GDSII
# c.write_gds("quantum_mzi.gds")
`
    },
    {
      id: 'directional-coupler',
      title: 'Directional Coupler',
      description: 'A directional coupler for beamsplitting in quantum circuits',
      tags: ['beamsplitter', 'coupler', 'basic'],
      complexity: 'beginner',
      code: `# GDSFactory Quantum Photonic Chip Design - Directional Coupler
import gdsfactory as gf
from gdsfactory.components import coupler

# Create a directional coupler to use as a beamsplitter
c = coupler(gap=0.2, length=10)

# Set this component as the one to be visualized
__preview_component = c

# Show the component
c.show()

# Export to GDSII
# c.write_gds("quantum_coupler.gds")
`
    },
    {
      id: 'cnot-gate',
      title: 'CNOT Gate Circuit',
      description: 'A photonic implementation of a CNOT quantum gate using MZIs and phase shifters',
      tags: ['quantum gate', 'cnot', 'advanced'],
      complexity: 'advanced',
      code: `# GDSFactory Quantum Photonic Chip Design - CNOT Gate
import gdsfactory as gf
from gdsfactory.components import mzi, delay_snake

# Create multiple MZIs for the CNOT implementation
mzi1 = mzi(delta_length=10)
mzi2 = mzi(delta_length=10)

# Create phase shifters using delay components with adjusted parameters
# Fix: Increase length and adjust n to avoid "Snake is too short" error
phase_shifter1 = delay_snake(length=50, n=4, layer=(1, 0))
phase_shifter2 = delay_snake(length=50, n=4, layer=(1, 0))

# Create a component and add references
c = gf.Component("cnot_gate")
ref_mzi1 = c << mzi1
ref_mzi2 = c << mzi2
ref_ps1 = c << phase_shifter1
ref_ps2 = c << phase_shifter2

# Position the components
ref_mzi1.movex(0)
ref_ps1.movex(ref_mzi1.size[0] + 20)
ref_mzi2.movex(ref_ps1.size[0] + ref_mzi1.size[0] + 30)
ref_ps2.movex(ref_mzi2.size[0] + ref_ps1.size[0] + ref_mzi1.size[0] + 40)

# Add optical routes between components
route1 = gf.routing.optical_route(
    component=c,
    port1=ref_mzi1.ports["o2"],
    port2=ref_ps1.ports["o1"],
    radius=10,
)
route2 = gf.routing.optical_route(
    component=c,
    port1=ref_ps1.ports["o2"],
    port2=ref_mzi2.ports["o1"],
    radius=10,
)
route3 = gf.routing.optical_route(
    component=c,
    port1=ref_mzi2.ports["o2"],
    port2=ref_ps2.ports["o1"],
    radius=10,
)

# Set this component as the one to be visualized
__preview_component = c

# Show the component
c.show()

# Export to GDSII
# c.write_gds("quantum_cnot_gate.gds")
`
    },
    {
      id: 'qft-circuit',
      title: 'Quantum Fourier Transform',
      description: 'A photonic implementation of a Quantum Fourier Transform (QFT) circuit for 2 qubits',
      tags: ['qft', 'algorithm', 'advanced'],
      complexity: 'advanced',
      code: `# GDSFactory Quantum Photonic Chip Design - 2-Qubit QFT
import gdsfactory as gf
from gdsfactory.components import mzi, ring_single

# Create a component for our QFT circuit
c = gf.Component("qft_2qubit")

# Create subcomponents for the QFT implementation
hadamard = mzi(delta_length=10)  # Hadamard gate equivalent
phase_90 = ring_single(radius=10, gap=0.2)  # Phase shifter (90 degrees)

# Add references to the component
h1 = c << hadamard
p1 = c << phase_90
h2 = c << hadamard

# Position components
h1.movex(0)
p1.movex(h1.size[0] + 20)
h2.movex(h1.size[0] + p1.size[0] + 40)

# Add optical routes between components
route1 = gf.routing.optical_route(
    component=c,
    port1=h1.ports["o2"],
    port2=p1.ports["o1"],
    radius=10,
)
route2 = gf.routing.optical_route(
    component=c,
    port1=p1.ports["o2"],
    port2=h2.ports["o1"],
    radius=10,
)

# Set this component as the one to be visualized
__preview_component = c

# Show the component
c.show()

# Export to GDSII
# c.write_gds("quantum_qft.gds")
`
    },
    {
      id: 'bell-state',
      title: 'Bell State Generator',
      description: 'A circuit for generating Bell states (entangled photon pairs)',
      tags: ['entanglement', 'bell-state', 'intermediate'],
      complexity: 'intermediate',
      code: `# GDSFactory Quantum Photonic Chip Design - Bell State Generator
import gdsfactory as gf
from gdsfactory.components import mzi, y_splitter

# Create a component for our Bell state generator
c = gf.Component("bell_state_generator")

# Create subcomponents:
# Y-splitter for the first qubit
splitter = y_splitter(width=0.5, length_straight=2)

# Hadamard-like operation using an MZI
hadamard = mzi(delta_length=10)

# Add references to the component
splitter_ref = c << splitter
hadamard_ref = c << hadamard

# Position components
splitter_ref.movex(0)
hadamard_ref.movex(splitter_ref.size[0] + 20)

# Add optical routes between components
route = gf.routing.optical_route(
    component=c,
    port1=splitter_ref.ports["o2"],
    port2=hadamard_ref.ports["o1"],
    radius=10,
)

# Set this component as the one to be visualized
__preview_component = c

# Show the component
c.show()

# Export to GDSII
# c.write_gds("quantum_bell_state.gds")
`
    },
    {
      id: 'waveguide-crossing',
      title: 'Low-Loss Waveguide Crossing',
      description: 'Optimized waveguide crossing for high-density quantum photonic circuits',
      tags: ['crossing', 'waveguide', 'topology'],
      complexity: 'intermediate',
      code: `# GDSFactory Quantum Photonic Chip Design - Waveguide Crossing
import gdsfactory as gf
from gdsfactory.components import crossing

# Create a low-loss waveguide crossing for dense photonic circuits
# Optimized parameters for better visualization
c = crossing(width=0.5, length=5, layer=(1, 0))

# Set this component as the one to be visualized
__preview_component = c

# Show the component
c.show()

# Export to GDSII
# c.write_gds("waveguide_crossing.gds")
`
    }
  ]

  const complexityColor = (complexity: string) => {
    switch(complexity) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quantumTemplates.map(template => (
          <Card key={template.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-1 mb-4">
                <Badge className={`${template.complexity === 'beginner' ? 'bg-green-500' : template.complexity === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  {template.complexity}
                </Badge>
                {template.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Template button clicked for:', template.title);
                  try {
                    // Call the parent component's handler
                    onSelectTemplate(template.code);
                    console.log('onSelectTemplate called successfully with code length:', template.code.length);
                    
                    // Display success message
                    const alertMessage = `Template "${template.title}" loaded! Switch to Code Editor tab to view it.`;
                    console.log(alertMessage);
                    alert(alertMessage);
                  } catch (error) {
                    console.error('Error selecting template:', error);
                  }
                }}
              >
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
