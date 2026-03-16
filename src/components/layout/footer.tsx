'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

const footerLinks = [
  { label: 'About', href: '/about' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold text-text-primary">
                Match<span className="text-accent">Pulse</span>
              </span>
            </Link>
            <p className="text-sm text-text-tertiary max-w-xs">
              Real-time sports scoring platform. Track live matches, manage tournaments, and stay
              connected to the game.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-xs text-text-tertiary text-center">
            &copy; {new Date().getFullYear()} MatchPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
