'use client';

import { Zap, Star, AlertTriangle, Trophy, Target } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ScoringEvent } from '@/types/scoring';

interface KeyMomentsProps {
  events: ScoringEvent[];
  teamAName: string;
  teamBName: string;
  teamAId?: string;
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  wicket: { icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
  goal: { icon: Target, color: 'text-emerald-500 bg-emerald-50' },
  three_pointer: { icon: Star, color: 'text-amber-500 bg-amber-50' },
  ace: { icon: Zap, color: 'text-blue-500 bg-blue-50' },
  six: { icon: Star, color: 'text-purple-500 bg-purple-50' },
  four: { icon: Zap, color: 'text-blue-500 bg-blue-50' },
  smash: { icon: Zap, color: 'text-cyan-500 bg-cyan-50' },
  red_card: { icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
  penalty_goal: { icon: Target, color: 'text-emerald-500 bg-emerald-50' },
  match_end: { icon: Trophy, color: 'text-amber-500 bg-amber-50' },
  match_start: { icon: Zap, color: 'text-emerald-500 bg-emerald-50' },
};

function getEventDisplay(event: ScoringEvent) {
  const config = EVENT_ICONS[event.eventType] || { icon: Zap, color: 'text-gray-500 bg-gray-50' };
  return config;
}

function formatEventType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function KeyMoments({ events, teamAName, teamBName, teamAId }: KeyMomentsProps) {
  // Filter to notification-worthy and significant events
  const keyEvents = events.filter(
    (e) =>
      !e.isUndone &&
      (e.isNotificationWorthy || isSignificantEvent(e.eventType))
  );

  if (keyEvents.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Zap size={14} className="text-amber-500" />
        Key Moments
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

        <div className="space-y-3">
          {keyEvents.slice(0, 15).map((event) => {
            const { icon: Icon, color } = getEventDisplay(event);
            const teamName = event.teamId === teamAId ? teamAName : teamBName;

            return (
              <div key={event.id || event._id} className="flex items-start gap-3 relative">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10',
                    color
                  )}
                >
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{formatEventType(event.eventType)}</span>
                    {teamName && (
                      <span className="text-gray-500"> — {teamName}</span>
                    )}
                  </p>
                  {event.aiCommentary && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {event.aiCommentary}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatRelativeTime(event.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function isSignificantEvent(type: string): boolean {
  const significant = [
    'wicket', 'goal', 'six', 'four', 'three_pointer', 'ace', 'smash',
    'red_card', 'penalty_goal', 'match_start', 'match_end',
    'half_start', 'half_end', 'quarter_start', 'quarter_end',
    'set_won', 'innings_end', 'toss', 'game_won',
  ];
  return significant.includes(type);
}
