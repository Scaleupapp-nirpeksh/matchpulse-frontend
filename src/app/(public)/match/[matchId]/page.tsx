'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Trophy,
  ChevronLeft,
  Sparkles,
  Activity,
  BarChart3,
  Info,
  MessageSquare,
  Clock,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveIndicator } from '@/components/matches/live-indicator';
import { SportScoreDisplay } from '@/components/matches/sport-displays/sport-score-display';
import { MatchTimeline } from '@/components/matches/match-timeline';
import { CommentaryFeed } from '@/components/matches/commentary-feed';
import { WinProbability } from '@/components/matches/win-probability';
import { SportIcon } from '@/components/matches/sport-icon';
import { useLiveMatch } from '@/hooks/use-live-match';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/hooks/use-auth';
import { getMatch } from '@/lib/api/matches';
import { getMatchEvents, getMatchStats } from '@/lib/api/scoring';
import { getSportConfig } from '@/lib/sports-config';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';
import { fadeIn } from '@/lib/animations';
import type { Match } from '@/types/match';
import type { SportState } from '@/types/sport-states';
import type { ScoringEvent } from '@/types/scoring';

function getTeamName(team: Match['teamA'], short = false): string {
  // Format 1: flat populated (team data at top level)
  if (short && team.shortName) return team.shortName;
  if (!short && team.name) return team.name;
  // Format 2: nested teamId object
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return short ? (team.teamId.shortName || team.teamId.name) : team.teamId.name;
  }
  return team.name || 'TBD';
}

function getTeamColor(team: Match['teamA']): string {
  // Format 1: flat populated
  if (team.color) return team.color;
  // Format 2: nested teamId object
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.color || '#6B7280';
  }
  return '#6B7280';
}

function getTournamentName(tournament: Match['tournamentId']): string {
  if (typeof tournament === 'object' && tournament !== null) {
    return tournament.name;
  }
  return '';
}

function getTournamentId(tournament: Match['tournamentId']): string {
  if (typeof tournament === 'object' && tournament !== null) {
    return tournament._id;
  }
  return tournament;
}

function MatchDetailSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-48 w-full rounded-xl mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

