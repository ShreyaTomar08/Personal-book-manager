import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import Book from '@/models/Book';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || 'createdAt_desc';

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const query: any = { userId: authUser.userId };

      if (status && status !== 'ALL') query.status = status;
      if (tag && tag !== 'ALL') query.tags = tag;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOption: any = { createdAt: -1 };
      if (sort === 'title_asc') sortOption = { title: 1 };
      if (sort === 'title_desc') sortOption = { title: -1 };
      if (sort === 'rating_desc') sortOption = { rating: -1, createdAt: -1 };
      if (sort === 'createdAt_asc') sortOption = { createdAt: 1 };

      const books = await Book.find(query).sort(sortOption);
      return NextResponse.json({ books });
    } else {
      const books = inMemoryDb.getBooks(authUser.userId, { status, tag, search, sort });
      return NextResponse.json({ books });
    }
  } catch (error: any) {
    console.error('Fetch books error:', error);
    return NextResponse.json({ message: 'Error fetching books' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { title, author, status, tags, totalPages, currentPage, rating, review, quote, coverUrl } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ message: 'Book title is required' }, { status: 400 });
    }

    if (!author || !author.trim()) {
      return NextResponse.json({ message: 'Author name is required' }, { status: 400 });
    }

    const processedTags = Array.isArray(tags)
      ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      : typeof tags === 'string'
      ? tags
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const newBook = await Book.create({
        userId: authUser.userId,
        title: title.trim(),
        author: author.trim(),
        status: status || 'WANT_TO_READ',
        tags: processedTags,
        totalPages: Number(totalPages) || 0,
        currentPage: Number(currentPage) || 0,
        rating: rating ? Number(rating) : undefined,
        review: review || '',
        quote: quote || '',
        coverUrl: coverUrl || '',
      });
      return NextResponse.json({ book: newBook, message: 'Book added to your collection ✨' }, { status: 201 });
    } else {
      const newBook = inMemoryDb.createBook(authUser.userId, {
        title: title.trim(),
        author: author.trim(),
        status,
        tags: processedTags,
        totalPages: Number(totalPages) || 0,
        currentPage: Number(currentPage) || 0,
        rating: rating ? Number(rating) : undefined,
        review,
        quote,
        coverUrl,
      });
      return NextResponse.json({ book: newBook, message: 'Book added to your collection ✨' }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Create book error:', error);
    return NextResponse.json({ message: error.message || 'Failed to add book to collection' }, { status: 500 });
  }
}
