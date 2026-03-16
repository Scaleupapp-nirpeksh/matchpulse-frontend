'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, PenLine, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Matches', href: '/dashboard/matches', icon: Trophy },
  { label: 'Score', href: '/scorer', icon: PenLine },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]',
                isActive
                  ? 'text-accent'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-accent')} />
              <span className={cn('text-[10px] font-medium', isActive && 'text-accent')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
