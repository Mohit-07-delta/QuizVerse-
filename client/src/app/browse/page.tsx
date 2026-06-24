'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiCompass, FiCpu } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { QuizCard } from '@/components/quiz/QuizCard';
import { api } from '@/lib/api';
import type { Quiz, QuizCategory } from '@/types';

export default function BrowseQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories: { label: string; value: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'General', value: 'general' },
    { label: 'Science', value: 'science' },
    { label: 'History', value: 'history' },
    { label: 'Geography', value: 'geography' },
    { label: 'Technology', value: 'technology' },
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'Sports', value: 'sports' },
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category !== 'all') queryParams.append('category', category);

        const res = await api.get(`/quizzes/public?${queryParams.toString()}`);
        if (res.data?.success) {
          setQuizzes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch public quizzes.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchQuizzes();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Browse Workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-6xl mx-auto space-y-6">
          <div className="pb-4 border-b border-purple-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-white">Quiz Lobby Explore</h1>
              <p className="text-sm text-gray-400 mt-0.5">Explore community created or AI curated rooms</p>
            </div>
          </div>

          {/* Search bar & filter pills */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-800/40 p-4 rounded-xl border border-purple-500/10 backdrop-blur-md">
            <div className="w-full md:w-96">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quizzes by title or keywords..."
                icon={<FiSearch className="text-gray-400" />}
                className="w-full"
              />
            </div>

            {/* Category Select Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition border ${
                    category === cat.value
                      ? 'bg-purple-600 border-purple-500 text-white shadow shadow-purple-500/25'
                      : 'bg-dark-900 border-purple-500/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : quizzes.length === 0 ? (
            <Card className="p-16 text-center text-gray-500 bg-dark-800/20 border border-dashed border-purple-500/10">
              <FiCompass className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="font-semibold text-lg text-white mb-1">No quizzes found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or search terms.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
