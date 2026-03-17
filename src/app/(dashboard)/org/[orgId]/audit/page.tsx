'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { getOrgAuditLogs, exportAuditLogs } from '@/lib/api/audit';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

interface AuditResponse {
  auditLogs: AuditLog[];
  pagination: { total: number; pages: number; page: number };
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'Created', color: 'bg-emerald-100 text-emerald-700' },
  update: { label: 'Updated', color: 'bg-blue-100 text-blue-700' },
  delete: { label: 'Deleted', color: 'bg-red-100 text-red-700' },
  login: { label: 'Login', color: 'bg-gray-100 text-gray-700' },
  invite: { label: 'Invited', color: 'bg-purple-100 text-purple-700' },
  join: { label: 'Joined', color: 'bg-emerald-100 text-emerald-700' },
  score: { label: 'Scored', color: 'bg-amber-100 text-amber-700' },
  start: { label: 'Started', color: 'bg-emerald-100 text-emerald-700' },
  end: { label: 'Ended', color: 'bg-blue-100 text-blue-700' },
  pause: { label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  resume: { label: 'Resumed', color: 'bg-emerald-100 text-emerald-700' },
  status_change: { label: 'Status Changed', color: 'bg-blue-100 text-blue-700' },
};

const ENTITY_TYPES = [
  { key: '', label: 'All Types' },
  { key: 'tournament', label: 'Tournament' },
  { key: 'match', label: 'Match' },
  { key: 'team', label: 'Team' },
  { key: 'player', label: 'Player' },
  { key: 'organization', label: 'Organization' },
  { key: 'user', label: 'User' },
];

function getActionBadge(action: string) {
  const config = ACTION_LABELS[action] || {
    label: action.replace(/_/g, ' '),
    color: 'bg-gray-100 text-gray-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function buildDescription(log: AuditLog): string {
  const entity = log.entityName || log.entityType || 'item';
  const user = log.userName || log.userEmail || 'Someone';
  const action = ACTION_LABELS[log.action]?.label?.toLowerCase() || log.action.replace(/_/g, ' ');
  return `${user} ${action} ${log.entityType} "${entity}"`;
}

export default function AuditLogPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', orgId, page, entityType],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 25 };
      if (entityType) params.entityType = entityType;
      const res = await getOrgAuditLogs(orgId, params);
      const d = res as unknown as { data: AuditResponse };
      return d?.data || (res as unknown as AuditResponse);
    },
  });

  const logs = data?.auditLogs || [];
  const pagination = data?.pagination;

  // Client-side search filter
  const filtered = searchQuery.trim()
    ? logs.filter(
        (log) =>
          (log.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.entityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.entityType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: Record<string, unknown> = {};
      if (entityType) params.entityType = entityType;
      const res = await exportAuditLogs(orgId, params);
      // Download the CSV blob
      const blob = new Blob([res as unknown as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${orgId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Audit log exported');
    } catch {
      toast.error('Failed to export audit log');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track all actions and changes in your organization
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="gap-1.5"
        >
          <Download size={14} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {ENTITY_TYPES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No audit logs found"
          description={
            entityType
              ? `No logs found for ${entityType} actions`
              : 'Organization activity will appear here'
          }
        />
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div
                key={log._id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {buildDescription(log)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getActionBadge(log.action)}
                    <Badge variant="default" size="sm">
                      {log.entityType}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} />
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {pagination.total} total entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-2">
              {page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.pages}
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
