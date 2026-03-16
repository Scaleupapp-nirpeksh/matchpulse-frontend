'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  Shield,
  User,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getTeam } from '@/lib/api/teams';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations';
import type { Team, TeamPlayer } from '@/types/team';

function TeamSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ player, isCaptain }: { player: TeamPlayer; isCaptain: boolean }) {
  return (
    <motion.div variants={staggerItem}>
      <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
        {/* Jersey number */}
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          {player.jerseyNumber !== undefined && player.jerseyNumber !== null ? (
            <span className="text-sm font-bold text-gray-600">
              {player.jerseyNumber}
            </span>
          ) : (
            <Hash size={14} className="text-gray-400" />
          )}
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/player/${player.playerId}`}
              className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors truncate"
            >
              {player.name || 'Unknown Player'}
            </Link>
            {isCaptain && (
              <Badge variant="accent" size="sm">
                Captain
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {player.position && (
              <span className="text-xs text-gray-400">{player.position}</span>
            )}
            {player.role && (
              <span className="text-xs text-gray-400 capitalize">
                {player.role}
              </span>
            )}
          </div>
        </div>

        {/* Playing status */}
        {player.isPlaying !== undefined && (
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              player.isPlaying ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const res = await getTeam(teamId);
      return (res as unknown as { data: Team }).data ?? (res as unknown as Team);
    },
    enabled: !!teamId,
  });

  const team = teamData as Team | undefined;

  if (isLoading) {
    return <TeamSkeleton />;
  }

  if (error || !team) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Team not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The team you are looking for does not exist or has been removed.
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

  const players = team.players || [];
  const captainId = team.captainId;

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Back nav */}
        <motion.div {...fadeIn} className="mb-6">
          <Link
            href={`/tournament/${team.tournamentId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to tournament</span>
          </Link>
        </motion.div>

        {/* Team Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: team.color || '#6B7280' }}
            >
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-12 h-12 object-contain rounded-lg"
                />
              ) : (
                <Shield size={28} className="text-white/80" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {team.shortName && (
                  <span className="text-sm text-gray-400">
                    {team.shortName}
                  </span>
                )}
                {team.groupName && (
                  <Badge variant="default" size="sm">
                    {team.groupName}
                  </Badge>
                )}
                {team.seed && (
                  <span className="text-xs text-gray-400">
                    Seed #{team.seed}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Color swatch */}
          {team.color && (
            <div className="mt-4 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {team.color}
              </span>
            </div>
          )}
        </motion.div>

        {/* Player Roster */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Player Roster
            </h2>
            <span className="text-sm text-gray-400">
              {players.length} player{players.length !== 1 ? 's' : ''}
            </span>
          </div>

          {players.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden"
            >
              {players.map((player) => (
                <PlayerRow
                  key={player.playerId}
                  player={player}
                  isCaptain={player.playerId === captainId}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={Users}
              title="No players registered"
              description="Players will appear here once they are added to the team"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
