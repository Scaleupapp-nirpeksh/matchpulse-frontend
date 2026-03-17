'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  Users,
  AlertCircle,
  FileText,
  ClipboardList,
  BarChart3,
  GitBranch,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import { StandingsTable } from '@/components/matches/standings-table';
import { BracketView } from '@/components/tournament/bracket-view';
import { SportIcon } from '@/components/matches/sport-icon';
import { getTournament } from '@/lib/api/tournaments';
import { getTournamentMatches } from '@/lib/api/matches';
import { getTournamentTeams } from '@/lib/api/teams';
import { getTournamentStandings } from '@/lib/api/standings';
import { getSportConfig } from '@/lib/sports-config';
import { formatDate, cn } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeIn } from '@/lib/animations';
import type { Tournament } from '@/types/tournament';
import type { Match } from '@/types/match';
import type { Team } from '@/types/team';

function TournamentSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-10 w-80 mb-3" />
        <Skeleton className="h-5 w-48 mb-8" />
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ tournament }: { tournament: Tournament }) {
  const sportConfig = getSportConfig(tournament.sportType);
  const rules = tournament.rulesConfig ?? {};
  const ruleEntries = Object.entries(rules).filter(
    ([k]) => !k.startsWith('_')
  );

  return (
    <div className="space-y-8">
      {/* Description */}
      {tournament.description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {tournament.description}
          </p>
        </div>
      )}

      {/* Rules summary */}
      {ruleEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Rules Configuration
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-0 divide-y divide-gray-200/60">
            {ruleEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {typeof value === 'boolean'
                    ? value
                      ? 'Yes'
                      : 'No'
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Venues */}
      {tournament.venues && tournament.venues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Venues</h3>
          <div className="space-y-2">
            {tournament.venues.map((venue, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-3"
              >
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {venue.name}
                  </p>
                  {venue.address && (
                    <p className="text-xs text-gray-400">{venue.address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tournament Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
        <div className="space-y-0 divide-y divide-gray-100">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500">Sport</span>
            <div className="flex items-center gap-2">
              <SportIcon sport={tournament.sportType} size={14} />
              <span className="text-sm font-medium text-gray-900">
                {sportConfig.name}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500">Format</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {tournament.format.replace(/_/g, ' ')}
            </span>
          </div>
          {tournament.maxTeams && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">Max Teams</span>
              <span className="text-sm font-medium text-gray-900">
                {tournament.maxTeams}
              </span>
            </div>
          )}
          {tournament.numGroups && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">Groups</span>
              <span className="text-sm font-medium text-gray-900">
                {tournament.numGroups}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FixturesTab({ tournamentId }: { tournamentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['tournament-matches', tournamentId],
    queryFn: async () => {
      const res = await getTournamentMatches(tournamentId);
      return ((res as unknown as { data: Match[] }).data ?? (res as unknown as Match[])) as Match[];
    },
  });

  const matches = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No fixtures yet"
        description="Fixtures will appear here once the schedule is generated"
      />
    );
  }

  // Group matches by stage
  const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
    const stage = match.stage || 'General';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div key={stage}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
            {stage.replace(/_/g, ' ')}
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {stageMatches.map((match) => (
              <motion.div key={match._id} variants={staggerItem}>
                <LiveMatchCard match={match} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function StandingsTab({
  tournamentId,
  sportType,
}: {
  tournamentId: string;
  sportType: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['tournament-standings', tournamentId],
    queryFn: async () => {
      const res = await getTournamentStandings(tournamentId);
      return (res as unknown as { data: unknown }).data ?? res;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded" />
        ))}
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const standings = Array.isArray(data) ? data : ((data as any)?.standings ?? []);

  if (standings.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No standings yet"
        description="Standings will be calculated after matches are completed"
      />
    );
  }

  // Check if standings are grouped
  const hasGroups = standings.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s.groupName && s.groupName !== ''
  );

  if (hasGroups) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups = (standings as any[]).reduce<Record<string, any[]>>((acc: Record<string, any[]>, s: any) => {
      const group = s.groupName || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(s);
      return acc;
    }, {});

    return (
      <div className="space-y-8">
        {Object.entries(groups).map(([groupName, groupStandings]) => (
          <div key={groupName}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {groupName}
            </h3>
            <div className="border border-gray-200 rounded-xl p-4">
              <StandingsTable
                standings={groupStandings}
                sportType={sportType}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <StandingsTable standings={standings} sportType={sportType} />
    </div>
  );
}

function TeamsTab({ tournamentId }: { tournamentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['tournament-teams', tournamentId],
    queryFn: async () => {
      const res = await getTournamentTeams(tournamentId);
      return ((res as unknown as { data: Team[] }).data ?? (res as unknown as Team[])) as Team[];
    },
  });

  const teams = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No teams yet"
        description="Teams will appear here once they are registered"
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
    >
      {teams.map((team) => {
        const id = team.id || team._id;
        return (
          <motion.div key={id} variants={staggerItem}>
            <Link href={`/team/${id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full shrink-0"
                    style={{
                      backgroundColor: team.color || '#6B7280',
                    }}
                  />
                  <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                    {team.name}
                  </h4>
                </div>
                {team.shortName && (
                  <p className="text-xs text-gray-400 mb-1">
                    {team.shortName}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {team.players?.length || 0} players
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function BracketTab({ tournamentId }: { tournamentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['tournament-matches', tournamentId],
    queryFn: async () => {
      const res = await getTournamentMatches(tournamentId);
      return ((res as unknown as { data: Match[] }).data ?? (res as unknown as Match[])) as Match[];
    },
  });

  const matches = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  // Filter to knockout stage matches only
  const knockoutMatches = matches.filter((m) => {
    const stage = (m.stage || '').toLowerCase();
    return (
      stage.includes('final') ||
      stage.includes('quarter') ||
      stage.includes('semi') ||
      stage.includes('round_of') ||
      stage.includes('knockout') ||
      stage.includes('elimination')
    );
  });

  // If no specific knockout stages, show all matches as bracket
  const bracketMatches = knockoutMatches.length > 0 ? knockoutMatches : matches;

  if (bracketMatches.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No bracket matches yet"
        description="Bracket matches will appear here once the knockout stage begins"
      />
    );
  }

  return <BracketView matches={bracketMatches} />;
}

export default function TournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const {
    data: tournamentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      const res = await getTournament(tournamentId);
      return (res as unknown as { data: Tournament }).data ?? (res as unknown as Tournament);
    },
    enabled: !!tournamentId,
  });

  const tournament = tournamentData as Tournament | undefined;

  if (isLoading) {
    return <TournamentSkeleton />;
  }

  if (error || !tournament) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Tournament not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The tournament you are looking for does not exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const sportConfig = getSportConfig(tournament.sportType);
  const id = tournament.id || tournament._id || tournamentId;

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Back nav */}
        <motion.div {...fadeIn} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Home</span>
          </Link>
        </motion.div>

        {/* Tournament Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <SportIcon
              sport={tournament.sportType}
              size={24}
              showBackground
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">
                  {sportConfig.name}
                </span>
                <Badge variant="default" size="sm" className="capitalize">
                  {tournament.format.replace(/_/g, ' ')}
                </Badge>
                <Badge
                  variant={
                    tournament.status === 'active'
                      ? 'accent'
                      : tournament.status === 'completed'
                      ? 'default'
                      : 'warning'
                  }
                  size="sm"
                  className="capitalize"
                >
                  {tournament.status}
                </Badge>
              </div>
              {(tournament.startDate || tournament.endDate) && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
                  <Calendar size={14} />
                  <span>
                    {tournament.startDate && formatDate(tournament.startDate)}
                    {tournament.endDate &&
                      ` - ${formatDate(tournament.endDate)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview" className="gap-1.5">
                <FileText size={14} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="fixtures" className="gap-1.5">
                <ClipboardList size={14} />
                Fixtures
              </TabsTrigger>
              <TabsTrigger value="standings" className="gap-1.5">
                <BarChart3 size={14} />
                Standings
              </TabsTrigger>
              {(tournament.format === 'knockout' || tournament.format === 'group_knockout') && (
                <TabsTrigger value="bracket" className="gap-1.5">
                  <GitBranch size={14} />
                  Bracket
                </TabsTrigger>
              )}
              <TabsTrigger value="teams" className="gap-1.5">
                <Users size={14} />
                Teams
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab tournament={tournament} />
            </TabsContent>

            <TabsContent value="fixtures">
              <FixturesTab tournamentId={id} />
            </TabsContent>

            <TabsContent value="standings">
              <StandingsTab
                tournamentId={id}
                sportType={tournament.sportType}
              />
            </TabsContent>

            {(tournament.format === 'knockout' || tournament.format === 'group_knockout') && (
              <TabsContent value="bracket">
                <BracketTab tournamentId={id} />
              </TabsContent>
            )}

            <TabsContent value="teams">
              <TeamsTab tournamentId={id} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
