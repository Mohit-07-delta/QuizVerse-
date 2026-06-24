'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiGlobe, FiCpu, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import type { QuizCategory, Difficulty } from '@/types';

export default function WikipediaQuizPage() {
  const router = useRouter();
  const [wikiUrl, setWikiUrl] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [category, setCategory] = useState<QuizCategory>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wikiUrl.trim()) {
      toast.error('Wikipedia URL or Title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/ai/generate-from-wikipedia', {
        url: wikiUrl,
        count,
        difficulty: difficulty.toUpperCase(),
      });

      if (res.data?.success) {
        toast.success('Quiz generated successfully! Previewing in creator...');
        // Save generated details to local storage or session storage so creator can prefill
        sessionStorage.setItem(
          'ai_generated_quiz',
          JSON.stringify({
            title: `Wiki: ${res.data.data.articleTitle}`,
            description: res.data.data.articleSummary || `Quiz generated automatically from Wikipedia article about ${res.data.data.articleTitle}`,
            category,
            difficulty,
            questions: res.data.data.questions.map((q: any) => ({
              text: q.text,
              type: q.type,
              options: q.options.map((opt: string) => ({ text: opt, isCorrect: false })), // convert to editor format
              correctAnswer: q.correctAnswer,
              timeLimit: q.timer || 30,
              difficulty: q.difficulty.toLowerCase() as Difficulty,
              hint: q.hints?.[0] || '',
              explanation: q.explanation || '',
              imageUrl: q.imageUrl || undefined,
            })),
          })
        );
        router.push('/create?source=wikipedia');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to extract questions from Wikipedia.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Workspace */}
        <div className="flex-grow p-6 md:p-8 max-w-3xl mx-auto space-y-6">
          <div className="pb-4 border-b border-purple-500/10">
            <h1 className="text-3xl font-extrabold font-heading text-white">Wikipedia Quiz Generator</h1>
            <p className="text-sm text-gray-400 mt-0.5 font-sans">
              Enter a Wikipedia article URL or topic title, and our AI will build custom quizzes for you instantly.
            </p>
          </div>

          <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />

            <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/35 text-red-300 text-sm flex items-center gap-2">
                  <FiAlertCircle className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Wikipedia Link or Article Title"
                value={wikiUrl}
                onChange={(e) => setWikiUrl(e.target.value)}
                placeholder="e.g. https://en.wikipedia.org/wiki/Artificial_intelligence or Quantum_computing"
                icon={<FiGlobe className="text-gray-400" />}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Questions Count
                  </label>
                  <select
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-[40px] px-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition"
                  >
                    {[3, 5, 10, 15].map((num) => (
                      <option key={num} value={num}>
                        {num} Questions
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Target Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full h-[40px] px-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition capitalize"
                  >
                    {['easy', 'medium', 'hard'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as QuizCategory)}
                    className="w-full h-[40px] px-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition capitalize"
                  >
                    {['general', 'science', 'history', 'geography', 'technology', 'mathematics', 'sports'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-3 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Spinner /> Extracting...
                    </>
                  ) : (
                    <>
                      <FiCpu /> Build Wikipedia Quiz
                    </>
                  )}
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
