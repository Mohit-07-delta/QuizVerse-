'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

const AVATAR_OPTIONS = [
  'avatar1',
  'avatar2',
  'avatar3',
  'avatar4',
  'avatar5',
  'avatar6',
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, avatar);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
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
        className="w-full max-w-md relative z-10 my-8"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold font-heading text-white">
            <FiCpu className="text-purple-500 text-3xl animate-pulse" />
            <span>QuizVerse <span className="text-cyan-400">AI</span></span>
          </Link>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
            Create account to start learning
          </p>
        </div>

        <Card className="p-8 bg-dark-800/40 border border-purple-500/15 backdrop-blur-md">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nickname / Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. quiz_master"
              icon={<FiUser className="text-gray-400" />}
              required
            />

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
              placeholder="Min 6 characters..."
              icon={<FiLock className="text-gray-400" />}
              required
            />

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden flex items-center justify-center p-1 bg-dark-900 transition ${
                      avatar === av
                        ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/20'
                        : 'border-purple-500/10 hover:border-purple-500/30'
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${av}`}
                      alt={av}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5"
            >
              Sign Up & Get Started
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 font-sans">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
