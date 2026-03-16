'use client';

import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { ROLE_HIERARCHY } from '@/lib/constants';

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(() => {
    const userRole = user?.role ?? 'player';
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;

    function hasRole(role: string): boolean {
      return userRole === role;
    }

    function hasMinRole(minRole: string): boolean {
      const minLevel = ROLE_HIERARCHY[minRole] ?? 0;
      return userLevel >= minLevel;
    }

    function canManageTournament(tournamentId?: string): boolean {
      // Platform admins and org admins can manage any tournament
      if (userLevel >= (ROLE_HIERARCHY.org_admin ?? 4)) return true;
      // Tournament admins can manage their assigned tournaments
      // (Full check would involve checking tournament assignments server-side)
      if (hasRole('tournament_admin') && tournamentId) return true;
      return false;
    }

    const isAdmin = userLevel >= (ROLE_HIERARCHY.platform_admin ?? 5);
    const isOrgAdmin = userLevel >= (ROLE_HIERARCHY.org_admin ?? 4);
    const isTournamentAdmin = userLevel >= (ROLE_HIERARCHY.tournament_admin ?? 3);
    const isScorer = userLevel >= (ROLE_HIERARCHY.scorer ?? 2);

    return {
      hasRole,
      hasMinRole,
      canManageTournament,
      isAdmin,
      isOrgAdmin,
      isTournamentAdmin,
      isScorer,
      userRole,
      userLevel,
    };
  }, [user]);
}
