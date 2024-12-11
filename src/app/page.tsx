'use client';

import { QuantumCircuit } from '@/components/quantum/photonics/QuantumCircuit';
import { QKDProtocol } from '@/components/quantum/networking/QKDProtocol';
import { StateVisualizer } from '@/components/quantum/visualization/StateVisualizer';
import { QuantumNetwork } from '@/components/quantum/internet/QuantumNetwork';
import { briskConfig } from '@/config/brisk';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Brisk Quantum Framework</h1>
        <p className="text-xl text-muted-foreground">
          {briskConfig.framework.description}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {Object.entries(briskConfig.applications).map(([key, app]) => (
          <div key={key} className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-4">{app.title}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {app.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Use Cases</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {app.use_cases.map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4 p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold">Interactive Quantum Applications</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Quantum Circuit Designer</h3>
              <QuantumCircuit className="w-full" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Quantum Network Simulator</h3>
              <QuantumNetwork className="w-full" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Quantum Key Distribution</h3>
              <QKDProtocol className="w-full" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Quantum State Visualization</h3>
              <StateVisualizer 
                states={[
                  { amplitude: 0.7071, phase: 0, basis: '|0⟩' },
                  { amplitude: 0.7071, phase: Math.PI, basis: '|1⟩' },
                ]} 
                className="w-full" 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold">Framework Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(briskConfig.capabilities).map(([category, features]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-lg font-medium capitalize">{category}</h3>
                <ul className="space-y-1">
                  {Object.entries(features).map(([feature, supported]) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <span className={supported ? "text-green-500" : "text-red-500"}>
                        {supported ? "✓" : "✗"}
                      </span>
                      <span className="text-muted-foreground capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
