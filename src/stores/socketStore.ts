'use client';

import { create } from 'zustand';

interface SocketState {
  connected: boolean;
  activeMatchRooms: Set<string>;
  activeTournamentRooms: Set<string>;
  setConnected: (connected: boolean) => void;
  addMatchRoom: (matchId: string) => void;
  removeMatchRoom: (matchId: string) => void;
  addTournamentRoom: (tournamentId: string) => void;
  removeTournamentRoom: (tournamentId: string) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  activeMatchRooms: new Set(),
  activeTournamentRooms: new Set(),
  setConnected: (connected) => set({ connected }),
  addMatchRoom: (matchId) =>
    set((state) => {
      const rooms = new Set(state.activeMatchRooms);
      rooms.add(matchId);
      return { activeMatchRooms: rooms };
    }),
  removeMatchRoom: (matchId) =>
    set((state) => {
      const rooms = new Set(state.activeMatchRooms);
      rooms.delete(matchId);
      return { activeMatchRooms: rooms };
    }),
  addTournamentRoom: (tournamentId) =>
    set((state) => {
      const rooms = new Set(state.activeTournamentRooms);
      rooms.add(tournamentId);
      return { activeTournamentRooms: rooms };
    }),
  removeTournamentRoom: (tournamentId) =>
    set((state) => {
      const rooms = new Set(state.activeTournamentRooms);
      rooms.delete(tournamentId);
      return { activeTournamentRooms: rooms };
    }),
}));
