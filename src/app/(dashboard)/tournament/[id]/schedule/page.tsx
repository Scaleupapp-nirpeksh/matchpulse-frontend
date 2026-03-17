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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { getTournamentMatches, createMatch, updateMatch, matchLifecycle } from '@/lib/api/matches'
import { getTournamentTeams } from '@/lib/api/teams'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Calendar, X, Pencil, Ban, Clock, Play } from 'lucide-react'

interface Team {
  _id: string
  name: string
}

interface Match {
  _id: string
  teamA?: { _id: string; name: string; shortName?: string }
  teamB?: { _id: string; name: string; shortName?: string }
  status: string
  resultSummary?: { scoreA?: string; scoreB?: string }
  scheduledAt?: string
  venue?: string | null
  stage?: string
  groupName?: string
  matchNumber?: number
}

const STATUS_FILTERS = ['all', 'scheduled', 'live', 'completed', 'postponed', 'cancelled'] as const

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

  // Edit dialog state
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [editForm, setEditForm] = useState({ scheduledAt: '', venue: '', stage: '' })
  const [saving, setSaving] = useState(false)

  // Cancel/postpone confirmation
  const [confirmAction, setConfirmAction] = useState<{ match: Match; action: 'cancel' | 'postpone' } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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
  const groups = [...new Set(matches.map((m) => m.groupName).filter(Boolean))]

  const filtered = matches.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (stageFilter !== 'all' && m.stage !== stageFilter && m.groupName !== stageFilter) return false
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

  const openEditDialog = (match: Match, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditMatch(match)
    setEditForm({
      scheduledAt: match.scheduledAt ? match.scheduledAt.slice(0, 16) : '',
      venue: match.venue || '',
      stage: match.stage || '',
    })
  }

  const handleEditSave = async () => {
    if (!editMatch) return
    setSaving(true)
    try {
      await updateMatch(editMatch._id, {
        scheduledAt: editForm.scheduledAt || undefined,
        venue: editForm.venue || undefined,
        stage: editForm.stage || undefined,
      } as Record<string, unknown>)
      toast.success('Match updated')
      setEditMatch(null)
      fetchData()
    } catch {
      toast.error('Failed to update match')
    } finally {
      setSaving(false)
    }
  }

  const openConfirmAction = (match: Match, action: 'cancel' | 'postpone', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmAction({ match, action })
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      await matchLifecycle(confirmAction.match._id, { action: confirmAction.action })
      toast.success(`Match ${confirmAction.action === 'cancel' ? 'cancelled' : 'postponed'}`)
      setConfirmAction(null)
      fetchData()
    } catch {
      toast.error(`Failed to ${confirmAction.action} match`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResume = async (match: Match, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await matchLifecycle(match._id, { action: 'start' })
      toast.success('Match resumed')
      fetchData()
    } catch {
      toast.error('Failed to resume match')
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

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'live': return 'live' as const
      case 'completed': return 'default' as const
      case 'cancelled': return 'danger' as const
      case 'postponed': return 'warning' as const
      default: return 'outline' as const
    }
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
                    <option key={t._id} value={t._id}>{t.name}</option>
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
                  {teams.filter((t) => t._id !== form.homeTeamId).map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
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
            <Link key={match._id} href={`/match/${match._id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{match.teamA?.name ?? 'TBD'}</p>
                    </div>
                    {match.resultSummary?.scoreA ? (
                      <div className="rounded bg-muted px-3 py-1 font-mono text-sm font-bold">
                        {match.resultSummary.scoreA} - {match.resultSummary.scoreB}
                      </div>
                    ) : (
                      <div className="rounded bg-muted px-3 py-1 text-sm text-muted-foreground">
                        vs
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{match.teamB?.name ?? 'TBD'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {match.status === 'live' && <LiveIndicator />}
                    <Badge variant={statusBadgeVariant(match.status)}>
                      {match.status}
                    </Badge>
                    {match.scheduledAt && (
                      <span className="text-sm text-muted-foreground">{formatDate(match.scheduledAt)}</span>
                    )}
                    {match.venue && (
                      <span className="text-xs text-muted-foreground">{match.venue}</span>
                    )}

                    {/* Action buttons */}
                    {match.status === 'postponed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleResume(match, e)}
                        title="Resume match"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {['scheduled', 'live', 'postponed'].includes(match.status) && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => openEditDialog(match, e)}
                          title="Edit match"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {match.status !== 'postponed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => openConfirmAction(match, 'postpone', e)}
                            title="Postpone match"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => openConfirmAction(match, 'cancel', e)}
                          title="Cancel match"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Edit Match Dialog */}
      <Dialog open={!!editMatch} onOpenChange={() => setEditMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
            <DialogDescription>
              {editMatch?.teamA?.name ?? 'TBD'} vs {editMatch?.teamB?.name ?? 'TBD'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Date & Time</label>
              <Input
                type="datetime-local"
                value={editForm.scheduledAt}
                onChange={(e) => setEditForm({ ...editForm, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Venue</label>
              <Input
                value={editForm.venue}
                onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                placeholder="Enter venue"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Stage</label>
              <Input
                value={editForm.stage}
                onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                placeholder="e.g. group_stage, semi_final"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMatch(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel/Postpone Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === 'cancel' ? 'Cancel Match' : 'Postpone Match'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === 'cancel'
                ? 'Are you sure you want to cancel this match? This action cannot be undone.'
                : 'This match will be postponed and can be resumed later.'}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmAction?.match.teamA?.name ?? 'TBD'} vs {confirmAction?.match.teamB?.name ?? 'TBD'}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Go Back
            </Button>
            <Button
              variant={confirmAction?.action === 'cancel' ? 'danger' : 'default'}
              onClick={handleConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Processing...'
                : confirmAction?.action === 'cancel'
                  ? 'Cancel Match'
                  : 'Postpone Match'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
