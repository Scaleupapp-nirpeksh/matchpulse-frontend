'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SportScoreDisplay } from '@/components/matches/sport-displays/sport-score-display';
import { LiveIndicator } from '@/components/matches/live-indicator';
import { SportIcon } from '@/components/matches/sport-icon';
import { getMatch, matchLifecycle } from '@/lib/api/matches';
import { submitEvent, undoEvent, getMatchEvents } from '@/lib/api/scoring';
import { useLiveMatch } from '@/hooks/use-live-match';
import { emitScorerActive } from '@/lib/socket';
import {
  CRICKET_WICKET_TYPES,
  CRICKET_EXTRAS,
  FOOTBALL_CARD_TYPES,
  EVENT_TYPES,
} from '@/lib/constants';
import { getSportConfig } from '@/lib/sports-config';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Match } from '@/types/match';
import type { SportState, CricketState, FootballState, Basketball5v5State, Basketball3x3State, VolleyballState, TennisState, TableTennisState, BadmintonState, SquashState } from '@/types/sport-states';
import type { ScoringEvent } from '@/types/scoring';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Undo2,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';

// ------ Helper to get team name ------
function getTeamName(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.shortName || team.teamId.name;
  }
  return team.name || 'TBD';
}

function getTeamFullName(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.name;
  }
  return team.name || 'TBD';
}

function getTeamId(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId._id;
  }
  return String(team.teamId);
}

function getTeamPlayers(team: Match['teamA']): { _id: string; name: string }[] {
  if (typeof team.teamId === 'object' && team.teamId !== null && team.teamId.players) {
    return team.teamId.players;
  }
  return [];
}

