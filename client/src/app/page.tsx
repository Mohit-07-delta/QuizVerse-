'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiPlay, FiCpu, FiGlobe, FiAward, FiShield, FiTrendingUp } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-dark-900">
      {/* Background Animated Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <main className="flex-grow z-10 flex flex-col justify-center py-20 px-4 md:px-8 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Animated Badge */}
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/5">
              🚀 Next-Generation AI Quiz Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold font-heading tracking-tight leading-none text-white mb-6"
          >
            Learn. Play.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
              Conquer.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-sans leading-relaxed"
          >
            Create live multiplayer quiz rooms in seconds. Generate questions automatically with AI, track analytics, climb leaderboard rankings, and integrate directly with Wikipedia.
          </motion.p>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2">
                Get Started Free
              </Button>
            </Link>
            <Link href="/play" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-base font-bold flex items-center justify-center gap-2">
                <FiPlay /> Join Lobby
              </Button>
            </Link>
          </motion.div>

          {/* Floating mock-up grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left"
          >
            {/* Feature 1 */}
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative group hover:border-purple-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
                <FiCpu className="text-xl" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white mb-2">AI Generator</h3>
              <p className="text-sm text-gray-400 font-sans">
                Paste any text, topic, or Wikipedia URL to auto-generate beautiful multiplayer quizzes instantly.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative group hover:border-cyan-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-600 group-hover:text-white transition">
                <FiGlobe className="text-xl" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white mb-2">Live Multiplayer</h3>
              <p className="text-sm text-gray-400 font-sans">
                Host games with real-time timers, streaks, combos, QR code invites, and custom room pins.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative group hover:border-pink-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 group-hover:bg-pink-600 group-hover:text-white transition">
                <FiAward className="text-xl" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white mb-2">XP & Achievements</h3>
              <p className="text-sm text-gray-400 font-sans">
                Level up as you play, earn badges, track weak topics, and climb weekly global leaderboards.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
