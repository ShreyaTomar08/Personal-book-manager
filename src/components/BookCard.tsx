'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, BookOpen, CheckCircle2, Bookmark, Trash2, Edit3 } from 'lucide-react';
import { IBook, ReadingStatus } from '@/types';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: IBook;
  onSelect: (book: IBook) => void;
  onEdit: (book: IBook) => void;
  onDelete: (bookId: string) => void;
  onQuickStatusChange: (bookId: string, status: ReadingStatus) => void;
}

const statusConfig: Record<
  ReadingStatus,
  { label: string; humanLabel: string; bg: string; text: string; icon: React.ElementType }
> = {
  WANT_TO_READ: {
    label: 'Want to Read',
    humanLabel: 'To Get Lost In',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: Bookmark,
  },
  READING: {
    label: 'Reading',
    humanLabel: 'Devouring Now',
    bg: 'bg-pink-50 border-pink-200',
    text: 'text-pink-800',
    icon: BookOpen,
  },
  COMPLETED: {
    label: 'Completed',
    humanLabel: 'Finished & Loved',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle2,
  },
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelect,
  onEdit,
  onDelete,
  onQuickStatusChange,
}) => {
  const currentStatus = statusConfig[book.status] || statusConfig.WANT_TO_READ;
  const StatusIcon = currentStatus.icon;

  const pageProgress =
    book.totalPages && book.totalPages > 0
      ? Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100))
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border border-pink-100 p-4 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Cover & Top Details */}
      <div
        tabIndex={0}
        role="button"
        aria-label={`View details for ${book.title} by ${book.author}`}
        onClick={() => onSelect(book)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(book);
          }
        }}
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-xl p-1 -m-1"
      >
        <BookCover
          title={book.title}
          author={book.author}
          coverUrl={book.coverUrl}
          tags={book.tags}
          className="w-full h-56 mb-4"
        />

        {/* Title & Author */}
        <h3 className="font-serif-header text-lg font-bold text-pink-950 line-clamp-1 group-hover:text-pink-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs font-medium text-pink-700/70 mb-2 italic">
          by {book.author}
        </p>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStatus.bg} ${currentStatus.text}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {currentStatus.humanLabel}
          </span>

          {/* Rating */}
          {book.rating ? (
            <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Rated ${book.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < book.rating! ? 'fill-amber-400 text-amber-400' : 'text-pink-100'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Reading Page Progress Bar */}
        {book.status === 'READING' && book.totalPages ? (
          <div className="mb-3">
            <div className="flex justify-between text-[11px] font-medium text-pink-800/80 mb-1">
              <span>Progress</span>
              <span className="text-pink-600 font-semibold">{pageProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500 rounded-full"
                style={{ width: `${pageProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Tags */}
        {book.tags && book.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-100"
              >
                #{tag}
              </span>
            ))}
            {book.tags.length > 3 ? (
              <span className="text-[10px] text-pink-400 font-medium self-center">
                +{book.tags.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Favorite Quote snippet */}
        {book.quote ? (
          <p className="text-[11px] text-pink-900/80 bg-pink-50/70 p-2 rounded-lg italic line-clamp-2 border border-pink-100 mb-3">
            &ldquo;{book.quote}&rdquo;
          </p>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-pink-100 flex items-center justify-between">
        {/* Quick Status Pill Action Buttons */}
        <div className="flex items-center gap-1" role="group" aria-label="Change reading status">
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Set status to Want to Read"
            title="Mark as Want to Read"
            onClick={() => onQuickStatusChange(book._id, 'WANT_TO_READ')}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 ${
              book.status === 'WANT_TO_READ'
                ? 'bg-amber-100 text-amber-800 font-bold'
                : 'text-pink-300 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Set status to Currently Reading"
            title="Mark as Reading"
            onClick={() => onQuickStatusChange(book._id, 'READING')}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 ${
              book.status === 'READING'
                ? 'bg-pink-100 text-pink-800 font-bold'
                : 'text-pink-300 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Set status to Completed"
            title="Mark as Completed"
            onClick={() => onQuickStatusChange(book._id, 'COMPLETED')}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 ${
              book.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800 font-bold'
                : 'text-pink-300 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Edit & Delete Actions */}
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(book)}
            className="p-1.5 rounded-lg text-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
            title="Edit Book Details"
            aria-label={`Edit ${book.title}`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(book._id)}
            className="p-1.5 rounded-lg text-pink-300 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
            title="Remove from Library"
            aria-label={`Delete ${book.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
