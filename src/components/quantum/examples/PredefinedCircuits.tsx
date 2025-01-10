'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircuitTemplate } from '@/types/photonic';

const PREDEFINED_CIRCUITS: CircuitTemplate[] = [
  {
    id: 'mzi',
    name: 'Mach-Zehnder Interferometer',
    description: 'A basic interferometer using two beam splitters and a phase shifter.',
    difficulty: 'beginner',
    components: [
      {
        id: 'source1',
        type: 'source',
        x: 100,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 10, layer: 1, cross_section: 'xs_sc' },
        ports: { 'o1': { x: 10, y: 0 } }
      },
      {
        id: 'bs1',
        type: 'beamSplitter',
        x: 150,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 20, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 20, y: -10 }, 'o2': { x: 20, y: 10 } }
      },
      {
        id: 'ps1',
        type: 'phaseShifter',
        x: 200,
        y: 90,
        rotation: 0,
        params: { width: 0.5, length: 30, phase: 0, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 30, y: 0 } }
      },
      {
        id: 'bs2',
        type: 'beamSplitter',
        x: 250,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 20, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: -10 }, 'i2': { x: 0, y: 10 }, 'o1': { x: 20, y: 0 } }
      },
      {
        id: 'detector1',
        type: 'detector',
        x: 300,
        y: 100,
        rotation: 0,
        params: { width: 5, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 } }
      }
    ],
    connections: [
      { source: { component: 0, port: 'o1' }, target: { component: 1, port: 'i1' } },
      { source: { component: 1, port: 'o1' }, target: { component: 2, port: 'i1' } },
      { source: { component: 1, port: 'o2' }, target: { component: 3, port: 'i2' } },
      { source: { component: 2, port: 'o1' }, target: { component: 3, port: 'i1' } },
      { source: { component: 3, port: 'o1' }, target: { component: 4, port: 'i1' } }
    ]
  },
  {
    id: 'ring-resonator',
    name: 'Ring Resonator',
    description: 'A waveguide coupled to a ring resonator for wavelength filtering.',
    difficulty: 'intermediate',
    components: [
      {
        id: 'source1',
        type: 'source',
        x: 100,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 10, layer: 1, cross_section: 'xs_sc' },
        ports: { 'o1': { x: 10, y: 0 } }
      },
      {
        id: 'wg1',
        type: 'straight',
        x: 150,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 100, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 100, y: 0 } }
      },
      {
        id: 'ring1',
        type: 'beamSplitter',
        x: 200,
        y: 100,
        rotation: 90,
        params: { width: 0.5, length: 20, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 20, y: 0 } }
      },
      {
        id: 'detector1',
        type: 'detector',
        x: 280,
        y: 100,
        rotation: 0,
        params: { width: 5, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 } }
      }
    ],
    connections: [
      { source: { component: 0, port: 'o1' }, target: { component: 1, port: 'i1' } },
      { source: { component: 1, port: 'o1' }, target: { component: 3, port: 'i1' } }
    ]
  },
  {
    id: 'bb84-encoder',
    name: 'BB84 QKD Encoder',
    description: 'Quantum key distribution encoder using the BB84 protocol.',
    difficulty: 'advanced',
    components: [
      {
        id: 'source1',
        type: 'source',
        x: 100,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 10, layer: 1, cross_section: 'xs_sc' },
        ports: { 'o1': { x: 10, y: 0 } }
      },
      {
        id: 'ps1',
        type: 'phaseShifter',
        x: 150,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 30, phase: 0, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 30, y: 0 } }
      },
      {
        id: 'bs1',
        type: 'beamSplitter',
        x: 200,
        y: 100,
        rotation: 0,
        params: { width: 0.5, length: 20, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 20, y: 0 } }
      },
      {
        id: 'ps2',
        type: 'phaseShifter',
        x: 250,
        y: 90,
        rotation: 0,
        params: { width: 0.5, length: 30, phase: 0, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 }, 'o1': { x: 30, y: 0 } }
      },
      {
        id: 'detector1',
        type: 'detector',
        x: 300,
        y: 100,
        rotation: 0,
        params: { width: 5, layer: 1, cross_section: 'xs_sc' },
        ports: { 'i1': { x: 0, y: 0 } }
      }
    ],
    connections: [
      { source: { component: 0, port: 'o1' }, target: { component: 1, port: 'i1' } },
      { source: { component: 1, port: 'o1' }, target: { component: 2, port: 'i1' } },
      { source: { component: 2, port: 'o1' }, target: { component: 3, port: 'i1' } },
      { source: { component: 3, port: 'o1' }, target: { component: 4, port: 'i1' } }
    ]
  }
];

interface PredefinedCircuitsProps {
  onLoadCircuit: (circuit: CircuitTemplate) => void;
}

export default function PredefinedCircuits({ onLoadCircuit }: PredefinedCircuitsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Load Example</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Predefined Quantum Circuits</DialogTitle>
          <DialogDescription>
            Choose from these example circuits to get started quickly.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-4">
            {PREDEFINED_CIRCUITS.map((circuit) => (
              <div
                key={circuit.id}
                className="flex flex-col gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                onClick={() => {
                  onLoadCircuit(circuit);
                  const closeButton = document.querySelector('[data-dialog-close]');
                  if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{circuit.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    circuit.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    circuit.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {circuit.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{circuit.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
