/**
 * Rich metadata for tournament rule fields across all 9 sports.
 * Powers the RulesEditor component with human labels, grouping, units, and constraints.
 */

export interface RuleFieldMeta {
  label: string;
  description?: string;
  group: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Group display order
export const RULE_GROUPS = [
  'Gameplay',
  'Time & Clock',
  'Timeouts',
  'Substitutions',
  'Discipline',
  'Tiebreaker',
  'Intervals',
];

type SportRulesMetadata = Record<string, RuleFieldMeta>;

export const RULE_METADATA: Record<string, SportRulesMetadata> = {
  cricket: {
    oversPerInnings: { label: 'Overs Per Innings', group: 'Gameplay', unit: 'overs', min: 1, max: 50 },
    powerplayOvers: { label: 'Powerplay Overs', group: 'Gameplay', unit: 'overs', min: 0, max: 20 },
    maxOversPerBowler: { label: 'Max Overs Per Bowler', group: 'Gameplay', unit: 'overs', min: 1, max: 10 },
    numberOfInnings: { label: 'Number of Innings', group: 'Gameplay', min: 1, max: 4 },
    maxPlayersPerTeam: { label: 'Players Per Team', group: 'Gameplay', min: 5, max: 15 },
    wideBallReBowl: { label: 'Wide Ball Re-bowled', description: 'Re-bowl the delivery on a wide', group: 'Gameplay' },
    freeHit: { label: 'Free Hit on No-Ball', description: 'Award a free hit after a no-ball', group: 'Gameplay' },
    lbwEnabled: { label: 'LBW Enabled', description: 'Allow leg-before-wicket dismissals', group: 'Gameplay' },
    superOverOnTie: { label: 'Super Over on Tie', description: 'Play a super over if match is tied', group: 'Tiebreaker' },
    drsReviewsPerInnings: { label: 'DRS Reviews Per Innings', description: '0 = no DRS', group: 'Gameplay', min: 0, max: 3 },
    timeoutsPerInnings: { label: 'Timeouts Per Innings', group: 'Timeouts', min: 0, max: 3 },
    timeoutDuration: { label: 'Timeout Duration', group: 'Timeouts', unit: 'min', min: 0.5, max: 5, step: 0.5 },
  },
  football: {
    halfLength: { label: 'Half Length', group: 'Time & Clock', unit: 'min', min: 5, max: 45 },
    extraTime: { label: 'Extra Time Enabled', description: 'Play extra time in knockout matches', group: 'Time & Clock' },
    extraTimeLength: { label: 'Extra Time Length', group: 'Time & Clock', unit: 'min', min: 5, max: 15 },
    injuryTime: { label: 'Injury/Stoppage Time', description: 'Allow added time at end of halves', group: 'Time & Clock' },
    clockDirection: { label: 'Clock Direction', description: '"up" counts up, "down" counts down', group: 'Time & Clock' },
    maxSubstitutions: { label: 'Max Substitutions', group: 'Substitutions', min: 0, max: 7 },
    rollingSubstitutions: { label: 'Rolling Substitutions', description: 'Allow unlimited re-entry subs', group: 'Substitutions' },
    timeoutsPerHalf: { label: 'Timeouts Per Half', group: 'Timeouts', min: 0, max: 3 },
    timeoutDuration: { label: 'Timeout Duration', group: 'Timeouts', unit: 'min', min: 0.5, max: 5, step: 0.5 },
    yellowCardSuspension: { label: 'Yellows for Suspension', description: 'Yellow cards before next-match ban', group: 'Discipline', min: 1, max: 5 },
    penaltyShootout: { label: 'Penalty Shootout', description: 'Use penalty shootout in knockout ties', group: 'Tiebreaker' },
  },
  basketball_5v5: {
    quarterLength: { label: 'Quarter Length', group: 'Time & Clock', unit: 'min', min: 5, max: 15 },
    overtimeLength: { label: 'Overtime Length', group: 'Time & Clock', unit: 'min', min: 3, max: 10 },
    numberOfQuarters: { label: 'Number of Quarters', group: 'Time & Clock', min: 2, max: 4 },
    clockDirection: { label: 'Clock Direction', description: '"down" counts down, "up" counts up', group: 'Time & Clock' },
    shotClock: { label: 'Shot Clock', group: 'Gameplay', unit: 'sec', min: 12, max: 35 },
    foulBonusThreshold: { label: 'Team Foul Bonus Threshold', description: 'Fouls before bonus free throws', group: 'Gameplay', min: 3, max: 7 },
    maxSubstitutions: { label: 'Max Substitutions', description: 'Per match (set high for unlimited)', group: 'Substitutions', min: 5, max: 50 },
    timeoutsPerHalf: { label: 'Timeouts Per Half', group: 'Timeouts', min: 1, max: 7 },
    timeoutDuration: { label: 'Timeout Duration', group: 'Timeouts', unit: 'min', min: 0.5, max: 2, step: 0.5 },
    maxPersonalFouls: { label: 'Max Personal Fouls', description: 'Player fouls out after this many', group: 'Discipline', min: 4, max: 6 },
    technicalFoulLimit: { label: 'Technical Foul Limit', description: 'Ejection after this many technicals', group: 'Discipline', min: 1, max: 3 },
  },
  basketball_3x3: {
    targetScore: { label: 'Target Score', description: 'First team to reach this wins', group: 'Gameplay', min: 10, max: 33 },
    gameTime: { label: 'Game Time', group: 'Time & Clock', unit: 'min', min: 5, max: 15 },
    shotClock: { label: 'Shot Clock', group: 'Gameplay', unit: 'sec', min: 10, max: 20 },
    foulBonus: { label: 'Team Foul Bonus', description: 'Team fouls before bonus free throws', group: 'Gameplay', min: 5, max: 10 },
    maxPlayers: { label: 'Max Players', description: 'On roster (3 on court + subs)', group: 'Gameplay', min: 3, max: 5 },
    timeoutsPerTeam: { label: 'Timeouts Per Team', group: 'Timeouts', min: 0, max: 2 },
    timeoutDuration: { label: 'Timeout Duration', group: 'Timeouts', unit: 'min', min: 0.5, max: 1, step: 0.5 },
  },
  volleyball: {
    setsToWin: { label: 'Sets to Win', group: 'Gameplay', min: 1, max: 3 },
    pointsPerSet: { label: 'Points Per Set', group: 'Gameplay', min: 15, max: 30 },
    decidingSetPoints: { label: 'Deciding Set Points', description: 'Points in the final/deciding set', group: 'Gameplay', min: 10, max: 25 },
    minLeadToWin: { label: 'Min Lead to Win', description: 'Point lead required to win a set', group: 'Gameplay', min: 1, max: 3 },
    maxPlayersOnCourt: { label: 'Players on Court', group: 'Gameplay', min: 4, max: 6 },
    maxSubstitutionsPerSet: { label: 'Max Substitutions Per Set', group: 'Substitutions', min: 0, max: 12 },
    timeoutsPerSet: { label: 'Timeouts Per Set', group: 'Timeouts', min: 0, max: 4 },
    timeoutDuration: { label: 'Timeout Duration', group: 'Timeouts', unit: 'min', min: 0.5, max: 1, step: 0.5 },
  },
  tennis: {
    bestOf: { label: 'Best of (Sets)', group: 'Gameplay', min: 1, max: 5, step: 2 },
    tiebreakEnabled: { label: 'Tiebreak Enabled', description: 'Play tiebreak at 6-6', group: 'Gameplay' },
    tiebreakPoints: { label: 'Tiebreak Points', description: 'First to this many points in tiebreak', group: 'Gameplay', min: 5, max: 10 },
    noAdScoring: { label: 'No-Ad Scoring', description: 'Decide deuce on a single point', group: 'Gameplay' },
    finalSetTiebreak: { label: 'Final Set Tiebreak', description: 'Tiebreak in the deciding set', group: 'Gameplay' },
    warmupTime: { label: 'Warmup Time', group: 'Time & Clock', unit: 'min', min: 0, max: 10 },
  },
  table_tennis: {
    bestOf: { label: 'Best of (Games)', group: 'Gameplay', min: 1, max: 7, step: 2 },
    pointsPerSet: { label: 'Points Per Game', group: 'Gameplay', min: 7, max: 15 },
    minLeadToWin: { label: 'Min Lead to Win', group: 'Gameplay', min: 1, max: 3 },
    serviceChangeEvery: { label: 'Service Change Every', description: 'Points between service rotation', group: 'Gameplay', unit: 'pts', min: 1, max: 5 },
    timeoutPerMatch: { label: 'Timeouts Per Match', group: 'Timeouts', min: 0, max: 2 },
    timeoutDuration: { label: 'Timeout Duration', group: 'Timeouts', unit: 'min', min: 0.5, max: 2, step: 0.5 },
  },
  badminton: {
    bestOf: { label: 'Best of (Games)', group: 'Gameplay', min: 1, max: 5, step: 2 },
    pointsPerGame: { label: 'Points Per Game', group: 'Gameplay', min: 11, max: 30 },
    capAt: { label: 'Score Cap', description: 'Hard cap regardless of lead (e.g. 30)', group: 'Gameplay', min: 20, max: 40 },
    minLeadToWin: { label: 'Min Lead to Win', group: 'Gameplay', min: 1, max: 3 },
    intervalPoints: { label: 'Mid-Game Interval At', description: 'Take an interval break at this score', group: 'Intervals', unit: 'pts', min: 5, max: 15 },
    intervalDuration: { label: 'Interval Duration', group: 'Intervals', unit: 'min', min: 0.5, max: 2, step: 0.5 },
    changeSidesOnDecider: { label: 'Change Sides in Decider', description: 'Switch sides at interval in deciding game', group: 'Intervals' },
  },
  squash: {
    bestOf: { label: 'Best of (Games)', group: 'Gameplay', min: 1, max: 7, step: 2 },
    pointsPerGame: { label: 'Points Per Game', group: 'Gameplay', min: 9, max: 15 },
    parScoring: { label: 'PAR Scoring', description: 'Point-a-rally scoring (vs hand-in/hand-out)', group: 'Gameplay' },
    minLeadToWin: { label: 'Min Lead to Win', group: 'Gameplay', min: 1, max: 3 },
    letEnabled: { label: 'Lets Enabled', description: 'Allow let calls for interference', group: 'Gameplay' },
    timeoutPerGame: { label: 'Timeouts Per Game', group: 'Timeouts', min: 0, max: 2 },
    timeBetweenGames: { label: 'Time Between Games', group: 'Timeouts', unit: 'min', min: 0.5, max: 3, step: 0.5 },
  },
};

/**
 * Get grouped metadata for a sport, returning rules organized by group.
 */
export function getGroupedRules(sportType: string): { group: string; keys: string[] }[] {
  const meta = RULE_METADATA[sportType];
  if (!meta) return [];

  const groupMap: Record<string, string[]> = {};
  for (const [key, field] of Object.entries(meta)) {
    if (!groupMap[field.group]) groupMap[field.group] = [];
    groupMap[field.group].push(key);
  }

  // Sort by RULE_GROUPS order
  return RULE_GROUPS
    .filter((g) => groupMap[g])
    .map((g) => ({ group: g, keys: groupMap[g] }));
}

/**
 * Get metadata for a specific rule field, with fallback to auto-generated label.
 */
export function getRuleMeta(sportType: string, key: string): RuleFieldMeta {
  return (
    RULE_METADATA[sportType]?.[key] || {
      label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim(),
      group: 'Gameplay',
    }
  );
}
