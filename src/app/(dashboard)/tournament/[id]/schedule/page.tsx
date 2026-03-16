'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { LiveIndicator } from '@/components/matches/live-indicator'
import { getTournamentMatches, createMatch } from '@/lib/api/matches'
import { getTournamentTeams } from '@/lib/api/teams'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Calendar, X } from 'lucide-react'

interface Team {
  id: string
  name: string
}

interface Match {
  id: string
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
  status: string
  score?: { home: number; away: number }
  scheduledAt?: string
  venue?: string
  stage?: string
  group?: string
}

const STATUS_FILTERS = ['all', 'scheduled', 'live', 'completed'] as const

export default function SchedulePage() {
  const { id: tournamentId } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ homeTeamId: '', awayTeamId: '', scheduledAt: '', venue: '' })

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        getTournamentMatches(tournamentId),
        getTournamentTeams(tournamentId),
      ])
      setMatches(matchesRes as unknown as Match[])
      setTeams(teamsRes as unknown as Team[])
    } catch (err) {
      console.error('Failed to fetch schedule data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tournamentId])

  const stages = [...new Set(matches.map((m) => m.stage).filter(Boolean))]
  const groups = [...new Set(matches.map((m) => m.group).filter(Boolean))]

  const filtered = matches.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (stageFilter !== 'all' && m.stage !== stageFilter && m.group !== stageFilter) return false
    return true
  })

  const handleCreateMatch = async () => {
    if (!form.homeTeamId || !form.awayTeamId) return
    setCreating(true)
    try {
      await createMatch({
        tournament: tournamentId,
        homeTeam: form.homeTeamId,
        awayTeam: form.awayTeamId,
        scheduledAt: form.scheduledAt || new Date().toISOString(),
        venue: form.venue || undefined,
      })
      toast.success('Match created')
      setForm({ homeTeamId: '', awayTeamId: '', scheduledAt: '', venue: '' })
      setShowCreateForm(false)
      fetchData()
    } catch {
      toast.error('Failed to create match')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Match Schedule</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Match
        </Button>
      </div>

      {/* Create Match Form */}
      {showCreateForm && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Create Match</h3>
              <button onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium">Home Team *</label>
                <select
                  value={form.homeTeamId}
                  onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium">Away Team *</label>
                <select
                  value={form.awayTeamId}
                  onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select team</option>
                  {teams.filter((t) => t.id !== form.homeTeamId).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-44">
                <label className="mb-1 block text-xs font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              </div>
              <div className="w-36">
                <label className="mb-1 block text-xs font-medium">Venue</label>
                <Input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Venue"
                />
              </div>
              <Button onClick={handleCreateMatch} disabled={creating || !form.homeTeamId || !form.awayTeamId}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
        {(stages.length > 0 || groups.length > 0) && (
          <>
            <div className="mx-2 h-8 w-px bg-border" />
            <button
              onClick={() => setStageFilter('all')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                stageFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              All stages
            </button>
            {[...stages, ...groups].map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s!)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  stageFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {s}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Match List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No matches found"
          description="Create a match or generate fixtures from the tournament dashboard."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => (
            <Link key={match.id} href={`/match/${match.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{match.homeTeam.name}</p>
                    </div>
                    {match.score ? (
                      <div className="rounded bg-muted px-3 py-1 font-mono text-lg font-bold">
                        {match.score.home} - {match.score.away}
                      </div>
                    ) : (
                      <div className="rounded bg-muted px-3 py-1 text-sm text-muted-foreground">
                        vs
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{match.awayTeam.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {match.status === 'live' && <LiveIndicator />}
                    <Badge variant={match.status === 'live' ? 'live' : match.status === 'completed' ? 'default' : 'outline'}>
                      {match.status}
                    </Badge>
                    {match.scheduledAt && (
                      <span className="text-sm text-muted-foreground">{formatDate(match.scheduledAt)}</span>
                    )}
                    {match.venue && (
                      <span className="text-xs text-muted-foreground">{match.venue}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
