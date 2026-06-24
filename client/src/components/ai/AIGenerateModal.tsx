'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiGlobe, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '@/lib/api';
import type { Question, QuizCategory, Difficulty } from '@/types';

interface AIGenerateModalProps {
  onQuestionsGenerated: (questions: Question[], title: string, category: QuizCategory) => void;
  onClose: () => void;
}

type TabType = 'topic' | 'wikipedia' | 'text';

export function AIGenerateModal({ onQuestionsGenerated, onClose }: AIGenerateModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('topic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [topic, setTopic] = useState('');
  const [wikiUrl, setWikiUrl] = useState('');
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [category, setCategory] = useState<QuizCategory>('general');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      if (activeTab === 'topic') {
        if (!topic.trim()) throw new Error('Topic is required.');
        res = await api.post('/ai/generate-from-topic', {
          topic,
          count,
          difficulty: difficulty.toUpperCase(),
        });
      } else if (activeTab === 'wikipedia') {
        if (!wikiUrl.trim()) throw new Error('Wikipedia URL or Title is required.');
        res = await api.post('/ai/generate-from-wikipedia', {
          url: wikiUrl,
          count,
          difficulty: difficulty.toUpperCase(),
        });
      } else {
        if (text.trim().length < 50) throw new Error('Pasted text must be at least 50 characters.');
        res = await api.post('/ai/generate-from-text', {
          text,
          count,
          difficulty: difficulty.toUpperCase(),
        });
      }

      if (res.data?.success) {
        const title = activeTab === 'topic' ? `Quiz on ${topic}` : activeTab === 'wikipedia' ? `Wiki: ${res.data.data.articleTitle}` : 'Custom AI Generated Quiz';
        onQuestionsGenerated(res.data.data.questions, title, category);
        onClose();
      } else {
        throw new Error(res.data?.message || 'Failed to generate quiz questions.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-dark-800 border border-purple-500/15 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-purple-500/10 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
          <div className="flex items-center gap-2">
            <FiCpu className="text-2xl text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold font-heading text-white">AI-Powered Quiz Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-semibold text-sm">
            Close
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/35 text-red-300 text-sm flex items-center gap-2">
              <FiAlertCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Selector tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-dark-900 border border-purple-500/10">
            {(['topic', 'wikipedia', 'text'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg capitalize flex items-center justify-center gap-1.5 transition ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'topic' && <FiCpu />}
                {tab === 'wikipedia' && <FiGlobe />}
                {tab === 'text' && <FiFileText />}
                {tab === 'wikipedia' ? 'Wikipedia URL' : tab}
              </button>
            ))}
          </div>

          {/* Conditional Input Rendering */}
          <div className="space-y-4">
            {activeTab === 'topic' && (
              <Input
                label="What topic should we base the quiz on?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. World War II, Quantum Mechanics, JavaScript arrays..."
                className="w-full"
                required
              />
            )}

            {activeTab === 'wikipedia' && (
              <Input
                label="Paste Wikipedia Article URL or Title"
                value={wikiUrl}
                onChange={(e) => setWikiUrl(e.target.value)}
                placeholder="e.g. https://en.wikipedia.org/wiki/Steve_Jobs"
                className="w-full"
                required
              />
            )}

            {activeTab === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Paste content to extract questions from
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste article, study notes, or text (min 50 characters)..."
                  rows={5}
                  className="w-full p-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition placeholder-gray-600 font-sans"
                  required
                />
              </div>
            )}
          </div>

          {/* Setup Config controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-purple-500/10 pt-4">
            {/* Questions count */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-[40px] px-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition"
              >
                {[3, 5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} Questions
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Difficulty
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

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Target Category
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

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-6 font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <>
                  <FiCpu className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FiCpu /> Build Questions
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
export default AIGenerateModal;
