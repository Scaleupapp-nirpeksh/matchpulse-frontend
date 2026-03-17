import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mtchpulse.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/tournaments/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { title: 'Tournament | MatchPulse' };
    }

    const json = await res.json();
    const tournament = json.data || json;

    const name = tournament.name || 'Tournament';
    const sport = (tournament.sportType || '').replace(/_/g, ' ');
    const status = tournament.status || 'draft';
    const format = (tournament.format || '').replace(/_/g, ' ');

    const title = `${name} | MatchPulse`;
    const description = `${name} - ${sport} ${format} tournament${status === 'active' ? ' (Active)' : ''} on MatchPulse`;

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
    return { title: 'Tournament | MatchPulse' };
  }
}

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
