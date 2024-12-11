'use client';

import { QuantumCircuit } from '@/components/quantum/photonics/QuantumCircuit';
import { QKDProtocol } from '@/components/quantum/networking/QKDProtocol';
import { StateVisualizer } from '@/components/quantum/visualization/StateVisualizer';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function Home() {
  const demoStates = [
    { amplitude: 0.7071, phase: 0, basis: '|0⟩' },
    { amplitude: 0.7071, phase: Math.PI, basis: '|1⟩' },
    { amplitude: 0.5, phase: Math.PI / 2, basis: '|+⟩' },
    { amplitude: 0.5, phase: -Math.PI / 2, basis: '|-⟩' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Brisk Quantum Framework</h1>
          <p className="text-muted-foreground">
            A next-generation quantum computing framework for photonics and networking
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Quantum Circuit Designer</h2>
          <QuantumCircuit className="w-full" />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Quantum Key Distribution</h2>
          <QKDProtocol className="w-full" keyLength={8} />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">State Visualization</h2>
          <StateVisualizer className="w-full" states={demoStates} />
        </section>
      </div>
    </div>
  );
}
