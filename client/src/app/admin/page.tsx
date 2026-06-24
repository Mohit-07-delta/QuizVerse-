'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiShield, FiTrendingUp, FiActivity, FiUsers, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Spinner } from '@/components/ui/Spinner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Access denied. Admin role required.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Spinner size="lg" />
      </div>
    );
  }

  const { overview, topQuizzes } = stats;

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
          <div className="pb-4 border-b border-purple-500/10 flex items-center gap-2">
            <FiShield className="text-2xl text-purple-400" />
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-white">Administration Console</h1>
              <p className="text-sm text-gray-400 mt-0.5 font-sans">Moderate reports, configure leaderboards, and monitor system metrics</p>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Users" value={overview.totalUsers} icon={<FiUsers className="text-purple-400" />} />
            <StatsCard title="Total Quizzes" value={overview.totalQuizzes} icon={<FiAward className="text-cyan-400" />} />
            <StatsCard title="Games Played" value={overview.totalGamesPlayed} icon={<FiActivity className="text-pink-400" />} />
            <StatsCard title="Active Sessions" value={overview.activeGames} icon={<FiTrendingUp className="text-yellow-400" />} />
          </div>

          {/* Top Quizzes */}
          <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md">
            <h3 className="text-lg font-bold font-heading text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-purple-400" /> Top Performer Quizzes
            </h3>

            {topQuizzes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6 font-sans">
                No quiz session data recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {topQuizzes.map((quiz: any, index: number) => (
                  <div
                    key={quiz.id}
                    className="flex justify-between items-center p-3 bg-dark-900/60 rounded-lg border border-purple-500/5 text-xs text-gray-300"
                  >
                    <div>
                      <span className="font-bold text-white block">{quiz.title}</span>
                      <span className="text-[10px] text-gray-500">
                        Category: <span className="capitalize">{quiz.category}</span> • Created by {quiz.creator?.name || 'Admin'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-cyan-400 block">{quiz.plays} plays</span>
                      <span className="text-[10px] text-gray-500">Rating: {quiz.rating.toFixed(1)}⭐</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
