'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  getTournamentTeams,
  createTeam,
  deleteTeam,
  addPlayer,
  removePlayer,
  bulkImportTeams,
  type CreateTeamData,
} from '@/lib/api/teams';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Upload,
  Users,
  ChevronDown,
  ChevronUp,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';

interface TeamData {
  _id: string;
  name: string;
  shortName?: string;
  color?: string;
  seed?: number;
  players?: PlayerData[];
}

interface PlayerData {
  _id?: string;
  playerId?: string;
  name: string;
  jerseyNumber?: number;
  position?: string;
  isCaptain?: boolean;
}

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  shortName: z.string().max(5).optional(),
  color: z.string().optional(),
  seed: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

const playerSchema = z.object({
  name: z.string().min(1, 'Player name is required'),
  jerseyNumber: z.string().optional(),
  position: z.string().optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

export default function TeamsPage() {
  const { id: tournamentId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch teams
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['tournament-teams', tournamentId],
    queryFn: () => getTournamentTeams(tournamentId) as unknown as Promise<TeamData[]>,
  });

  // Add team form
  const {
    register: registerTeam,
    handleSubmit: handleTeamSubmit,
    formState: { errors: teamErrors },
    reset: resetTeam,
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: '', shortName: '', color: '#10B981', seed: '' },
  });

  // Add player form
  const {
    register: registerPlayer,
    handleSubmit: handlePlayerSubmit,
    formState: { errors: playerErrors },
    reset: resetPlayer,
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: { name: '', jerseyNumber: '', position: '' },
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (data: TeamFormValues) =>
      createTeam({
        name: data.name,
        shortName: data.shortName || undefined,
        tournament: tournamentId,
        seed: data.seed ? Number(data.seed) : undefined,
        color: data.color,
      } as CreateTeamData),
    onSuccess: () => {
      toast.success('Team added');
      resetTeam();
      setAddTeamOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tournament-teams', tournamentId] });
    },
    onError: () => {
      toast.error('Failed to add team');
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      toast.success('Team deleted');
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['tournament-teams', tournamentId] });
    },
    onError: () => {
      toast.error('Failed to delete team');
    },
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: PlayerFormValues }) =>
      addPlayer(teamId, {
        name: data.name,
        jerseyNumber: data.jerseyNumber ? Number(data.jerseyNumber) : undefined,
        position: data.position || undefined,
      }),
    onSuccess: () => {
      toast.success('Player added');
      resetPlayer();
      queryClient.invalidateQueries({ queryKey: ['tournament-teams', tournamentId] });
    },
    onError: () => {
      toast.error('Failed to add player');
    },
  });

  // Remove player mutation
  const removePlayerMutation = useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      removePlayer(teamId, playerId),
    onSuccess: () => {
      toast.success('Player removed');
      queryClient.invalidateQueries({ queryKey: ['tournament-teams', tournamentId] });
    },
    onError: () => {
      toast.error('Failed to remove player');
    },
  });

  // Bulk import handler
  const handleBulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('file', file);
        await bulkImportTeams(tournamentId, formData);
        toast.success('Teams imported successfully');
        queryClient.invalidateQueries({ queryKey: ['tournament-teams', tournamentId] });
      } catch {
        toast.error('Failed to import teams');
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Teams</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team</DialogTitle>
                <DialogDescription>Add a new team to this tournament</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleTeamSubmit((data) => createTeamMutation.mutate(data))}
                className="space-y-4"
              >
                <Input
                  label="Team Name"
                  {...registerTeam('name')}
                  placeholder="Team Name"
                  error={teamErrors.name?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Short Name"
                    {...registerTeam('shortName')}
                    placeholder="TN"
                    maxLength={5}
                  />
                  <Input
                    label="Seed"
                    type="number"
                    {...registerTeam('seed')}
                    placeholder="#"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-primary">Color</label>
                  <input
                    type="color"
                    {...registerTeam('color')}
                    className="h-10 w-20 cursor-pointer rounded-lg border border-border"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddTeamOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createTeamMutation.isPending}>
                    Add Team
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Add teams to your tournament to get started."
          action={
            <Button onClick={() => setAddTeamOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Team
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const isExpanded = expandedTeam === team._id;
            const players = team.players ?? [];

            return (
              <Card key={team._id} className="overflow-hidden">
                {/* Color bar */}
                <div className="h-1" style={{ backgroundColor: team.color || '#6B7280' }} />

                <CardContent className="p-4">
                  {/* Team header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full shrink-0"
                        style={{ backgroundColor: team.color || '#6B7280' }}
                      />
                      <div>
                        <h3 className="font-semibold text-text-primary">{team.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          {team.shortName && <span>{team.shortName}</span>}
                          <span>{players.length} player{players.length !== 1 ? 's' : ''}</span>
                          {team.seed && <span>Seed #{team.seed}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedTeam(isExpanded ? null : team._id)}
                      className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface hover:text-text-primary transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded: Players + Add Player + Delete */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      <Separator />

                      {/* Players list */}
                      {players.length === 0 ? (
                        <p className="py-2 text-center text-xs text-text-tertiary">
                          No players added yet
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {players.map((player) => (
                            <div
                              key={player._id || player.playerId || player.name}
                              className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                {player.jerseyNumber != null && (
                                  <span className="text-xs font-mono font-bold text-text-secondary">
                                    #{player.jerseyNumber}
                                  </span>
                                )}
                                <span className="text-sm text-text-primary">{player.name}</span>
                                {player.position && (
                                  <Badge size="sm">{player.position}</Badge>
                                )}
                                {player.isCaptain && (
                                  <Badge variant="accent" size="sm">C</Badge>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  removePlayerMutation.mutate({
                                    teamId: team._id,
                                    playerId: player._id || player.playerId || '',
                                  })
                                }
                                className="rounded p-1 text-text-tertiary hover:text-danger transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Player Form */}
                      <form
                        onSubmit={handlePlayerSubmit((data) =>
                          addPlayerMutation.mutate({ teamId: team._id, data })
                        )}
                        className="flex items-end gap-2"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Player name"
                            {...registerPlayer('name')}
                            className="h-8 text-xs"
                          />
                        </div>
                        <Input
                          placeholder="#"
                          {...registerPlayer('jerseyNumber')}
                          type="number"
                          className="h-8 w-14 text-xs"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          loading={addPlayerMutation.isPending}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                      </form>

                      <Separator />

                      {/* Delete Team */}
                      {deleteConfirm === team._id ? (
                        <div className="flex items-center justify-between rounded-lg bg-danger/5 border border-danger/20 px-3 py-2">
                          <span className="text-xs text-danger">Delete this team?</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => deleteTeamMutation.mutate(team._id)}
                              loading={deleteTeamMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-danger hover:text-danger hover:bg-danger/5"
                          onClick={() => setDeleteConfirm(team._id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete Team
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
