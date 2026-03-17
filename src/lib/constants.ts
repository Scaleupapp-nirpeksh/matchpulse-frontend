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
    oversPerInnings: 15,
    powerplayOvers: 4,
    maxOversPerBowler: 3,
    wideBallReBowl: true,
    freeHit: true,
    lbwEnabled: false,
    numberOfInnings: 2,
  },
  football: {
    halfLength: 30,
    extraTime: false,
    extraTimeLength: 10,
    penaltyShootout: true,
    maxSubstitutions: 3,
  },
  basketball_5v5: {
    quarterLength: 10,
    overtimeLength: 5,
    shotClock: 24,
    foulBonusThreshold: 5,
    numberOfQuarters: 4,
  },
  basketball_3x3: {
    targetScore: 21,
    gameTime: 10,
    shotClock: 12,
    foulBonus: 7,
  },
  volleyball: {
    setsToWin: 3,
    pointsPerSet: 25,
    decidingSetPoints: 15,
    minLeadToWin: 2,
  },
  tennis: {
    bestOf: 3,
    tiebreakEnabled: true,
    noAdScoring: false,
    finalSetTiebreak: true,
  },
  table_tennis: {
    bestOf: 5,
    pointsPerSet: 11,
    minLeadToWin: 2,
  },
  badminton: {
    bestOf: 3,
    pointsPerGame: 21,
    capAt: 30,
    minLeadToWin: 2,
  },
  squash: {
    bestOf: 5,
    pointsPerGame: 11,
    parScoring: true,
    minLeadToWin: 2,
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
