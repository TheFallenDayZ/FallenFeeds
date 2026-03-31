import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Wallet } from 'lucide-react';

interface User {
  id: string;
  username: string;
  balance: number;
  level: number;
  xp: number;
}

interface Props {
  limit?: number;
}

export function EconomyLeaderboard({ limit = 50 }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('discord_users')
        .select('*')
        .order('balance', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
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

  if (users.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <Wallet size={24} />
          <div>
            <h3 className="font-semibold">No Economy Data</h3>
            <p className="text-sm">Users will appear here once they start using economy commands.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Top Users</h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`rounded-lg p-4 flex items-center justify-between transition ${
              index < 3
                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200'
                : 'bg-white border border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold w-12 text-center">{getMedalEmoji(index)}</span>
              <div>
                <p className="font-semibold text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-600">Level {user.level} • {user.xp} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600 text-lg">
                ${user.balance.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
