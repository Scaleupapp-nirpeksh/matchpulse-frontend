export interface CricketBatter {
  playerId: string;
  name?: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
  dismissedBy?: string;
}

export interface CricketBowler {
  playerId: string;
  name?: string;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
}

export interface CricketInnings {
  battingTeamId: string;
  bowlingTeamId: string;
  score: number;
  wickets: number;
  overs: number;
  balls: number;
  ballsInCurrentOver: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    total: number;
  };
  batters: CricketBatter[];
  bowlers: CricketBowler[];
  fallOfWickets: { wicketNumber: number; score: number; playerId: string; overs: number }[];
  partnerships: { runs: number; balls: number; batter1Id: string; batter2Id: string }[];
  lastSixBalls: string[];
  runRate: number;
}

export interface CricketState {
  battingTeam: string;
  bowlingTeam: string;
  innings: CricketInnings[];
  currentInnings: number;
  target?: number;
  currentBatter?: string;
  nonStriker?: string;
  currentBowler?: string;
  freeHitNext: boolean;
  runRate: number;
  requiredRate?: number;
  oversPerInnings: number;
  isComplete: boolean;
  matchResult?: string;
}

export interface FootballEvent {
  type: string;
  playerId?: string;
  teamId: string;
  minute: number;
  half: number;
  detail?: string;
}

export interface FootballCard {
  playerId: string;
  teamId: string;
  type: 'yellow' | 'red';
  minute: number;
  half: number;
}

export interface FootballSubstitution {
  playerInId: string;
  playerOutId: string;
  teamId: string;
  minute: number;
  half: number;
}

export interface FootballState {
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  half: number;
  clockSeconds: number;
  clockRunning: boolean;
  clockStartedAt?: string;
  events: FootballEvent[];
  cards: FootballCard[];
  substitutions: FootballSubstitution[];
  penalties?: { teamAGoals: number; teamBGoals: number; kicks: { teamId: string; playerId: string; scored: boolean }[] };
  isComplete: boolean;
  matchResult?: string;
  halfLength: number;
  extraTime?: { firstHalf: number; secondHalf: number };
  penaltyShootout?: boolean;
  maxSubstitutions: number;
}

export interface Basketball5v5PlayerStats {
  playerId: string;
  name?: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgMade: number;
  fgAttempted: number;
  threePtMade: number;
  threePtAttempted: number;
  ftMade: number;
  ftAttempted: number;
  minutes: number;
}

export interface Basketball5v5State {
  scoreA: number;
  scoreB: number;
  quarter: number;
  clockSeconds: number;
  clockRunning: boolean;
  clockStartedAt?: string;
  teamFoulsA: number;
  teamFoulsB: number;
  timeoutsA: number;
  timeoutsB: number;
  playerStatsA: Basketball5v5PlayerStats[];
  playerStatsB: Basketball5v5PlayerStats[];
  leadChanges: number;
  largestLead: number;
  isOvertime: boolean;
  quarterComplete: boolean;
}

export interface Basketball3x3State {
  scoreA: number;
  scoreB: number;
  clockSeconds: number;
  clockRunning: boolean;
  clockStartedAt?: string;
  targetScore: number;
  teamFoulsA: number;
  teamFoulsB: number;
  isComplete: boolean;
}

export interface VolleyballSet {
  scoreA: number;
  scoreB: number;
  setNumber: number;
  serving: 'A' | 'B';
  isComplete: boolean;
  winnerId?: string;
}

export interface VolleyballState {
  sets: VolleyballSet[];
  currentSet: number;
  setNumber: number;
  serving: 'A' | 'B';
  setsWonA: number;
  setsWonB: number;
  matchComplete: boolean;
}

export interface TennisGame {
  pointsA: number;
  pointsB: number;
  serving: 'A' | 'B';
}

export interface TennisSet {
  gamesA: number;
  gamesB: number;
  tiebreak: boolean;
  tiebreakScoreA?: number;
  tiebreakScoreB?: number;
  isComplete: boolean;
  winnerId?: string;
}

export interface TennisState {
  sets: TennisSet[];
  currentGame: TennisGame;
  serving: 'A' | 'B';
  setsWonA: number;
  setsWonB: number;
  gamesA: number;
  gamesB: number;
  tiebreak: boolean;
  tiebreakScore?: { a: number; b: number };
  matchComplete: boolean;
}

export interface TableTennisSet {
  scoreA: number;
  scoreB: number;
  setNumber: number;
  isComplete: boolean;
  winnerId?: string;
}

export interface TableTennisState {
  sets: TableTennisSet[];
  currentSet: number;
  setNumber: number;
  serving: 'A' | 'B';
  setsWonA: number;
  setsWonB: number;
  bestOf: number;
  matchComplete: boolean;
}

export interface BadmintonSet {
  scoreA: number;
  scoreB: number;
  setNumber: number;
  isComplete: boolean;
  winnerId?: string;
}

export interface BadmintonState {
  sets: BadmintonSet[];
  currentSet: number;
  setNumber: number;
  serving: 'A' | 'B';
  setsWonA: number;
  setsWonB: number;
  bestOf: number;
  capAt: number;
  pointsPerGame: number;
  matchComplete: boolean;
}

export interface SquashSet {
  scoreA: number;
  scoreB: number;
  setNumber: number;
  isComplete: boolean;
  winnerId?: string;
}

export interface SquashState {
  sets: SquashSet[];
  currentSet: number;
  setNumber: number;
  serving: 'A' | 'B';
  setsWonA: number;
  setsWonB: number;
  bestOf: number;
  parScoring: boolean;
  matchComplete: boolean;
}

export type SportState =
  | CricketState
  | FootballState
  | Basketball5v5State
  | Basketball3x3State
  | VolleyballState
  | TennisState
  | TableTennisState
  | BadmintonState
  | SquashState;
