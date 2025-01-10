'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TutorialStep {
  title: string;
  description: string;
  highlight?: string; // CSS selector for highlighting elements
  action?: string; // What the user needs to do
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Brisk!',
    description: 'This tutorial will guide you through creating your first quantum photonic circuit.',
    action: 'Click "Next" to begin.'
  },
  {
    title: 'Adding Components',
    description: 'Start by adding components from the toolbar above. Click any component button to add it to your canvas.',
    highlight: '.component-buttons',
    action: 'Try adding a Straight Waveguide to your canvas.'
  },
  {
    title: 'Moving Components',
    description: 'You can drag components around the canvas to position them. Click and hold any component to move it.',
    action: 'Try moving the component you just added.'
  },
  {
    title: 'Connecting Components',
    description: 'Double-click a component to start a connection, then click another component to complete the connection.',
    action: 'Add another component and try connecting them.'
  },
  {
    title: 'Component Parameters',
    description: 'Click any component to select it, then use the parameter panel to adjust its properties.',
    highlight: '.parameter-panel',
    action: 'Try adjusting some parameters of your components.'
  },
  {
    title: 'Layer Management',
    description: 'Components can be placed on different layers. Use the layer dropdown in the parameters panel to organize your design.',
    action: 'Try changing the layer of a component.'
  },
  {
    title: 'Congratulations!',
    description: 'You\'ve completed the basic tutorial. Feel free to explore more features or load example circuits to learn advanced concepts.',
    action: 'Click "Finish" to end the tutorial.'
  }
];

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({ onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
          {step.action && (
            <div className="bg-accent/50 p-2 rounded-md text-sm">
              ✨ {step.action}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onSkip}>
            Skip Tutorial
          </Button>
          <Button onClick={handleNext}>
            {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
