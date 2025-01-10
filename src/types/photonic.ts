export interface ComponentParams {
  [key: string]: number | string;
}

export interface ComponentPorts {
  [key: string]: { x: number; y: number };
}

export interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  params: ComponentParams;
  ports: ComponentPorts;
}

export interface Connection {
  source: { component: number; port: string };
  target: { component: number; port: string };
}

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  components: Component[];
  connections: Connection[];
  thumbnail?: string;
}

export interface LayerConfig {
  value: number;
  label: string;
  color: string;
}

export interface CrossSectionConfig {
  value: string;
  label: string;
}

export type ComponentType = {
  name: string;
  params: Record<string, number>;
  ports: string[];
  color: string;
};
