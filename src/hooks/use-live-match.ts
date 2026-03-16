'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, connectSocket } from '@/lib/socket';
import { useMatchRoom } from './use-socket';
import type { Match } from '@/types/match';
import type { ScoringEvent } from '@/types/scoring';
import type { SportState } from '@/types/sport-states';

interface LiveMatchState {
  currentState: SportState | null;
  status: Match['status'];
  winProbability: { a: number; b: number } | null;
  events: ScoringEvent[];
  commentary: { eventId: string; text: string }[];
  scorerActive: boolean;
  lastUpdate: number;
}

interface ScoreUpdatePayload {
  currentState: SportState;
  event: ScoringEvent;
  winProbability: { teamA: number; teamB: number };
  undone?: boolean;
}

interface LifecyclePayload {
  action: string;
  match: Match;
}

interface CommentaryPayload {
  eventId: string;
  text: string;
}

export function useLiveMatch(matchId: string | undefined, initialMatch?: Match) {
  const [state, setState] = useState<LiveMatchState>({
    currentState: (initialMatch?.currentState as SportState) || null,
    status: initialMatch?.status || 'scheduled',
    winProbability: initialMatch?.winProbability || null,
    events: [],
    commentary: [],
    scorerActive: false,
    lastUpdate: Date.now(),
  });

  const scorerActiveTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Join the match room
  useMatchRoom(matchId);

  // Handle initial match state from server
  useEffect(() => {
    if (!matchId) return;

    const socket = connectSocket();

    const handleMatchState = (payload: { matchId: string; currentState: SportState; status: string; winProbability: { teamA: number; teamB: number } }) => {
      if (payload.matchId === matchId) {
        setState((prev) => ({
          ...prev,
          currentState: payload.currentState,
          status: payload.status as Match['status'],
          winProbability: payload.winProbability ? { a: payload.winProbability.teamA, b: payload.winProbability.teamB } : prev.winProbability,
          lastUpdate: Date.now(),
        }));
      }
    };

    socket.on('match_state', handleMatchState);
    return () => { socket.off('match_state', handleMatchState); };
  }, [matchId]);

  // Handle score updates
  useEffect(() => {
    if (!matchId) return;
    const socket = getSocket();

    const handleScoreUpdate = (payload: ScoreUpdatePayload) => {
      setState((prev) => ({
        ...prev,
        currentState: payload.currentState,
        winProbability: payload.winProbability ? { a: payload.winProbability.teamA, b: payload.winProbability.teamB } : prev.winProbability,
        events: payload.undone
          ? prev.events.map((e) => (e._id === payload.event._id ? { ...e, isUndone: true } : e))
          : [...prev.events, payload.event],
        lastUpdate: Date.now(),
      }));
    };

    socket.on('score_update', handleScoreUpdate);
    return () => { socket.off('score_update', handleScoreUpdate); };
  }, [matchId]);

  // Handle lifecycle events
  useEffect(() => {
    if (!matchId) return;
    const socket = getSocket();

    const handleLifecycle = (payload: LifecyclePayload) => {
      setState((prev) => ({
        ...prev,
        status: payload.match.status,
        currentState: (payload.match.currentState as SportState) || prev.currentState,
        lastUpdate: Date.now(),
      }));
    };

    socket.on('match_lifecycle', handleLifecycle);
    return () => { socket.off('match_lifecycle', handleLifecycle); };
  }, [matchId]);

  // Handle commentary
  useEffect(() => {
    if (!matchId) return;
    const socket = getSocket();

    const handleCommentary = (payload: CommentaryPayload) => {
      setState((prev) => ({
        ...prev,
        commentary: [...prev.commentary.slice(-49), payload],
      }));
    };

    socket.on('commentary', handleCommentary);
    return () => { socket.off('commentary', handleCommentary); };
  }, [matchId]);

  // Handle scorer activity
  useEffect(() => {
    if (!matchId) return;
    const socket = getSocket();

    const handleScorerActive = () => {
      setState((prev) => ({ ...prev, scorerActive: true }));
      if (scorerActiveTimeout.current) clearTimeout(scorerActiveTimeout.current);
      scorerActiveTimeout.current = setTimeout(() => {
        setState((prev) => ({ ...prev, scorerActive: false }));
      }, 10000);
    };

    socket.on('scorer_active', handleScorerActive);
    return () => {
      socket.off('scorer_active', handleScorerActive);
      if (scorerActiveTimeout.current) clearTimeout(scorerActiveTimeout.current);
    };
  }, [matchId]);

  const addEvent = useCallback((event: ScoringEvent) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }));
  }, []);

  return {
    ...state,
    addEvent,
    isLive: state.status === 'live' || state.status === 'paused',
  };
}
