'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Plus, Library } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { DashboardStats } from '@/components/DashboardStats';
import { FilterBar } from '@/components/FilterBar';
import { BookCard } from '@/components/BookCard';
import { BookModal } from '@/components/BookModal';
import { BookDetailModal } from '@/components/BookDetailModal';
import { BookCover } from '@/components/BookCover';
import { SkeletonStats, SkeletonGrid } from '@/components/SkeletonLoader';
import { IBook, IDashboardStats, ReadingStatus } from '@/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState<IBook[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'ALL'>('ALL');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [sortOption, setSortOption] = useState('createdAt_desc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<IBook | null>(null);
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Calculate live stats dynamically from current books array for instant sync!
  const computedStats = useMemo<IDashboardStats>(() => {
    let wantToRead = 0;
    let reading = 0;
    let completed = 0;
    let totalPagesRead = 0;
    const tagCounts: Record<string, number> = {};

    books.forEach((book) => {
      if (book.status === 'WANT_TO_READ') wantToRead++;
      if (book.status === 'READING') reading++;
      if (book.status === 'COMPLETED') completed++;

      if (book.status === 'COMPLETED') {
        totalPagesRead += book.totalPages || 0;
      } else if (book.status === 'READING') {
        totalPagesRead += book.currentPage || 0;
      }

      if (Array.isArray(book.tags)) {
        book.tags.forEach((t) => {
          if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalBooks: books.length,
      wantToRead,
      reading,
      completed,
      totalPagesRead,
      topTags,
    };
  }, [books]);

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/books', { headers });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  }, []);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/stats', { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchBooks(), fetchStats()]).finally(() => setLoading(false));
    }
  }, [user, fetchBooks, fetchStats]);

  // Instant Client-Side Filter & Sort Calculation
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (statusFilter !== 'ALL') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (selectedTag !== 'ALL') {
      const tagLower = selectedTag.toLowerCase();
      result = result.filter((b) => b.tags?.some((t) => t.toLowerCase() === tagLower));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortOption === 'title_asc') return a.title.localeCompare(b.title);
      if (sortOption === 'title_desc') return b.title.localeCompare(a.title);
      if (sortOption === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      if (sortOption === 'createdAt_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [books, statusFilter, selectedTag, searchQuery, sortOption]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setEditingBook(null);
        setSelectedBook(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // OPTIMISTIC Quick Status Change Handler
  const handleQuickStatusChange = async (bookId: string, newStatus: ReadingStatus) => {
    const previousBooks = [...books];

    // Optimistically update local state immediately
    setBooks((prev) =>
      prev.map((b) => (b._id === bookId ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b))
    );

    if (selectedBook?._id === bookId) {
      setSelectedBook((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
    } catch (err) {
      console.error('Optimistic status update failed, rolling back:', err);
      setBooks(previousBooks);
    }
  };

  // OPTIMISTIC Delete Book Handler
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to remove this book from your nook?')) return;

    const previousBooks = [...books];

    // Optimistically remove book immediately
    setBooks((prev) => prev.filter((b) => b._id !== bookId));
    if (selectedBook?._id === bookId) setSelectedBook(null);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) throw new Error('Deletion failed');
    } catch (err) {
      console.error('Optimistic delete failed, rolling back:', err);
      setBooks(previousBooks);
    }
  };

  // OPTIMISTIC Progress Update Handler
  const handleUpdateProgress = async (bookId: string, currentPage: number, status?: ReadingStatus) => {
    const previousBooks = [...books];

    setBooks((prev) =>
      prev.map((b) => {
        if (b._id === bookId) {
          return {
            ...b,
            currentPage,
            status: status || b.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    if (selectedBook && selectedBook._id === bookId) {
      setSelectedBook((prev) =>
        prev ? { ...prev, currentPage, status: status || prev.status } : null
      );
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const updateBody: any = { currentPage };
      if (status) updateBody.status = status;

      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateBody),
      });

      if (!res.ok) throw new Error('Progress update failed');
    } catch (err) {
      console.error('Optimistic progress update failed, rolling back:', err);
      setBooks(previousBooks);
    }
  };

  // Add / Edit Save Handler
  const handleSaveBook = async (bookData: Partial<IBook>) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (editingBook) {
      const res = await fetch(`/api/books/${editingBook._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bookData),
      });
      if (!res.ok) throw new Error('Failed to update book');
      const data = await res.json();
      setBooks((prev) => prev.map((b) => (b._id === editingBook._id ? data.book : b)));
    } else {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookData),
      });
      if (!res.ok) throw new Error('Failed to create book');
      const data = await res.json();
      setBooks((prev) => [data.book, ...prev]);
    }

    setEditingBook(null);
    fetchStats();
  };

  // Export Reading Journal to Markdown
  const handleExportJournal = () => {
    if (books.length === 0) return alert('No books in your nook to export!');

    let markdown = `# My Reading Sanctuary Log ✨\n`;
    markdown += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;

    books.forEach((book, i) => {
      markdown += `### ${i + 1}. ${book.title}\n`;
      markdown += `- **Author**: ${book.author}\n`;
      markdown += `- **Status**: ${book.status}\n`;
      if (book.rating) markdown += `- **Rating**: ${'★'.repeat(book.rating)}\n`;
      if (book.tags?.length) markdown += `- **Tags**: ${book.tags.map((t) => `#${t}`).join(', ')}\n`;
      if (book.quote) markdown += `- **Favorite Quote**: "${book.quote}"\n`;
      if (book.review) markdown += `- **Notes**: ${book.review}\n`;
      markdown += `\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-sanctuary-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Currently reading book spotlight
  const currentReadingBook = books.find((b) => b.status === 'READING');

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/80 via-white to-rose-50/50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <SkeletonStats />
          <SkeletonGrid count={4} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/80 via-white to-rose-50/50 text-pink-950">
      <Navbar onExportJournal={handleExportJournal} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Warm Greeting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif-header text-3xl sm:text-4xl font-bold text-pink-950 flex items-center gap-2">
              {greeting}, {user?.name || 'Reader'} <Sparkles className="w-6 h-6 text-pink-500" />
            </h1>
            <p className="text-xs sm:text-sm text-pink-800/80 mt-1">
              Welcome to your personal bookshelf sanctuary. What story are you diving into today?
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/25 transition-all touch-target"
          >
            <Plus className="w-4 h-4" /> Add Book to Nook ✨
          </motion.button>
        </div>

        {/* Dashboard Analytics Bar */}
        {loading ? (
          <SkeletonStats />
        ) : (
          <DashboardStats stats={computedStats} onTagSelect={(tag) => setSelectedTag(tag)} />
        )}

        {/* Reading Spotlight Widget */}
        {currentReadingBook ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-pink-100/70 via-rose-100/50 to-amber-100/60 border border-pink-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-32 h-44 shrink-0 shadow-md rounded-xl overflow-hidden">
              <BookCover
                title={currentReadingBook.title}
                author={currentReadingBook.author}
                coverUrl={currentReadingBook.coverUrl}
                tags={currentReadingBook.tags}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-pink-500 text-white shadow-2xs">
                <BookOpen className="w-3 h-3" /> Currently Devouring
              </span>
              <h2 className="font-serif-header text-2xl font-bold text-pink-950">
                {currentReadingBook.title}
              </h2>
              <p className="text-xs font-semibold text-pink-800/80 italic">
                by {currentReadingBook.author}
              </p>

              {currentReadingBook.totalPages ? (
                <div className="pt-2 max-w-md">
                  <div className="flex justify-between text-xs font-semibold text-pink-900 mb-1">
                    <span>Reading Progress</span>
                    <span className="text-pink-600 font-bold">
                      {currentReadingBook.currentPage || 0} of {currentReadingBook.totalPages} pages (
                      {Math.round(
                        ((currentReadingBook.currentPage || 0) / currentReadingBook.totalPages) * 100
                      )}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((currentReadingBook.currentPage || 0) / currentReadingBook.totalPages) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => setSelectedBook(currentReadingBook)}
                className="pt-2 text-xs font-bold text-pink-700 hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-md px-1"
              >
                Update pages & read notes &rarr;
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* Filter, Search & Tab Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          statusFilter={statusFilter}
          onStatusChange={(s) => setStatusFilter(s)}
          selectedTag={selectedTag}
          onTagChange={(t) => setSelectedTag(t)}
          sortOption={sortOption}
          onSortChange={(so) => setSortOption(so)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Book Collection Grid */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-pink-200 my-4"
          >
            <div className="inline-flex p-4 rounded-full bg-pink-100 text-pink-600 mb-4 shadow-2xs">
              <Library className="w-8 h-8" />
            </div>
            <h3 className="font-serif-header text-xl font-bold text-pink-950 mb-2">
              {searchQuery || statusFilter !== 'ALL' || selectedTag !== 'ALL'
                ? 'No matching stories found'
                : 'Your Bookshelf is Waiting for Its First Story...'}
            </h3>
            <p className="text-xs text-pink-700/80 max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== 'ALL' || selectedTag !== 'ALL'
                ? 'Try adjusting your search terms or clearing status & tag filters.'
                : 'Log a book you are devouring or want to read to build your sanctuary.'}
            </p>
            <button
              onClick={() => {
                if (searchQuery || statusFilter !== 'ALL' || selectedTag !== 'ALL') {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setSelectedTag('ALL');
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-all touch-target"
            >
              {searchQuery || statusFilter !== 'ALL' || selectedTag !== 'ALL'
                ? 'Clear All Filters'
                : 'Add First Book ✨'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onSelect={(b) => setSelectedBook(b)}
                  onEdit={(b) => setEditingBook(b)}
                  onDelete={(id) => handleDeleteBook(id)}
                  onQuickStatusChange={(id, status) => handleQuickStatusChange(id, status)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <BookModal
        isOpen={isAddModalOpen || !!editingBook}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        initialData={editingBook}
      />

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onEdit={(b) => setEditingBook(b)}
        onDelete={(id) => handleDeleteBook(id)}
        onUpdateProgress={handleUpdateProgress}
      />
    </div>
  );
}
