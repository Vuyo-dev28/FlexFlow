
'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TriangleAlert, X } from 'lucide-react';

export function RiskManagementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className="sticky top-14 z-40 rounded-none border-x-0 border-t-0 flex items-center justify-between text-center gap-2 py-2 px-4 text-xs"
    >
      <div className="flex items-center gap-2">
        <TriangleAlert className="h-4 w-4" />
        <AlertDescription>
          Please remember to use proper risk management.
        </AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-destructive-foreground"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </Alert>
  );
}
