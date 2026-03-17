'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { SportIcon } from '@/components/matches/sport-icon'
import { getOrgTournaments } from '@/lib/api/tournaments'
import { formatDate, cn } from '@/lib/utils'
import { Plus, Trophy } from 'lucide-react'

interface Tournament {
  _id: string
  name: string
  sportType?: string
  sport?: string
  format: string
  status: string
  startDate?: string
  endDate?: string
}

const STATUS_FILTERS = ['all', 'draft', 'active', 'completed'] as const

export default function OrgTournamentsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await getOrgTournaments(orgId)
        setTournaments(res as unknown as Tournament[])
      } catch (err) {
        console.error('Failed to fetch tournaments', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [orgId])

  const filtered = statusFilter === 'all'
    ? tournaments
    : tournaments.filter((t) => t.status === statusFilter)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
        <Button asChild>
          <Link href={`/tournament/new?orgId=${orgId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Tournament
          </Link>
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tournament Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No tournaments found"
          description={statusFilter === 'all' ? 'Create your first tournament to get started.' : `No ${statusFilter} tournaments.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Link key={t._id} href={`/tournament/${t._id}/manage`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <SportIcon sport={t.sportType || t.sport || ''} className="h-6 w-6" />
                    <Badge variant={t.status === 'active' ? 'accent' : t.status === 'completed' ? 'default' : 'outline'}>
                      {t.status}
                    </Badge>
                  </div>
                  <h3 className="mb-1 font-semibold">{t.name}</h3>
                  <p className="text-sm capitalize text-muted-foreground">{t.format.replace('_', ' ')}</p>
                  {t.startDate && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(t.startDate)}
                      {t.endDate && ` - ${formatDate(t.endDate)}`}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
