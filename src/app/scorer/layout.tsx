'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ScorerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Minimal Header */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-white px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Link href="/scorer" className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
              <span className="text-[10px] font-bold text-white">MP</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              MatchPulse Scorer
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>
    </div>
  );
}
