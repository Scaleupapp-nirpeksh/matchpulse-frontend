'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, getSocket, joinMatchRoom, leaveMatchRoom, joinTournamentRoom, leaveTournamentRoom } from '@/lib/socket';
import { useSocketStore } from '@/stores/socketStore';

export function useSocket() {
  const { connected, setConnected } = useSocketStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = connectSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('reconnect', () => {
      setConnected(true);
      // Rejoin all active rooms
      const { activeMatchRooms, activeTournamentRooms } = useSocketStore.getState();
      activeMatchRooms.forEach((id) => joinMatchRoom(id));
      activeTournamentRooms.forEach((id) => joinTournamentRoom(id));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect');
    };
  }, [setConnected]);

  return { connected, socket: getSocket() };
}

export function useMatchRoom(matchId: string | undefined) {
  const { addMatchRoom, removeMatchRoom } = useSocketStore();

  useEffect(() => {
    if (!matchId) return;

    const socket = connectSocket();

    if (socket.connected) {
      joinMatchRoom(matchId);
    } else {
      socket.once('connect', () => joinMatchRoom(matchId));
    }

    addMatchRoom(matchId);

    return () => {
      leaveMatchRoom(matchId);
      removeMatchRoom(matchId);
    };
  }, [matchId, addMatchRoom, removeMatchRoom]);
}

export function useTournamentRoom(tournamentId: string | undefined) {
  const { addTournamentRoom, removeTournamentRoom } = useSocketStore();

  useEffect(() => {
    if (!tournamentId) return;

    const socket = connectSocket();

    if (socket.connected) {
      joinTournamentRoom(tournamentId);
    } else {
      socket.once('connect', () => joinTournamentRoom(tournamentId));
    }

    addTournamentRoom(tournamentId);

    return () => {
      leaveTournamentRoom(tournamentId);
      removeTournamentRoom(tournamentId);
    };
  }, [tournamentId, addTournamentRoom, removeTournamentRoom]);
}
