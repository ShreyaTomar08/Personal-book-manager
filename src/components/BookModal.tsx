'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, BookOpen, Bookmark, CheckCircle2, Loader2 } from 'lucide-react';
import { IBook, ReadingStatus } from '@/types';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: Partial<IBook>) => Promise<void>;
  initialData?: IBook | null;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('WANT_TO_READ');
  const [tags, setTags] = useState('');
  const [totalPages, setTotalPages] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState<number | ''>('');
  const [rating, setRating] = useState<number>(0);
  const [quote, setQuote] = useState('');
  const [review, setReview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setStatus(initialData.status || 'WANT_TO_READ');
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');
      setTotalPages(initialData.totalPages || '');
      setCurrentPage(initialData.currentPage || '');
      setRating(initialData.rating || 0);
      setQuote(initialData.quote || '');
      setReview(initialData.review || '');
      setCoverUrl(initialData.coverUrl || '');
    } else {
      setTitle('');
      setAuthor('');
      setStatus('WANT_TO_READ');
      setTags('');
      setTotalPages('');
      setCurrentPage('');
      setRating(0);
      setQuote('');
      setReview('');
      setCoverUrl('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Title and Author are required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        author: author.trim(),
        status,
        tags: parsedTags,
        totalPages: totalPages === '' ? 0 : Number(totalPages),
        currentPage: currentPage === '' ? 0 : Number(currentPage),
        rating: rating > 0 ? rating : undefined,
        quote: quote.trim(),
        review: review.trim(),
        coverUrl: coverUrl.trim(),
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/20 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-100 text-pink-600 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 id="modal-title" className="font-serif-header text-xl font-bold text-pink-950">
                {initialData ? 'Edit Book Details' : 'Add to Your Bookshelf'}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-full text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Title & Author */}
            <div>
              <label htmlFor="book-title" className="block font-medium text-pink-950 mb-1">
                Book Title *
              </label>
              <input
                id="book-title"
                type="text"
                required
                placeholder="e.g. The Midnight Library"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label htmlFor="book-author" className="block font-medium text-pink-950 mb-1">
                Author Name *
              </label>
              <input
                id="book-author"
                type="text"
                required
                placeholder="e.g. Matt Haig"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Reading Status Selector */}
            <div>
              <label className="block font-medium text-pink-950 mb-1.5">
                Reading Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'WANT_TO_READ', label: 'Want to Read', icon: Bookmark },
                  { key: 'READING', label: 'Reading', icon: BookOpen },
                  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = status === st.key;
                  return (
                    <button
                      type="button"
                      key={st.key}
                      onClick={() => setStatus(st.key as ReadingStatus)}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                        isSelected
                          ? 'border-pink-400 bg-pink-100 text-pink-900 ring-2 ring-pink-300 shadow-2xs'
                          : 'border-pink-100 bg-white text-pink-700 hover:border-pink-200 hover:bg-pink-50/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Page Count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="total-pages" className="block font-medium text-pink-950 mb-1">
                  Total Pages
                </label>
                <input
                  id="total-pages"
                  type="number"
                  min="0"
                  placeholder="304"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label htmlFor="current-page" className="block font-medium text-pink-950 mb-1">
                  Current Page
                </label>
                <input
                  id="current-page"
                  type="number"
                  min="0"
                  placeholder="120"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="book-tags" className="block font-medium text-pink-950 mb-1">
                Tags / Genres (comma separated)
              </label>
              <input
                id="book-tags"
                type="text"
                placeholder="fiction, cozy, fantasy, philosophy"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block font-medium text-pink-950 mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`Rate ${star} out of 5 stars`}
                    onClick={() => setRating(star === rating ? 0 : star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-md"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-pink-200'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 ? (
                  <span className="text-xs text-amber-600 font-semibold ml-2">
                    {rating} / 5 stars
                  </span>
                ) : (
                  <span className="text-xs text-pink-400 ml-2">Tap to rate</span>
                )}
              </div>
            </div>

            {/* Favorite Quote */}
            <div>
              <label htmlFor="book-quote" className="block font-medium text-pink-950 mb-1">
                Favorite Quote / Highlight
              </label>
              <input
                id="book-quote"
                type="text"
                placeholder="&ldquo;Between life and death there is a library...&rdquo;"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400 italic"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label htmlFor="cover-url" className="block font-medium text-pink-950 mb-1">
                Cover Image URL (optional - fallback cover generated if empty)
              </label>
              <input
                id="cover-url"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-pink-200 bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-pink-700 hover:bg-pink-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-md shadow-pink-500/25 transition-all disabled:opacity-50 flex items-center gap-2 touch-target"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : initialData ? (
                  'Update Book'
                ) : (
                  'Add to Nook ✨'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
