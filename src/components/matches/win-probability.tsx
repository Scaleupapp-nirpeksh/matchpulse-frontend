'use client';

import { cn } from '@/lib/utils';

interface WinProbabilityProps {
  teamA: number;
  teamB: number;
  teamAName: string;
  teamBName: string;
  teamAColor?: string;
  teamBColor?: string;
}

export function WinProbability({ teamA, teamB, teamAName, teamBName, teamAColor = '#10B981', teamBColor = '#6366F1' }: WinProbabilityProps) {
  // Backend sends values as percentages (0-100) not fractions (0-1)
  const pctA = teamA > 1 ? Math.round(teamA) : Math.round(teamA * 100);
  const pctB = teamB > 1 ? Math.round(teamB) : Math.round(teamB * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{teamAName} <span className="text-text-secondary">{pctA}%</span></span>
        <span className="text-text-tertiary text-[10px] uppercase tracking-wider font-medium">Win Probability</span>
        <span className="font-medium"><span className="text-text-secondary">{pctB}%</span> {teamBName}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-surface">
        <div
          className="transition-all duration-500 ease-out rounded-l-full"
          style={{ width: `${pctA}%`, backgroundColor: teamAColor }}
        />
        <div
          className="transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${pctB}%`, backgroundColor: teamBColor }}
        />
      </div>
    </div>
  );
}
