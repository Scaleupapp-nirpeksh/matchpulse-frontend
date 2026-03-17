'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { getLiveMatches, getMyMatches } from '@/lib/api/matches';
import { getOrgTournaments } from '@/lib/api/tournaments';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import type { Match } from '@/types/match';
import {
  Trophy,
  Radio,
  Building2,
  CalendarDays,
  Plus,
  ClipboardEdit,
  LayoutDashboard,
  ArrowRight,
  Rocket,
} from 'lucide-react';

function getUserOrgId(user: ReturnType<typeof useAuth>['user']): string | null {
  if (!user?.organizationId) return null;
  if (typeof user.organizationId === 'string') return user.organizationId;
  if (typeof user.organizationId === 'object' && user.organizationId._id) return user.organizationId._id;
  return null;
}

function getUserOrgName(user: ReturnType<typeof useAuth>['user']): string | null {
  if (!user?.organizationId) return null;
  if (typeof user.organizationId === 'object' && user.organizationId.name) return user.organizationId.name;
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isTournamentAdmin, isOrgAdmin, isScorer } = usePermissions();

  const orgId = getUserOrgId(user);
  const orgName = getUserOrgName(user);
  const hasOrg = !!orgId;

  // Fetch org-scoped tournaments (only if user has an org)
  const { data: orgTournaments, isLoading: loadingTournaments } = useQuery({
    queryKey: ['orgTournaments', orgId],
    queryFn: () => getOrgTournaments(orgId!) as unknown as Promise<{ _id: string; status: string }[]>,
    enabled: hasOrg,
  });

  // Fetch live matches scoped to user's org
  const { data: liveMatches, isLoading: loadingLive } = useQuery({
    queryKey: ['liveMatches', orgId],
    queryFn: async () => {
      const matches = (await getLiveMatches()) as unknown as Match[];
      if (!orgId || !orgTournaments) return [];
      const orgTournamentIds = new Set(orgTournaments.map((t) => t._id));
      return matches.filter((m) => {
        const tid = typeof m.tournamentId === 'string' ? m.tournamentId : m.tournamentId?._id;
        return tid && orgTournamentIds.has(tid);
      });
    },
    enabled: hasOrg && !loadingTournaments,
  });

  // Fetch user's scorer matches
  const { data: myMatches, isLoading: loadingMy } = useQuery({
    queryKey: ['myMatches'],
    queryFn: () => getMyMatches() as unknown as Promise<Match[]>,
    enabled: hasOrg,
  });

  const isLoading = hasOrg && (loadingLive || loadingMy || loadingTournaments);

  const activeTournaments = orgTournaments?.filter((t) => t.status === 'active')?.length ?? 0;
  const totalTournaments = orgTournaments?.length ?? 0;
  const liveCount = liveMatches?.length ?? 0;
  const totalMatches = myMatches?.length ?? 0;

  const recentMatches = (myMatches ?? []).slice(0, 5) as Match[];

  // ---------- New user without org — Onboarding view ----------
  if (!hasOrg && !isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome, {user?.fullName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="mt-1 text-text-secondary">
            Let&apos;s get you set up. Start by creating your organization.
          </p>
        </div>

        {/* Getting Started Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Rocket className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Get Started</h2>
                <p className="text-sm text-text-secondary">3 steps to your first live match</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary">Create your Organization</h3>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    An organization is your team, club, or league. It holds all your tournaments.
                  </p>
                  <Button asChild className="mt-3">
                    <Link href="/org/new">
                      <Building2 className="mr-2 h-4 w-4" />
                      Create Organization
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 rounded-lg border border-border p-4 opacity-60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-text-tertiary">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-text-secondary">Create a Tournament</h3>
                  <p className="mt-0.5 text-sm text-text-tertiary">
                    Choose a sport, format, and customize rules — round-robin, knockout, or groups+knockout.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 rounded-lg border border-border p-4 opacity-60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-text-tertiary">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-text-secondary">Add Teams & Start Scoring</h3>
                  <p className="mt-0.5 text-sm text-text-tertiary">
                    Add teams, generate fixtures, and score matches live with real-time updates.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Or join an org */}
        <p className="text-center text-sm text-text-tertiary">
          Were you invited to an organization? Check your email for an invite link.
        </p>
      </div>
    );
  }

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-5 w-96" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // ---------- Main Dashboard (user has org) ----------
  const statCards = [
    {
      label: 'Active Tournaments',
      value: activeTournaments,
      icon: <Trophy className="h-5 w-5" />,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Live Matches',
      value: liveCount,
      icon: <Radio className="h-5 w-5" />,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'My Matches',
      value: totalMatches,
      icon: <CalendarDays className="h-5 w-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Tournaments',
      value: totalTournaments,
      icon: <Building2 className="h-5 w-5" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-text-secondary">
          {orgName ? (
            <>Here is what&apos;s happening in <span className="font-medium text-text-primary">{orgName}</span>.</>
          ) : (
            <>Here is what is happening across your matches and tournaments.</>
          )}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <div className={s.color}>{s.icon}</div>
              </div>
              <div>
                <p className="text-sm text-text-secondary">{s.label}</p>
                <p className="text-2xl font-bold text-text-primary">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {isOrgAdmin && (
          <Button asChild>
            <Link href="/tournament/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Link>
          </Button>
        )}
        {isScorer && (
          <Button variant="outline" asChild>
            <Link href="/scorer">
              <ClipboardEdit className="mr-2 h-4 w-4" />
              Score a Match
            </Link>
          </Button>
        )}
        {isOrgAdmin && orgId && (
          <Button variant="outline" asChild>
            <Link href={`/org/${orgId}/manage`}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Organization
            </Link>
          </Button>
        )}
        {orgId && (
          <Button variant="ghost" asChild>
            <Link href={`/org/${orgId}/tournaments`}>
              <Trophy className="mr-2 h-4 w-4" />
              View Tournaments
            </Link>
          </Button>
        )}
      </div>

      {/* Recent Matches */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Recent Matches</h2>
          {recentMatches.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/matches">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {recentMatches.length === 0 ? (
          <EmptyState
            icon={LayoutDashboard}
            title="No recent matches"
            description={
              isOrgAdmin
                ? 'Create a tournament and generate fixtures to see matches here.'
                : 'Matches assigned to you as a scorer will appear here.'
            }
            action={
              isOrgAdmin ? (
                <Button asChild>
                  <Link href="/tournament/new">Create a Tournament</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentMatches.map((match) => (
              <LiveMatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
