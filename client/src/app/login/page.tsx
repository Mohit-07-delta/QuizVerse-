'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiCpu, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  
  const { login, guestLogin } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const randomName = "Guest_" + Math.floor(1000 + Math.random() * 9000);
      await guestLogin(randomName, "avatar1");
      toast.success('Joined as Guest!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Failed to login as guest.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-dark-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold font-heading text-white">
            <FiCpu className="text-purple-500 text-3xl animate-pulse" />
            <span>QuizVerse <span className="text-cyan-400">AI</span></span>
          </Link>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
            Sign in to continue conquering
          </p>
        </div>

        <Card className="p-8 bg-dark-800/40 border border-purple-500/15 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@domain.com"
              icon={<FiMail className="text-gray-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<FiLock className="text-gray-400" />}
              required
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-[1px] bg-purple-500/10" />
            <span className="px-3 text-xs text-gray-500 font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow h-[1px] bg-purple-500/10" />
          </div>

          {/* Guest Mode */}
          <Button
            type="button"
            variant="secondary"
            disabled={guestLoading}
            onClick={handleGuestLogin}
            className="w-full py-3 flex items-center justify-center gap-2 border-purple-500/20 bg-dark-900/50 hover:bg-dark-900 text-purple-300 font-semibold"
          >
            <FiUser /> Play as Guest
          </Button>

          <p className="text-center text-xs text-gray-400 mt-6 font-sans">
            Don't have an account?{' '}
            <Link href="/register" className="text-cyan-400 font-bold hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
