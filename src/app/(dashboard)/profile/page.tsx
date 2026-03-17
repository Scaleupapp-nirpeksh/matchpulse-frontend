'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SportIcon } from '@/components/matches/sport-icon';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile, changePassword } from '@/lib/api/auth';
import { uploadAvatar } from '@/lib/api/upload';
import { SPORT_LIST } from '@/lib/constants';
import { SPORT_CONFIGS } from '@/lib/sports-config';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Camera, Save, User, LogOut, Lock, Shield } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [preferredSports, setPreferredSports] = useState<string[]>([]);
  const [showPhoto, setShowPhoto] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Profile form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', bio: '' },
  });

  const bio = watch('bio') || '';

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // Initialize from user
  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName || '', bio: user.bio || '' });
      setPreferredSports(user.preferredSports || []);
      setShowPhoto(user.privacySettings?.showPhoto ?? true);
      setShowStats(user.privacySettings?.showStats ?? true);
      if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
    }
  }, [user, reset]);

  // Upload avatar mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return uploadAvatar(formData);
    },
    onSuccess: () => {
      toast.success('Avatar updated');
      refreshUser?.();
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    avatarMutation.mutate(file);
  };

  // Save profile mutation
  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      updateProfile({
        fullName: data.fullName,
        bio: data.bio,
        preferredSports,
        privacySettings: { showPhoto, showStats },
      } as Record<string, unknown>),
    onSuccess: () => {
      toast.success('Profile updated');
      refreshUser?.();
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed');
      resetPassword();
    },
    onError: () => toast.error('Failed to change password'),
  });

  const toggleSport = (sport: string) => {
    setPreferredSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Profile</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-surface"
          disabled={avatarMutation.isPending}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <User className="mx-auto mt-5 h-12 w-12 text-text-tertiary" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <p className="mt-2 text-xs text-text-tertiary">Click to change avatar</p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit((data) => profileMutation.mutate(data))}
        className="space-y-6"
      >
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              {...register('fullName')}
              error={errors.fullName?.message}
            />

            <div>
              <Textarea
                label="Bio"
                {...register('bio')}
                placeholder="Tell us about yourself..."
                rows={3}
                error={errors.bio?.message}
              />
              <p className="mt-1 text-right text-xs text-text-tertiary">
                {bio.length}/200
              </p>
            </div>

            <Input label="Email" value={user.email || ''} readOnly className="bg-surface" />
            {user.phone && (
              <Input label="Phone" value={user.phone} readOnly className="bg-surface" />
            )}
          </CardContent>
        </Card>

        {/* Preferred Sports */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Sports</CardTitle>
            <CardDescription>
              Select the sports you are interested in to personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {SPORT_LIST.map((sport) => {
                const config = SPORT_CONFIGS[sport];
                const isSelected = preferredSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all',
                      isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/40'
                    )}
                  >
                    <SportIcon sport={sport} size={16} />
                    <span className="text-xs font-medium text-text-primary">
                      {config?.name ?? sport}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Shield className="mr-2 inline h-4 w-4" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Show profile photo</p>
                <p className="text-xs text-text-tertiary">Display your photo publicly</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showPhoto}
                onClick={() => setShowPhoto(!showPhoto)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
                  showPhoto ? 'bg-accent' : 'bg-surface border border-border'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    showPhoto ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Show match stats</p>
                <p className="text-xs text-text-tertiary">Display your match statistics publicly</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showStats}
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
                  showStats ? 'bg-accent' : 'bg-surface border border-border'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    showStats ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={!isDirty && preferredSports.join() === (user.preferredSports ?? []).join()}
          loading={profileMutation.isPending}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </form>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Lock className="mr-2 inline h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))}
            className="space-y-4"
          >
            <Input
              label="Current Password"
              type="password"
              {...registerPassword('currentPassword')}
              error={passwordErrors.currentPassword?.message}
            />
            <Input
              label="New Password"
              type="password"
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
            />
            <Input
              label="Confirm New Password"
              type="password"
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
            />
            <Button type="submit" variant="outline" loading={passwordMutation.isPending}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <div className="flex gap-3 pb-8">
        <Button variant="outline" onClick={handleLogout} className="flex-1">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            try {
              const { logoutAll } = await import('@/lib/api/auth');
              await logoutAll();
              await logout();
              toast.success('Logged out from all sessions');
            } catch {
              toast.error('Failed to logout from all sessions');
            }
          }}
          className="flex-1"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout All Sessions
        </Button>
      </div>
    </div>
  );
}
