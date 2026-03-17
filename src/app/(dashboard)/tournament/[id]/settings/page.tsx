'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getTournament, updateTournament, updateTournamentStatus } from '@/lib/api/tournaments'
import { toast } from 'sonner'
import { Save, AlertTriangle, XCircle } from 'lucide-react'

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  venues: z.string().optional(),
})

type SettingsForm = z.infer<typeof settingsSchema>

interface Tournament {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  venues?: Array<string | { name: string; address?: string; _id?: string }>
  rules?: Record<string, number>
  status: string
}

export default function TournamentSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await getTournament(id) as unknown as Tournament
        setTournament(res)
        reset({
          name: res.name,
          description: res.description || '',
          startDate: res.startDate ? res.startDate.split('T')[0] : '',
          endDate: res.endDate ? res.endDate.split('T')[0] : '',
          venues: res.venues?.map((v) => typeof v === 'string' ? v : v.name).join(', ') || '',
        })
      } catch (err) {
        console.error('Failed to fetch tournament', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTournament()
  }, [id, reset])

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateTournament(id, {
        ...data,
        venues: data.venues ? data.venues.split(',').map((v) => v.trim()) : [],
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this tournament? This action cannot be undone.')) return
    setCancelling(true)
    try {
      await updateTournamentStatus(id, 'cancelled')
      toast.success('Tournament cancelled')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to cancel tournament')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!tournament) {
    return <p className="text-muted-foreground">Tournament not found.</p>
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tournament Settings</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input {...register('name')} />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Start Date</label>
                <Input type="date" {...register('startDate')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">End Date</label>
                <Input type="date" {...register('endDate')} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Venues (comma-separated)</label>
              <Input {...register('venues')} placeholder="Stadium A, Ground B" />
            </div>

            <Button type="submit" disabled={!isDirty || isSubmitting} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Rules (read-only) */}
      {tournament.rules && Object.keys(tournament.rules).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-3 font-semibold">Rules</h3>
            <div className="space-y-2">
              {Object.entries(tournament.rules).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Danger Zone</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Cancelling a tournament is permanent. All scheduled matches will be voided.
          </p>
          <Button variant="danger" className="mt-4" onClick={handleCancel} disabled={cancelling}>
            <XCircle className="mr-2 h-4 w-4" />
            {cancelling ? 'Cancelling...' : 'Cancel Tournament'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
