export interface ScoringEvent {
  id: string;
  _id?: string;
  matchId: string;
  sportType: string;
  eventType: string;
  eventData: Record<string, unknown>;
  playerId?: string;
  teamId?: string;
  sequenceNumber: number;
  aiCommentary?: string;
  isNotificationWorthy?: boolean;
  isUndone?: boolean;
  undoneBy?: string;
  undoReason?: string;
  stateSnapshot?: unknown;
  createdBy: string;
  createdAt: string;
}
