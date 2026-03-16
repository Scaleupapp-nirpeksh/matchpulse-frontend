export interface SportConfig {
  name: string;
  shortName: string;
  icon: string;
  color: string;
  positions: string[];
  scoreLabel: string;
  periodLabel: string;
  formatScore: (score: Record<string, unknown>) => string;
}

export const SPORT_CONFIGS: Record<string, SportConfig> = {
  cricket: {
    name: 'Cricket',
    shortName: 'CRI',
    icon: 'circle-dot',
    color: '#22C55E',
    positions: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    scoreLabel: 'Score',
    periodLabel: 'Innings',
    formatScore: (score) => {
      const runs = score.runs ?? 0;
      const wickets = score.wickets ?? 0;
      const overs = score.overs ?? 0;
      return `${runs}/${wickets} (${overs})`;
    },
  },
  football: {
    name: 'Football',
    shortName: 'FTB',
    icon: 'circle',
    color: '#EF4444',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    scoreLabel: 'Goals',
    periodLabel: 'Half',
    formatScore: (score) => {
      const goals = score.goals ?? 0;
      return `${goals}`;
    },
  },
  basketball_5v5: {
    name: 'Basketball 5v5',
    shortName: 'B5V',
    icon: 'circle-dashed',
    color: '#F97316',
    positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    scoreLabel: 'Points',
    periodLabel: 'Quarter',
    formatScore: (score) => {
      const points = score.points ?? 0;
      return `${points}`;
    },
  },
  basketball_3x3: {
    name: 'Basketball 3x3',
    shortName: 'B3X',
    icon: 'circle-dashed',
    color: '#F59E0B',
    positions: ['Guard', 'Forward', 'Center'],
    scoreLabel: 'Points',
    periodLabel: 'Game',
    formatScore: (score) => {
      const points = score.points ?? 0;
      return `${points}`;
    },
  },
  volleyball: {
    name: 'Volleyball',
    shortName: 'VLB',
    icon: 'circle-ellipsis',
    color: '#8B5CF6',
    positions: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'],
    scoreLabel: 'Sets',
    periodLabel: 'Set',
    formatScore: (score) => {
      const sets = score.sets ?? 0;
      const points = score.points ?? 0;
      return `${sets} (${points})`;
    },
  },
  tennis: {
    name: 'Tennis',
    shortName: 'TEN',
    icon: 'target',
    color: '#06B6D4',
    positions: ['Singles', 'Doubles'],
    scoreLabel: 'Sets',
    periodLabel: 'Set',
    formatScore: (score) => {
      const sets = score.sets ?? 0;
      const games = score.games ?? 0;
      const points = score.points ?? 0;
      return `${sets}-${games} (${points})`;
    },
  },
  table_tennis: {
    name: 'Table Tennis',
    shortName: 'TT',
    icon: 'disc',
    color: '#3B82F6',
    positions: ['Singles', 'Doubles'],
    scoreLabel: 'Sets',
    periodLabel: 'Set',
    formatScore: (score) => {
      const sets = score.sets ?? 0;
      const points = score.points ?? 0;
      return `${sets} (${points})`;
    },
  },
  badminton: {
    name: 'Badminton',
    shortName: 'BAD',
    icon: 'feather',
    color: '#EC4899',
    positions: ['Singles', 'Doubles'],
    scoreLabel: 'Games',
    periodLabel: 'Game',
    formatScore: (score) => {
      const games = score.games ?? 0;
      const points = score.points ?? 0;
      return `${games} (${points})`;
    },
  },
  squash: {
    name: 'Squash',
    shortName: 'SQH',
    icon: 'square',
    color: '#6366F1',
    positions: ['Singles'],
    scoreLabel: 'Games',
    periodLabel: 'Game',
    formatScore: (score) => {
      const games = score.games ?? 0;
      const points = score.points ?? 0;
      return `${games} (${points})`;
    },
  },
};

export function getSportConfig(sportType: string): SportConfig {
  return SPORT_CONFIGS[sportType] ?? SPORT_CONFIGS.cricket;
}

export function getSportColor(sportType: string): string {
  return SPORT_CONFIGS[sportType]?.color ?? '#22C55E';
}
