/**
 * Types for the quantum circuit connection system
 */

/**
 * Port represents an input or output point on a quantum component
 */
export interface Port {
  id: string;
  type: 'input' | 'output';
  position: { x: number; y: number }; // Relative to component center
  componentId: string;
  label?: string;
  connectionId?: string; // ID of connected wire, undefined if not connected
  portIndex: number; // Index of the port on the component (e.g., first input, second output)
}

/**
 * Connection represents a wire connecting two ports
 */
export interface Connection {
  id: string;
  sourcePortId: string;
  targetPortId: string;
  sourceComponentId: string;
  targetComponentId: string;
}

/**
 * Metadata for port definitions on quantum components
 */
export interface ComponentPortDefinition {
  inputs: Array<{
    position: { x: number; y: number };
    label?: string;
  }>;
  outputs: Array<{
    position: { x: number; y: number };
    label?: string;
  }>;
}

/**
 * Enhanced quantum component with connection capabilities
 */
export interface ConnectableQuantumComponent {
  id: string;
  type: string;
  position: { x: number; y: number };
  angle: number;
  params: Record<string, any>;
  inputPorts: Port[];
  outputPorts: Port[];
  selected: boolean;
}

/**
 * Circuit validation result
 */
export interface CircuitValidationResult {
  valid: boolean;
  errors: Array<{
    componentId: string;
    message: string;
  }>;
  warnings: Array<{
    componentId: string;
    message: string;
  }>;
}

/**
 * Circuit state for serialization and restoration
 */
export interface CircuitState {
  components: ConnectableQuantumComponent[];
  connections: Connection[];
}
