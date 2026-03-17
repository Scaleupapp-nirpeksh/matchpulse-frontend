'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronLeft, Save, Loader2, Smartphone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/api/notifications';
import { toast } from 'sonner';

interface NotificationPref {
  match_start: boolean;
  match_end: boolean;
  score_update: boolean;
  wicket: boolean;
  goal: boolean;
  tournament_update: boolean;
  system: boolean;
}

const EVENT_TYPES: { key: keyof NotificationPref; label: string; description: string }[] = [
  {
    key: 'match_start',
    label: 'Match Start',
    description: 'When a match you follow starts',
  },
  {
    key: 'match_end',
    label: 'Match End',
    description: 'When a match you follow ends with final result',
  },
  {
    key: 'score_update',
    label: 'Score Updates',
    description: 'Major score changes and milestones',
  },
  {
    key: 'wicket',
    label: 'Wickets (Cricket)',
    description: 'When a batsman is dismissed in cricket matches',
  },
  {
    key: 'goal',
    label: 'Goals (Football)',
    description: 'When a goal is scored in football matches',
  },
  {
    key: 'tournament_update',
    label: 'Tournament Updates',
    description: 'New fixtures, schedule changes, results',
  },
  {
    key: 'system',
    label: 'System Notifications',
    description: 'Account updates, new features, announcements',
  },
];

const DEFAULT_PREFS: NotificationPref = {
  match_start: true,
  match_end: true,
  score_update: true,
  wicket: true,
  goal: true,
  tournament_update: true,
  system: true,
};

export default function NotificationPreferencesPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { permission, isSubscribed, isSupported, subscribe, unsubscribe, isLoading: pushLoading } =
    usePushNotifications();

  const [prefs, setPrefs] = useState<NotificationPref>(DEFAULT_PREFS);

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      try {
        const res = await getNotificationPreferences();
        const d = (res as unknown as { data: { preferences: NotificationPref } })?.data;
        return d?.preferences || DEFAULT_PREFS;
      } catch {
        // If endpoint doesn't exist yet, use defaults
        return DEFAULT_PREFS;
      }
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (data) setPrefs(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateNotificationPreferences({ preferences: prefs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notification preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleToggle = (key: keyof NotificationPref) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success('Push notifications disabled');
    } else {
      const ok = await subscribe();
      if (ok) toast.success('Push notifications enabled');
      else if (permission === 'denied') toast.error('Notifications blocked. Enable in browser settings.');
      else toast.error('Could not enable push notifications');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <Bell size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to manage notifications</h2>
          <Link href="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-sm text-gray-500">
            Control which notifications you receive
          </p>
        </div>
      </div>

      {/* Push Notification Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone size={18} className="text-emerald-600" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get real-time alerts on your device when matches start or scores update
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupported ? (
            <p className="text-sm text-gray-500">
              Push notifications are not supported in this browser.
            </p>
          ) : permission === 'denied' ? (
            <p className="text-sm text-amber-600">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isSubscribed ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-xs text-gray-500">
                  {isSubscribed
                    ? 'You will receive push notifications'
                    : 'Enable to get alerts on your device'}
                </p>
              </div>
              <button
                onClick={handlePushToggle}
                disabled={pushLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isSubscribed ? 'bg-emerald-500' : 'bg-gray-200'
                } ${pushLoading ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSubscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Type Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell size={18} className="text-emerald-600" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which events you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {EVENT_TYPES.map(({ key, label, description }, i) => (
                <div key={key}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        prefs[key] ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          prefs[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail size={18} className="text-emerald-600" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Email digest and summary options (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 italic">
            Email notification settings will be available in a future update.
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
