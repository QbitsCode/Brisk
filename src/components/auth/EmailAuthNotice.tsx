'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export default function EmailAuthNotice({ providerName }: { providerName: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Card className="p-4 my-3 bg-gray-900 border border-amber-800/50">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-400">{providerName} Authentication Setup Required</h3>
          <p className="text-xs text-gray-300 mt-1">
            {providerName} authentication requires configuring OAuth credentials. Please use email authentication until OAuth setup is complete.
          </p>
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
