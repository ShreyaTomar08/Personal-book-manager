'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, X, Plus } from 'lucide-react';
import { ReadingStatus } from '@/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: ReadingStatus | 'ALL';
  onStatusChange: (status: ReadingStatus | 'ALL') => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onOpenAddModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedTag,
  onTagChange,
  sortOption,
  onSortChange,
  onOpenAddModal,
}) => {
  const statusTabs: { key: ReadingStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'All Stories' },
    { key: 'READING', label: '📖 Devouring Now' },
    { key: 'WANT_TO_READ', label: '🔖 Want to Read' },
    { key: 'COMPLETED', label: '🌸 Finished & Loved' },
  ];

  return (
    <div className="bg-white border border-pink-100 p-4 rounded-2xl shadow-2xs mb-6 space-y-4">
      {/* Top Row: Search & Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <label htmlFor="search-books" className="sr-only">
            Search books by title, author, or tag
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <input
            id="search-books"
            type="text"
            placeholder="Search title, author, tag... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-xs sm:text-sm text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add Book Button & Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/30 text-xs font-medium text-pink-900">
            <ArrowUpDown className="w-3.5 h-3.5 text-pink-400" />
            <label htmlFor="sort-selector" className="sr-only">
              Sort books
            </label>
            <select
              id="sort-selector"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-pink-950"
            >
              <option value="createdAt_desc">Recently Added</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="createdAt_asc">Oldest First</option>
            </select>
          </div>

          {/* Add Book Trigger */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target"
          >
            <Plus className="w-4 h-4" /> Add Book ✨
          </motion.button>
        </div>
      </div>

      {/* Bottom Row: Status Tabs & Tag Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pink-100">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Filter by reading status">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.95 }}
                role="tab"
                aria-selected={active}
                onClick={() => onStatusChange(tab.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target ${
                  active
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                    : 'bg-pink-50/70 text-pink-900 hover:bg-pink-100'
                }`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Tag Clear Pill */}
        {selectedTag && selectedTag !== 'ALL' ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-900 text-xs font-semibold border border-pink-200">
            <Filter className="w-3 h-3 text-pink-500" />
            <span>Tag: #{selectedTag}</span>
            <button
              onClick={() => onTagChange('ALL')}
              aria-label={`Clear tag filter ${selectedTag}`}
              className="ml-1 hover:text-pink-600 p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
