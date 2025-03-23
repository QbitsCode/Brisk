// Type declarations for Perceval components

declare module '@/components/perceval/PercevalCodeEditor' {
  interface PercevalCodeEditorProps {
    code: string;
    onCodeChange: (code: string) => void;
    onRunCode: () => void;
    results: any;
  }
  
  export default function PercevalCodeEditor(props: PercevalCodeEditorProps): JSX.Element;
}

declare module '@/components/perceval/PercevalVisualizer' {
  interface PercevalVisualizerProps {
    code: string;
    results: any;
  }
  
  export default function PercevalVisualizer(props: PercevalVisualizerProps): JSX.Element;
}

declare module '@/components/perceval/PercevalDocumentation' {
  export default function PercevalDocumentation(): JSX.Element;
}
