'use client';

import React, { useEffect, useState } from 'react';
import { FiAward, FiGlobe, FiZap, FiActivity } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import Avatar from '@/components/ui/Avatar';
import { api } from '@/lib/api';

export default function GlobalLeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');
  const [boardData, setBoardData] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/leaderboards?period=${period.toUpperCase()}`);
        if (res.data?.success) {
          setBoardData(res.data.data.leaderboard);
          setMyRank(res.data.data.userRank);
        }
      } catch (err) {
        toast.error('Failed to load leaderboard standings.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Leaderboard Workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-white">Standings & Rankings</h1>
              <p className="text-sm text-gray-400 mt-0.5 font-sans">Compete globally and track your leaderboard ranking</p>
            </div>

            {/* Period selector */}
            <div className="flex gap-1.5 p-1 bg-dark-800 rounded-xl border border-purple-500/10">
              {(['weekly', 'monthly', 'all_time'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    period === p
                      ? 'bg-purple-600 text-white shadow shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p === 'all_time' ? 'All Time' : p}
                </button>
              ))}
            </div>
          </div>

          {/* User placement panel highlights */}
          {myRank && (
            <Card className="p-4 bg-purple-500/10 border border-purple-500/25 max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">Your Placement</h4>
                  <p className="text-xs text-purple-300">You are currently ranked #{myRank.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-heading font-black text-lg text-cyan-400">{myRank.score.toLocaleString()} pts</span>
              </div>
            </Card>
          )}

          {/* Main ranking board */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : boardData.length === 0 ? (
            <Card className="p-16 text-center text-gray-500 bg-dark-800/20 border border-dashed border-purple-500/10">
              <FiAward className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="font-semibold text-lg text-white mb-1">No standings recorded</p>
              <p className="text-sm text-gray-400">Scores from finished multiplayer games will be displayed here.</p>
            </Card>
          ) : (
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md max-w-2xl mx-auto">
              <div className="space-y-2">
                {boardData.map((entry: any, index: number) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-dark-900/60 border border-purple-500/5 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-heading ${
                          rank === 1
                            ? 'bg-yellow-500 text-dark-900 shadow-md shadow-yellow-500/20'
                            : rank === 2
                            ? 'bg-gray-300 text-dark-900'
                            : rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-dark-800 text-gray-400'
                        }`}>
                          {rank}
                        </span>
                        
                        <Avatar name={entry.userName} src={entry.userAvatar} size="xs" />
                        <span className="font-heading font-semibold text-white">{entry.userName}</span>
                      </div>

                      <div>
                        <span className="font-heading font-extrabold text-cyan-400">
                          {entry.score.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">pts</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
import { toast } from 'react-hot-toast';
