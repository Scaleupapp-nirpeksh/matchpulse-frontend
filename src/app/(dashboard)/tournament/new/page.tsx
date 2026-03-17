'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SportIcon } from '@/components/matches/sport-icon';
import { createTournament, type CreateTournamentData } from '@/lib/api/tournaments';
import { getOrganizations } from '@/lib/api/organizations';
import { SPORT_LIST, DEFAULT_RULES } from '@/lib/constants';
import { getSportConfig, SPORT_CONFIGS } from '@/lib/sports-config';
import { RulesEditor } from '@/components/tournament/rules-editor';
import { getRuleMeta } from '@/lib/rules-metadata';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  Check,
  Layers,
  Sliders,
  FileText,
  Eye,
} from 'lucide-react';

const STEPS = [
  { label: 'Sport', icon: Trophy },
  { label: 'Format', icon: Layers },
  { label: 'Rules', icon: Sliders },
  { label: 'Details', icon: FileText },
  { label: 'Review', icon: Eye },
] as const;

const FORMAT_OPTIONS = [
  {
    value: 'round_robin',
    label: 'Round Robin',
    description: 'Every team plays against every other team. Best for small groups.',
  },
  {
    value: 'knockout',
    label: 'Knockout',
    description: 'Single elimination bracket. Lose once and you are out.',
  },
  {
    value: 'groups_knockout',
    label: 'Groups + Knockout',
    description: 'Group stage followed by knockout rounds. Classic tournament format.',
  },
  {
    value: 'swiss',
    label: 'Swiss',
    description: 'Teams with similar records play each other. Efficient for large fields.',
  },
];

const detailsSchema = z.object({
  name: z.string().min(2, 'Tournament name is required'),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  venues: z.string().optional(),
});

type DetailsForm = z.infer<typeof detailsSchema>;

export default function NewTournamentPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-secondary">Loading...</div>}>
      <NewTournamentPage />
    </Suspense>
  );
}

function NewTournamentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOrgId = searchParams.get('orgId');

  const [step, setStep] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState(urlOrgId || '');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [rules, setRules] = useState<Record<string, unknown>>({});

  // Fetch organizations
  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations() as unknown as Promise<{ _id: string; name: string }[]>,
    enabled: !urlOrgId,
  });

  // Details form
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      venues: '',
    },
  });

  // Set default rules when sport changes
  useEffect(() => {
    if (selectedSport && DEFAULT_RULES[selectedSport]) {
      setRules({ ...DEFAULT_RULES[selectedSport] });
    }
  }, [selectedSport]);

  // Create tournament mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const details = getValues();
      const payload = {
        organizationId: selectedOrg || urlOrgId,
        sportType: selectedSport,
        format: selectedFormat,
        rulesConfig: rules,
        name: details.name,
        description: details.description,
        startDate: details.startDate,
        endDate: details.endDate || undefined,
        venues: details.venues
          ? details.venues.split(',').map((v: string) => ({ name: v.trim() }))
          : undefined,
      };
      return createTournament(payload as CreateTournamentData) as unknown as {
        _id: string;
        id?: string;
      };
    },
    onSuccess: (result) => {
      toast.success('Tournament created successfully!');
      router.push(`/tournament/${result._id || result.id}/manage`);
    },
    onError: () => {
      toast.error('Failed to create tournament');
    },
  });

  const canProceed = useCallback(() => {
    switch (step) {
      case 0:
        return !!selectedSport && (!!urlOrgId || !!selectedOrg);
      case 1:
        return !!selectedFormat;
      case 2:
        return true;
      case 3:
        return !!getValues('name') && !!getValues('startDate');
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, selectedSport, urlOrgId, selectedOrg, selectedFormat, getValues]);

  const goNext = async () => {
    if (step === 3) {
      const valid = await trigger();
      if (!valid) return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      createMutation.mutate();
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const sportConfig = selectedSport ? getSportConfig(selectedSport) : null;
  const details = getValues();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Trophy className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Create Tournament
          </h1>
          <p className="text-sm text-text-secondary">
            Set up a new tournament in {STEPS.length} easy steps
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                'flex items-center gap-2 transition-colors',
                i > step && 'opacity-40',
                i <= step && 'cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                  i < step
                    ? 'bg-accent text-white'
                    : i === step
                      ? 'bg-accent text-white shadow-sm shadow-accent/30'
                      : 'bg-surface border border-border text-text-tertiary'
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-sm sm:inline',
                  i === step ? 'font-medium text-text-primary' : 'text-text-secondary'
                )}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px w-6 sm:w-10',
                  i < step ? 'bg-accent' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[320px]">
        {/* Step 0: Organization + Sport */}
        {step === 0 && (
          <div className="space-y-5">
            {/* Organization selector */}
            {!urlOrgId && (
              <Select
                label="Organization"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                placeholder="Select an organization"
                options={orgs.map((o) => ({
                  value: o._id,
                  label: o.name,
                }))}
              />
            )}

            {/* Sport grid */}
            <div>
              <label className="mb-3 block text-sm font-medium text-text-primary">
                Select Sport
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SPORT_LIST.map((sport) => {
                  const config = SPORT_CONFIGS[sport];
                  return (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={cn(
                        'flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all',
                        selectedSport === sport
                          ? 'border-accent bg-accent/5 shadow-sm'
                          : 'border-border hover:border-accent/40 hover:bg-surface'
                      )}
                    >
                      <SportIcon sport={sport} size={28} showBackground />
                      <span className="text-xs font-medium text-text-primary">
                        {config?.name ?? sport}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Format */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-primary">
              Tournament Format
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSelectedFormat(f.value)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    selectedFormat === f.value
                      ? 'border-accent bg-accent/5 shadow-sm'
                      : 'border-border hover:border-accent/40 hover:bg-surface'
                  )}
                >
                  <h3 className="text-sm font-semibold text-text-primary">{f.label}</h3>
                  <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Rules */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {sportConfig?.name ?? selectedSport} Rules
              </CardTitle>
              <CardDescription>
                Customize scoring rules for your tournament. Defaults are pre-filled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(rules).length > 0 ? (
                <RulesEditor
                  sportType={selectedSport}
                  rules={rules}
                  onRulesChange={setRules}
                />
              ) : (
                <p className="text-sm text-text-tertiary">
                  No configurable rules for this sport.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Tournament Details</CardTitle>
              <CardDescription>
                Provide the basic information for your tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Input
                label="Tournament Name"
                {...register('name')}
                placeholder="Summer Championship 2026"
                error={errors.name?.message}
              />

              <Textarea
                label="Description"
                {...register('description')}
                placeholder="Brief description of the tournament..."
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  {...register('startDate')}
                  error={errors.startDate?.message}
                />
                <Input
                  label="End Date"
                  type="date"
                  {...register('endDate')}
                />
              </div>

              <Input
                label="Venues (comma-separated)"
                {...register('venues')}
                placeholder="Stadium A, Ground B, Court C"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Tournament</CardTitle>
              <CardDescription>
                Confirm all details before creating the tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Name</span>
                  <span className="text-sm font-medium text-text-primary">
                    {details.name}
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Sport</span>
                  <div className="flex items-center gap-2">
                    <SportIcon sport={selectedSport} size={16} />
                    <Badge variant="sport" sportType={selectedSport.replace(/_/g, '-')}>
                      {sportConfig?.name}
                    </Badge>
                  </div>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Format</span>
                  <Badge variant="accent">
                    {FORMAT_OPTIONS.find((f) => f.value === selectedFormat)?.label ??
                      selectedFormat}
                  </Badge>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Start Date</span>
                  <span className="text-sm text-text-primary">{details.startDate}</span>
                </div>

                {details.endDate && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">End Date</span>
                      <span className="text-sm text-text-primary">{details.endDate}</span>
                    </div>
                  </>
                )}

                {details.venues && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Venues</span>
                      <span className="text-sm text-text-primary">{details.venues}</span>
                    </div>
                  </>
                )}

                {/* Rules summary */}
                {Object.keys(rules).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-text-secondary">Rules</span>
                      <div className="mt-2 space-y-1.5 rounded-lg bg-surface p-3">
                        {Object.entries(rules).map(([key, value]) => {
                          const meta = getRuleMeta(selectedSport, key);
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-text-secondary">
                                {meta.label}
                              </span>
                              <span className="font-mono text-text-primary">
                                {typeof value === 'boolean'
                                  ? value
                                    ? 'Yes'
                                    : 'No'
                                  : `${String(value)}${meta.unit ? ` ${meta.unit}` : ''}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={goBack} disabled={step === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={goNext}
          disabled={!canProceed() || createMutation.isPending}
          loading={createMutation.isPending}
        >
          {step === 4 ? (
            'Create Tournament'
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
