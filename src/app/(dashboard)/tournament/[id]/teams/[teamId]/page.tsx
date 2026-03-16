'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getTeam, addPlayer, removePlayer } from '@/lib/api/teams'
import { toast } from 'sonner'
import { UserPlus, Trash2, Shield, Star } from 'lucide-react'

interface Player {
  id: string
  name: string
  jerseyNumber?: number
  position?: string
  isCaptain?: boolean
}

interface Team {
  id: string
  name: string
  shortName?: string
  color?: string
  seed?: number
  players: Player[]
}

export default function TeamDetailPage() {
  const { id: tournamentId, teamId } = useParams<{ id: string; teamId: string }>()
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [playerForm, setPlayerForm] = useState({ name: '', jerseyNumber: '', position: '', isCaptain: false })
  const [submitting, setSubmitting] = useState(false)

  const fetchTeam = async () => {
    try {
      const res = await getTeam(teamId)
      setTeam(res as unknown as Team)
    } catch (err) {
      console.error('Failed to fetch team', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [tournamentId, teamId])

  const handleAddPlayer = async () => {
    if (!playerForm.name) return
    setSubmitting(true)
    try {
      await addPlayer(teamId, {
        name: playerForm.name,
        jerseyNumber: playerForm.jerseyNumber ? Number(playerForm.jerseyNumber) : undefined,
        position: playerForm.position || undefined,
        isCaptain: playerForm.isCaptain,
      })
      toast.success('Player added')
      setPlayerForm({ name: '', jerseyNumber: '', position: '', isCaptain: false })
      setShowAddPlayer(false)
      fetchTeam()
    } catch {
      toast.error('Failed to add player')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemovePlayer = async (playerId: string) => {
    try {
      await removePlayer(teamId, playerId)
      toast.success('Player removed')
      fetchTeam()
    } catch {
      toast.error('Failed to remove player')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!team) {
    return <p className="text-muted-foreground">Team not found.</p>
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-full"
          style={{ backgroundColor: team.color || '#6b7280' }}
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {team.shortName && <span>{team.shortName}</span>}
            {team.seed && <span>Seed #{team.seed}</span>}
            <span>{team.players.length} players</span>
          </div>
        </div>
      </div>

      {/* Add Player */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Player Roster</h2>
        <Button onClick={() => setShowAddPlayer(!showAddPlayer)} size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>

      {showAddPlayer && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium">Name *</label>
                <Input
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  placeholder="Player name"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs font-medium">Jersey #</label>
                <Input
                  type="number"
                  value={playerForm.jerseyNumber}
                  onChange={(e) => setPlayerForm({ ...playerForm, jerseyNumber: e.target.value })}
                  placeholder="#"
                />
              </div>
              <div className="w-32">
                <label className="mb-1 block text-xs font-medium">Position</label>
                <Input
                  value={playerForm.position}
                  onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                  placeholder="Forward"
                />
              </div>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={playerForm.isCaptain}
                  onChange={(e) => setPlayerForm({ ...playerForm, isCaptain: e.target.checked })}
                  className="rounded"
                />
                Captain
              </label>
              <Button onClick={handleAddPlayer} disabled={submitting || !playerForm.name}>
                {submitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Jersey #</th>
                  <th className="px-6 py-3 font-medium">Position</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {team.players.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No players yet. Add players to the roster.
                    </td>
                  </tr>
                ) : (
                  team.players.map((player) => (
                    <tr key={player.id} className="border-b last:border-0">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          {player.name}
                          {player.isCaptain && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Star className="h-3 w-3" />
                              Captain
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono">{player.jerseyNumber ?? '-'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{player.position || '-'}</td>
                      <td className="px-6 py-4">
                        {player.isCaptain && <Shield className="h-4 w-4 text-amber-500" />}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayer(player.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
