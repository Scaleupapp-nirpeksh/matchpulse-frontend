'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Building2,
  Trophy,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SportIcon } from '@/components/matches/sport-icon';
import { getOrganizationBySlug } from '@/lib/api/organizations';
import { getTournaments } from '@/lib/api/tournaments';
import { getSportConfig } from '@/lib/sports-config';
import { formatDate } from '@/lib/utils';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations';
import type { Tournament } from '@/types/tournament';

interface OrgData {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  [key: string]: unknown;
}

function OrgSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="flex items-center gap-5 mb-10">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrganizationPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: orgData,
    isLoading: orgLoading,
    error: orgError,
  } = useQuery({
    queryKey: ['org', slug],
    queryFn: async () => {
      const res = await getOrganizationBySlug(slug);
      return ((res as unknown as { data: OrgData }).data ?? (res as unknown as OrgData)) as OrgData;
    },
    enabled: !!slug,
  });

  const org = orgData as OrgData | undefined;
  const orgId = org?._id || org?.id;

  const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['org-tournaments', orgId],
    queryFn: async () => {
      const res = await getTournaments({ organization: orgId });
      return ((res as unknown as { data: Tournament[] }).data ?? (res as unknown as Tournament[])) as Tournament[];
    },
    enabled: !!orgId,
  });

  const tournaments = Array.isArray(tournamentsData) ? tournamentsData : [];

  if (orgLoading) {
    return <OrgSkeleton />;
  }

  if (orgError || !org) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Organization not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The organization &ldquo;{slug}&rdquo; does not exist.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const logoSrc = org.logoUrl || org.logo;
  const primaryColor = org.primaryColor || '#10B981';

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Back nav */}
        <motion.div {...fadeIn} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Home</span>
          </Link>
        </motion.div>

        {/* Org Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={org.name}
                  className="w-12 h-12 object-contain rounded-lg"
                />
              ) : (
                <Building2
                  size={28}
                  style={{ color: primaryColor }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {org.name}
              </h1>
              {org.description && (
                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                  {org.description}
                </p>
              )}
              {/* Color swatches */}
              {(org.primaryColor || org.secondaryColor) && (
                <div className="flex items-center gap-3 mt-3">
                  {org.primaryColor && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: org.primaryColor }}
                      />
                      <span className="text-xs text-gray-400">Primary</span>
                    </div>
                  )}
                  {org.secondaryColor && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: org.secondaryColor }}
                      />
                      <span className="text-xs text-gray-400">Secondary</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Tournaments
            </h2>
            {tournaments.length > 0 && (
              <span className="text-sm text-gray-400">
                ({tournaments.length})
              </span>
            )}
          </div>

          {tournamentsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : tournaments.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {tournaments.map((tournament) => {
                const tId = tournament.id || tournament._id;
                const sportConfig = getSportConfig(tournament.sportType);
                return (
                  <motion.div key={tId} variants={staggerItem}>
                    <Link href={`/tournament/${tId}`}>
                      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <SportIcon
                            sport={tournament.sportType}
                            size={20}
                            showBackground
                          />
                          <Badge
                            variant={
                              tournament.status === 'active'
                                ? 'accent'
                                : tournament.status === 'completed'
                                ? 'default'
                                : 'warning'
                            }
                            size="sm"
                            className="capitalize"
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                          {tournament.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {sportConfig.name}
                          {tournament.format && (
                            <span className="text-gray-400">
                              {' '}
                              &middot;{' '}
                              {tournament.format.replace(/_/g, ' ')}
                            </span>
                          )}
                        </p>
                        {(tournament.startDate || tournament.endDate) && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>
                              {tournament.startDate &&
                                formatDate(tournament.startDate)}
                              {tournament.endDate &&
                                ` - ${formatDate(tournament.endDate)}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <EmptyState
              icon={Trophy}
              title="No tournaments yet"
              description="This organization has not created any tournaments yet"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
