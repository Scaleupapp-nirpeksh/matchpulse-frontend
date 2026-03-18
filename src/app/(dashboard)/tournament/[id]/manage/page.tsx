'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { SportIcon } from '@/components/matches/sport-icon';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import {
  getTournament,
  updateTournamentStatus,
  generateFixtures,
} from '@/lib/api/tournaments';
import { getTournamentTeams } from '@/lib/api/teams';
import { getTournamentMatches } from '@/lib/api/matches';
import { getSportConfig } from '@/lib/sports-config';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Match } from '@/types/match';
import {
  Users,
  Calendar,
  CheckCircle,
  Play,
  PauseCircle,
  Shuffle,
  Settings,
  BarChart3,
  Trophy,
  ArrowRight,
  Clipboard,
  Link2,
} from 'lucide-react';

interface TournamentData {
  _id: string;
  name: string;
  sportType: string;
  format: string;
  status: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  rulesConfig?: Record<string, unknown>;
}

interface TeamData {
  _id: string;
  name: string;
}

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; icon: typeof Play }[]> = {
  draft: [{ next: 'registration', label: 'Open Registration', icon: Clipboard }],
  registration: [{ next: 'active', label: 'Start Tournament', icon: Play }],
  active: [{ next: 'completed', label: 'Complete Tournament', icon: CheckCircle }],
};

export default function ManageTournamentPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Fetch tournament
  const { data: tournament, isLoading: loadingTournament } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => getTournament(id) as unknown as Promise<TournamentData>,
  });

  // Fetch teams
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['tournament-teams', id],
    queryFn: () => getTournamentTeams(id) as unknown as Promise<TeamData[]>,
  });

  // Fetch matches
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['tournament-matches', id],
    queryFn: () => getTournamentMatches(id) as unknown as Promise<Match[]>,
  });

  // Status transition mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => updateTournamentStatus(id, newStatus),
    onSuccess: (_, newStatus) => {
      toast.success(`Tournament status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
    },
    onError: () => {
      toast.error('Failed to update tournament status');
    },
  });

  // Generate fixtures mutation
  const fixturesMutation = useMutation({
    mutationFn: () => generateFixtures(id),
    onSuccess: () => {
      toast.success('Fixtures generated successfully');
      queryClient.invalidateQueries({ queryKey: ['tournament-matches', id] });
    },
    onError: () => {
      toast.error('Failed to generate fixtures');
    },
  });

  const isLoading = loadingTournament || loadingTeams || loadingMatches;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <EmptyState
        icon={Trophy}
        title="Tournament not found"
        description="The tournament you are looking for does not exist."
      />
    );
  }

  const sportConfig = getSportConfig(tournament.sportType);
  const completedMatches = (matches as Match[]).filter((m) => m.status === 'completed').length;
  const liveMatches = (matches as Match[]).filter((m) => m.status === 'live');
  const availableTransitions = STATUS_TRANSITIONS[tournament.status] || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'accent' as const;
      case 'completed':
        return 'default' as const;
      case 'registration':
        return 'warning' as const;
      case 'cancelled':
        return 'danger' as const;
      default:
        return 'default' as const;
    }
  };

  const stats = [
    {
      label: 'Teams',
      value: teams.length,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Matches',
      value: (matches as Match[]).length,
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: completedMatches,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <SportIcon sport={tournament.sportType} size={22} showBackground />
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {tournament.name}
            </h1>
            <Badge variant={getStatusBadgeVariant(tournament.status)}>
              {tournament.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary capitalize">
            {sportConfig.name} &middot; {tournament.format.replace(/_/g, ' ')}
            {tournament.startDate && ` &middot; ${formatDate(tournament.startDate)}`}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/tournament/${id}/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
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

      {/* Status Controls + Fixture Gen */}
      <div className="flex flex-wrap gap-3">
        {availableTransitions.map((t) => (
          <Button
            key={t.next}
            onClick={() => statusMutation.mutate(t.next)}
            loading={statusMutation.isPending}
          >
            <t.icon className="mr-2 h-4 w-4" />
            {t.label}
          </Button>
        ))}

        {tournament.status === 'active' && (matches as Match[]).length === 0 && (
          <Button
            variant="outline"
            onClick={() => fixturesMutation.mutate()}
            loading={fixturesMutation.isPending}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Generate Fixtures
          </Button>
        )}

        {tournament.status === 'registration' && (
          <Button
            variant="outline"
            onClick={() => {
              const url = `${window.location.origin}/tournament/${id}/register`;
              navigator.clipboard?.writeText(url);
              toast.success('Registration link copied to clipboard!');
            }}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Copy Registration Link
          </Button>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: `/tournament/${id}/teams`, icon: Users, label: 'Teams' },
          { href: `/tournament/${id}/schedule`, icon: Calendar, label: 'Schedule' },
          { href: `/tournament/${id}/standings`, icon: BarChart3, label: 'Standings' },
          { href: `/tournament/${id}/settings`, icon: Settings, label: 'Settings' },
        ].map((link) => (
          <Button
            key={link.label}
            variant="outline"
            asChild
            className="h-auto flex-col gap-1.5 py-4"
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5" />
              <span className="text-xs">{link.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Recent Matches */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Recent Matches</h2>
          {(matches as Match[]).length > 5 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tournament/${id}/schedule`}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {(matches as Match[]).length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No matches yet"
            description="Generate fixtures or create matches manually to get started."
            action={
              tournament.status === 'active' ? (
                <Button onClick={() => fixturesMutation.mutate()} loading={fixturesMutation.isPending}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Generate Fixtures
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(matches as Match[]).slice(0, 6).map((match) => (
              <LiveMatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
