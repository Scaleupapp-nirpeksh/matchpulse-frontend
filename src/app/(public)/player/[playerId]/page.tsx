'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  User,
  AlertCircle,
  BarChart3,
  History,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import { SportIcon } from '@/components/matches/sport-icon';
import { getPlayer, getPlayerStats, getPlayerMatches } from '@/lib/api/players';
import { SPORT_CONFIGS } from '@/lib/sports-config';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations';
import type { Match } from '@/types/match';

interface PlayerData {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  preferredSports?: string[];
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface PlayerStatGroup {
  sport?: string;
  sportType?: string;
  [key: string]: unknown;
}

function PlayerSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="flex items-center gap-5 mb-8">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Highlight stats: pick the most important numbers for quick overview cards
const HIGHLIGHT_KEYS: Record<string, string[]> = {
  cricket: ['runs', 'wickets', 'matches', 'battingAvg', 'bowlingAvg', 'catches', 'innings', 'fifties', 'hundreds', 'strikeRate'],
  football: ['goals', 'assists', 'matches', 'yellowCards', 'redCards', 'minutesPlayed', 'cleanSheets'],
  'basketball_5v5': ['points', 'rebounds', 'assists', 'matches', 'steals', 'blocks', 'threePointers'],
  'basketball_3x3': ['points', 'rebounds', 'assists', 'matches', 'steals', 'blocks'],
  volleyball: ['kills', 'blocks', 'aces', 'matches', 'digs', 'assists'],
  tennis: ['matchesWon', 'matchesLost', 'aces', 'doubleFaults', 'winRate'],
  table_tennis: ['matchesWon', 'matchesLost', 'points', 'winRate'],
  badminton: ['matchesWon', 'matchesLost', 'smashes', 'winRate'],
  squash: ['matchesWon', 'matchesLost', 'points', 'winRate'],
};

function getHighlightStats(stats: Record<string, unknown>, sport?: string): { key: string; value: unknown }[] {
  const priorityKeys = sport ? (HIGHLIGHT_KEYS[sport] || []) : [];
  const result: { key: string; value: unknown }[] = [];

  // First add priority keys
  for (const key of priorityKeys) {
    if (stats[key] !== undefined && stats[key] !== null) {
      result.push({ key, value: stats[key] });
    }
  }

  // Then add any numeric values not already included
  if (result.length < 4) {
    for (const [key, value] of Object.entries(stats)) {
      if (result.some((r) => r.key === key)) continue;
      if (key.startsWith('_') || key === 'playerId' || key === 'sport' || key === 'sportType' || key === 'player' || key === 'id' || key === '__v') continue;
      if (typeof value === 'number') {
        result.push({ key, value });
      }
      if (result.length >= 6) break;
    }
  }

  return result.slice(0, 6);
}

function StatHighlightCards({ stats, sport }: { stats: Record<string, unknown>; sport?: string }) {
  const highlights = getHighlightStats(stats, sport);

  if (highlights.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      {highlights.map(({ key, value }) => (
        <div
          key={key}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? (value % 1 !== 0 ? value.toFixed(2) : value) : String(value)}
          </p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatsSection({ playerId }: { playerId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['player-stats', playerId],
    queryFn: async () => {
      const res = await getPlayerStats(playerId);
      return (res as unknown as { data: unknown }).data ?? res;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`r${i}`} className="h-12 rounded" />
        ))}
      </div>
    );
  }

  // Stats can be an array of per-sport stat groups, or a single object
  const statsArray: PlayerStatGroup[] = Array.isArray(data)
    ? (data as PlayerStatGroup[])
    : data && typeof data === 'object'
    ? [data as PlayerStatGroup]
    : [];

  if (statsArray.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No statistics yet"
        description="Statistics will appear here as the player participates in matches"
      />
    );
  }

  // If multiple sport groups, show as tabs
  const hasSports = statsArray.length > 1 && statsArray.some((s) => s.sport || s.sportType);

  if (hasSports) {
    return (
      <Tabs defaultValue={statsArray[0].sport || statsArray[0].sportType || '0'}>
        <TabsList>
          {statsArray.map((group, i) => {
            const sportKey = group.sport || group.sportType || String(i);
            const sportName = SPORT_CONFIGS[sportKey]?.name || sportKey;
            return (
              <TabsTrigger key={sportKey} value={sportKey} className="gap-1.5">
                <SportIcon sport={sportKey} size={12} />
                {sportName}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {statsArray.map((group, i) => {
          const sportKey = group.sport || group.sportType || String(i);
          const entries = Object.entries(group).filter(
            ([k]) =>
              k !== 'sport' &&
              k !== 'sportType' &&
              !k.startsWith('_') &&
              k !== 'playerId'
          );
          return (
            <TabsContent key={sportKey} value={sportKey}>
              <StatHighlightCards stats={group as Record<string, unknown>} sport={sportKey} />
              <StatEntries entries={entries} />
            </TabsContent>
          );
        })}
      </Tabs>
    );
  }

  // Single stats group
  const sportKey = statsArray[0].sport || statsArray[0].sportType;
  const entries = Object.entries(statsArray[0]).filter(
    ([k]) =>
      k !== 'sport' &&
      k !== 'sportType' &&
      !k.startsWith('_') &&
      k !== 'playerId' &&
      k !== 'player' &&
      k !== 'id' &&
      k !== '__v'
  );

  return (
    <>
      <StatHighlightCards stats={statsArray[0] as Record<string, unknown>} sport={sportKey as string} />
      <StatEntries entries={entries} />
    </>
  );
}

function StatEntries({ entries }: { entries: [string, unknown][] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        No stats available
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-500 capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {typeof value === 'object'
              ? JSON.stringify(value)
              : String(value ?? '-')}
          </span>
        </div>
      ))}
    </div>
  );
}

function MatchHistorySection({ playerId }: { playerId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['player-matches', playerId],
    queryFn: async () => {
      const res = await getPlayerMatches(playerId);
      return ((res as unknown as { data: Match[] }).data ?? (res as unknown as Match[])) as Match[];
    },
  });

