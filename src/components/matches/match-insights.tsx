'use client';

import { Trophy, TrendingUp, Target, Star, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchInsightsProps {
  insights: Record<string, unknown>;
  aiSummary?: string;
  sportType?: string;
}

interface InsightCard {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

function parseInsights(insights: Record<string, unknown>, sportType?: string): InsightCard[] {
  const cards: InsightCard[] = [];

  // Generic insights that apply to any sport
  if (insights.keyMoment || insights.turningPoint) {
    cards.push({
      icon: Zap,
      label: 'Turning Point',
      value: String(insights.keyMoment || insights.turningPoint),
      color: 'text-amber-600 bg-amber-50',
    });
  }

  if (insights.topPerformer || insights.mvp || insights.playerOfTheMatch) {
    cards.push({
      icon: Star,
      label: 'Top Performer',
      value: String(insights.topPerformer || insights.mvp || insights.playerOfTheMatch),
      color: 'text-purple-600 bg-purple-50',
    });
  }

  if (insights.winMargin || insights.margin) {
    cards.push({
      icon: Trophy,
      label: 'Victory Margin',
      value: String(insights.winMargin || insights.margin),
      color: 'text-emerald-600 bg-emerald-50',
    });
  }

  if (insights.totalEvents || insights.totalPoints || insights.totalGoals) {
    cards.push({
      icon: Target,
      label: 'Total Activity',
      value: String(insights.totalEvents || insights.totalPoints || insights.totalGoals),
      color: 'text-blue-600 bg-blue-50',
    });
  }

  if (insights.momentum || insights.dominance) {
    cards.push({
      icon: TrendingUp,
      label: 'Momentum',
      value: String(insights.momentum || insights.dominance),
      color: 'text-cyan-600 bg-cyan-50',
    });
  }

  // Sport-specific insights
  if (sportType === 'cricket') {
    if (insights.runRate) {
      cards.push({
        icon: BarChart3,
        label: 'Run Rate',
        value: String(insights.runRate),
        color: 'text-green-600 bg-green-50',
      });
    }
    if (insights.highestPartnership) {
      cards.push({
        icon: Target,
        label: 'Highest Partnership',
        value: String(insights.highestPartnership),
        color: 'text-orange-600 bg-orange-50',
      });
    }
  }

  // If no structured insights, parse generic key-value pairs
  if (cards.length === 0) {
    const iconPool = [Trophy, TrendingUp, Target, Star, Zap, BarChart3];
    const colorPool = [
      'text-emerald-600 bg-emerald-50',
      'text-blue-600 bg-blue-50',
      'text-amber-600 bg-amber-50',
      'text-purple-600 bg-purple-50',
      'text-cyan-600 bg-cyan-50',
      'text-orange-600 bg-orange-50',
    ];
    let i = 0;
    for (const [key, value] of Object.entries(insights)) {
      if (key.startsWith('_') || typeof value === 'object') continue;
      if (i >= 6) break;
      cards.push({
        icon: iconPool[i % iconPool.length],
        label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
        value: String(value),
        color: colorPool[i % colorPool.length],
      });
      i++;
    }
  }

  return cards;
}

export function MatchInsights({ insights, aiSummary, sportType }: MatchInsightsProps) {
  const cards = parseInsights(insights, sportType);

  if (cards.length === 0 && !aiSummary) return null;

  return (
    <div className="space-y-4">
      {cards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', card.color)}>
                  <Icon size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-0.5 capitalize">{card.label}</p>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
