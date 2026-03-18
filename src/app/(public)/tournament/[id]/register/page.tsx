'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Zap,
  Trophy,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getRegistrationInfo, type RegistrationInfo } from '@/lib/api/tournaments';
import { publicRegisterTeam } from '@/lib/api/teams';

// --- Schema ---

const playerSchema = z.object({
  name: z.string().min(1, 'Player name is required'),
  jerseyNumber: z
    .union([z.coerce.number().int().min(0).max(999), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),
  position: z.string().optional(),
});

const registrationSchema = z.object({
  teamName: z.string().min(1, 'Team name is required').max(100),
  shortName: z.string().max(5, 'Max 5 characters').optional().or(z.literal('')),
  captainName: z.string().min(1, 'Captain name is required'),
  captainEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  captainPhone: z.string().optional().or(z.literal('')),
  players: z.array(playerSchema).min(1, 'At least one player is required'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// --- Loading skeleton ---

function RegistrationSkeleton() {
  return (
    <div className="min-h-screen bg-bg py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto mb-4" />
          <Skeleton className="h-7 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-40 mx-auto" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </div>
  );
}

// --- Main page ---

export default function TournamentRegistrationPage() {
  const params = useParams();
  const id = params.id as string;

  const [submitted, setSubmitted] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const {
    data: regData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['registration-info', id],
    queryFn: async () => {
      const res = await getRegistrationInfo(id);
      return res.data as RegistrationInfo;
    },
    enabled: !!id,
    retry: 1,
  });

  const tournament = regData?.tournament;
  const registration = regData?.registration;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: '',
      shortName: '',
      captainName: '',
      captainEmail: '',
      captainPhone: '',
      players: [
        { name: '', jerseyNumber: undefined, position: '' },
        { name: '', jerseyNumber: undefined, position: '' },
        { name: '', jerseyNumber: undefined, position: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'players',
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await publicRegisterTeam(id, {
        teamName: data.teamName,
        shortName: data.shortName || undefined,
        captain: {
          name: data.captainName,
          email: data.captainEmail || undefined,
          phone: data.captainPhone || undefined,
        },
        players: data.players.map((p) => ({
          name: p.name,
          jerseyNumber: typeof p.jerseyNumber === 'number' ? p.jerseyNumber : undefined,
          position: p.position || undefined,
        })),
      });
      setRequiresApproval(registration?.requireApproval ?? false);
      setSubmitted(true);
      toast.success('Registration submitted!');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit registration. Please try again.';
      toast.error(message);
    }
  };

  // --- Loading ---
  if (isLoading) {
    return <RegistrationSkeleton />;
  }

  // --- Error ---
  if (error || !regData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full px-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-danger" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Tournament not found
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            This tournament does not exist or registration info is unavailable.
          </p>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- Registration closed ---
  if (!registration?.isAccepting) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full px-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} className="text-danger" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Registration Closed
          </h1>
          <p className="text-sm text-text-secondary mb-2">
            Registration for <span className="font-semibold">{tournament?.name}</span> is
            currently closed.
          </p>
          {registration?.deadline && (
            <p className="text-xs text-text-tertiary mb-6">
              Deadline was {new Date(registration.deadline).toLocaleDateString()}
            </p>
          )}
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- Success state ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full px-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {requiresApproval ? 'Registration Pending Approval' : 'Team Registered!'}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {requiresApproval
              ? 'Your registration has been submitted and is awaiting approval from the tournament organizer. You will be notified once it is reviewed.'
              : 'Your team has been successfully registered for the tournament. Good luck!'}
          </p>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- Registration form ---
  return (
    <div className="min-h-screen bg-bg py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-text-primary">
              Match<span className="text-accent">Pulse</span>
            </span>
          </Link>

          {/* Tournament info */}
          <div className="flex flex-col items-center gap-3">
            {tournament?.logoUrl ? (
              <img
                src={tournament.logoUrl}
                alt={tournament.name}
                className="w-14 h-14 rounded-xl object-contain border border-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Trophy size={24} className="text-accent" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{tournament?.name}</h1>
              {tournament?.organization?.name && (
                <p className="text-sm text-text-secondary mt-1">
                  Organized by {tournament.organization.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {tournament?.sportType && (
                <Badge variant="sport" sportType={tournament.sportType}>
                  {tournament.sportType.replace(/-/g, ' ')}
                </Badge>
              )}
              {tournament?.format && (
                <Badge variant="accent">{tournament.format.replace(/-/g, ' ')}</Badge>
              )}
            </div>
            {tournament?.startDate && (
              <p className="text-xs text-text-tertiary">
                Starts {new Date(tournament.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </motion.div>

        {/* Instructions banner */}
        {registration?.instructions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3"
          >
            <Info size={18} className="text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-text-secondary">{registration.instructions}</p>
          </motion.div>
        )}

        {/* Registration deadline */}
        {registration?.deadline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6 text-center"
          >
            <p className="text-xs text-text-tertiary">
              Registration deadline:{' '}
              <span className="font-medium text-text-secondary">
                {new Date(registration.deadline).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Team Details */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Users size={18} className="text-accent" />
                  Team Details
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Team Name"
                  placeholder="e.g. Thunder Strikers"
                  error={errors.teamName?.message}
                  {...register('teamName')}
                />
                <Input
                  label="Short Name"
                  placeholder="e.g. TS (max 5 chars)"
                  maxLength={5}
                  error={errors.shortName?.message}
                  {...register('shortName')}
                />
              </CardContent>
            </Card>

            {/* Captain Details */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Users size={18} className="text-accent" />
                  Captain Details
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Captain Name"
                  placeholder="Full name"
                  error={errors.captainName?.message}
                  {...register('captainName')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="captain@example.com"
                    error={errors.captainEmail?.message}
                    {...register('captainEmail')}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    error={errors.captainPhone?.message}
                    {...register('captainPhone')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Players */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <Users size={18} className="text-accent" />
                    Players
                  </h2>
                  <Badge variant="default">{fields.length} players</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.players?.root?.message && (
                  <p className="text-xs text-danger">{errors.players.root.message}</p>
                )}
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-border bg-surface p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-tertiary">
                        Player {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-text-tertiary hover:text-danger transition-colors p-1 rounded"
                          aria-label={`Remove player ${index + 1}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Player name"
                      error={errors.players?.[index]?.name?.message}
                      {...register(`players.${index}.name`)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Jersey #"
                        type="number"
                        min={0}
                        max={999}
                        error={errors.players?.[index]?.jerseyNumber?.message}
                        {...register(`players.${index}.jerseyNumber`)}
                      />
                      <Input
                        placeholder="Position"
                        error={errors.players?.[index]?.position?.message}
                        {...register(`players.${index}.position`)}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    append({ name: '', jerseyNumber: undefined, position: '' })
                  }
                >
                  <Plus size={16} />
                  Add Player
                </Button>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Register Team'}
            </Button>

            {registration?.requireApproval && (
              <p className="text-xs text-text-tertiary text-center">
                Registrations require approval from the tournament organizer.
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
