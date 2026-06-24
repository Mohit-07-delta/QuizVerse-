'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSettings, FiUser, FiEye, FiLock, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

const AVATARS = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'];

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || AVATARS[0]);
    }
  }, [user, token, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name, avatar });
      if (res.data?.success) {
        toast.success('Settings updated!');
        setUser(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div className="pb-4 border-b border-purple-500/10 flex items-center gap-2">
            <FiSettings className="text-2xl text-purple-400" />
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-white">Account Settings</h1>
              <p className="text-sm text-gray-400 mt-0.5 font-sans">Manage your nickname, avatar, and account preferences</p>
            </div>
          </div>

          <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md">
            <form onSubmit={handleUpdate} className="space-y-6">
              <Input
                label="Nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Username..."
                icon={<FiUser className="text-gray-400" />}
                required
              />

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Change Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden flex items-center justify-center p-1 bg-dark-900 transition ${
                        avatar === av
                          ? 'border-cyan-400 scale-105 shadow shadow-cyan-500/20'
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

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold px-6 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
