import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCw, Trash2 } from 'lucide-react';
import { QuantumGate } from '@/types/quantum';

interface ComponentControlsProps {
  selectedGate: QuantumGate | null;
  onUpdateParameters: (id: string, params: Record<string, number>) => void;
  onRotate: (id: string, angle: number) => void;
  onDelete: (id: string) => void;
}

const parameterConfigs = {
  beamsplitter: [
    {
      name: 'transmittivity',
      label: 'Transmittivity',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
    },
    {
      name: 'phase',
      label: 'Phase',
      min: 0,
      max: 360,
      step: 1,
      default: 0,
    },
  ],
  phaseshift: [
    {
      name: 'phase',
      label: 'Phase Shift',
      min: 0,
      max: 360,
      step: 1,
      default: 0,
    },
  ],
  source: [
    {
      name: 'photonNumber',
      label: 'Photon Number',
      min: 1,
      max: 10,
      step: 1,
      default: 1,
    },
    {
      name: 'frequency',
      label: 'Frequency (THz)',
      min: 100,
      max: 1000,
      step: 10,
      default: 193.1, // C-band center frequency
    },
  ],
  detector: [
    {
      name: 'efficiency',
      label: 'Efficiency',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.9,
    },
    {
      name: 'darkCount',
      label: 'Dark Count Rate (Hz)',
      min: 0,
      max: 1000,
      step: 10,
      default: 100,
    },
  ],
};

export function ComponentControls({
  selectedGate,
  onUpdateParameters,
  onRotate,
  onDelete,
}: ComponentControlsProps) {
  if (!selectedGate) return null;

  const parameters = parameterConfigs[selectedGate.type as keyof typeof parameterConfigs] || [];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Component Settings</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRotate(selectedGate.id, 90)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(selectedGate.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {parameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{param.label}</Label>
              <Input
                type="number"
                value={selectedGate.parameters?.[param.name] ?? param.default}
                onChange={(e) =>
                  onUpdateParameters(selectedGate.id, {
                    ...selectedGate.parameters,
                    [param.name]: parseFloat(e.target.value),
                  })
                }
                className="w-20 text-right"
                min={param.min}
                max={param.max}
                step={param.step}
              />
            </div>
            <Slider
              value={[selectedGate.parameters?.[param.name] ?? param.default]}
              min={param.min}
              max={param.max}
              step={param.step}
              onValueChange={([value]) =>
                onUpdateParameters(selectedGate.id, {
                  ...selectedGate.parameters,
                  [param.name]: value,
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Position:</div>
          <div>
            ({selectedGate.position.x}, {selectedGate.position.y})
          </div>
          <div className="text-muted-foreground">Rotation:</div>
          <div>{selectedGate.rotation}°</div>
        </div>
      </div>
    </Card>
  );
}
