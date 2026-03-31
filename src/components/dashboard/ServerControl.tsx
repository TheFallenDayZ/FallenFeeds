import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Server, Play, Square, RotateCw, Ban, FileText } from 'lucide-react';

interface ServerData {
  id: string;
  guild_id: string;
  server_name: string;
  nitrado_id: string;
  status: string;
  players_online: number;
  max_players: number;
}

export function ServerControl() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const { data, error } = await supabase
        .from('dayz_servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServers(data || []);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerAction = async (action: string) => {
    setActionLoading(action);
    alert(`Server ${action} functionality requires Discord bot commands. Use /${action}server in Discord.`);
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-blue-800">
          <Server size={24} />
          <div>
            <h3 className="font-semibold">No Servers Configured</h3>
            <p className="text-sm">Use the /setup command in Discord to configure your Nitrado server.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {servers.map((server) => (
        <div key={server.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{server.server_name}</h3>
              <p className="text-sm text-gray-600">Nitrado ID: {server.nitrado_id}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold ${
                server.status === 'started'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {server.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-800">
                {server.status === 'started' ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Players</p>
              <p className="text-lg font-semibold text-gray-800">
                {server.players_online}/{server.max_players}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Guild ID</p>
              <p className="text-sm font-mono text-gray-800 truncate">{server.guild_id}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Server ID</p>
              <p className="text-sm font-mono text-gray-800">{server.nitrado_id}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleServerAction('start')}
              disabled={actionLoading === 'start' || server.status === 'started'}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              Start Server
            </button>

            <button
              onClick={() => handleServerAction('stop')}
              disabled={actionLoading === 'stop' || server.status !== 'started'}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square size={18} />
              Stop Server
            </button>

            <button
              onClick={() => handleServerAction('restart')}
              disabled={actionLoading === 'restart'}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw size={18} />
              Restart Server
            </button>

            <button
              onClick={() => handleServerAction('banlist')}
              disabled={actionLoading === 'banlist'}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban size={18} />
              View Bans
            </button>

            <button
              onClick={() => handleServerAction('logs')}
              disabled={actionLoading === 'logs'}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={18} />
              View Logs
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Server control actions are performed through Discord bot commands.
              Use the corresponding slash commands in your Discord server for actual server management.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
