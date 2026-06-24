'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiAward, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import Avatar from '@/components/ui/Avatar';
import { api } from '@/lib/api';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get(`/users/profile/${id || ''}`);
        if (res.data?.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load profile.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Spinner size="lg" />
      </div>
    );
  }

  const { stats, levelProgress } = profile;

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Profile workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

            <Avatar name={profile.name} src={profile.avatar} size="lg" className="w-24 h-24 border-2 border-purple-500/35" />

            <div className="text-center md:text-left flex-grow space-y-3 relative z-10">
              <h1 className="text-3xl font-extrabold font-heading text-white">{profile.name}</h1>
              <div className="flex justify-center md:justify-start items-center gap-4 text-xs font-bold text-gray-400">
                <span className="bg-purple-950/40 border border-purple-800/30 px-2.5 py-1 rounded-full text-purple-300">
                  LEVEL {levelProgress.level}
                </span>
                <span>{levelProgress.xp} Total XP</span>
              </div>
              <ProgressBar value={levelProgress.xpProgress} target={levelProgress.xpNeeded} className="h-2 w-full md:w-80" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Games Played" value={stats.totalGamesPlayed} icon={<FiTrendingUp className="text-purple-400" />} />
            <StatsCard title="Accuracy rate" value={`${stats.averageAccuracy}%`} icon={<FiTarget className="text-cyan-400" />} />
            <StatsCard title="Achievements" value={stats.achievementsUnlocked} icon={<FiAward className="text-pink-400" />} />
            <StatsCard title="Current Streak" value={`${profile.streakDays || 0} Days`} icon={<FiZap className="text-yellow-400" />} />
          </div>

          {/* Badges showcase section */}
          <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md">
            <h3 className="text-lg font-bold font-heading text-white mb-4 border-b border-purple-500/10 pb-2 flex items-center gap-2">
              <FiAward className="text-purple-400" /> Unlocked Badges
            </h3>

            {stats.achievementsUnlocked === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6 font-sans">
                No achievements unlocked yet. Play more quiz sessions to earn badges!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Custom badge loops will fetch user achievements array from profile if populated */}
                <div className="p-4 bg-dark-900/60 rounded-xl border border-purple-500/5 text-center space-y-1">
                  <span className="text-3xl">🎮</span>
                  <h4 className="text-sm font-bold font-heading text-white">First Blood</h4>
                  <p className="text-[10px] text-gray-400">Completed 1st game session</p>
                </div>
                <div className="p-4 bg-dark-900/60 rounded-xl border border-purple-500/5 text-center space-y-1 animate-pulse">
                  <span className="text-3xl">🔥</span>
                  <h4 className="text-sm font-bold font-heading text-white">Streak King</h4>
                  <p className="text-[10px] text-gray-400">Maintained streak count</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
import { toast } from 'react-hot-toast';
