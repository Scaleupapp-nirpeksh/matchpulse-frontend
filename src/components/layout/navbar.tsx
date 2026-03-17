'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Zap, ChevronDown, LogOut, LayoutDashboard, PenLine, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live' },
  { label: 'Tournaments', href: '/tournaments' },
];

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white border-b border-border shadow-sm'
          : 'bg-white border-b border-border'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold text-text-primary">
            Match<span className="text-accent">Pulse</span>
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth buttons or user avatar (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface transition-colors"
              >
                <Avatar
                  src={user.avatarUrl}
                  name={user.fullName}
                  size="sm"
                />
                <span className="text-sm font-medium text-text-primary max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-text-tertiary transition-transform',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white border border-border shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/scorer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    <PenLine className="h-4 w-4" />
                    Scorer
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: Hamburger */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary py-3 px-4 rounded-lg hover:bg-surface transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <>
                <div className="border-t border-border mt-2 pt-2">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{user.fullName}</p>
                      <p className="text-xs text-text-tertiary">{user.email}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 text-sm font-medium text-text-secondary hover:text-text-primary py-3 px-4 rounded-lg hover:bg-surface transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/scorer"
                  className="flex items-center gap-3 text-sm font-medium text-text-secondary hover:text-text-primary py-3 px-4 rounded-lg hover:bg-surface transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <PenLine className="h-4 w-4" />
                  Scorer
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 text-sm font-medium text-text-secondary hover:text-text-primary py-3 px-4 rounded-lg hover:bg-surface transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 text-sm font-medium text-danger py-3 px-4 rounded-lg hover:bg-danger-light transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="ghost" size="md" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="default" size="md" asChild>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
