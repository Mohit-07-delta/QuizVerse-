'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiCopy, FiHelpCircle, FiImage, FiClock, FiGrid } from 'react-icons/fi';
import type { Question, Difficulty } from '@/types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionEditorProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, text: e.target.value });
  };

  const handleTypeChange = (type: 'MCQ' | 'TRUE_FALSE' | 'IMAGE') => {
    let options = [...question.options];
    if (type === 'TRUE_FALSE') {
      options = [
        { text: 'True', isCorrect: question.correctAnswer === 0 },
        { text: 'False', isCorrect: question.correctAnswer === 1 },
      ];
    } else if (question.type === 'TRUE_FALSE') {
      options = [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    }
    onUpdate({
      ...question,
      type,
      options,
      correctAnswer: question.correctAnswer >= options.length ? 0 : question.correctAnswer,
    });
  };

  const handleOptionChange = (optionIndex: number, text: string) => {
    const options = [...question.options];
    options[optionIndex] = { ...options[optionIndex], text };
    onUpdate({ ...question, options });
  };

  const handleCorrectAnswerChange = (optionIndex: number) => {
    const options = question.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex,
    }));
    onUpdate({ ...question, correctAnswer: optionIndex, options });
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    onUpdate({ ...question, difficulty });
  };

  const handleTimeLimitChange = (timeLimit: number) => {
    onUpdate({ ...question, timeLimit });
  };

  const handleHintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, hint: e.target.value });
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, explanation: e.target.value });
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, imageUrl: e.target.value });
  };

  return (
    <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/10">
        <span className="text-sm font-bold font-heading text-purple-400">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate Question">
            <FiCopy />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300" title="Delete Question">
            <FiTrash2 />
          </Button>
        </div>
      </div>

      {/* Main Question Text */}
      <div className="mb-4">
        <Input
          label="Question Title"
          value={question.text}
          onChange={handleTextChange}
          placeholder="Start typing your question here..."
          className="w-full"
        />
      </div>

      {/* Configuration row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Question Type
          </label>
          <div className="flex rounded-lg bg-dark-900 border border-purple-500/10 overflow-hidden p-0.5">
            {(['MCQ', 'TRUE_FALSE', 'IMAGE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all duration-200 capitalize ${
                  question.type === t
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'TRUE_FALSE' ? 'True/False' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiClock /> Time Limit (seconds)
          </label>
          <select
            value={question.timeLimit}
            onChange={(e) => handleTimeLimitChange(parseInt(e.target.value))}
            className="w-full h-[40px] px-3 rounded-lg bg-dark-900 border border-purple-500/10 text-sm text-white focus:outline-none focus:border-purple-500/30 transition"
          >
            {[5, 10, 20, 30, 45, 60, 90, 120].map((t) => (
              <option key={t} value={t}>
                {t} seconds
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiGrid /> Difficulty
          </label>
          <div className="flex rounded-lg bg-dark-900 border border-purple-500/10 overflow-hidden p-0.5">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDifficultyChange(d)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all duration-200 capitalize ${
                  question.difficulty === d
                    ? d === 'easy'
                      ? 'bg-green-600 text-white'
                      : d === 'medium'
                      ? 'bg-orange-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Question URL */}
      {question.type === 'IMAGE' && (
        <div className="mb-4">
          <Input
            label="Image URL"
            value={question.imageUrl || ''}
            onChange={handleImageUrlChange}
            placeholder="Paste image link here (e.g. https://domain.com/image.jpg)..."
            icon={<FiImage className="text-gray-400" />}
          />
        </div>
      )}

      {/* Answer Options Grid */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Answer Options (Select the correct answer)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${
                question.correctAnswer === idx
                  ? 'border-green-500/40 bg-green-500/5'
                  : 'border-purple-500/10 bg-dark-900/60'
              }`}
            >
              <input
                type="radio"
                name={`correct-${index}`}
                checked={question.correctAnswer === idx}
                onChange={() => handleCorrectAnswerChange(idx)}
                className="w-4 h-4 text-green-600 border-gray-600 focus:ring-green-500"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}${
                  question.type === 'TRUE_FALSE' ? '' : ' (optional)'
                }`}
                disabled={question.type === 'TRUE_FALSE'}
                className="flex-grow bg-transparent border-none text-white focus:ring-0 p-1 text-sm outline-none placeholder-gray-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hints & Explanations row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="AI-Powered Hint (Optional)"
          value={question.hint || ''}
          onChange={handleHintChange}
          placeholder="Guidance for players..."
          icon={<FiHelpCircle className="text-gray-400" />}
        />
        <Input
          label="Explanation (Optional)"
          value={question.explanation || ''}
          onChange={handleExplanationChange}
          placeholder="Why this answer is correct..."
          icon={<FiHelpCircle className="text-gray-400" />}
        />
      </div>
    </Card>
  );
}
