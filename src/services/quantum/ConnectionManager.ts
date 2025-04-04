import { Connection, Port, ConnectableQuantumComponent, CircuitValidationResult } from "@/types/quantum/connections";
import { v4 as uuidv4 } from 'uuid';

/**
 * ConnectionManager handles the creation, validation and management of connections
 * between quantum circuit components.
 */
export class ConnectionManager {
  /**
   * Validates if a connection between two ports is possible
   */
  static canConnect(sourcePort: Port, targetPort: Port): boolean {
    // Can't connect to already connected ports
    if (sourcePort.connectionId || targetPort.connectionId) {
      return false;
    }
    
    // Can only connect output to input
    if (sourcePort.type !== 'output' || targetPort.type !== 'input') {
      return false;
    }
    
    // Can't connect a component to itself
    if (sourcePort.componentId === targetPort.componentId) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Creates a new connection between ports
   */
  static createConnection(
    sourcePort: Port, 
    targetPort: Port, 
    components: ConnectableQuantumComponent[]
  ): Connection | null {
    if (!this.canConnect(sourcePort, targetPort)) {
      return null;
    }
    
    const connectionId = uuidv4();
    const connection: Connection = {
      id: connectionId,
      sourcePortId: sourcePort.id,
      targetPortId: targetPort.id,
      sourceComponentId: sourcePort.componentId,
      targetComponentId: targetPort.componentId
    };
    
    // Update the ports with the connection ID
    this.updatePortConnection(sourcePort.id, connectionId, components);
    this.updatePortConnection(targetPort.id, connectionId, components);
    
    return connection;
  }
  
  /**
   * Updates a port with connection information
   */
  static updatePortConnection(
    portId: string, 
    connectionId: string | undefined, 
    components: ConnectableQuantumComponent[]
  ): void {
    components.forEach(component => {
      const inputPort = component.inputPorts.find(p => p.id === portId);
      if (inputPort) {
        inputPort.connectionId = connectionId;
      }
      
      const outputPort = component.outputPorts.find(p => p.id === portId);
      if (outputPort) {
        outputPort.connectionId = connectionId;
      }
    });
  }
  
  /**
   * Removes a connection and updates the connected ports
   */
  static removeConnection(
    connectionId: string, 
    connections: Connection[], 
    components: ConnectableQuantumComponent[]
  ): Connection[] {
    const connectionToRemove = connections.find(c => c.id === connectionId);
    if (!connectionToRemove) return connections;
    
    // Update port connections
    this.updatePortConnection(connectionToRemove.sourcePortId, undefined, components);
    this.updatePortConnection(connectionToRemove.targetPortId, undefined, components);
    
    // Remove the connection
    return connections.filter(c => c.id !== connectionId);
  }
  
  /**
   * Finds a port by its ID within the component array
   */
  static findPortById(
    portId: string, 
    components: ConnectableQuantumComponent[]
  ): Port | undefined {
    for (const component of components) {
      const inputPort = component.inputPorts.find(p => p.id === portId);
      if (inputPort) return inputPort;
      
      const outputPort = component.outputPorts.find(p => p.id === portId);
      if (outputPort) return outputPort;
    }
    return undefined;
  }
  
  /**
   * Validates the entire circuit for correctness
   */
  static validateCircuit(
    components: ConnectableQuantumComponent[],
    connections: Connection[]
  ): CircuitValidationResult {
    const result: CircuitValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // Check for disconnected components (except sources and detectors)
    components.forEach(component => {
      if (component.type !== 'single-photon-source' && 
          component.type !== 'entangled-source' &&
          component.type !== 'detector') {
            
        // Check if inputs are connected
        const hasDisconnectedInput = component.inputPorts.some(port => !port.connectionId);
        if (hasDisconnectedInput) {
          result.warnings.push({
            componentId: component.id,
            message: `Component ${component.type} has disconnected input ports`
          });
        }
        
        // Check if outputs are connected (if there are any)
        if (component.outputPorts.length > 0) {
          const hasDisconnectedOutput = component.outputPorts.some(port => !port.connectionId);
          if (hasDisconnectedOutput) {
            result.warnings.push({
              componentId: component.id,
              message: `Component ${component.type} has disconnected output ports`
            });
          }
        }
      }
    });
    
    // Check for sources without any connections
    const disconnectedSources = components.filter(c => 
      (c.type === 'single-photon-source' || c.type === 'entangled-source') &&
      c.outputPorts.every(port => !port.connectionId)
    );
    
    if (disconnectedSources.length > 0) {
      disconnectedSources.forEach(source => {
        result.warnings.push({
          componentId: source.id,
          message: `Source ${source.type} is not connected to any component`
        });
      });
    }
    
    // Check for detectors without any connections
    const disconnectedDetectors = components.filter(c => 
      c.type === 'detector' &&
      c.inputPorts.every(port => !port.connectionId)
    );
    
    if (disconnectedDetectors.length > 0) {
      disconnectedDetectors.forEach(detector => {
        result.warnings.push({
          componentId: detector.id,
          message: `Detector is not connected to any component`
        });
      });
    }
    
    // Check if there are any sources in the circuit
    const hasSources = components.some(c => 
      c.type === 'single-photon-source' || c.type === 'entangled-source'
    );
    
    if (!hasSources) {
      result.errors.push({
        componentId: '',
        message: 'Circuit has no photon sources'
      });
      result.valid = false;
    }
    
    // Check if there are any detectors in the circuit
    const hasDetectors = components.some(c => c.type === 'detector');
    
    if (!hasDetectors) {
      result.errors.push({
        componentId: '',
        message: 'Circuit has no detectors'
      });
      result.valid = false;
    }
    
    return result;
  }
  
  /**
   * Converts the circuit to a format suitable for simulation
   * This is a placeholder - actual implementation will depend on how
   * we integrate with Perceval
   */
  static prepareForSimulation(
    components: ConnectableQuantumComponent[],
    connections: Connection[]
  ): Record<string, any> {
    // This is where we'll create the Perceval code or simulation data
    // based on the circuit components and connections
    
    // For now, return a simplified representation
    return {
      components: components.map(c => ({
        id: c.id,
        type: c.type,
        params: c.params,
        position: c.position
      })),
      connections: connections.map(c => ({
        source: {
          componentId: c.sourceComponentId,
          portId: c.sourcePortId
        },
        target: {
          componentId: c.targetComponentId,
          portId: c.targetPortId
        }
      }))
    };
  }
}
