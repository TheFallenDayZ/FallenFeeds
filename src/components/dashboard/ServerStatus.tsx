import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Server, Users, Activity } from 'lucide-react';

interface ServerData {
  server_name: string;
  status: string;
  players_online: number;
  max_players: number;
  updated_at: string;
}

export function ServerStatus() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
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
            <p className="text-sm">Use the /setup command in Discord to configure your server.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {servers.map((server) => {
        const isOnline = server.status === 'started';
        const statusColor = isOnline ? 'bg-green-500' : 'bg-red-500';

        return (
          <div
            key={server.server_name}
            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}></div>
                <h3 className="text-xl font-bold text-gray-800">{server.server_name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {server.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Activity className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-800">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Players</p>
                  <p className="font-semibold text-gray-800">
                    {server.players_online}/{server.max_players}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Server className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(server.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
