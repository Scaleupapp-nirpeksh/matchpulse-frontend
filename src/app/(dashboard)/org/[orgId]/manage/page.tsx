'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getOrganization,
  updateOrganization,
  getMembers,
  createInvite,
} from '@/lib/api/organizations';
import { uploadLogo } from '@/lib/api/upload';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Settings,
  Users,
  Mail,
  Search,
  UserPlus,
  Copy,
  Shield,
  Crown,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';

interface OrgData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  ownerId: string;
}

interface MemberData {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  user?: string | { _id: string; fullName: string; email: string; avatarUrl?: string; role: string };
  joinedAt?: string;
}

interface InviteData {
  _id: string;
  code?: string;
  email?: string;
  role: string;
  expiresAt?: string;
  used?: boolean;
}

const settingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().max(500).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const inviteSchema = z.object({
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  role: z.string().min(1, 'Select a role'),
  expiresInDays: z.string().optional(),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function ManageOrganizationPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch org data
  const { data: org, isLoading: loadingOrg } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => getOrganization(orgId) as unknown as Promise<OrgData>,
  });

  // Fetch members
  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => getMembers(orgId) as unknown as Promise<MemberData[]>,
  });

  // Settings form
  const {
    register: registerSettings,
    handleSubmit: handleSettingsSubmit,
    setValue: setSettingsValue,
    watch: watchSettings,
    formState: { errors: settingsErrors, isDirty: settingsDirty },
    reset: resetSettings,
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: {
      name: org?.name ?? '',
      description: org?.description ?? '',
      primaryColor: org?.primaryColor ?? '#10B981',
      secondaryColor: org?.secondaryColor ?? '#059669',
    },
  });

  const primaryColor = watchSettings('primaryColor');
  const secondaryColor = watchSettings('secondaryColor');

  // Invite form
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
    reset: resetInvite,
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'scorer', expiresInDays: '7' },
  });

  // Update org mutation
  const updateMutation = useMutation({
    mutationFn: (data: SettingsForm) =>
      updateOrganization(orgId, data as Record<string, unknown>),
    onSuccess: () => {
      toast.success('Organization updated');
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
    },
    onError: () => {
      toast.error('Failed to update organization');
    },
  });

  // Create invite mutation
  const [lastInvite, setLastInvite] = useState<{ code: string; url: string } | null>(null);
  const inviteMutation = useMutation({
    mutationFn: (data: InviteForm) =>
      createInvite(orgId, {
        email: data.email || undefined,
        role: data.role,
        expiresInDays: data.expiresInDays ? Number(data.expiresInDays) : 7,
      }) as unknown as Promise<{ inviteCode: string; inviteUrl: string; role: string }>,
    onSuccess: (result) => {
      const code = result?.inviteCode;
      const url = result?.inviteUrl;
      if (code) {
        navigator.clipboard?.writeText(url || code);
        toast.success('Invite link copied to clipboard! Share it with the member.');
        setLastInvite({ code, url: url || '' });
      } else {
        toast.success('Invite created');
      }
      resetInvite();
      setInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['org-invites', orgId] });
    },
    onError: () => {
      toast.error('Failed to create invite');
    },
  });

  // Backend returns flat User objects (with fullName, email, role directly on the object)
  const getMemberName = (m: MemberData) => {
    if (m.fullName) return m.fullName;
    if (typeof m.user === 'object' && m.user?.fullName) return m.user.fullName;
    return 'Unknown';
  };
  const getMemberEmail = (m: MemberData) => {
    if (m.email) return m.email;
    if (typeof m.user === 'object' && m.user?.email) return m.user.email;
    return '';
  };
  const getMemberId = (m: MemberData) => m._id || (typeof m.user === 'object' ? m.user?._id : '') || '';
  const getMemberRole = (m: MemberData) => m.role;

  const filteredMembers = members.filter((m) => {
    if (!memberSearch) return true;
    const search = memberSearch.toLowerCase();
    return (
      getMemberName(m).toLowerCase().includes(search) ||
      getMemberEmail(m).toLowerCase().includes(search)
    );
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'platform_admin':
      case 'org_admin':
        return 'accent' as const;
      case 'tournament_admin':
        return 'warning' as const;
      case 'scorer':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const roleOptions = [
    { value: 'org_admin', label: 'Org Admin' },
    { value: 'tournament_admin', label: 'Tournament Admin' },
    { value: 'scorer', label: 'Scorer' },
    { value: 'player', label: 'Player' },
  ];

  if (loadingOrg) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!org) {
    return (
      <EmptyState
        icon={Building2}
        title="Organization not found"
        description="The organization you are looking for does not exist or you do not have access."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{org.name}</h1>
        {org.description && (
          <p className="mt-1 text-text-secondary">{org.description}</p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Mail className="mr-2 h-4 w-4" />
            Invites
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Update your organization details and branding</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSettingsSubmit((data) => updateMutation.mutate(data))}
                className="space-y-5"
              >
                {/* Logo Upload */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface transition-colors hover:border-accent hover:bg-accent/5"
                  >
                    {logoPreview || org?.logoUrl ? (
                      <img src={logoPreview || org?.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-text-tertiary group-hover:text-accent" />
                    )}
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoPreview(URL.createObjectURL(file));
                      setUploadingLogo(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = (await uploadLogo(formData)) as unknown as { url: string };
                        await updateOrganization(orgId, { logoUrl: res.url } as Record<string, unknown>);
                        queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
                        toast.success('Logo updated');
                      } catch {
                        toast.error('Failed to upload logo');
                        setLogoPreview(null);
                      } finally {
                        setUploadingLogo(false);
                      }
                    }}
                  />
                  <p className="mt-2 text-xs text-text-tertiary">
                    {uploadingLogo ? 'Uploading...' : 'Click to change logo'}
                  </p>
                </div>

                <Input
                  label="Organization Name"
                  {...registerSettings('name')}
                  error={settingsErrors.name?.message}
                />

                <Textarea
                  label="Description"
                  {...registerSettings('description')}
                  placeholder="Describe your organization..."
                  rows={3}
                  error={settingsErrors.description?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-primary">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor || '#10B981'}
                        onChange={(e) => setSettingsValue('primaryColor', e.target.value, { shouldDirty: true })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                      />
                      <Input {...registerSettings('primaryColor')} className="flex-1" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-primary">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor || '#059669'}
                        onChange={(e) => setSettingsValue('secondaryColor', e.target.value, { shouldDirty: true })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                      />
                      <Input {...registerSettings('secondaryColor')} className="flex-1" />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!settingsDirty}
                  loading={updateMutation.isPending}
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              {loadingMembers ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : filteredMembers.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-tertiary">
                  {memberSearch ? 'No members match your search' : 'No members yet'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((member, i) => {
                    const name = getMemberName(member);
                    const email = getMemberEmail(member);
                    const id = getMemberId(member);
                    const role = getMemberRole(member);
                    return (
                      <div
                        key={id || i}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm font-medium text-text-secondary">
                            {name[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {name}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {email}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getRoleBadgeVariant(role)}>
                          {role.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invite Members</CardTitle>
                  <CardDescription>Create invite codes to add new members</CardDescription>
                </div>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Invite</DialogTitle>
                      <DialogDescription>
                        Generate an invite code or send directly to an email address
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleInviteSubmit((data) => inviteMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <Input
                        label="Email (optional)"
                        {...registerInvite('email')}
                        placeholder="member@example.com"
                        error={inviteErrors.email?.message}
                      />

                      <Select
                        label="Role"
                        {...registerInvite('role')}
                        options={roleOptions}
                        error={inviteErrors.role?.message}
                      />

                      <Select
                        label="Expires In"
                        {...registerInvite('expiresInDays')}
                        options={[
                          { value: '1', label: '1 day' },
                          { value: '7', label: '7 days' },
                          { value: '14', label: '14 days' },
                          { value: '30', label: '30 days' },
                        ]}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setInviteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" loading={inviteMutation.isPending}>
                          Create Invite
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {lastInvite ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                    <p className="text-sm font-medium text-text-primary mb-2">Latest Invite Link</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-surface px-3 py-2 text-xs text-text-primary break-all">
                        {lastInvite.url}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard?.writeText(lastInvite.url);
                          toast.success('Copied!');
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-text-tertiary">
                      Share this link with the person you want to invite. Email delivery may take a few minutes.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-text-tertiary">
                  Create invite codes above to invite new members to your organization.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
