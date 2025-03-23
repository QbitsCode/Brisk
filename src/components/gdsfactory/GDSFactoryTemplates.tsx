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
c = mzi(delta_length=10, splitter='mmi2x2')

# Add ports and pins for fabrication reference
c = gf.routing.add_fiber_array(c)

# Show the component
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

# Create phase shifters using delay components
phase_shifter1 = delay_snake(length=20)
phase_shifter2 = delay_snake(length=20)

# Create a component and add references
c = gf.Component("cnot_gate")
ref_mzi1 = c << mzi1
ref_mzi2 = c << mzi2
ref_ps1 = c << phase_shifter1
ref_ps2 = c << phase_shifter2

# Position the components
ref_mzi1.movex(0)
ref_ps1.movex(ref_mzi1.size[0] + 10)
ref_mzi2.movex(ref_ps1.size[0] + ref_mzi1.size[0] + 20)
ref_ps2.movex(ref_mzi2.size[0] + ref_ps1.size[0] + ref_mzi1.size[0] + 30)

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

# Create routes between components (simplified for visualization)
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

# Show the component
c.show()

# Export to GDSII
# c.write_gds("quantum_fourier_transform.gds")
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
from gdsfactory.components import mmi2x2, straight

# Create a component for Bell state generation
c = gf.Component("bell_state_generator")

# Create a 2x2 MMI coupler (acts as a Hadamard gate)
coupler = mmi2x2(width_mmi=2.5, length_mmi=5.5)

# Create two straight waveguides for inputs
input1 = straight(length=20)
input2 = straight(length=20)

# Add components to the circuit
ref_coupler = c << coupler
ref_input1 = c << input1
ref_input2 = c << input2

# Position components
ref_input1.movex(-30)
ref_input1.movey(2)
ref_input2.movex(-30)
ref_input2.movey(-2)

# Connect inputs to the coupler
route1 = gf.routing.optical_route(
    component=c,
    port1=ref_input1.ports["o2"],
    port2=ref_coupler.ports["o1"],
    radius=10,
)
route2 = gf.routing.optical_route(
    component=c,
    port1=ref_input2.ports["o2"],
    port2=ref_coupler.ports["o2"],
    radius=10,
)

# Show the component
c.show()

# Export to GDSII
# c.write_gds("bell_state_generator.gds")
`
    },
    {
      id: 'crossing-waveguides',
      title: 'Low-Loss Waveguide Crossing',
      description: 'Optimized waveguide crossing for high-density quantum photonic circuits',
      tags: ['crossing', 'waveguide', 'topology'],
      complexity: 'intermediate',
      code: `# GDSFactory Quantum Photonic Chip Design - Low-Loss Crossing
import gdsfactory as gf
from gdsfactory.components import crossing

# Create an optimized waveguide crossing for quantum circuits
# Low optical crosstalk is crucial for quantum operations
c = crossing(width=0.5, length=3)

# Show the component
c.show()

# Export to GDSII
# c.write_gds("low_loss_crossing.gds")
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
    <ScrollArea className="h-[600px] pr-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quantumTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className={complexityColor(template.complexity)}>
                  {template.complexity}
                </Badge>
                {template.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {template.code.split('\n').slice(0, 3).join('\n')}...
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => onSelectTemplate(template.code)}
                className="w-full"
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
