'use client';

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';

interface InstallBannerProps {
  /** Variant: 'compact' for inline, 'full' for prominent banner */
  variant?: 'compact' | 'full';
}

export function InstallBanner({ variant = 'full' }: InstallBannerProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || dismissed) return null;

  // Check localStorage for persistent dismiss
  if (typeof window !== 'undefined') {
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const daysSince =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return null; // Don't show for 7 days after dismiss
    }
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', String(Date.now()));
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
      >
        <Download size={14} />
        Install App
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <Download size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Install MatchPulse
          </p>
          <p className="text-xs text-gray-500 truncate">
            Add to your home screen for quick access to live scoring
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={install} className="gap-1.5">
          <Download size={14} />
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
