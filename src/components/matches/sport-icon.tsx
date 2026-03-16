'use client';

import * as React from 'react';
import {
  CircleDot,
  Circle,
  CircleDashed,
  CircleEllipsis,
  Target,
  Disc,
  Feather,
  Square,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSportColor } from '@/lib/sports-config';

const sportIcons: Record<string, LucideIcon> = {
  cricket: CircleDot,
  football: Circle,
  basketball_5v5: CircleDashed,
  basketball_3x3: CircleDashed,
  volleyball: CircleEllipsis,
  tennis: Target,
  table_tennis: Disc,
  badminton: Feather,
  squash: Square,
};

export interface SportIconProps extends React.HTMLAttributes<HTMLDivElement> {
  sport: string;
  size?: number;
  showBackground?: boolean;
}

const SportIcon = React.forwardRef<HTMLDivElement, SportIconProps>(
  ({ sport, size = 18, showBackground = false, className, ...props }, ref) => {
    const Icon = sportIcons[sport] || Trophy;
    const color = getSportColor(sport);

    if (showBackground) {
      return (
        <div
          ref={ref}
          className={cn('inline-flex items-center justify-center rounded-lg', className)}
          style={{ backgroundColor: `${color}15`, width: size * 2, height: size * 2 }}
          {...props}
        >
          <Icon size={size} style={{ color }} />
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('inline-flex', className)} {...props}>
        <Icon size={size} style={{ color }} />
      </div>
    );
  }
);
SportIcon.displayName = 'SportIcon';

export { SportIcon };
