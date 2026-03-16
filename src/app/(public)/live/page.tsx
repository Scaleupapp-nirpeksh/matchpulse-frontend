'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Radio, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import { SportIcon } from '@/components/matches/sport-icon';
import { useSocket } from '@/hooks/use-socket';
import { getLiveMatches } from '@/lib/api/matches';
import { SPORT_LIST } from '@/lib/constants';
import { SPORT_CONFIGS } from '@/lib/sports-config';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';

const SPORT_FILTERS = [
  { key: 'all', label: 'All Sports' },
  ...SPORT_LIST.map((s) => ({
    key: s,
    label: SPORT_CONFIGS[s]?.name || s,
  })),
];

export default function LiveMatchesPage() {
  const [activeSport, setActiveSport] = useState('all');

  // Connect to socket for real-time updates
  useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['live-matches'],
    queryFn: async () => {
      const res = await getLiveMatches();
      return (res as unknown as { data: Match[] }).data ?? (res as unknown as Match[]);
    },
    refetchInterval: 15000,
  });

  const allMatches: Match[] = Array.isArray(data) ? data : [];

  const liveMatches = useMemo(
    () =>
      allMatches.filter(
        (m) => m.status === 'live' || m.status === 'paused'
      ),
    [allMatches]
  );

  const recentlyCompleted = useMemo(() => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return allMatches.filter(
      (m) => m.status === 'completed' && m.completedAt && m.completedAt > dayAgo
    );
  }, [allMatches]);

  const filteredLive = useMemo(
    () =>
      activeSport === 'all'
        ? liveMatches
        : liveMatches.filter((m) => m.sportType === activeSport),
    [liveMatches, activeSport]
  );

  const filteredCompleted = useMemo(
    () =>
      activeSport === 'all'
        ? recentlyCompleted
        : recentlyCompleted.filter((m) => m.sportType === activeSport),
    [recentlyCompleted, activeSport]
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">Live Matches</h1>
            {liveMatches.length > 0 && (
              <Badge variant="live">{liveMatches.length}</Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Real-time scores and updates from matches happening now
          </p>
        </motion.div>

        {/* Sport Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
        >
          {SPORT_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSport(key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                'border cursor-pointer',
                activeSport === key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {key !== 'all' && (
                <SportIcon sport={key} size={14} />
              )}
              {label}
            </button>
          ))}
        </motion.div>

        {/* Live Matches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : filteredLive.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredLive.map((match) => (
              <motion.div key={match._id} variants={staggerItem}>
                <LiveMatchCard match={match} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Radio}
            title="No live matches"
            description={
              activeSport === 'all'
                ? 'There are no live matches right now. Check back soon!'
                : `No live ${SPORT_CONFIGS[activeSport]?.name || activeSport} matches right now`
            }
          />
        )}

        {/* Recently Completed Section */}
        {!isLoading && filteredCompleted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock size={18} className="text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recently Completed
              </h2>
              <span className="text-sm text-gray-400">Last 24 hours</span>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredCompleted.map((match) => (
                <motion.div key={match._id} variants={staggerItem}>
                  <LiveMatchCard match={match} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
