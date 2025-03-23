/**
 * Type definitions for GDSFactory components
 */

declare module '@/components/gdsfactory/GDSFactoryCodeEditor' {
  interface GDSFactoryCodeEditorProps {
    code: string;
    onCodeChange: (code: string) => void;
    onRunCode: () => void;
    results: any;
  }

  export default function GDSFactoryCodeEditor(props: GDSFactoryCodeEditorProps): JSX.Element;
}

declare module '@/components/gdsfactory/GDSFactoryVisualizer' {
  interface GDSFactoryVisualizerProps {
    code: string;
    results: any;
  }

  export default function GDSFactoryVisualizer(props: GDSFactoryVisualizerProps): JSX.Element;
}

declare module '@/components/gdsfactory/GDSFactoryDocumentation' {
  export default function GDSFactoryDocumentation(): JSX.Element;
}

declare module '@/components/gdsfactory/GDSFactoryTemplates' {
  interface GDSFactoryTemplatesProps {
    onSelectTemplate: (code: string) => void;
  }

  export default function GDSFactoryTemplates(props: GDSFactoryTemplatesProps): JSX.Element;
}
