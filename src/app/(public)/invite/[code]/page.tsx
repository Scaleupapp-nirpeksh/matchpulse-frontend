'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Building2,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { joinOrganization, getOrganizationBySlug } from '@/lib/api/organizations';
import { toast } from 'sonner';
import { fadeIn } from '@/lib/animations';

interface InviteInfo {
  organization?: {
    _id?: string;
    name?: string;
    slug?: string;
    description?: string;
    logo?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  orgName?: string;
  role?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

function InviteSkeleton() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-6" />
          <Skeleton className="h-7 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-72 mx-auto mb-8" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  // Try to fetch invite info — the API may or may not support this
  // For now we show the invite code and let the user join
  const {
    data: inviteData,
    isLoading: inviteLoading,
    error: inviteError,
  } = useQuery({
    queryKey: ['invite', code],
    queryFn: async () => {
      // Attempt to get invite details. If the API does not have a dedicated
      // invite info endpoint, we gracefully fall back.
      try {
        const res = await fetch(`/api/organizations/invites/${code}`);
        if (!res.ok) return null;
        return (await res.json()) as InviteInfo;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const invite = inviteData as InviteInfo | null;
  const orgName = invite?.organization?.name || invite?.orgName || 'Organization';
  const orgLogo = invite?.organization?.logoUrl || invite?.organization?.logo;
  const orgColor = invite?.organization?.primaryColor || '#10B981';

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinOrganization(code);
      setJoined(true);
      toast.success(`Successfully joined ${orgName}!`);
      // Redirect to the organization page after a moment
      const slug = invite?.organization?.slug;
      setTimeout(() => {
        if (slug) {
          router.push(`/org/${slug}`);
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to join organization. The invite may be expired or invalid.';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || inviteLoading) {
    return <InviteSkeleton />;
  }

  // Successfully joined
  if (joined) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md px-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome aboard!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            You have successfully joined {orgName}. Redirecting you now...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Redirecting...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6"
      >
        <div className="text-center">
          {/* Org icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-200"
            style={{ backgroundColor: `${orgColor}10` }}
          >
            {orgLogo ? (
              <img
                src={orgLogo}
                alt={orgName}
                className="w-10 h-10 object-contain rounded-lg"
              />
            ) : (
              <Building2 size={28} style={{ color: orgColor }} />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re invited!
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            You have been invited to join
          </p>
          <p className="text-lg font-semibold text-gray-900 mb-1">
            {orgName}
          </p>
          {invite?.role && (
            <p className="text-sm text-gray-400 capitalize mb-8">
              as {invite.role.replace(/_/g, ' ')}
            </p>
          )}
          {!invite?.role && <div className="mb-8" />}

          {/* Invite code display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-8">
            <span className="text-xs text-gray-400 block mb-1">
              Invite Code
            </span>
            <span className="text-sm font-mono font-medium text-gray-700">
              {code}
            </span>
          </div>

          {/* Actions */}
          {isAuthenticated ? (
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleJoin}
                loading={joining}
              >
                <UserPlus size={16} />
                Join Organization
              </Button>
              <p className="text-xs text-gray-400">
                Signed in as{' '}
                <span className="font-medium text-gray-600">
                  {user?.email || user?.fullName}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/invite/${code}`}
                className="block"
              >
                <Button size="lg" className="w-full gap-2">
                  <LogIn size={16} />
                  Log in to join
                </Button>
              </Link>
              <p className="text-xs text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/register?redirect=/invite/${code}`}
                  className="text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
