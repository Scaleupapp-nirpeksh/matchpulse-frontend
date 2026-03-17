'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={28} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
        <p className="text-gray-500 mb-8">
          It looks like you&apos;ve lost your internet connection. MatchPulse needs
          an active connection to show live scores and match data.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw size={16} />
          Try again
        </Button>
      </div>
    </div>
  );
}
