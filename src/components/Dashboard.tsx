import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ServerStatus } from './dashboard/ServerStatus';
import { ModerationLogs } from './dashboard/ModerationLogs';
import { EconomyLeaderboard } from './dashboard/EconomyLeaderboard';
import { ServerControl } from './dashboard/ServerControl';
import {
  LayoutDashboard,
  Shield,
  Wallet,
  Settings,
  LogOut,
  Server,
  Menu,
  X
} from 'lucide-react';

type Tab = 'overview' | 'moderation' | 'economy' | 'server' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'server', name: 'Server Control', icon: Server },
    { id: 'moderation', name: 'Moderation', icon: Shield },
    { id: 'economy', name: 'Economy', icon: Wallet },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">DayZ Bot Dashboard</h1>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-800"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <span className="block px-3 py-2 text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64">
            <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as Tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                  <ServerStatus />
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <ModerationLogs limit={5} />
                    <EconomyLeaderboard limit={5} />
                  </div>
                </div>
              )}

              {activeTab === 'server' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Server Control</h2>
                  <ServerControl />
                </div>
              )}

              {activeTab === 'moderation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Moderation Logs</h2>
                  <ModerationLogs limit={25} />
                </div>
              )}

              {activeTab === 'economy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Economy Leaderboard</h2>
                  <EconomyLeaderboard limit={50} />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      Configure your bot settings using the <code className="bg-blue-200 px-2 py-1 rounded">/setup</code> command in Discord.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
