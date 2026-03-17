import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mtchpulse.com';

function getTeamName(team: Record<string, unknown>): string {
  if (team.name) return team.name as string;
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return (team.teamId as Record<string, unknown>).name as string || 'TBD';
  }
  return 'TBD';
}

function getTeamShort(team: Record<string, unknown>): string {
  if (team.shortName) return team.shortName as string;
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return ((team.teamId as Record<string, unknown>).shortName || (team.teamId as Record<string, unknown>).name) as string || 'TBD';
  }
  return team.name as string || 'TBD';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;

  try {
    const res = await fetch(`${API_URL}/api/matches/${matchId}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return { title: 'Match | MatchPulse' };
    }

    const json = await res.json();
    const match = json.data || json;

    const teamA = getTeamShort(match.teamA || {});
    const teamB = getTeamShort(match.teamB || {});
    const sport = (match.sportType || '').replace(/_/g, ' ');
    const status = match.status || 'scheduled';

    let scoreText = '';
    if (match.currentState) {
      const state = match.currentState as Record<string, unknown>;
      if ('scoreA' in state && 'scoreB' in state) {
        scoreText = ` ${state.scoreA}-${state.scoreB}`;
      }
    }

    const isLive = status === 'live' || status === 'paused';
    const statusPrefix = isLive ? 'LIVE: ' : status === 'completed' ? 'Final: ' : '';
    const title = `${statusPrefix}${teamA} vs ${teamB}${scoreText} | MatchPulse`;

    const tournament = typeof match.tournamentId === 'object' ? (match.tournamentId as Record<string, unknown>).name : '';
    const description = `${getTeamName(match.teamA || {})} vs ${getTeamName(match.teamB || {})}${tournament ? ` in ${tournament}` : ''} - ${sport}${isLive ? ' - Live Now!' : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'MatchPulse',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return { title: 'Match | MatchPulse' };
  }
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
