'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Search, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SportIcon } from '@/components/matches/sport-icon';
import { getTournaments } from '@/lib/api/tournaments';
import { SPORT_LIST } from '@/lib/constants';
import { SPORT_CONFIGS } from '@/lib/sports-config';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn, formatDate } from '@/lib/utils';
import type { Tournament } from '@/types/tournament';
import { Button } from '@/components/ui/button';

const SPORT_FILTERS = [
  { key: 'all', label: 'All Sports' },
  ...SPORT_LIST.map((s) => ({
    key: s,
    label: SPORT_CONFIGS[s]?.name || s,
  })),
];

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const statusBadgeVariant = (status: string): 'accent' | 'default' | 'live' => {
  switch (status) {
    case 'active':
      return 'accent';
    case 'upcoming':
      return 'default';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
};

export default function TournamentsPage() {
  const [activeSport, setActiveSport] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tournaments-public', activeSport, activeStatus, page],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 18 };
      if (activeSport !== 'all') params.sportType = activeSport;
      if (activeStatus !== 'all') params.status = activeStatus;
      const res = await getTournaments(params);
      const d = res as unknown as { data: { tournaments: Tournament[]; pagination?: { total: number; pages: number } } };
      if (d?.data?.tournaments) {
        return { tournaments: d.data.tournaments, pagination: d.data.pagination };
      }
      // Fallback: API may return array directly or nested under data
      const arr = (d?.data as unknown as Tournament[]) ?? (res as unknown as Tournament[]);
      return { tournaments: Array.isArray(arr) ? arr : [], pagination: undefined };
    },
  });

  const tournaments = data?.tournaments || [];
  const pagination = data?.pagination;

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tournaments;
    const q = searchQuery.toLowerCase();
    return tournaments.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.sportType?.toLowerCase().includes(q) ||
        t.format?.toLowerCase().includes(q)
    );
  }, [tournaments, searchQuery]);

  // Reset page when filters change
  const handleSportChange = (sport: string) => {
    setActiveSport(sport);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Browse tournaments across all sports and follow the action
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex items-center gap-1 mb-6"
        >
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                activeStatus === key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              {label}
            </button>
          ))}
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
              onClick={() => handleSportChange(key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                'border cursor-pointer',
                activeSport === key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {key !== 'all' && <SportIcon sport={key} size={14} />}
              {label}
            </button>
          ))}
        </motion.div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((tournament) => {
              const id = tournament.id || tournament._id;
              const sportConfig = SPORT_CONFIGS[tournament.sportType];
              return (
                <motion.div key={id} variants={staggerItem}>
                  <Link href={`/tournament/${id}`}>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <SportIcon
                          sport={tournament.sportType}
                          size={20}
                          showBackground
                        />
                        <Badge
                          variant={statusBadgeVariant(tournament.status)}
                          size="sm"
                        >
                          {tournament.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {tournament.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {sportConfig?.name || tournament.sportType}
                        {tournament.format && (
                          <span className="text-gray-400">
                            {' '}
                            &middot; {tournament.format.replace(/_/g, ' ')}
                          </span>
                        )}
                      </p>
                      {tournament.description && (
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {tournament.description}
                        </p>
                      )}
                      {(tournament.startDate || tournament.endDate) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={12} />
                          <span>
                            {tournament.startDate && formatDate(tournament.startDate)}
                            {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No tournaments found"
            description={
              searchQuery
                ? `No tournaments matching "${searchQuery}"`
                : activeStatus !== 'all'
                ? `No ${activeStatus} tournaments${activeSport !== 'all' ? ` for ${SPORT_CONFIGS[activeSport]?.name || activeSport}` : ''}`
                : 'No tournaments available yet. Check back soon!'
            }
          />
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
