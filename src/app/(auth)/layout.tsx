import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Zap className="h-7 w-7 text-accent" />
        <span className="text-2xl font-bold text-text-primary">
          Match<span className="text-accent">Pulse</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
