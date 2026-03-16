'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { getLiveMatches, getMyMatches } from '@/lib/api/matches';
import { getOrganizations } from '@/lib/api/organizations';
import { getTournaments } from '@/lib/api/tournaments';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import { formatRelativeTime } from '@/lib/utils';
import type { Match } from '@/types/match';
import {
  Trophy,
  Radio,
  Building2,
  CalendarDays,
  Plus,
  ClipboardEdit,
  Users,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isTournamentAdmin, isScorer } = usePermissions();

  const { data: liveMatches, isLoading: loadingLive } = useQuery({
    queryKey: ['liveMatches'],
    queryFn: () => getLiveMatches() as unknown as Promise<Match[]>,
  });

  const { data: myMatches, isLoading: loadingMy } = useQuery({
    queryKey: ['myMatches'],
    queryFn: () => getMyMatches() as unknown as Promise<Match[]>,
  });

  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations() as unknown as Promise<{ _id: string }[]>,
  });

  const { data: tournaments, isLoading: loadingTournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => getTournaments() as unknown as Promise<{ _id: string; status: string }[]>,
  });

  const isLoading = loadingLive || loadingMy || loadingOrgs || loadingTournaments;

  const activeTournaments = tournaments?.filter((t) => t.status === 'active')?.length ?? 0;
  const liveCount = liveMatches?.length ?? 0;
  const totalMatches = myMatches?.length ?? 0;
  const orgCount = organizations?.length ?? 0;

  const recentMatches = (myMatches ?? []).slice(0, 5) as Match[];

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
      label: 'Total Matches',
      value: totalMatches,
      icon: <CalendarDays className="h-5 w-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Organizations',
      value: orgCount,
      icon: <Building2 className="h-5 w-5" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

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

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-text-secondary">
          Here is what is happening across your matches and tournaments.
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
      {isTournamentAdmin && (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tournament/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Link>
          </Button>
          {isScorer && (
            <Button variant="outline" asChild>
              <Link href="/scorer">
                <ClipboardEdit className="mr-2 h-4 w-4" />
                Score a Match
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/org/new">
              <Building2 className="mr-2 h-4 w-4" />
              New Organization
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/matches">
              <Users className="mr-2 h-4 w-4" />
              Manage Teams
            </Link>
          </Button>
        </div>
      )}

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
            description="Your matches will appear here once tournaments have scheduled fixtures."
            action={
              isTournamentAdmin ? (
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
