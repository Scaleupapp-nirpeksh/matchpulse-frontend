'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrganization, updateOrganization } from '@/lib/api/organizations'
import { toast } from 'sonner'
import { Save, AlertTriangle } from 'lucide-react'

const settingsSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
})

type SettingsForm = z.infer<typeof settingsSchema>

interface Org {
  id: string
  name: string
  slug: string
  description?: string
  primaryColor?: string
  secondaryColor?: string
}

export default function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    async function fetchOrg() {
      try {
        const org = await getOrganization(orgId) as unknown as Org
        reset({
          name: org.name,
          slug: org.slug,
          description: org.description || '',
          primaryColor: org.primaryColor || '#3b82f6',
          secondaryColor: org.secondaryColor || '#1e40af',
        })
      } catch (err) {
        console.error('Failed to fetch org', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrg()
  }, [orgId, reset])

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateOrganization(orgId, data)
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input {...register('name')} />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <Input {...register('slug')} />
              {errors.slug && <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>}
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
                <label className="mb-1 block text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" {...register('primaryColor')} className="h-10 w-10 cursor-pointer rounded border" />
                  <Input {...register('primaryColor')} className="flex-1" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" {...register('secondaryColor')} className="h-10 w-10 cursor-pointer rounded border" />
                  <Input {...register('secondaryColor')} className="flex-1" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={!isDirty || isSubmitting} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Danger Zone</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting an organization is permanent and cannot be undone. All associated tournaments, teams, and matches will be lost.
          </p>
          <Button variant="danger" className="mt-4" disabled>
            Delete Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
