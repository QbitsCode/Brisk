import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircuitTemplate } from '@/types/quantum';

interface CircuitTemplatesProps {
  onSelectTemplate: (template: CircuitTemplate) => void;
}

const templates: CircuitTemplate[] = [
  {
    id: 'hom-interference',
    name: 'Hong-Ou-Mandel Interference',
    description: 'Demonstrates quantum interference between two identical photons.',
    difficulty: 'beginner',
    components: [
      {
        id: 'source1',
        type: 'source',
        x: 50,
        y: 100,
        rotation: 0,
        params: { photonNumber: 1, frequency: 193.1 },
        ports: { output: { x: 74, y: 112 } },
      },
      {
        id: 'source2',
        type: 'source',
        x: 50,
        y: 200,
        rotation: 0,
        params: { photonNumber: 1, frequency: 193.1 },
        ports: { output: { x: 74, y: 212 } },
      },
      {
        id: 'bs1',
        type: 'beamsplitter',
        x: 200,
        y: 150,
        rotation: 45,
        params: { transmittivity: 0.5, phase: 0 },
        ports: {
          input1: { x: 188, y: 162 },
          input2: { x: 212, y: 138 },
          output1: { x: 212, y: 162 },
          output2: { x: 188, y: 138 },
        },
      },
      {
        id: 'detector1',
        type: 'detector',
        x: 350,
        y: 100,
        rotation: 0,
        params: { efficiency: 0.9, darkCount: 100 },
        ports: { input: { x: 338, y: 112 } },
      },
      {
        id: 'detector2',
        type: 'detector',
        x: 350,
        y: 200,
        rotation: 0,
        params: { efficiency: 0.9, darkCount: 100 },
        ports: { input: { x: 338, y: 212 } },
      },
    ],
    connections: [
      {
        sourceId: 'source1',
        targetId: 'bs1',
        sourcePort: 'output',
        targetPort: 'input1',
      },
      {
        sourceId: 'source2',
        targetId: 'bs1',
        sourcePort: 'output',
        targetPort: 'input2',
      },
      {
        sourceId: 'bs1',
        targetId: 'detector1',
        sourcePort: 'output1',
        targetPort: 'input',
      },
      {
        sourceId: 'bs1',
        targetId: 'detector2',
        sourcePort: 'output2',
        targetPort: 'input',
      },
    ],
    thumbnail: '/templates/hom-interference.svg',
  },
  {
    id: 'mzi',
    name: 'Mach-Zehnder Interferometer',
    description: 'Single-photon interference using two beam splitters.',
    difficulty: 'intermediate',
    components: [
      {
        id: 'source1',
        type: 'source',
        x: 50,
        y: 150,
        rotation: 0,
        params: { photonNumber: 1, frequency: 193.1 },
        ports: { output: { x: 74, y: 162 } },
      },
      {
        id: 'bs1',
        type: 'beamsplitter',
        x: 150,
        y: 150,
        rotation: 45,
        params: { transmittivity: 0.5, phase: 0 },
        ports: {
          input1: { x: 138, y: 162 },
          input2: { x: 162, y: 138 },
          output1: { x: 162, y: 162 },
          output2: { x: 138, y: 138 },
        },
      },
      {
        id: 'phase',
        type: 'phase',
        x: 250,
        y: 100,
        rotation: 0,
        params: { phase: 0 },
        ports: {
          input: { x: 238, y: 112 },
          output: { x: 262, y: 112 },
        },
      },
      {
        id: 'bs2',
        type: 'beamsplitter',
        x: 350,
        y: 150,
        rotation: 45,
        params: { transmittivity: 0.5, phase: 0 },
        ports: {
          input1: { x: 338, y: 162 },
          input2: { x: 362, y: 138 },
          output1: { x: 362, y: 162 },
          output2: { x: 338, y: 138 },
        },
      },
      {
        id: 'detector1',
        type: 'detector',
        x: 450,
        y: 100,
        rotation: 0,
        params: { efficiency: 0.9, darkCount: 100 },
        ports: { input: { x: 438, y: 112 } },
      },
      {
        id: 'detector2',
        type: 'detector',
        x: 450,
        y: 200,
        rotation: 0,
        params: { efficiency: 0.9, darkCount: 100 },
        ports: { input: { x: 438, y: 212 } },
      },
    ],
    connections: [
      {
        sourceId: 'source1',
        targetId: 'bs1',
        sourcePort: 'output',
        targetPort: 'input1',
      },
      {
        sourceId: 'bs1',
        targetId: 'phase',
        sourcePort: 'output2',
        targetPort: 'input',
      },
      {
        sourceId: 'phase',
        targetId: 'bs2',
        sourcePort: 'output',
        targetPort: 'input2',
      },
      {
        sourceId: 'bs1',
        targetId: 'bs2',
        sourcePort: 'output1',
        targetPort: 'input1',
      },
      {
        sourceId: 'bs2',
        targetId: 'detector1',
        sourcePort: 'output2',
        targetPort: 'input',
      },
      {
        sourceId: 'bs2',
        targetId: 'detector2',
        sourcePort: 'output1',
        targetPort: 'input',
      },
    ],
    thumbnail: '/templates/mzi.svg',
  },
];

export function CircuitTemplates({ onSelectTemplate }: CircuitTemplatesProps) {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-xl font-medium mb-4">Templates</h3>
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 rounded-lg border bg-background/50 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium">{template.name}</h4>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  template.difficulty === 'beginner'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}
              >
                {template.difficulty}
              </span>
            </div>
            {template.thumbnail && (
              <div className="bg-background rounded-md p-4 mb-4 border">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-32 object-contain"
                />
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate(template);
              }}
            >
              Use Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
