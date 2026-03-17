export const SPORTS = {
  CRICKET: 'cricket',
  FOOTBALL: 'football',
  BASKETBALL_5V5: 'basketball_5v5',
  BASKETBALL_3X3: 'basketball_3x3',
  VOLLEYBALL: 'volleyball',
  TENNIS: 'tennis',
  TABLE_TENNIS: 'table_tennis',
  BADMINTON: 'badminton',
  SQUASH: 'squash',
} as const;

export const SPORT_LIST = [
  SPORTS.CRICKET,
  SPORTS.FOOTBALL,
  SPORTS.BASKETBALL_5V5,
  SPORTS.BASKETBALL_3X3,
  SPORTS.VOLLEYBALL,
  SPORTS.TENNIS,
  SPORTS.TABLE_TENNIS,
  SPORTS.BADMINTON,
  SPORTS.SQUASH,
] as const;

export const TOURNAMENT_FORMATS = {
  ROUND_ROBIN: 'round_robin',
  KNOCKOUT: 'knockout',
  GROUPS_KNOCKOUT: 'groups_knockout',
  SWISS: 'swiss',
} as const;

export const TOURNAMENT_STATUS = {
  DRAFT: 'draft',
  REGISTRATION: 'registration',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const;

export const USER_ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  ORG_ADMIN: 'org_admin',
  TOURNAMENT_ADMIN: 'tournament_admin',
  SCORER: 'scorer',
  PLAYER: 'player',
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  platform_admin: 5,
  org_admin: 4,
  tournament_admin: 3,
  scorer: 2,
  player: 1,
};

export const DEFAULT_RULES: Record<string, Record<string, unknown>> = {
  cricket: {
    // Gameplay
    oversPerInnings: 15,
    powerplayOvers: 4,
    maxOversPerBowler: 3,
    numberOfInnings: 2,
    maxPlayersPerTeam: 11,
    // Rules
    wideBallReBowl: true,
    freeHit: true,
    lbwEnabled: false,
    superOverOnTie: true,
    drsReviewsPerInnings: 0,
    // Timeouts
    timeoutsPerInnings: 1,
    timeoutDuration: 2,
  },
  football: {
    // Time
    halfLength: 30,
    extraTime: false,
    extraTimeLength: 10,
    injuryTime: true,
    clockDirection: 'up',
    // Substitutions
    maxSubstitutions: 3,
    rollingSubstitutions: false,
    // Timeouts
    timeoutsPerHalf: 0,
    timeoutDuration: 1,
    // Discipline
    yellowCardSuspension: 2,
    // Tiebreaker
    penaltyShootout: true,
  },
  basketball_5v5: {
    // Time
    quarterLength: 10,
    overtimeLength: 5,
    numberOfQuarters: 4,
    clockDirection: 'down',
    // Gameplay
    shotClock: 24,
    foulBonusThreshold: 5,
    // Substitutions
    maxSubstitutions: 15,
    // Timeouts
    timeoutsPerHalf: 3,
    timeoutDuration: 1,
    // Discipline
    maxPersonalFouls: 5,
    technicalFoulLimit: 2,
  },
  basketball_3x3: {
    // Gameplay
    targetScore: 21,
    gameTime: 10,
    shotClock: 12,
    foulBonus: 7,
    maxPlayers: 4,
    // Timeouts
    timeoutsPerTeam: 1,
    timeoutDuration: 0.5,
  },
  volleyball: {
    // Gameplay
    setsToWin: 3,
    pointsPerSet: 25,
    decidingSetPoints: 15,
    minLeadToWin: 2,
    maxPlayersOnCourt: 6,
    // Substitutions
    maxSubstitutionsPerSet: 6,
    // Timeouts
    timeoutsPerSet: 2,
    timeoutDuration: 0.5,
  },
  tennis: {
    // Gameplay
    bestOf: 3,
    tiebreakEnabled: true,
    tiebreakPoints: 7,
    noAdScoring: false,
    finalSetTiebreak: true,
    // Time
    warmupTime: 5,
  },
  table_tennis: {
    // Gameplay
    bestOf: 5,
    pointsPerSet: 11,
    minLeadToWin: 2,
    serviceChangeEvery: 2,
    // Timeouts
    timeoutPerMatch: 1,
    timeoutDuration: 1,
  },
  badminton: {
    // Gameplay
    bestOf: 3,
    pointsPerGame: 21,
    capAt: 30,
    minLeadToWin: 2,
    // Intervals
    intervalPoints: 11,
    intervalDuration: 1,
    changeSidesOnDecider: true,
  },
  squash: {
    // Gameplay
    bestOf: 5,
    pointsPerGame: 11,
    parScoring: true,
    minLeadToWin: 2,
    letEnabled: true,
    // Timeouts
    timeoutPerGame: 1,
    timeBetweenGames: 1.5,
  },
};

export const EVENT_TYPES = {
  BALL: 'ball',
  WICKET: 'wicket',
  OVER_COMPLETE: 'over_complete',
  INNINGS_BREAK: 'innings_break',
  GOAL: 'goal',
  CARD: 'card',
  SUBSTITUTION: 'substitution',
  SHOT_MADE: 'shot_made',
  SHOT_MISSED: 'shot_missed',
  FOUL: 'foul',
  TIMEOUT: 'timeout',
  QUARTER_START: 'quarter_start',
  QUARTER_END: 'quarter_end',
  RALLY_POINT: 'rally_point',
  SET_END: 'set_end',
  POINT: 'point',
  GAME_END: 'game_end',
  MATCH_START: 'match_start',
  MATCH_PAUSE: 'match_pause',
  MATCH_RESUME: 'match_resume',
  MATCH_END: 'match_end',
  PERIOD_START: 'half_start',
  PERIOD_END: 'half_end',
  UNDO: 'undo',
} as const;

export const CRICKET_WICKET_TYPES = [
  'bowled',
  'caught',
  'lbw',
  'run_out',
  'stumped',
  'hit_wicket',
  'retired_hurt',
  'retired_out',
  'timed_out',
  'obstructing_the_field',
] as const;

export const CRICKET_EXTRAS = ['wide', 'no_ball', 'bye', 'leg_bye'] as const;

export const FOOTBALL_CARD_TYPES = ['yellow', 'red'] as const;

export const BASKETBALL_SHOT_TYPES = ['2pt', '3pt', 'ft', '1pt'] as const;

export const NOTIFICATION_TYPES = {
  MATCH_START: 'match_start',
  MATCH_END: 'match_end',
  SCORE_UPDATE: 'score_update',
  WICKET: 'wicket',
  GOAL: 'goal',
  TOURNAMENT_UPDATE: 'tournament_update',
  INVITE: 'invite',
  SYSTEM: 'system',
} as const;
