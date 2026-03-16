'use client';

import type { ScoringEvent } from '@/types/scoring';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

interface MatchTimelineProps {
  events: ScoringEvent[];
  sportType: string;
}

function getEventLabel(event: ScoringEvent): string {
  switch (event.eventType) {
    case 'ball': {
      const data = event.eventData as Record<string, unknown>;
      if (data.isWicket) return 'WICKET';
      if (data.runs === 4) return 'FOUR';
      if (data.runs === 6) return 'SIX';
      if (data.extras) return 'Extra';
      return `${data.runs || 0} run${(data.runs as number) !== 1 ? 's' : ''}`;
    }
    case 'goal': return 'GOAL';
    case 'card': return `${(event.eventData as Record<string, unknown>).cardType === 'red' ? 'RED' : 'YELLOW'} CARD`;
    case 'substitution': return 'Substitution';
    case 'shot_made': return `${(event.eventData as Record<string, unknown>).shotType} Made`;
    case 'shot_missed': return `${(event.eventData as Record<string, unknown>).shotType} Miss`;
    case 'foul': return 'Foul';
    case 'rally_point':
    case 'point': return 'Point';
    case 'over_complete': return 'Over Complete';
    case 'innings_break': return 'Innings Break';
    case 'half_start': return 'Half Started';
    case 'half_end': return 'Half Ended';
    case 'quarter_start': return 'Quarter Started';
    case 'quarter_end': return 'Quarter Ended';
    default: return event.eventType.replace(/_/g, ' ');
  }
}

function getEventColor(event: ScoringEvent): string {
  if (event.isUndone) return 'bg-gray-200';
  switch (event.eventType) {
    case 'ball': {
      const data = event.eventData as Record<string, unknown>;
      if (data.isWicket) return 'bg-danger';
      if (data.runs === 4) return 'bg-blue-500';
      if (data.runs === 6) return 'bg-purple-500';
      return 'bg-gray-300';
    }
    case 'goal': return 'bg-accent';
    case 'card': return (event.eventData as Record<string, unknown>).cardType === 'red' ? 'bg-danger' : 'bg-warning';
    case 'shot_made': return 'bg-accent';
    case 'point':
    case 'rally_point': return 'bg-accent';
    default: return 'bg-gray-300';
  }
}

export function MatchTimeline({ events, sportType }: MatchTimelineProps) {
  const visibleEvents = events.filter((e) => !e.isUndone).slice(-30).reverse();

  if (visibleEvents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-text-tertiary">
        No events yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {visibleEvents.map((event, i) => (
        <div
          key={event._id || event.id || i}
          className={cn(
            'flex items-start gap-3 py-2.5',
            i < visibleEvents.length - 1 && 'border-b border-border/50'
          )}
        >
          <div className="flex flex-col items-center pt-1">
            <div className={cn('w-2 h-2 rounded-full', getEventColor(event))} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={cn('text-sm font-medium', event.isNotificationWorthy && 'text-accent')}>
                {getEventLabel(event)}
              </span>
              <span className="text-xs text-text-tertiary shrink-0">
                #{event.sequenceNumber}
              </span>
            </div>
            {event.aiCommentary && (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{event.aiCommentary}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