  const matches = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No match history"
        description="Matches will appear here as the player participates"
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {matches.map((match) => (
        <motion.div key={match._id} variants={staggerItem}>
          <LiveMatchCard match={match} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function AchievementsSection({ playerId }: { playerId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['player-matches', playerId],
    queryFn: async () => {
      const res = await getPlayerMatches(playerId);
      return ((res as unknown as { data: Match[] }).data ?? (res as unknown as Match[])) as Match[];
    },
  });

  const matches = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  // Extract MOTM awards from completed matches
  const motmAwards = matches.filter(
    (m) => m.status === 'completed' && m.resultSummary?.motm === playerId
  );
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const wins = completedMatches.filter((m) => {
    if (!m.resultSummary?.winnerId) return false;
    // Check if the player's team won (approximate)
    return true; // Backend would need to provide this
  });

  // Show summary stats
  const achievements = [
    { label: 'Total Matches', value: totalMatches, icon: '🏟️' },
    { label: 'Completed Matches', value: completedMatches.length, icon: '✅' },
    { label: 'Man of the Match', value: motmAwards.length, icon: '🏆' },
  ];

  // Find unique sports
  const sports = [...new Set(matches.map((m) => m.sportType))];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {achievements.map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl block mb-1">{icon}</span>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Sports Played */}
      {sports.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sports Played</h3>
          <div className="flex flex-wrap gap-2">
            {sports.map((sport) => {
              const count = matches.filter((m) => m.sportType === sport).length;
              return (
                <div
                  key={sport}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <SportIcon sport={sport} size={14} />
                  <span className="text-sm text-gray-700">{SPORT_CONFIGS[sport]?.name || sport}</span>
                  <Badge variant="default" size="sm">{count}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MOTM Awards */}
      {motmAwards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-amber-500" />
            Man of the Match Awards
          </h3>
          <div className="space-y-2">
            {motmAwards.map((match) => (
              <Link
                key={match._id}
                href={`/match/${match._id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SportIcon sport={match.sportType} size={14} />
                  <span className="text-sm text-gray-700">
                    {typeof match.teamA?.teamId === 'object' ? match.teamA.teamId.name : match.teamA?.name} vs{' '}
                    {typeof match.teamB?.teamId === 'object' ? match.teamB.teamId.name : match.teamB?.name}
                  </span>
                </div>
                <Badge variant="accent" size="sm">MOTM</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {totalMatches === 0 && (
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          description="Achievements will appear here as the player participates in matches and tournaments"
        />
      )}
    </div>
  );
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const {
    data: playerData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const res = await getPlayer(playerId);
      return ((res as unknown as { data: PlayerData }).data ?? (res as unknown as PlayerData)) as PlayerData;
    },
    enabled: !!playerId,
  });

  const player = playerData as PlayerData | undefined;

  if (isLoading) {
    return <PlayerSkeleton />;
  }

  if (error || !player) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Player not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The player you are looking for does not exist.
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

  const displayName = player.fullName || player.name || 'Unknown Player';
  const preferredSports = player.preferredSports || [];

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Back nav */}
        <motion.div {...fadeIn} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </Link>
        </motion.div>

        {/* Player Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-5">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {displayName}
              </h1>
              {player.bio && (
                <p className="text-sm text-gray-500 mt-1 max-w-md leading-relaxed">
                  {player.bio}
                </p>
              )}
              {preferredSports.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {preferredSports.map((sport) => (
                    <div
                      key={sport}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-2.5 py-1"
                    >
                      <SportIcon sport={sport} size={12} />
                      <span className="text-xs text-gray-600">
                        {SPORT_CONFIGS[sport]?.name || sport}
                      </span>
                    </div>
                  ))}
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
          <Tabs defaultValue="stats">
            <TabsList>
              <TabsTrigger value="stats" className="gap-1.5">
                <BarChart3 size={14} />
                Career Stats
              </TabsTrigger>
              <TabsTrigger value="matches" className="gap-1.5">
                <History size={14} />
                Matches
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-1.5">
                <Trophy size={14} />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <StatsSection playerId={playerId} />
            </TabsContent>

            <TabsContent value="matches">
              <MatchHistorySection playerId={playerId} />
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementsSection playerId={playerId} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
