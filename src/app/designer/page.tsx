'use client';

import dynamic from 'next/dynamic';

const PhotonicChipDesigner = dynamic(
  () => import('@/components/quantum/PhotonicChipDesigner'),
  { ssr: false }
);

export default function DesignerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Photonic Chip Designer</h1>
        <p className="text-xl text-muted-foreground">
          Design and simulate quantum photonic circuits
        </p>
      </header>

      <PhotonicChipDesigner />
    </div>
  );
}