function StatsTab({ matchId }: { matchId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['match-stats', matchId],
    queryFn: async () => {
      const res = await getMatchStats(matchId);
      return res as unknown as Record<string, unknown>;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        No match statistics available yet
      </div>
    );
  }

  // Render stats as key-value pairs
  const stats = (data as Record<string, unknown>).data ?? data;
  const entries = typeof stats === 'object' && stats !== null ? Object.entries(stats as Record<string, unknown>) : [];

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        No match statistics available yet
      </div>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {entries.map(([key, value]) => {
        // Skip internal fields
        if (key.startsWith('_') || key === 'matchId') return null;
        return (
          <div
            key={key}
            className="flex items-center justify-between py-3"
          >
            <span className="text-sm text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MatchInfoTab({ match }: { match: Match }) {
  const tournamentName = getTournamentName(match.tournamentId);
  const tournamentId = getTournamentId(match.tournamentId);
  const sportConfig = getSportConfig(match.sportType);

  return (
    <div className="space-y-6">
      <div className="space-y-0 divide-y divide-gray-100">
        {tournamentName && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Tournament</span>
            <Link
              href={`/tournament/${tournamentId}`}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              {tournamentName}
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-500">Sport</span>
          <div className="flex items-center gap-2">
            <SportIcon sport={match.sportType} size={14} />
            <span className="text-sm font-medium text-gray-900">
              {sportConfig.name}
            </span>
          </div>
        </div>
        {match.stage && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Stage</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {match.stage.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        {match.matchNumber && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Match #</span>
            <span className="text-sm font-medium text-gray-900">
              {match.matchNumber}
            </span>
          </div>
        )}
        {match.venue && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Venue</span>
            <span className="text-sm font-medium text-gray-900">
              {match.venue}
            </span>
          </div>
        )}
        {match.scheduledAt && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Scheduled</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(match.scheduledAt)}
            </span>
          </div>
        )}
        {match.startedAt && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Started</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(match.startedAt)}
            </span>
          </div>
        )}
        {match.completedAt && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Completed</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(match.completedAt)}
            </span>
          </div>
        )}
        {match.toss && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Toss</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {match.toss.decision}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-500">Status</span>
          <Badge
            variant={
              match.status === 'live'
                ? 'live'
                : match.status === 'completed'
                ? 'accent'
                : 'default'
            }
            size="sm"
          >
            {match.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  // Fetch initial match data
  const {
    data: matchData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const res = await getMatch(matchId);
      return (res as unknown as { data: Match }).data ?? (res as unknown as Match);
    },
    enabled: !!matchId,
  });

  const match = matchData as Match | undefined;

  // Push notifications
  const { isAuthenticated } = useAuth();
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: subscribePush } = usePushNotifications();

  // Fetch match events
  const { data: eventsData } = useQuery({
    queryKey: ['match-events', matchId],
    queryFn: async () => {
      const res = await getMatchEvents(matchId);
      return ((res as unknown as { data: ScoringEvent[] }).data ?? (res as unknown as ScoringEvent[])) as ScoringEvent[];
    },
    enabled: !!matchId,
    refetchInterval: match?.status === 'live' ? 10000 : false,
  });

  // Real-time live match data
  const liveState = useLiveMatch(matchId, match);

  if (isLoading) {
    return <MatchDetailSkeleton />;
  }

  if (error || !match) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Match not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The match you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/live"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Browse live matches
          </Link>
        </div>
      </div>
    );
  }

  const isLive = liveState.isLive;
  const currentState = liveState.currentState || (match.currentState as SportState);
  const teamAName = getTeamName(match.teamA);
  const teamBName = getTeamName(match.teamB);
  const teamAShort = getTeamName(match.teamA, true);
  const teamBShort = getTeamName(match.teamB, true);
  const teamAColor = getTeamColor(match.teamA);
  const teamBColor = getTeamColor(match.teamB);
  const tournamentName = getTournamentName(match.tournamentId);
  const tournamentId = getTournamentId(match.tournamentId);
  const sportConfig = getSportConfig(match.sportType);

  // Merge server events with live events
  const serverEvents = (eventsData as ScoringEvent[]) || [];
  const allEvents = [
    ...serverEvents,
    ...liveState.events.filter(
      (le) => !serverEvents.some((se) => (se._id || se.id) === (le._id || le.id))
    ),
  ];

  // Build commentary from event AI commentary + live socket commentary
  const eventCommentary = allEvents
    .filter((e) => e.aiCommentary && !e.isUndone)
    .map((e) => ({ eventId: e._id || e.id || String(e.sequenceNumber), text: e.aiCommentary as string }));
  const allCommentary = [
    ...eventCommentary,
    ...liveState.commentary.filter(
      (lc) => !eventCommentary.some((ec) => ec.eventId === lc.eventId)
    ),
  ];

  const winProbability =
    liveState.winProbability || match.winProbability || null;

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Back nav */}
        <motion.div {...fadeIn} className="mb-6">
          <Link
            href="/live"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to matches</span>
          </Link>
        </motion.div>

        {/* Match header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {tournamentName && (
              <Link
                href={`/tournament/${tournamentId}`}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                {tournamentName}
              </Link>
            )}
            {match.stage && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-sm text-gray-500 capitalize">
                  {match.stage.replace(/_/g, ' ')}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <SportIcon sport={match.sportType} size={16} />
            <span className="text-sm text-gray-500">{sportConfig.name}</span>
            {match.venue && (
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <MapPin size={12} />
                {match.venue}
              </span>
            )}
            {match.scheduledAt && (
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar size={12} />
                {formatDate(match.scheduledAt)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Score Display Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            'bg-white border rounded-2xl p-6 mb-6',
            isLive ? 'border-red-200/60 shadow-sm' : 'border-gray-200'
          )}
        >
          {/* Live/Status indicator row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isLive && <LiveIndicator size="md" />}
              {liveState.status === 'paused' && (
                <Badge variant="warning" size="sm">
                  Paused
                </Badge>
              )}
              {match.status === 'completed' && (
                <Badge variant="accent" size="sm">
                  Completed
                </Badge>
              )}
              {match.status === 'scheduled' && (
                <Badge variant="default" size="sm">
                  <Clock size={10} className="mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
            {liveState.scorerActive && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Scorer active
              </div>
            )}
          </div>

          {/* Score */}
          {currentState ? (
            <SportScoreDisplay
              sportType={match.sportType}
              state={currentState}
              teamAName={teamAName}
              teamBName={teamBName}
            />
          ) : (
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: teamAColor }}
                />
                <span className="text-lg font-semibold text-gray-900">
                  {teamAName}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-400">vs</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  {teamBName}
                </span>
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: teamBColor }}
                />
              </div>
            </div>
          )}

          {/* Result summary */}
          {match.status === 'completed' && match.resultSummary && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm font-medium text-gray-700">
                {match.resultSummary.margin || 'Match completed'}
              </p>
              {match.resultSummary.motm && (
                <p className="text-xs text-gray-400 mt-1">
                  Player of the Match: {match.resultSummary.motm}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Win Probability Bar */}
        {winProbability && isLive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white border border-gray-200 rounded-xl p-4 mb-6"
          >
            <WinProbability
              teamA={winProbability.a}
              teamB={winProbability.b}
              teamAName={teamAShort}
              teamBName={teamBShort}
              teamAColor={teamAColor}
              teamBColor={teamBColor}
            />
          </motion.div>
        )}

        {/* AI Summary */}
        {match.status === 'completed' && match.aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/40 rounded-xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                AI Match Summary
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {match.aiSummary}
            </p>
          </motion.div>
        )}

        {/* Push notification opt-in */}
        {isLive && isAuthenticated && pushSupported && !pushSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bell size={14} className="text-emerald-600" />
              </div>
              <p className="text-sm text-gray-600">
                Get notified when scores update in this match
              </p>
            </div>
            <button
              onClick={() => subscribePush()}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
            >
              Enable alerts
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs defaultValue="events">
            <TabsList>
              <TabsTrigger value="events" className="gap-1.5">
                <Activity size={14} />
                Events
              </TabsTrigger>
              <TabsTrigger value="commentary" className="gap-1.5">
                <MessageSquare size={14} />
                Commentary
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-1.5">
                <BarChart3 size={14} />
                Stats
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-1.5">
                <Info size={14} />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <MatchTimeline
                  events={allEvents}
                  sportType={match.sportType}
                />
              </div>
            </TabsContent>

            <TabsContent value="commentary">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <CommentaryFeed items={allCommentary} />
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <StatsTab matchId={matchId} />
              </div>
            </TabsContent>

            <TabsContent value="info">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <MatchInfoTab match={match} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
