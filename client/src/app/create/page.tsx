'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSave, FiCpu, FiCompass, FiGrid, FiEye, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { QuestionEditor } from '@/components/quiz/QuestionEditor';
import { AIGenerateModal } from '@/components/ai/AIGenerateModal';
import { api } from '@/lib/api';
import type { Question, QuizCategory, Difficulty } from '@/types';

export default function CreateQuizPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState(1);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Check for generated quiz on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedQuiz = sessionStorage.getItem('ai_generated_quiz');
      if (savedQuiz) {
        const parsed = JSON.parse(savedQuiz);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setCategory(parsed.category || 'general');
        setDifficulty(parsed.difficulty || 'medium');
        setQuestions(parsed.questions || []);
        setStep(2); // Show questions directly for editing
        sessionStorage.removeItem('ai_generated_quiz'); // clean up
      }
    }
  }, []);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuizCategory>('general');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isPublic, setIsPublic] = useState(true);
  const [tagsInput, setTagsInput] = useState('');

  // Questions Array
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      text: '',
      type: 'MCQ',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: 0,
      difficulty: 'medium',
      timeLimit: 30,
      points: 1000,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, updated: Question) => {
    const nextQuestions = [...questions];
    nextQuestions[index] = updated;
    setQuestions(nextQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleDuplicateQuestion = (index: number) => {
    const copied = { ...questions[index] };
    setQuestions([...questions, copied]);
  };

  const handleSaveQuiz = async (isDraft = false) => {
    if (!title.trim()) {
      toast.error('Quiz title is required.');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question to save.');
      return;
    }

    // Basic questions validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        toast.error(`Question ${i + 1} title cannot be empty.`);
        return;
      }
      for (let o = 0; o < questions[i].options.length; o++) {
        if (!questions[i].options[o].text.trim()) {
          toast.error(`Option ${o + 1} for Question ${i + 1} cannot be empty.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Map questions array fields to match backend schema expectation
      const questionsData = questions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options.map((opt) => opt.text),
        correctAnswer: q.correctAnswer,
        timer: q.timeLimit,
        difficulty: q.difficulty.toUpperCase(),
        hints: q.hint ? [q.hint] : [],
        explanation: q.explanation,
        imageUrl: q.imageUrl,
      }));

      const payload = {
        title,
        description,
        category,
        difficulty: difficulty.toUpperCase(),
        isPublic,
        questions: questionsData,
        tags,
        isDraft,
      };

      const res = await api.post('/quizzes', payload);
      if (res.data?.success) {
        toast.success(isDraft ? 'Quiz saved as draft!' : 'Quiz published successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionsGenerated = (generated: Question[], aiTitle: string, aiCategory: QuizCategory) => {
    setTitle(aiTitle);
    setCategory(aiCategory);
    setQuestions(generated);
    setStep(2); // Jump straight to edit page
    toast.success(`Generated ${generated.length} questions! Review them below.`);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Workspace panel */}
        <div className="flex-grow p-6 md:p-8 max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/10">
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-white">Create New Quiz</h1>
              <p className="text-sm text-gray-400 mt-0.5">Build standard manual quizzes or generate with AI helper</p>
            </div>

            <Button
              onClick={() => setAiModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25"
            >
              <FiCpu /> Generate with AI
            </Button>
          </div>

          {/* Steps Nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className={`px-4 py-2 text-sm font-bold font-heading rounded-lg border transition ${
                step === 1
                  ? 'bg-purple-500/15 border-purple-400 text-purple-300'
                  : 'bg-dark-800/40 border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Step 1: Quiz Details
            </button>
            <div className="w-6 h-[1px] bg-purple-500/10" />
            <button
              onClick={() => setStep(2)}
              className={`px-4 py-2 text-sm font-bold font-heading rounded-lg border transition ${
                step === 2
                  ? 'bg-purple-500/15 border-purple-400 text-purple-300'
                  : 'bg-dark-800/40 border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Step 2: Add Questions ({questions.length})
            </button>
          </div>

          {/* Conditional steps view */}
          {step === 1 ? (
            <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md space-y-4">
              <Input
                label="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Science Fundamentals, Pop Culture Trivia..."
                className="w-full"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell players what this quiz is about..."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition placeholder-gray-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Default Difficulty
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
              </div>

              <Input
                label="Tags (comma-separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. physics, solar-system, trivia"
              />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-600 focus:ring-purple-500 rounded"
                />
                <label htmlFor="public" className="text-sm font-semibold text-gray-300 select-none">
                  Make Quiz public (visible in Explore / Browse)
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold">
                  Next: Add Questions
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Actions row */}
              <div className="flex justify-between items-center bg-dark-900 p-3 rounded-xl border border-purple-500/10">
                <Button variant="secondary" onClick={handleAddQuestion} className="flex items-center gap-1">
                  <FiPlus /> Add Question
                </Button>

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleSaveQuiz(true)} disabled={saving}>
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSaveQuiz(false)} disabled={saving} className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/20">
                    <FiSave /> Publish Quiz
                  </Button>
                </div>
              </div>

              {/* Questions list editors */}
              {questions.length === 0 ? (
                <Card className="p-12 text-center text-gray-500 bg-dark-800/20 border border-dashed border-purple-500/10">
                  <p className="mb-4">No questions added yet.</p>
                  <Button onClick={handleAddQuestion} variant="secondary">
                    Create Question #1
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <QuestionEditor
                      key={idx}
                      question={q}
                      index={idx}
                      onUpdate={(updated) => handleUpdateQuestion(idx, updated)}
                      onDelete={() => handleDeleteQuestion(idx)}
                      onDuplicate={() => handleDuplicateQuestion(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Generation modal overlay */}
          <AnimatePresence>
            {aiModalOpen && (
              <AIGenerateModal
                onQuestionsGenerated={handleQuestionsGenerated}
                onClose={() => setAiModalOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
