'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle2, Edit3, Trash2, Sparkles, Quote, Loader2 } from 'lucide-react';
import { IBook, ReadingStatus } from '@/types';
import { BookCover } from './BookCover';

interface BookDetailModalProps {
  book: IBook | null;
  onClose: () => void;
  onEdit: (book: IBook) => void;
  onDelete: (bookId: string) => void;
  onUpdateProgress: (bookId: string, currentPage: number, status?: ReadingStatus) => Promise<void>;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const [updating, setUpdating] = useState(false);

  if (!book) return null;

  const total = book.totalPages || 0;
  const current = book.currentPage || 0;
  const progressPercent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  const handlePageIncrement = async (delta: number) => {
    if (updating) return;
    const newPage = Math.max(0, Math.min(total || 9999, current + delta));
    setUpdating(true);

    let newStatus: ReadingStatus = book.status;
    if (total > 0 && newPage >= total) {
      newStatus = 'COMPLETED';
    } else if (newPage > 0 && book.status === 'WANT_TO_READ') {
      newStatus = 'READING';
    }

    try {
      await onUpdateProgress(book._id, newPage, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await onUpdateProgress(book._id, total || current, 'COMPLETED');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/20 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close details dialog"
            className="absolute top-4 right-4 p-2 rounded-full text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Cover Column */}
            <div className="md:col-span-2 flex flex-col items-center">
              <BookCover
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl}
                tags={book.tags}
                className="w-full h-72 mb-4"
              />

              {/* Quick Actions */}
              <div className="flex gap-2 w-full">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    onEdit(book);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-pink-200 hover:bg-pink-50 text-xs font-semibold text-pink-900 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Details
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    onDelete(book._id);
                  }}
                  aria-label={`Delete ${book.title}`}
                  className="px-3 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 touch-target"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Details Column */}
            <div className="md:col-span-3 flex flex-col justify-between space-y-4">
              <div>
                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-800 mb-3 border border-pink-200">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  {book.status === 'WANT_TO_READ'
                    ? 'Want to Read'
                    : book.status === 'READING'
                    ? 'Currently Reading'
                    : 'Completed'}
                </div>

                <h2 id="detail-title" className="font-serif-header text-2xl sm:text-3xl font-bold text-pink-950 leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm font-medium text-pink-700/70 italic mb-3">
                  by {book.author}
                </p>

                {/* Rating Display */}
                {book.rating ? (
                  <div className="flex items-center gap-1 mb-4 text-amber-500" aria-label={`Rated ${book.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < book.rating! ? 'fill-amber-400 text-amber-400' : 'text-pink-100'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-pink-700 ml-2">
                      {book.rating} / 5
                    </span>
                  </div>
                ) : null}

                {/* Interactive Page Progress */}
                <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-pink-900 mb-2">
                    <span>Reading Progress</span>
                    <span className="text-pink-600 font-bold">
                      {current} / {total > 0 ? `${total} pages` : '?'}{' '}
                      {total > 0 ? `(${progressPercent}%)` : ''}
                    </span>
                  </div>

                  {total > 0 ? (
                    <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  ) : null}

                  {/* Page Tracker Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageIncrement(-10)}
                      disabled={updating || current <= 0}
                      className="px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-xs font-semibold text-pink-900 hover:bg-pink-100 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target"
                    >
                      -10 pgs
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageIncrement(10)}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-xs font-semibold text-pink-900 hover:bg-pink-100 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-pink-400 touch-target"
                    >
                      +10 pgs
                    </motion.button>
                    {book.status !== 'COMPLETED' ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMarkCompleted}
                        disabled={updating}
                        className="ml-auto px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 touch-target"
                      >
                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Mark Completed ✓'}
                      </motion.button>
                    ) : (
                      <span className="ml-auto text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Quote Section */}
                {book.quote ? (
                  <div className="relative p-4 rounded-2xl bg-gradient-to-r from-pink-100/60 to-rose-100/60 border border-pink-200/60 mb-4">
                    <Quote className="w-5 h-5 text-pink-400 mb-1 opacity-70" />
                    <p className="text-xs sm:text-sm text-pink-950 italic font-serif-header">
                      &ldquo;{book.quote}&rdquo;
                    </p>
                  </div>
                ) : null}

                {/* Personal Review */}
                {book.review ? (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">
                      Personal Reflections
                    </h3>
                    <p className="text-xs sm:text-sm text-pink-950 leading-relaxed bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                      {book.review}
                    </p>
                  </div>
                ) : null}

                {/* Tags */}
                {book.tags && book.tags.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">
                      Tags & Genres
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {book.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-pink-100 text-pink-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
