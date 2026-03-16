'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CommentaryItem {
  eventId: string;
  text: string;
}

interface CommentaryFeedProps {
  items: CommentaryItem[];
  className?: string;
}

export function CommentaryFeed({ items, className }: CommentaryFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className={cn('text-center py-6 text-sm text-text-tertiary', className)}>
        Commentary will appear here as the match progresses
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={cn('space-y-2 max-h-64 overflow-y-auto custom-scrollbar', className)}>
      {[...items].reverse().map((item, i) => (
        <div
          key={item.eventId || i}
          className={cn(
            'px-3 py-2 rounded-lg bg-surface text-sm text-text-secondary leading-relaxed',
            i === 0 && 'animate-slide-up bg-accent-light/30 text-text-primary'
          )}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
