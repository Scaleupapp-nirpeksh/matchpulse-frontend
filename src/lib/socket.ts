'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.mtchpulse.com';
    socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnection: true,
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinMatchRoom(matchId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:match', matchId);
  }
}

export function leaveMatchRoom(matchId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('leave:match', matchId);
  }
}

export function joinTournamentRoom(tournamentId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:tournament', tournamentId);
  }
}

export function leaveTournamentRoom(tournamentId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('leave:tournament', tournamentId);
  }
}

export function requestClockSync(matchId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('request:clock_sync', matchId);
  }
}

export function emitScorerActive(matchId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('scorer:active', matchId);
  }
}
