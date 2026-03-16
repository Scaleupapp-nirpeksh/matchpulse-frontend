'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Building2,
  Users,
  Settings,
  ChevronLeft,
  Zap,
  PlusCircle,
  ClipboardList,
  Shield,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  minRole?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  minRole?: string;
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Organization',
    minRole: 'org_admin',
    items: [
      { label: 'Settings', href: '/dashboard/org/settings', icon: Settings, minRole: 'org_admin' },
      { label: 'Members', href: '/dashboard/org/members', icon: Users, minRole: 'org_admin' },
      { label: 'Audit Log', href: '/dashboard/org/audit', icon: Shield, minRole: 'org_admin' },
    ],
  },
  {
    title: 'Tournaments',
    items: [
      { label: 'All Tournaments', href: '/dashboard/tournaments', icon: Trophy },
      { label: 'Create New', href: '/tournament/new', icon: PlusCircle, minRole: 'tournament_admin' },
    ],
  },
  {
    title: 'Matches',
    items: [
      { label: 'Matches', href: '/dashboard/matches', icon: ClipboardList },
      { label: 'Score', href: '/scorer', icon: PenLine, minRole: 'scorer' },
    ],
  },
];

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasMinRole } = usePermissions();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-white border-r border-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Zap className="h-6 w-6 text-accent shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-text-primary whitespace-nowrap">
              Match<span className="text-accent">Pulse</span>
            </span>
          )}
        </Link>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => {
          // Check if the section itself requires a minimum role
          if (section.minRole && !hasMinRole(section.minRole)) {
            return null;
          }

          // Filter items by role
          const visibleItems = section.items.filter(
            (item) => !item.minRole || hasMinRole(item.minRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface',
                        collapsed && 'justify-center px-0'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn('h-5 w-5 shrink-0', isActive && 'text-accent')}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
