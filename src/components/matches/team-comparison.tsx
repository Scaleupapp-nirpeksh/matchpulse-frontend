'use client';

import { cn } from '@/lib/utils';

interface StatRow {
  label: string;
  teamA: number;
  teamB: number;
}

interface TeamComparisonProps {
  stats: Record<string, unknown>;
  teamAName: string;
  teamBName: string;
}

function extractComparisonStats(stats: Record<string, unknown>): StatRow[] {
  const rows: StatRow[] = [];

  // Try to extract team-level stats
  const teamAStats = (stats.teamA || stats.team_a || stats.home) as Record<string, number> | undefined;
  const teamBStats = (stats.teamB || stats.team_b || stats.away) as Record<string, number> | undefined;

  if (teamAStats && teamBStats && typeof teamAStats === 'object') {
    for (const key of Object.keys(teamAStats)) {
      if (key.startsWith('_') || key === 'teamId' || key === 'name') continue;
      const a = Number(teamAStats[key]) || 0;
      const b = Number(teamBStats[key]) || 0;
      if (a === 0 && b === 0) continue;
      rows.push({
        label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
        teamA: a,
        teamB: b,
      });
    }
  }

  // Fallback: look for paired keys like shotsA/shotsB, goalsA/goalsB
  if (rows.length === 0) {
    const keys = Object.keys(stats);
    const paired = new Set<string>();
    for (const key of keys) {
      const base = key.replace(/[AB]$/, '').replace(/_[ab]$/, '');
      if (paired.has(base)) continue;
      const aKey = keys.find((k) => k === `${base}A` || k === `${base}_a`);
      const bKey = keys.find((k) => k === `${base}B` || k === `${base}_b`);
      if (aKey && bKey) {
        paired.add(base);
        const a = Number(stats[aKey]) || 0;
        const b = Number(stats[bKey]) || 0;
        if (a === 0 && b === 0) continue;
        rows.push({
          label: base.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
          teamA: a,
          teamB: b,
        });
      }
    }
  }

  return rows;
}

function BarComparison({ label, teamA, teamB }: StatRow) {
  const total = teamA + teamB || 1;
  const pctA = (teamA / total) * 100;
  const pctB = (teamB / total) * 100;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn('text-sm font-medium', teamA > teamB ? 'text-gray-900' : 'text-gray-500')}>
          {teamA}
        </span>
        <span className="text-xs text-gray-500 capitalize">{label}</span>
        <span className={cn('text-sm font-medium', teamB > teamA ? 'text-gray-900' : 'text-gray-500')}>
          {teamB}
        </span>
      </div>
      <div className="flex items-center gap-1 h-2">
        <div className="flex-1 flex justify-end">
          <div
            className={cn(
              'h-2 rounded-l-full transition-all',
              teamA >= teamB ? 'bg-emerald-500' : 'bg-gray-200'
            )}
            style={{ width: `${pctA}%` }}
          />
        </div>
        <div className="flex-1">
          <div
            className={cn(
              'h-2 rounded-r-full transition-all',
              teamB >= teamA ? 'bg-blue-500' : 'bg-gray-200'
            )}
            style={{ width: `${pctB}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function TeamComparison({ stats, teamAName, teamBName }: TeamComparisonProps) {
  const rows = extractComparisonStats(stats);

  if (rows.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Comparison</h3>
      {/* Team headers */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-emerald-600">{teamAName}</span>
        <span className="text-xs font-medium text-blue-600">{teamBName}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <BarComparison key={row.label} {...row} />
        ))}
      </div>
    </div>
  );
}
