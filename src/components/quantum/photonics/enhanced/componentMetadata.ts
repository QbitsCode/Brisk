import { ComponentPortDefinition } from "@/types/quantum/connections";

/**
 * Port definitions for all quantum component types
 * Positions are relative to component center
 * Convention: 
 * - Inputs typically on left side
 * - Outputs typically on right side
 * - Multiple ports are distributed evenly
 */
export const COMPONENT_PORT_DEFINITIONS: Record<string, ComponentPortDefinition> = {
  'single-photon-source': {
    inputs: [],
    outputs: [
      { position: { x: 24, y: 0 }, label: 'out' }
    ]
  },
  'entangled-source': {
    inputs: [],
    outputs: [
      { position: { x: 24, y: -8 }, label: 'out1' },
      { position: { x: 24, y: 8 }, label: 'out2' }
    ]
  },
  'beamsplitter': {
    inputs: [
      { position: { x: -24, y: -12 }, label: 'in1' },
      { position: { x: -24, y: 12 }, label: 'in2' }
    ],
    outputs: [
      { position: { x: 24, y: -12 }, label: 'out1' },
      { position: { x: 24, y: 12 }, label: 'out2' }
    ]
  },
  'polarizing-beamsplitter': {
    inputs: [
      { position: { x: -24, y: -12 }, label: 'in1' },
      { position: { x: -24, y: 12 }, label: 'in2' }
    ],
    outputs: [
      { position: { x: 24, y: -12 }, label: 'out1' },
      { position: { x: 24, y: 12 }, label: 'out2' }
    ]
  },
  'phaseshift': {
    inputs: [
      { position: { x: -24, y: 0 }, label: 'in' }
    ],
    outputs: [
      { position: { x: 24, y: 0 }, label: 'out' }
    ]
  },
  'waveplate': {
    inputs: [
      { position: { x: -24, y: 0 }, label: 'in' }
    ],
    outputs: [
      { position: { x: 24, y: 0 }, label: 'out' }
    ]
  },
  'detector': {
    inputs: [
      { position: { x: -24, y: 0 }, label: 'in' }
    ],
    outputs: []
  },
  'mirror': {
    inputs: [
      { position: { x: -16, y: -16 }, label: 'in' }
    ],
    outputs: [
      { position: { x: 16, y: 16 }, label: 'out' }
    ]
  },
  'fiber-coupler': {
    inputs: [
      { position: { x: -24, y: 0 }, label: 'in' }
    ],
    outputs: [
      { position: { x: 24, y: 0 }, label: 'out' }
    ]
  }
};

/**
 * Helper to get port definitions for a component type
 */
export function getComponentPortDefinition(type: string): ComponentPortDefinition {
  const definition = COMPONENT_PORT_DEFINITIONS[type];
  if (!definition) {
    console.warn(`No port definition found for component type: ${type}`);
    return { inputs: [], outputs: [] };
  }
  return definition;
}

/**
 * Creates port objects for a component based on its type and ID
 */
export function createComponentPorts(componentId: string, type: string): {
  inputPorts: any[];
  outputPorts: any[];
} {
  const definition = getComponentPortDefinition(type);
  
  const inputPorts = definition.inputs.map((input, index) => ({
    id: `${componentId}-in-${index}`,
    type: 'input',
    position: input.position,
    componentId,
    label: input.label || `in${index + 1}`,
    portIndex: index,
  }));
  
  const outputPorts = definition.outputs.map((output, index) => ({
    id: `${componentId}-out-${index}`,
    type: 'output',
    position: output.position,
    componentId,
    label: output.label || `out${index + 1}`,
    portIndex: index,
  }));
  
  return { inputPorts, outputPorts };
}
