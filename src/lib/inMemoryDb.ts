import { IUser, IBook, ReadingStatus } from '@/types';

// In-Memory storage for seamless local execution without MongoDB service
let memoryUsers: (IUser & { password?: string })[] = [];
let memoryBooks: IBook[] = [];

// Seed default books for in-memory store so the app opens with a beautiful bookshelf!
const initialSampleBooks: Omit<IBook, '_id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    status: 'READING',
    tags: ['fiction', 'philosophical', 'fantasy', 'cozy'],
    totalPages: 304,
    currentPage: 182,
    rating: 5,
    quote: 'Between life and death there is a library, and within that library, the shelves go on forever.',
    review: 'A heartwarming story about second chances, parallel lives, and appreciating the life you have.',
  },
  {
    title: 'Before the Coffee Gets Cold',
    author: 'Toshikazu Kawaguchi',
    status: 'COMPLETED',
    tags: ['magical-realism', 'japanese-lit', 'time-travel', 'cozy'],
    totalPages: 213,
    currentPage: 213,
    rating: 5,
    quote: 'At the end of the day, whether one returns to the past or goes to the future, the present doesn’t change.',
    review: 'Wholesome and emotional stories set in a small Tokyo basement café.',
  },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    status: 'COMPLETED',
    tags: ['historical-fiction', 'romance', 'hollywood', 'drama'],
    totalPages: 400,
    currentPage: 400,
    rating: 5,
    quote: 'Never let anyone make you feel ordinary.',
    review: 'Glitz, glamour, and incredible storytelling.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    status: 'WANT_TO_READ',
    tags: ['self-improvement', 'mindset', 'productivity'],
    totalPages: 320,
    currentPage: 0,
    rating: 4,
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    review: 'Essential reading for building sustainable daily habits.',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    status: 'COMPLETED',
    tags: ['classic', 'romance', 'literature'],
    totalPages: 432,
    currentPage: 432,
    rating: 5,
    quote: 'I declare after all there is no enjoyment like reading!',
    review: 'Timeless wit and romance.',
  },
];

export const inMemoryDb = {
  findUserByEmail: (email: string) => {
    return memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findUserById: (id: string) => {
    return memoryUsers.find((u) => u._id === id) || null;
  },
  createUser: (userData: { name: string; email: string; password?: string }) => {
    const newUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password || '',
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(newUser);

    // Seed sample books for this new user so their sanctuary is populated immediately
    initialSampleBooks.forEach((sample, idx) => {
      memoryBooks.push({
        _id: 'book_' + Date.now() + '_' + idx,
        userId: newUser._id,
        ...sample,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return newUser;
  },

  getBooks: (userId: string, filters?: { status?: string; tag?: string; search?: string; sort?: string }) => {
    let result = memoryBooks.filter((b) => b.userId === userId);

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((b) => b.status === filters.status);
    }

    if (filters?.tag && filters.tag !== 'ALL') {
      const targetTag = filters.tag.toLowerCase();
      result = result.filter((b) => b.tags?.some((t) => t.toLowerCase() === targetTag));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const sort = filters?.sort || 'createdAt_desc';
    result.sort((a, b) => {
      if (sort === 'title_asc') return a.title.localeCompare(b.title);
      if (sort === 'title_desc') return b.title.localeCompare(a.title);
      if (sort === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      if (sort === 'createdAt_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  },

  createBook: (userId: string, bookData: Partial<IBook>) => {
    const newBook: IBook = {
      _id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      title: bookData.title || 'Untitled',
      author: bookData.author || 'Unknown',
      status: (bookData.status as ReadingStatus) || 'WANT_TO_READ',
      tags: bookData.tags || [],
      totalPages: bookData.totalPages || 0,
      currentPage: bookData.currentPage || 0,
      rating: bookData.rating,
      review: bookData.review || '',
      quote: bookData.quote || '',
      coverUrl: bookData.coverUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryBooks.unshift(newBook);
    return newBook;
  },

  updateBook: (userId: string, bookId: string, updates: Partial<IBook>) => {
    const idx = memoryBooks.findIndex((b) => b._id === bookId && b.userId === userId);
    if (idx === -1) return null;

    memoryBooks[idx] = {
      ...memoryBooks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return memoryBooks[idx];
  },

  deleteBook: (userId: string, bookId: string) => {
    const initialLength = memoryBooks.length;
    memoryBooks = memoryBooks.filter((b) => !(b._id === bookId && b.userId === userId));
    return memoryBooks.length < initialLength;
  },

  getStats: (userId: string) => {
    const userBooks = memoryBooks.filter((b) => b.userId === userId);
    let wantToRead = 0;
    let reading = 0;
    let completed = 0;
    let totalPagesRead = 0;
    const tagCounts: Record<string, number> = {};

    userBooks.forEach((book) => {
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
      totalBooks: userBooks.length,
      wantToRead,
      reading,
      completed,
      totalPagesRead,
      topTags,
    };
  },
};