// ====== MAIN COMPONENT ======
export default function LiveScoringPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const queryClient = useQueryClient();

  // Fetch match data
  const { data: matchData, isLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatch(matchId) as unknown as Promise<Match>,
  });

  // Live state from socket
  const liveState = useLiveMatch(matchId, matchData as Match | undefined);

  // Undo dialog
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoReason, setUndoReason] = useState('');

  // Toss dialog (cricket)
  const [tossOpen, setTossOpen] = useState(false);
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  // Scorer activity ping
  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(() => {
      emitScorerActive(matchId);
    }, 5000);
    emitScorerActive(matchId);
    return () => clearInterval(interval);
  }, [matchId]);

  // Fetch events for undo
  const { data: events = [] } = useQuery({
    queryKey: ['match-events', matchId],
    queryFn: () => getMatchEvents(matchId) as unknown as Promise<ScoringEvent[]>,
  });

  // Match lifecycle mutation
  const lifecycleMutation = useMutation({
    mutationFn: (action: string) =>
      matchLifecycle(matchId, {
        action: action as 'start' | 'pause' | 'resume' | 'end' | 'cancel',
        ...(action === 'start' && tossWinner && matchData?.sportType === 'cricket'
          ? { toss: { winnerId: tossWinner, decision: tossDecision } }
          : {}),
      }),
    onSuccess: (_, action) => {
      toast.success(`Match ${action}ed`);
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
    onError: () => toast.error('Failed to update match'),
  });

  // Submit event mutation
  const submitMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => submitEvent(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-events', matchId] });
    },
    onError: () => toast.error('Failed to submit event'),
  });

  // Undo mutation
  const undoMutation = useMutation({
    mutationFn: () => {
      const lastEvent = (events as ScoringEvent[])
        .filter((e) => !e.isUndone)
        .slice(-1)[0];
      if (!lastEvent) throw new Error('No event to undo');
      return undoEvent(matchId, lastEvent._id || lastEvent.id, undoReason || undefined);
    },
    onSuccess: () => {
      toast.success('Event undone');
      setUndoOpen(false);
      setUndoReason('');
      queryClient.invalidateQueries({ queryKey: ['match-events', matchId] });
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
    onError: () => toast.error('Failed to undo event'),
  });

  // Handle start: for cricket show toss dialog first
  const handleStart = () => {
    if (matchData?.sportType === 'cricket') {
      setTossOpen(true);
    } else {
      lifecycleMutation.mutate('start');
    }
  };

  const handleTossConfirm = () => {
    setTossOpen(false);
    lifecycleMutation.mutate('start');
  };

  const handleSubmitEvent = useCallback(
    (eventData: Record<string, unknown>) => {
      submitMutation.mutate(eventData);
    },
    [submitMutation]
  );

  if (isLoading || !matchData) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const match = matchData as Match;
  const currentState = liveState.currentState;
  const matchStatus = liveState.status;
  const isLive = matchStatus === 'live';
  const isPaused = matchStatus === 'paused';
  const isScheduled = matchStatus === 'scheduled';
  const isCompleted = matchStatus === 'completed';
  const teamAName = getTeamName(match.teamA);
  const teamBName = getTeamName(match.teamB);
  const teamAId = getTeamId(match.teamA);
  const teamBId = getTeamId(match.teamB);
  const teamAPlayers = getTeamPlayers(match.teamA);
  const teamBPlayers = getTeamPlayers(match.teamB);
  const allPlayers = [...teamAPlayers, ...teamBPlayers];

  return (
    <div className="space-y-4 p-3">
      {/* Score Header */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SportIcon sport={match.sportType} size={14} />
              <span className="text-xs text-text-secondary font-medium">
                {getSportConfig(match.sportType).name}
              </span>
            </div>
            {isLive && <LiveIndicator size="sm" />}
            {isPaused && <Badge variant="warning" size="sm">Paused</Badge>}
            {isCompleted && <Badge size="sm">Completed</Badge>}
          </div>

          {/* Score Display */}
          {currentState ? (
            <SportScoreDisplay
              sportType={match.sportType}
              state={currentState}
              teamAName={teamAName}
              teamBName={teamBName}
              compact
            />
          ) : (
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold">{getTeamFullName(match.teamA)}</span>
              <span className="text-xs text-text-tertiary">vs</span>
              <span className="text-sm font-semibold">{getTeamFullName(match.teamB)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Controls */}
      <div className="flex gap-2">
        {isScheduled && (
          <Button onClick={handleStart} className="flex-1 min-h-[48px] text-base" loading={lifecycleMutation.isPending}>
            <Play className="mr-2 h-5 w-5" />
            Start Match
          </Button>
        )}
        {isLive && (
          <>
            <Button
              variant="secondary"
              onClick={() => lifecycleMutation.mutate('pause')}
              className="flex-1 min-h-[48px]"
              loading={lifecycleMutation.isPending}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button
              variant="danger"
              onClick={() => lifecycleMutation.mutate('end')}
              className="flex-1 min-h-[48px]"
              loading={lifecycleMutation.isPending}
            >
              <Square className="mr-2 h-4 w-4" />
              End Match
            </Button>
          </>
        )}
        {isPaused && (
          <>
            <Button
              onClick={() => lifecycleMutation.mutate('resume')}
              className="flex-1 min-h-[48px] text-base"
              loading={lifecycleMutation.isPending}
            >
              <Play className="mr-2 h-5 w-5" />
              Resume
            </Button>
            <Button
              variant="danger"
              onClick={() => lifecycleMutation.mutate('end')}
              className="flex-1 min-h-[48px]"
              loading={lifecycleMutation.isPending}
            >
              <Square className="mr-2 h-4 w-4" />
              End Match
            </Button>
          </>
        )}
      </div>

      {/* Sport-Specific Scoring Pad */}
      {(isLive || isPaused) && (
        <>
          {match.sportType === 'cricket' && (
            <CricketScoringPad
              state={currentState as CricketState}
              teamAId={teamAId}
              teamBId={teamBId}
              teamAName={teamAName}
              teamBName={teamBName}
              teamAPlayers={teamAPlayers}
              teamBPlayers={teamBPlayers}
              onSubmit={handleSubmitEvent}
              isPending={submitMutation.isPending}
            />
          )}

          {match.sportType === 'football' && (
            <FootballScoringPad
              state={currentState as FootballState}
              teamAId={teamAId}
              teamBId={teamBId}
              teamAName={teamAName}
              teamBName={teamBName}
              teamAPlayers={teamAPlayers}
              teamBPlayers={teamBPlayers}
              onSubmit={handleSubmitEvent}
              isPending={submitMutation.isPending}
            />
          )}

          {(match.sportType === 'basketball_5v5' || match.sportType === 'basketball_3x3') && (
            <BasketballScoringPad
              sportType={match.sportType}
              state={currentState as Basketball5v5State | Basketball3x3State}
              teamAId={teamAId}
              teamBId={teamBId}
              teamAName={teamAName}
              teamBName={teamBName}
              teamAPlayers={teamAPlayers}
              teamBPlayers={teamBPlayers}
              onSubmit={handleSubmitEvent}
              isPending={submitMutation.isPending}
            />
          )}

          {['volleyball', 'tennis', 'table_tennis', 'badminton', 'squash'].includes(
            match.sportType
          ) && (
            <RallyScoringPad
              sportType={match.sportType}
              state={currentState as VolleyballState | TennisState | TableTennisState | BadmintonState | SquashState}
              teamAId={teamAId}
              teamBId={teamBId}
              teamAName={teamAName}
              teamBName={teamBName}
              onSubmit={handleSubmitEvent}
              isPending={submitMutation.isPending}
            />
          )}

          {/* Undo Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => setUndoOpen(true)}
              className="w-full min-h-[48px] border-dashed"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo Last Event
            </Button>
          </div>
        </>
      )}

      {/* Toss Dialog (Cricket) */}
      <Dialog open={tossOpen} onOpenChange={setTossOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toss</DialogTitle>
            <DialogDescription>Who won the toss?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTossWinner(teamAId)}
                className={cn(
                  'rounded-xl border-2 p-4 text-center transition-all min-h-[56px]',
                  tossWinner === teamAId ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <span className="text-sm font-semibold">{teamAName}</span>
              </button>
              <button
                onClick={() => setTossWinner(teamBId)}
                className={cn(
                  'rounded-xl border-2 p-4 text-center transition-all min-h-[56px]',
                  tossWinner === teamBId ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <span className="text-sm font-semibold">{teamBName}</span>
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Chose to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTossDecision('bat')}
                  className={cn(
                    'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
                    tossDecision === 'bat' ? 'border-accent bg-accent/5' : 'border-border'
                  )}
                >
                  <span className="text-sm font-medium">Bat</span>
                </button>
                <button
                  onClick={() => setTossDecision('bowl')}
                  className={cn(
                    'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
                    tossDecision === 'bowl' ? 'border-accent bg-accent/5' : 'border-border'
                  )}
                >
                  <span className="text-sm font-medium">Bowl</span>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTossOpen(false)}>Cancel</Button>
            <Button onClick={handleTossConfirm} disabled={!tossWinner} loading={lifecycleMutation.isPending}>
              Start Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Dialog */}
      <Dialog open={undoOpen} onOpenChange={setUndoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo Last Event</DialogTitle>
            <DialogDescription>
              This will reverse the most recent scoring event. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Input
            label="Reason (optional)"
            value={undoReason}
            onChange={(e) => setUndoReason(e.target.value)}
            placeholder="e.g. Scoring error, wrong player"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setUndoOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => undoMutation.mutate()} loading={undoMutation.isPending}>
              <Undo2 className="mr-2 h-4 w-4" />
              Confirm Undo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ====== CRICKET SCORING PAD ======
interface CricketScoringPadProps {
  state: CricketState | null;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAPlayers: { _id: string; name: string }[];
  teamBPlayers: { _id: string; name: string }[];
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}

function CricketScoringPad({
  state,
  teamAId,
  teamBId,
  teamAName,
  teamBName,
  teamAPlayers,
  teamBPlayers,
  onSubmit,
  isPending,
}: CricketScoringPadProps) {
  const [wicketOpen, setWicketOpen] = useState(false);
  const [wicketType, setWicketType] = useState('bowled');
  const [wicketFielder, setWicketFielder] = useState('');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [extrasType, setExtrasType] = useState('');
  const [extrasRuns, setExtrasRuns] = useState(0);

  const currentInnings = state?.innings?.[state.currentInnings - 1];
  const lastSixBalls = currentInnings?.lastSixBalls ?? [];
  const battingTeamId = state?.battingTeam ?? teamAId;
  const bowlingTeamId = state?.bowlingTeam ?? teamBId;

  const handleRun = (runs: number) => {
    onSubmit({
      eventType: EVENT_TYPES.BALL,
      eventData: { runs, extras: null, isWicket: false },
      teamId: battingTeamId,
      playerId: state?.currentBatter,
    });
  };

  const handleWicket = () => {
    onSubmit({
      eventType: EVENT_TYPES.BALL,
      eventData: {
        runs: 0,
        isWicket: true,
        wicketType,
        fielderId: wicketFielder || undefined,
      },
      teamId: battingTeamId,
      playerId: state?.currentBatter,
    });
    setWicketOpen(false);
    setWicketType('bowled');
    setWicketFielder('');
  };

  const handleExtras = () => {
    onSubmit({
      eventType: EVENT_TYPES.BALL,
      eventData: {
        runs: extrasRuns,
        extras: extrasType,
        isWicket: false,
      },
      teamId: battingTeamId,
    });
    setExtrasOpen(false);
    setExtrasType('');
    setExtrasRuns(0);
  };

  const handleOverComplete = () => {
    onSubmit({ eventType: EVENT_TYPES.OVER_COMPLETE, eventData: {} });
  };

  const bowlingTeamPlayers = battingTeamId === teamAId ? teamBPlayers : teamAPlayers;

  return (
    <div className="space-y-3">
      {/* Current Over Display */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary">This Over</span>
            <span className="text-xs text-text-tertiary">
              {currentInnings?.overs ?? 0}.{currentInnings?.ballsInCurrentOver ?? 0} overs
            </span>
          </div>
          <div className="flex gap-1.5">
            {lastSixBalls.map((ball, i) => (
              <div
                key={i}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                  ball === 'W' ? 'bg-danger/10 text-danger border border-danger/20' :
                  ball === '4' || ball === '6' ? 'bg-accent/10 text-accent border border-accent/20' :
                  ball === '0' ? 'bg-surface text-text-tertiary border border-border' :
                  'bg-blue-50 text-blue-600 border border-blue-200'
                )}
              >
                {ball}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 6 - lastSixBalls.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Run Buttons - Large touch targets */}
      <div className="grid grid-cols-6 gap-2">
        {[0, 1, 2, 3, 4, 6].map((runs) => (
          <button
            key={runs}
            onClick={() => handleRun(runs)}
            disabled={isPending}
            className={cn(
              'flex h-16 items-center justify-center rounded-xl text-xl font-bold transition-all active:scale-95',
              runs === 4 ? 'bg-blue-500 text-white' :
              runs === 6 ? 'bg-accent text-white' :
              runs === 0 ? 'bg-surface border border-border text-text-secondary' :
              'bg-white border-2 border-border text-text-primary hover:border-accent'
            )}
          >
            {runs}
          </button>
        ))}
      </div>

      {/* Extras Row */}
      <div className="grid grid-cols-4 gap-2">
        {(['wide', 'no_ball', 'bye', 'leg_bye'] as const).map((extra) => (
          <button
            key={extra}
            onClick={() => {
              setExtrasType(extra);
              setExtrasRuns(extra === 'wide' || extra === 'no_ball' ? 1 : 0);
              setExtrasOpen(true);
            }}
            className="flex h-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700 transition-all active:scale-95"
          >
            {extra.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Wicket + Over Complete */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setWicketOpen(true)}
          className="flex h-14 items-center justify-center rounded-xl bg-danger text-white font-semibold text-sm transition-all active:scale-95"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Wicket
        </button>
        <button
          onClick={handleOverComplete}
          disabled={isPending}
          className="flex h-14 items-center justify-center rounded-xl bg-surface border border-border text-text-primary font-medium text-sm transition-all active:scale-95"
        >
          Over Complete
        </button>
      </div>

      {/* Wicket Dialog */}
      <Dialog open={wicketOpen} onOpenChange={setWicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wicket</DialogTitle>
            <DialogDescription>Select the type of dismissal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {CRICKET_WICKET_TYPES.slice(0, 6).map((type) => (
                <button
                  key={type}
                  onClick={() => setWicketType(type)}
                  className={cn(
                    'rounded-lg border-2 p-3 text-sm font-medium capitalize transition-all min-h-[48px]',
                    wicketType === type
                      ? 'border-danger bg-danger/5 text-danger'
                      : 'border-border text-text-primary'
                  )}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {['caught', 'run_out', 'stumped'].includes(wicketType) && (
              <Select
                label="Fielder (optional)"
                value={wicketFielder}
                onChange={(e) => setWicketFielder(e.target.value)}
                placeholder="Select fielder"
                options={bowlingTeamPlayers.map((p) => ({
                  value: p._id,
                  label: p.name,
                }))}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWicketOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleWicket} loading={isPending}>
              Confirm Wicket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extras Dialog */}
      <Dialog open={extrasOpen} onOpenChange={setExtrasOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{extrasType?.replace('_', ' ')}</DialogTitle>
            <DialogDescription>How many additional runs?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4].map((runs) => (
              <button
                key={runs}
                onClick={() => setExtrasRuns(runs)}
                className={cn(
                  'flex h-14 items-center justify-center rounded-xl text-lg font-bold border-2 transition-all min-h-[56px]',
                  extrasRuns === runs
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-border text-text-primary'
                )}
              >
                +{runs}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtrasOpen(false)}>Cancel</Button>
            <Button onClick={handleExtras} loading={isPending}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ====== FOOTBALL SCORING PAD ======
interface FootballScoringPadProps {
  state: FootballState | null;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAPlayers: { _id: string; name: string }[];
  teamBPlayers: { _id: string; name: string }[];
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}

function FootballScoringPad({
  state,
  teamAId,
  teamBId,
  teamAName,
  teamBName,
  teamAPlayers,
  teamBPlayers,
  onSubmit,
  isPending,
}: FootballScoringPadProps) {
  const [goalOpen, setGoalOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedAssister, setSelectedAssister] = useState('');
  const [minute, setMinute] = useState('');
  const [cardType, setCardType] = useState<'yellow' | 'red'>('yellow');
  const [playerOut, setPlayerOut] = useState('');
  const [playerIn, setPlayerIn] = useState('');

  const getPlayersForTeam = (teamId: string) =>
    teamId === teamAId ? teamAPlayers : teamBPlayers;

  const resetForm = () => {
    setSelectedTeam('');
    setSelectedPlayer('');
    setSelectedAssister('');
    setMinute('');
    setPlayerOut('');
    setPlayerIn('');
  };

  const handleGoal = () => {
    onSubmit({
      eventType: EVENT_TYPES.GOAL,
      eventData: {
        minute: minute ? Number(minute) : undefined,
        assisterId: selectedAssister || undefined,
      },
      teamId: selectedTeam,
      playerId: selectedPlayer || undefined,
    });
    setGoalOpen(false);
    resetForm();
  };

  const handleCard = () => {
    onSubmit({
      eventType: EVENT_TYPES.CARD,
      eventData: {
        cardType,
        minute: minute ? Number(minute) : undefined,
      },
      teamId: selectedTeam,
      playerId: selectedPlayer || undefined,
    });
    setCardOpen(false);
    resetForm();
  };

  const handleSub = () => {
    onSubmit({
      eventType: EVENT_TYPES.SUBSTITUTION,
      eventData: {
        playerOutId: playerOut,
        playerInId: playerIn,
        minute: minute ? Number(minute) : undefined,
      },
      teamId: selectedTeam,
    });
    setSubOpen(false);
    resetForm();
  };

  // Team selector component
  const TeamSelector = () => (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => setSelectedTeam(teamAId)}
        className={cn(
          'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
          selectedTeam === teamAId ? 'border-accent bg-accent/5' : 'border-border'
        )}
      >
        <span className="text-sm font-semibold">{teamAName}</span>
      </button>
      <button
        onClick={() => setSelectedTeam(teamBId)}
        className={cn(
          'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
          selectedTeam === teamBId ? 'border-accent bg-accent/5' : 'border-border'
        )}
      >
        <span className="text-sm font-semibold">{teamBName}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Score Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-text-secondary">{teamAName}</p>
              <p className="text-4xl font-bold text-text-primary">{state?.scoreA ?? 0}</p>
            </div>
            <span className="text-lg text-text-tertiary">-</span>
            <div className="text-center">
              <p className="text-xs text-text-secondary">{teamBName}</p>
              <p className="text-4xl font-bold text-text-primary">{state?.scoreB ?? 0}</p>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-text-tertiary">
            Half {state?.half ?? 1}
          </p>
        </CardContent>
      </Card>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { resetForm(); setGoalOpen(true); }}
          className="flex h-20 flex-col items-center justify-center rounded-xl bg-accent text-white font-semibold transition-all active:scale-95"
        >
          <span className="text-2xl">&#9917;</span>
          <span className="text-sm">Goal</span>
        </button>
        <button
          onClick={() => { resetForm(); setCardOpen(true); }}
          className="flex h-20 flex-col items-center justify-center rounded-xl bg-amber-500 text-white font-semibold transition-all active:scale-95"
        >
          <span className="text-2xl">&#128993;</span>
          <span className="text-sm">Card</span>
        </button>
        <button
          onClick={() => { resetForm(); setSubOpen(true); }}
          className="flex h-20 flex-col items-center justify-center rounded-xl bg-blue-500 text-white font-semibold transition-all active:scale-95"
        >
          <span className="text-2xl">&#128260;</span>
          <span className="text-sm">Sub</span>
        </button>
      </div>

      {/* Half Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="min-h-[48px]"
          onClick={() => onSubmit({ eventType: EVENT_TYPES.PERIOD_START, eventData: { half: (state?.half ?? 0) + 1 } })}
        >
          Start Half {(state?.half ?? 0) + 1}
        </Button>
        <Button
          variant="outline"
          className="min-h-[48px]"
          onClick={() => onSubmit({ eventType: EVENT_TYPES.PERIOD_END, eventData: { half: state?.half ?? 1 } })}
        >
          End Half {state?.half ?? 1}
        </Button>
      </div>

      {/* Goal Dialog */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <TeamSelector />
            {selectedTeam && (
              <>
                <Select
                  label="Scorer"
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  placeholder="Select player"
                  options={getPlayersForTeam(selectedTeam).map((p) => ({ value: p._id, label: p.name }))}
                />
                <Select
                  label="Assist (optional)"
                  value={selectedAssister}
                  onChange={(e) => setSelectedAssister(e.target.value)}
                  placeholder="Select assister"
                  options={[
                    { value: '', label: 'None' },
                    ...getPlayersForTeam(selectedTeam).map((p) => ({ value: p._id, label: p.name })),
                  ]}
                />
                <Input
                  label="Minute"
                  type="number"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="e.g. 45"
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalOpen(false)}>Cancel</Button>
            <Button onClick={handleGoal} disabled={!selectedTeam} loading={isPending}>Confirm Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Dialog */}
      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <TeamSelector />
            {selectedTeam && (
              <>
                <Select
                  label="Player"
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  placeholder="Select player"
                  options={getPlayersForTeam(selectedTeam).map((p) => ({ value: p._id, label: p.name }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCardType('yellow')}
                    className={cn(
                      'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
                      cardType === 'yellow' ? 'border-amber-500 bg-amber-50' : 'border-border'
                    )}
                  >
                    <span className="text-sm font-medium">Yellow</span>
                  </button>
                  <button
                    onClick={() => setCardType('red')}
                    className={cn(
                      'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
                      cardType === 'red' ? 'border-danger bg-danger/5' : 'border-border'
                    )}
                  >
                    <span className="text-sm font-medium">Red</span>
                  </button>
                </div>
                <Input
                  label="Minute"
                  type="number"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="e.g. 30"
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardOpen(false)}>Cancel</Button>
            <Button onClick={handleCard} disabled={!selectedTeam} loading={isPending}>Confirm Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substitution Dialog */}
      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Substitution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <TeamSelector />
            {selectedTeam && (
              <>
                <Select
                  label="Player Out"
                  value={playerOut}
                  onChange={(e) => setPlayerOut(e.target.value)}
                  placeholder="Select player going off"
                  options={getPlayersForTeam(selectedTeam).map((p) => ({ value: p._id, label: p.name }))}
                />
                <Select
                  label="Player In"
                  value={playerIn}
                  onChange={(e) => setPlayerIn(e.target.value)}
                  placeholder="Select player coming on"
                  options={getPlayersForTeam(selectedTeam).map((p) => ({ value: p._id, label: p.name }))}
                />
                <Input
                  label="Minute"
                  type="number"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="e.g. 60"
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubOpen(false)}>Cancel</Button>
            <Button onClick={handleSub} disabled={!selectedTeam || !playerOut || !playerIn} loading={isPending}>
              Confirm Sub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ====== BASKETBALL SCORING PAD ======
interface BasketballScoringPadProps {
  sportType: string;
  state: Basketball5v5State | Basketball3x3State | null;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAPlayers: { _id: string; name: string }[];
  teamBPlayers: { _id: string; name: string }[];
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}

function BasketballScoringPad({
  sportType,
  state,
  teamAId,
  teamBId,
  teamAName,
  teamBName,
  teamAPlayers,
  teamBPlayers,
  onSubmit,
  isPending,
}: BasketballScoringPadProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [foulOpen, setFoulOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const is3x3 = sportType === 'basketball_3x3';

  const scoreA = (state as Basketball5v5State)?.scoreA ?? (state as Basketball3x3State)?.scoreA ?? 0;
  const scoreB = (state as Basketball5v5State)?.scoreB ?? (state as Basketball3x3State)?.scoreB ?? 0;

  const getPlayersForTeam = (teamId: string) =>
    teamId === teamAId ? teamAPlayers : teamBPlayers;

  const handleShot = (teamId: string, shotType: string, made: boolean) => {
    onSubmit({
      eventType: made ? EVENT_TYPES.SHOT_MADE : EVENT_TYPES.SHOT_MISSED,
      eventData: { shotType },
      teamId,
    });
  };

  const handleFoul = () => {
    if (!selectedTeam) return;
    onSubmit({
      eventType: EVENT_TYPES.FOUL,
      eventData: {},
      teamId: selectedTeam,
      playerId: selectedPlayer || undefined,
    });
    setFoulOpen(false);
    setSelectedTeam('');
    setSelectedPlayer('');
  };

  const handleTimeout = (teamId: string) => {
    onSubmit({
      eventType: EVENT_TYPES.TIMEOUT,
      eventData: {},
      teamId,
    });
  };

  const shotButtons = is3x3
    ? [
        { label: '1PT', type: '1pt' },
        { label: '2PT', type: '2pt' },
      ]
    : [
        { label: '2PT', type: '2pt' },
        { label: '3PT', type: '3pt' },
        { label: 'FT', type: 'ft' },
      ];

  return (
    <div className="space-y-3">
      {/* Score Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-text-secondary">{teamAName}</p>
              <p className="text-4xl font-bold text-text-primary">{scoreA}</p>
            </div>
            <span className="text-lg text-text-tertiary">-</span>
            <div className="text-center">
              <p className="text-xs text-text-secondary">{teamBName}</p>
              <p className="text-4xl font-bold text-text-primary">{scoreB}</p>
            </div>
          </div>
          {!is3x3 && (
            <p className="mt-2 text-center text-xs text-text-tertiary">
              Q{(state as Basketball5v5State)?.quarter ?? 1}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Shot Buttons for Team A */}
      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">{teamAName}</p>
        <div className="grid grid-cols-2 gap-2">
          {shotButtons.map((shot) => (
            <div key={`a-${shot.type}`} className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleShot(teamAId, shot.type, true)}
                disabled={isPending}
                className="flex h-14 flex-col items-center justify-center rounded-xl bg-accent text-white font-semibold text-sm transition-all active:scale-95"
              >
                <span className="text-xs opacity-70">{shot.label}</span>
                <span>Made</span>
              </button>
              <button
                onClick={() => handleShot(teamAId, shot.type, false)}
                disabled={isPending}
                className="flex h-14 flex-col items-center justify-center rounded-xl bg-surface border border-border text-text-secondary font-medium text-sm transition-all active:scale-95"
              >
                <span className="text-xs opacity-70">{shot.label}</span>
                <span>Miss</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shot Buttons for Team B */}
      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">{teamBName}</p>
        <div className="grid grid-cols-2 gap-2">
          {shotButtons.map((shot) => (
            <div key={`b-${shot.type}`} className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleShot(teamBId, shot.type, true)}
                disabled={isPending}
                className="flex h-14 flex-col items-center justify-center rounded-xl bg-blue-500 text-white font-semibold text-sm transition-all active:scale-95"
              >
                <span className="text-xs opacity-70">{shot.label}</span>
                <span>Made</span>
              </button>
              <button
                onClick={() => handleShot(teamBId, shot.type, false)}
                disabled={isPending}
                className="flex h-14 flex-col items-center justify-center rounded-xl bg-surface border border-border text-text-secondary font-medium text-sm transition-all active:scale-95"
              >
                <span className="text-xs opacity-70">{shot.label}</span>
                <span>Miss</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Foul + Timeout + Quarter */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setFoulOpen(true)}
          className="flex h-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-medium text-sm transition-all active:scale-95"
        >
          Foul
        </button>
        <button
          onClick={() => handleTimeout(teamAId)}
          disabled={isPending}
          className="flex h-12 items-center justify-center rounded-xl bg-surface border border-border text-text-primary font-medium text-sm transition-all active:scale-95"
        >
          TO {teamAName}
        </button>
        <button
          onClick={() => handleTimeout(teamBId)}
          disabled={isPending}
          className="flex h-12 items-center justify-center rounded-xl bg-surface border border-border text-text-primary font-medium text-sm transition-all active:scale-95"
        >
          TO {teamBName}
        </button>
      </div>

      {/* Quarter/Period Controls */}
      {!is3x3 && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="min-h-[48px]"
            onClick={() =>
              onSubmit({
                eventType: EVENT_TYPES.QUARTER_START,
                eventData: { quarter: ((state as Basketball5v5State)?.quarter ?? 0) + 1 },
              })
            }
          >
            Start Q{((state as Basketball5v5State)?.quarter ?? 0) + 1}
          </Button>
          <Button
            variant="outline"
            className="min-h-[48px]"
            onClick={() =>
              onSubmit({
                eventType: EVENT_TYPES.QUARTER_END,
                eventData: { quarter: (state as Basketball5v5State)?.quarter ?? 1 },
              })
            }
          >
            End Q{(state as Basketball5v5State)?.quarter ?? 1}
          </Button>
        </div>
      )}

      {/* Foul Dialog */}
      <Dialog open={foulOpen} onOpenChange={setFoulOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Foul</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedTeam(teamAId)}
                className={cn(
                  'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
                  selectedTeam === teamAId ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                {teamAName}
              </button>
              <button
                onClick={() => setSelectedTeam(teamBId)}
                className={cn(
                  'rounded-xl border-2 p-3 text-center transition-all min-h-[48px]',
                  selectedTeam === teamBId ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                {teamBName}
              </button>
            </div>
            {selectedTeam && (
              <Select
                label="Player (optional)"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                placeholder="Select player"
                options={[
                  { value: '', label: 'Unknown' },
                  ...getPlayersForTeam(selectedTeam).map((p) => ({ value: p._id, label: p.name })),
                ]}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFoulOpen(false)}>Cancel</Button>
            <Button onClick={handleFoul} disabled={!selectedTeam} loading={isPending}>
              Confirm Foul
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ====== RALLY SPORTS SCORING PAD ======
// Volleyball, Tennis, Table Tennis, Badminton, Squash
interface RallyScoringPadProps {
  sportType: string;
  state: VolleyballState | TennisState | TableTennisState | BadmintonState | SquashState | null;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}

function RallyScoringPad({
  sportType,
  state,
  teamAId,
  teamBId,
  teamAName,
  teamBName,
  onSubmit,
  isPending,
}: RallyScoringPadProps) {
  // Get current scores based on sport type
  let currentScoreA = 0;
  let currentScoreB = 0;
  let setsWonA = 0;
  let setsWonB = 0;
  let currentSetNumber = 1;
  let serving: 'A' | 'B' = 'A';

  if (sportType === 'volleyball') {
    const vs = state as VolleyballState;
    const currentSet = vs?.sets?.[vs.currentSet - 1];
    currentScoreA = currentSet?.scoreA ?? 0;
    currentScoreB = currentSet?.scoreB ?? 0;
    setsWonA = vs?.setsWonA ?? 0;
    setsWonB = vs?.setsWonB ?? 0;
    currentSetNumber = vs?.setNumber ?? 1;
    serving = vs?.serving ?? 'A';
  } else if (sportType === 'tennis') {
    const ts = state as TennisState;
    currentScoreA = ts?.currentGame?.pointsA ?? 0;
    currentScoreB = ts?.currentGame?.pointsB ?? 0;
    setsWonA = ts?.setsWonA ?? 0;
    setsWonB = ts?.setsWonB ?? 0;
    currentSetNumber = (ts?.sets?.length ?? 0) + 1;
    serving = ts?.serving ?? 'A';
  } else if (sportType === 'table_tennis') {
    const tt = state as TableTennisState;
    const currentSet = tt?.sets?.[tt.currentSet - 1];
    currentScoreA = currentSet?.scoreA ?? 0;
    currentScoreB = currentSet?.scoreB ?? 0;
    setsWonA = tt?.setsWonA ?? 0;
    setsWonB = tt?.setsWonB ?? 0;
    currentSetNumber = tt?.setNumber ?? 1;
    serving = tt?.serving ?? 'A';
  } else if (sportType === 'badminton') {
    const bd = state as BadmintonState;
    const currentSet = bd?.sets?.[bd.currentSet - 1];
    currentScoreA = currentSet?.scoreA ?? 0;
    currentScoreB = currentSet?.scoreB ?? 0;
    setsWonA = bd?.setsWonA ?? 0;
    setsWonB = bd?.setsWonB ?? 0;
    currentSetNumber = bd?.setNumber ?? 1;
    serving = bd?.serving ?? 'A';
  } else if (sportType === 'squash') {
    const sq = state as SquashState;
    const currentSet = sq?.sets?.[sq.currentSet - 1];
    currentScoreA = currentSet?.scoreA ?? 0;
    currentScoreB = currentSet?.scoreB ?? 0;
    setsWonA = sq?.setsWonA ?? 0;
    setsWonB = sq?.setsWonB ?? 0;
    currentSetNumber = sq?.setNumber ?? 1;
    serving = sq?.serving ?? 'A';
  }

  const handlePoint = (teamId: string) => {
    const eventType = sportType === 'tennis' ? EVENT_TYPES.POINT : EVENT_TYPES.RALLY_POINT;
    onSubmit({
      eventType,
      eventData: { side: teamId === teamAId ? 'A' : 'B' },
      teamId,
    });
  };

  // Tennis-specific extras
  const handleTennisExtra = (type: string, teamId: string) => {
    onSubmit({
      eventType: EVENT_TYPES.POINT,
      eventData: { side: teamId === teamAId ? 'A' : 'B', detail: type },
      teamId,
    });
  };

  // Volleyball-specific extras
  const handleVolleyballExtra = (type: string, teamId: string) => {
    onSubmit({
      eventType: EVENT_TYPES.RALLY_POINT,
      eventData: { side: teamId === teamAId ? 'A' : 'B', detail: type },
      teamId,
    });
  };

  const sportConfig = getSportConfig(sportType);
  const setLabel = sportConfig.periodLabel || 'Set';

  return (
    <div className="space-y-3">
      {/* Set Score */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-center">
              <p className="text-xs text-text-secondary">{teamAName}</p>
              <p className="text-lg font-bold text-text-primary">{setsWonA}</p>
            </div>
            <span className="text-xs text-text-tertiary">{setLabel}s</span>
            <div className="text-center">
              <p className="text-xs text-text-secondary">{teamBName}</p>
              <p className="text-lg font-bold text-text-primary">{setsWonB}</p>
            </div>
          </div>
          <Separator />
          {/* Current Set/Game Score */}
          <div className="flex items-center justify-center gap-8 pt-2">
            <div className="text-center">
              <p className="text-4xl font-bold text-text-primary">{currentScoreA}</p>
              {serving === 'A' && (
                <div className="mt-1 mx-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">{setLabel} {currentSetNumber}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-text-primary">{currentScoreB}</p>
              {serving === 'B' && (
                <div className="mt-1 mx-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two LARGE Point Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handlePoint(teamAId)}
          disabled={isPending}
          className="flex h-24 flex-col items-center justify-center rounded-2xl bg-accent text-white font-bold text-lg transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm font-normal opacity-80">{teamAName}</span>
          <span className="text-xl">Point</span>
        </button>
        <button
          onClick={() => handlePoint(teamBId)}
          disabled={isPending}
          className="flex h-24 flex-col items-center justify-center rounded-2xl bg-blue-500 text-white font-bold text-lg transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm font-normal opacity-80">{teamBName}</span>
          <span className="text-xl">Point</span>
        </button>
      </div>

      {/* Sport-specific extras */}
      {sportType === 'tennis' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-secondary">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Ace', detail: 'ace' },
              { label: 'Double Fault', detail: 'double_fault' },
              { label: 'Winner', detail: 'winner' },
              { label: 'Unforced Error', detail: 'unforced_error' },
            ].map((action) => (
              <div key={action.detail} className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleTennisExtra(action.detail, teamAId)}
                  disabled={isPending}
                  className="flex h-10 items-center justify-center rounded-lg bg-surface border border-border text-xs font-medium text-text-primary transition-all active:scale-95"
                >
                  {teamAName} {action.label}
                </button>
                <button
                  onClick={() => handleTennisExtra(action.detail, teamBId)}
                  disabled={isPending}
                  className="flex h-10 items-center justify-center rounded-lg bg-surface border border-border text-xs font-medium text-text-primary transition-all active:scale-95"
                >
                  {teamBName} {action.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sportType === 'volleyball' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-secondary">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Kill', detail: 'kill' },
              { label: 'Block', detail: 'block_point' },
              { label: 'Ace', detail: 'ace' },
              { label: 'Svc Error', detail: 'service_error' },
            ].map((action) => (
              <div key={action.detail} className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleVolleyballExtra(action.detail, teamAId)}
                  disabled={isPending}
                  className="flex h-10 items-center justify-center rounded-lg bg-surface border border-border text-xs font-medium text-text-primary transition-all active:scale-95"
                >
                  {teamAName}
                </button>
                <button
                  onClick={() => handleVolleyballExtra(action.detail, teamBId)}
                  disabled={isPending}
                  className="flex h-10 items-center justify-center rounded-lg bg-surface border border-border text-xs font-medium text-text-primary transition-all active:scale-95"
                >
                  {teamBName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
