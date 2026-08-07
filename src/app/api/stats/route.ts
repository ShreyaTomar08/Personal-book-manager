import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import Book from '@/models/Book';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const books = await Book.find({ userId: authUser.userId });

      const totalBooks = books.length;
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
          book.tags.forEach((t: string) => {
            if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
          });
        }
      });

      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return NextResponse.json({
        stats: {
          totalBooks,
          wantToRead,
          reading,
          completed,
          totalPagesRead,
          topTags,
        },
      });
    } else {
      const stats = inMemoryDb.getStats(authUser.userId);
      return NextResponse.json({ stats });
    }
  } catch (error: any) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ message: 'Error calculating reading analytics' }, { status: 500 });
  }
}
