'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, CheckCircle2, Library, Sparkles, Flame } from 'lucide-react';
import { IDashboardStats } from '@/types';

interface DashboardStatsProps {
  stats: IDashboardStats | null;
  onTagSelect?: (tag: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onTagSelect }) => {
  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      subtext: 'In your sanctuary',
      icon: Library,
      color: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Currently Reading',
      value: stats.reading,
      subtext: 'Devouring now',
      icon: BookOpen,
      color: 'bg-pink-100 text-pink-700',
    },
    {
      label: 'Finished & Loved',
      value: stats.completed,
      subtext: 'Completed stories',
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Want to Read',
      value: stats.wantToRead,
      subtext: 'To get lost in',
      icon: Bookmark,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Pages Turned',
      value: stats.totalPagesRead.toLocaleString(),
      subtext: 'Total pages read',
      icon: Flame,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white border border-pink-100 p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-pink-700/80">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-serif-header text-2xl sm:text-3xl font-bold text-pink-950">
                  {card.value}
                </span>
                <p className="text-[11px] text-pink-400 mt-0.5">{card.subtext}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Tag Chips bar */}
      {stats.topTags && stats.topTags.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs no-scrollbar">
          <span className="font-semibold text-pink-700 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Popular Tags:
          </span>
          {stats.topTags.map((item, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              aria-label={`Filter by tag #${item.tag}`}
              onClick={() => onTagSelect && onTagSelect(item.tag)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 transition-colors font-medium text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target"
            >
              #{item.tag} <span className="opacity-60 text-[10px]">({item.count})</span>
            </motion.button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
