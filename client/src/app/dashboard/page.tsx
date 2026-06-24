'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiCompass, FiBookOpen, FiUser, FiZap, FiTarget, FiAward, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { QuizCard } from '@/components/quiz/QuizCard';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import type { Quiz } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, checkAuth } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    
    if (!user) {
      checkAuth();
    }
  }, [user, token, router, checkAuth]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes/public?limit=3');
        if (res.data?.success) {
          setQuizzes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load recent quizzes.');
      } finally {
        setLoadingQuizzes(false);
      }
    };
    
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate percentage of XP Progress
  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;
  const xpNeededForLevel = currentLevel * 1000;
  const xpBasisForLevel = (currentLevel - 1) * 1000;
  const progress = currentXP - xpBasisForLevel;
  const target = xpNeededForLevel - xpBasisForLevel;

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Dashboard Main Workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-purple-500/10">
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-white">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{user.name}</span>!
              </h1>
              <p className="text-sm text-gray-400 mt-1 font-sans">
                {user.isGuest ? "You're playing as a Guest. Create an account to save achievements!" : "Ready to conquer more quizzes today?"}
              </p>
            </div>
            
            {/* XP Level progression */}
            <div className="w-full md:w-80">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-purple-400 mb-1.5 font-heading">
                <span>Level {user.level}</span>
                <span>{progress}/{target} XP</span>
              </div>
              <ProgressBar value={progress} target={target} className="h-2.5" />
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/create">
              <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-dark-800/40 border border-purple-500/15 backdrop-blur-md hover:border-purple-400/30 transition text-center group cursor-pointer h-full flex flex-col items-center justify-center gap-y-3">
                <FiPlusCircle className="text-3xl text-purple-400 group-hover:scale-110 transition" />
                <div className="flex flex-col gap-y-1">
                  <h3 className="font-heading font-bold text-base text-white">Create Quiz</h3>
                  <p className="text-xs text-gray-400 font-sans">Build manuals or use AI assistant</p>
                </div>
              </Card>
            </Link>

            <Link href="/browse">
              <Card className="p-6 bg-gradient-to-br from-cyan-900/40 to-dark-800/40 border border-cyan-500/15 backdrop-blur-md hover:border-cyan-400/30 transition text-center group cursor-pointer h-full flex flex-col items-center justify-center gap-y-3">
                <FiCompass className="text-3xl text-cyan-400 group-hover:scale-110 transition" />
                <div className="flex flex-col gap-y-1">
                  <h3 className="font-heading font-bold text-base text-white">Browse Quizzes</h3>
                  <p className="text-xs text-gray-400 font-sans">Explore popular community rooms</p>
                </div>
              </Card>
            </Link>

            <Link href="/wikipedia">
              <Card className="p-6 bg-gradient-to-br from-pink-900/40 to-dark-800/40 border border-pink-500/15 backdrop-blur-md hover:border-pink-400/30 transition text-center group cursor-pointer h-full flex flex-col items-center justify-center gap-y-3">
                <FiCpu className="text-3xl text-pink-400 group-hover:scale-110 transition animate-pulse" />
                <div className="flex flex-col gap-y-1">
                  <h3 className="font-heading font-bold text-base text-white">Wikipedia Creator</h3>
                  <p className="text-xs text-gray-400 font-sans">Generate questions from URLs</p>
                </div>
              </Card>
            </Link>

            <Link href="/play">
              <Card className="p-6 bg-gradient-to-br from-green-900/40 to-dark-800/40 border border-green-500/15 backdrop-blur-md hover:border-green-400/30 transition text-center group cursor-pointer h-full flex flex-col items-center justify-center gap-y-3">
                <FiBookOpen className="text-3xl text-green-400 group-hover:scale-110 transition" />
                <div className="flex flex-col gap-y-1">
                  <h3 className="font-heading font-bold text-base text-white">Join Gameplay</h3>
                  <p className="text-xs text-gray-400 font-sans">Enter game PIN to join lobby</p>
                </div>
              </Card>
            </Link>
          </div>

          {/* Quick Stats overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Quizzes Hosted" value={user.quizzesCreated || 0} icon={<FiBookOpen className="text-purple-400" />} />
            <StatsCard title="Games Played" value={user.gamesPlayed || 0} icon={<FiUser className="text-cyan-400" />} />
            <StatsCard title="Accuracy rate" value={`${user.accuracy || 0}%`} icon={<FiTarget className="text-pink-400" />} />
            <StatsCard title="Streak count" value={`${user.streak || 0} Days`} icon={<FiZap className="text-yellow-400" />} />
          </div>

          {/* Quizzes list & leaderboards columns split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Public/Recommended Quizzes */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold font-heading text-white">
                Featured Quizzes
              </h3>
              
              {loadingQuizzes ? (
                <div className="h-40 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : quizzes.length === 0 ? (
                <Card className="p-8 text-center text-gray-500 bg-dark-800/20 border border-purple-500/10">
                  No public quizzes available. Create one to get started!
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz) => (
                    <QuizCard key={quiz.id || quiz._id} quiz={quiz} />
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Showcase list sidebar */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading text-white">
                Recent Achievements
              </h3>
              
              <Card className="p-5 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md space-y-4">
                {user.achievements && user.achievements.length > 0 ? (
                  user.achievements.slice(0, 3).map((ach: any) => (
                    <div key={ach.id || ach._id} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-lg">
                        {ach.icon || '🏅'}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-white">{ach.name}</h4>
                        <p className="text-xs text-gray-400">{ach.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 font-sans">
                    No achievements unlocked yet. Go host or play a game!
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
