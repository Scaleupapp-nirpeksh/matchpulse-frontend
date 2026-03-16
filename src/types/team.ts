export interface Team {
  id: string;
  _id?: string;
  tournamentId: string;
  name: string;
  shortName?: string;
  color?: string;
  logoUrl?: string;
  captainId?: string;
  groupName?: string;
  seed?: number;
  players?: TeamPlayer[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPlayer {
  playerId: string;
  name?: string;
  jerseyNumber?: number;
  position?: string;
  role?: string;
  isPlaying?: boolean;
}
