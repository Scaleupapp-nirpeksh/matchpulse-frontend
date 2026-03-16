'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getMembers, createInvite } from '@/lib/api/organizations'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { UserPlus, Copy, X } from 'lucide-react'

interface Member {
  id: string
  fullName: string
  email?: string
  role: string
  joinedAt: string
}

const ROLES = [
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'tournament_admin', label: 'Tournament Admin' },
  { value: 'scorer', label: 'Scorer' },
  { value: 'player', label: 'Player' },
]

export default function MembersPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteRole, setInviteRole] = useState('player')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await getMembers(orgId)
        setMembers(res as unknown as Member[])
      } catch (err) {
        console.error('Failed to fetch members', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [orgId])

  const handleInvite = async () => {
    setInviting(true)
    try {
      const res = await createInvite(orgId, {
        role: inviteRole,
        email: inviteEmail || undefined,
        phone: invitePhone || undefined,
      }) as unknown as { code: string }
      setInviteCode(res.code)
      toast.success('Invite created')
    } catch {
      toast.error('Failed to create invite')
    } finally {
      setInviting(false)
    }
  }

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      toast.success('Code copied to clipboard')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <Button onClick={() => { setShowInvite(true); setInviteCode(null) }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Invite Member</h3>
              <button onClick={() => setShowInvite(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteCode ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Share this invite code:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-4 py-2 font-mono text-lg font-bold">
                    {inviteCode}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email (optional)</label>
                  <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
                  <Input value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} placeholder="+1234567890" />
                </div>
                <Button onClick={handleInvite} disabled={inviting} className="w-full">
                  {inviting ? 'Creating...' : 'Generate Invite Code'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No members yet. Invite someone to get started.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="px-6 py-4 font-medium">{m.fullName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{m.email || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{m.role.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(m.joinedAt)}</td>
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
