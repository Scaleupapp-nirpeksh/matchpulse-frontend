'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Radio,
  Trophy,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import { SportIcon } from '@/components/matches/sport-icon';
import { getLiveMatches } from '@/lib/api/matches';
import { getTournaments } from '@/lib/api/tournaments';
import { SPORT_CONFIGS } from '@/lib/sports-config';
import { SPORT_LIST } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { Match } from '@/types/match';
import type { Tournament } from '@/types/tournament';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-white" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/60 px-4 py-1.5">
            <Zap size={14} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Real-time scoring for every sport
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Live Sports Scoring,{' '}
            <span className="text-emerald-600">Reimagined</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-500 max-w-2xl">
            Follow matches in real time with ball-by-ball updates, AI commentary,
            and beautiful scorecards. Built for tournaments of every size, from
            local leagues to major competitions.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/live">
              <Button variant="outline" size="lg" className="gap-2">
                <Radio size={16} />
                View Live Matches
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LiveMatchesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['live-matches-home'],
    queryFn: async () => {
      const res = await getLiveMatches();
      return (res as unknown as { data: Match[] }).data ?? (res as unknown as Match[]);
    },
    refetchInterval: 30000,
  });

  const matches = Array.isArray(data) ? data.slice(0, 6) : [];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Live Matches
                </h2>
                {matches.length > 0 && (
                  <Badge variant="live">{matches.length} Live</Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                Happening right now across all sports
              </p>
            </div>
            <Link href="/live">
              <Button variant="ghost" className="gap-1 text-gray-500">
                View all
                <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {matches.map((match) => (
              <motion.div key={match._id} variants={staggerItem}>
                <LiveMatchCard match={match} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Radio}
            title="No live matches right now"
            description="Check back soon or browse upcoming tournaments"
          />
        )}
      </div>
    </section>
  );
}

function TournamentsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['tournaments-home'],
    queryFn: async () => {
      const res = await getTournaments({ status: 'active', limit: 6 });
      return (res as unknown as { data: Tournament[] }).data ?? (res as unknown as Tournament[]);
    },
  });

  const tournaments = Array.isArray(data) ? data.slice(0, 6) : [];

  return (
    <section className="bg-gray-50/60 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Active Tournaments
              </h2>
              <p className="text-gray-500 text-sm">
                Follow the action across ongoing competitions
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {tournaments.map((tournament) => {
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
                          variant={
                            tournament.status === 'active' ? 'accent' : 'default'
                          }
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
                      {(tournament.startDate || tournament.endDate) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={12} />
                          <span>
                            {tournament.startDate &&
                              formatDate(tournament.startDate)}
                            {tournament.endDate &&
                              ` - ${formatDate(tournament.endDate)}`}
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
            title="No active tournaments"
            description="Tournaments will appear here when they are in progress"
          />
        )}
      </div>
    </section>
  );
}

function SportsSection() {
  const sports = SPORT_LIST.map((key) => ({
    key,
    config: SPORT_CONFIGS[key],
  }));

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            9 Sports, One Platform
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            From cricket to squash, MatchPulse supports detailed scoring for
            every sport with sport-specific rules and displays
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4"
        >
          {sports.map(({ key, config }) => (
            <motion.div
              key={key}
              variants={staggerItem}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <SportIcon sport={key} size={24} showBackground />
              <span className="text-xs font-medium text-gray-600 text-center">
                {config.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="bg-gray-50/60 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Ready to score?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Create your organization, set up tournaments, and start scoring
            matches in minutes.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Sign Up Free
              <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <LiveMatchesSection />
      <TournamentsSection />
      <SportsSection />
      <FooterCTA />
    </div>
  );
}
