import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import Book from '@/models/Book';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { getAuthUser } from '@/lib/auth';

const sampleBooks = [
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

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const existingCount = await Book.countDocuments({ userId: authUser.userId });
      if (existingCount > 0) {
        return NextResponse.json({ message: 'Sanctuary already contains books' }, { status: 400 });
      }

      const booksToInsert = sampleBooks.map((b) => ({
        ...b,
        userId: authUser.userId,
      }));

      await Book.insertMany(booksToInsert);
      return NextResponse.json({ message: 'Sample bookshelf created with cozy classics ✨' });
    } else {
      sampleBooks.forEach((sample) => {
        inMemoryDb.createBook(authUser.userId, sample as any);
      });
      return NextResponse.json({ message: 'Sample bookshelf created with cozy classics ✨' });
    }
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ message: 'Failed to seed sample books' }, { status: 500 });
  }
}
