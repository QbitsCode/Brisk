import { Component, Connection } from '@/types/photonic';
import { GDSIIExporter } from './gdsii-utils';

interface CircuitDesign {
  components: Component[];
  connections: Connection[];
  metadata: {
    name: string;
    description?: string;
    created: string;
    modified: string;
    version: string;
  };
}

interface GDSIIExport {
  cells: any[];
  toplevel: string;
  precision: number;
  units: {
    logical: number;
    physical: number;
  };
}

export class CircuitValidator {
  static validateComponent(component: Component): string[] {
    const errors: string[] = [];
    const componentType = component.type;

    // Validate required parameters
    if (!component.params) {
      errors.push(`Component ${component.id}: Missing parameters`);
      return errors;
    }

    // Validate parameter ranges
    for (const [param, value] of Object.entries(component.params)) {
      switch (param) {
        case 'width':
          if (value <= 0 || value > 5) {
            errors.push(`Component ${component.id}: Width must be between 0 and 5 μm`);
          }
          break;
        case 'length':
          if (value <= 0 || value > 1000) {
            errors.push(`Component ${component.id}: Length must be between 0 and 1000 μm`);
          }
          break;
        case 'radius':
          if (value <= 5 || value > 100) {
            errors.push(`Component ${component.id}: Radius must be between 5 and 100 μm`);
          }
          break;
        case 'gap':
          if (value <= 0.1 || value > 2) {
            errors.push(`Component ${component.id}: Gap must be between 0.1 and 2 μm`);
          }
          break;
      }
    }

    // Validate position
    if (typeof component.x !== 'number' || typeof component.y !== 'number') {
      errors.push(`Component ${component.id}: Invalid position`);
    }

    return errors;
  }

  static validateConnection(connection: Connection, components: Component[]): string[] {
    const errors: string[] = [];

    // Check if source and target components exist
    const sourceComponent = components[connection.source.component];
    const targetComponent = components[connection.target.component];

    if (!sourceComponent) {
      errors.push(`Connection error: Source component not found`);
    }
    if (!targetComponent) {
      errors.push(`Connection error: Target component not found`);
    }

    // Check if ports exist on components
    if (sourceComponent && !sourceComponent.ports[connection.source.port]) {
      errors.push(`Connection error: Source port ${connection.source.port} not found on component`);
    }
    if (targetComponent && !targetComponent.ports[connection.target.port]) {
      errors.push(`Connection error: Target port ${connection.target.port} not found on component`);
    }

    return errors;
  }

  static validateCircuit(design: CircuitDesign): string[] {
    const errors: string[] = [];

    // Validate components
    design.components.forEach(component => {
      errors.push(...this.validateComponent(component));
    });

    // Validate connections
    design.connections.forEach(connection => {
      errors.push(...this.validateConnection(connection, design.components));
    });

    // Validate circuit-level rules
    errors.push(...this.validateCircuitRules(design));

    return errors;
  }

  private static validateCircuitRules(design: CircuitDesign): string[] {
    const errors: string[] = [];

    // Check for isolated components
    const connectedComponents = new Set<number>();
    design.connections.forEach(conn => {
      connectedComponents.add(conn.source.component);
      connectedComponents.add(conn.target.component);
    });

    design.components.forEach((comp, index) => {
      if (!connectedComponents.has(index)) {
        errors.push(`Warning: Component ${comp.id} (${comp.type}) is isolated`);
      }
    });

    // Check for loops in connections
    if (this.hasCircularConnections(design)) {
      errors.push('Warning: Circuit contains feedback loops');
    }

    return errors;
  }

  private static hasCircularConnections(design: CircuitDesign): boolean {
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const dfs = (componentIndex: number): boolean => {
      if (recursionStack.has(componentIndex)) return true;
      if (visited.has(componentIndex)) return false;

      visited.add(componentIndex);
      recursionStack.add(componentIndex);

      const outgoingConnections = design.connections.filter(
        conn => conn.source.component === componentIndex
      );

      for (const conn of outgoingConnections) {
        if (dfs(conn.target.component)) return true;
      }

      recursionStack.delete(componentIndex);
      return false;
    };

    for (let i = 0; i < design.components.length; i++) {
      if (dfs(i)) return true;
    }

    return false;
  }
}

export class CircuitExporter {
  static toJSON(design: CircuitDesign): string {
    return JSON.stringify(design, null, 2);
  }

  static fromJSON(jsonString: string): CircuitDesign {
    const design = JSON.parse(jsonString);
    const errors = CircuitValidator.validateCircuit(design);
    
    if (errors.length > 0) {
      throw new Error(`Invalid circuit design:\n${errors.join('\n')}`);
    }
    
    return design;
  }

  static async toGDSII(design: CircuitDesign): Promise<ArrayBuffer> {
    const exporter = new GDSIIExporter();
    return await exporter.exportGDSII(design.components, design.connections);
  }
}

export class CircuitImporter {
  static async fromGDSII(gdsiiData: ArrayBuffer): Promise<CircuitDesign> {
    // Implementation will depend on specific GDSII library being used
    // This is a placeholder for the actual GDSII import logic
    throw new Error('GDSII import not implemented yet');
  }
}
