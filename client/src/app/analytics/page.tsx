'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrendingUp, FiTarget, FiActivity, FiArrowUpRight, FiBookOpen } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Spinner } from '@/components/ui/Spinner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/users/analytics');
        if (res.data?.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load analytics.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Spinner size="lg" />
      </div>
    );
  }

  const { summary, categoryBreakdown, history } = analytics;

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-5xl mx-auto space-y-6">
          <div className="pb-4 border-b border-purple-500/10">
            <h1 className="text-3xl font-extrabold font-heading text-white">Performance Insights</h1>
            <p className="text-sm text-gray-400 mt-0.5 font-sans">Track your learning curve, strengths, and weak topics</p>
          </div>

          {/* Aggregated Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Games Played" value={summary.totalGames} icon={<FiActivity className="text-purple-400" />} />
            <StatsCard title="Avg Accuracy" value={`${summary.averageAccuracy}%`} icon={<FiTarget className="text-cyan-400" />} />
            <StatsCard title="Total Score" value={summary.totalScore.toLocaleString()} icon={<FiTrendingUp className="text-pink-400" />} />
            <StatsCard title="Avg Score" value={summary.averageScore} icon={<FiBookOpen className="text-yellow-400" />} />
          </div>

          {/* Splits: Categories & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category breakdowns */}
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md">
              <h3 className="text-lg font-bold font-heading text-white mb-4 flex items-center gap-2">
                <FiTarget className="text-purple-400" /> Category Breakdown
              </h3>

              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10 font-sans">
                  No data to display. Play a game first!
                </p>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-300 capitalize">
                        <span>{item.category} ({item.games} plays)</span>
                        <span>{item.averageAccuracy}% accuracy</span>
                      </div>
                      <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-purple-500/5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                          style={{ width: `${item.averageAccuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Session History list */}
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-white mb-4 flex items-center gap-2">
                  <FiActivity className="text-cyan-400" /> Recent Activity
                </h3>

                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-10 font-sans">
                    No recent games. Get active!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {history.map((game: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-lg bg-dark-900/60 border border-purple-500/5 text-xs text-gray-300"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{game.quizTitle || 'Quiz session'}</span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(game.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-cyan-400 block">+{game.score} pts</span>
                          <span className="text-[10px] text-gray-500">{game.accuracy}% Acc</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
import { toast } from 'react-hot-toast';
