import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, AlertTriangle } from 'lucide-react';

interface ModerationLog {
  id: string;
  action: string;
  user_id: string;
  moderator_id: string;
  reason: string;
  created_at: string;
}

interface Props {
  limit?: number;
}

export function ModerationLogs({ limit = 25 }: Props) {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'ban':
        return 'bg-red-100 text-red-800';
      case 'kick':
        return 'bg-orange-100 text-orange-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'timeout':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <Shield size={24} />
          <div>
            <h3 className="font-semibold">No Moderation Logs</h3>
            <p className="text-sm">Moderation actions will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-orange-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Recent Actions</h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                    {log.action.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">User:</span> {log.user_id}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Moderator:</span> {log.moderator_id}
                </p>
                {log.reason && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Reason:</span> {log.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
